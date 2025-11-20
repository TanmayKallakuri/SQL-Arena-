
import { GoogleGenAI, Type } from "@google/genai";
import { Difficulty, EvaluationResult, QuizQuestion, SqlTopic } from "../types";
import { STATIC_QUIZ_QUESTIONS } from "./staticContent";

// Ensure API Key is present
const apiKey = process.env.API_KEY || '';
if (!apiKey) {
  console.error("API_KEY is missing from environment variables");
}

const ai = new GoogleGenAI({ apiKey });

const modelId = 'gemini-2.5-flash';

// Curriculum context derived from the specific PDFs provided
const CURRICULUM_CONTEXT: Record<string, string> = {
  'Window Functions': `
    Focus on the specific curriculum regarding Window Functions:
    1. Syntax: function_name(expression) OVER ([partition_definition] [order_definition] [frame_definition]).
    2. Frames: Understand ROWS vs RANGE. Frame start: UNBOUNDED PRECEDING, N PRECEDING, CURRENT ROW. Frame end: UNBOUNDED FOLLOWING, N FOLLOWING.
    3. Specific Functions to cover:
       - FIRST_VALUE() / LAST_VALUE()
       - NTH_VALUE(expr, N) FROM FIRST/LAST
       - LAG(expr, offset, default) / LEAD(expr, offset, default)
       - ROW_NUMBER() vs RANK() vs DENSE_RANK()
       - NTILE(n) (divides rows into buckets)
       - PERCENT_RANK() (rank-1 / total_rows-1)
       - CUME_DIST() (number of rows with values <= current / total rows)
    4. Key concept: Window functions do NOT reduce the number of rows returned (unlike Group By).
  `,
  'Subqueries': `
    Focus on the specific curriculum regarding Subqueries:
    1. Types: Scalar (single value), Row (single row), Table (multiple rows/cols).
    2. Locations: SELECT, FROM (derived table), WHERE, HAVING.
    3. Correlated Subqueries: Uses "Outer References". Executes once for EACH row of the outer query.
    4. Comparison Tests:
       - Simple Comparison (=, <, >)
       - IN / NOT IN (Set membership)
       - EXISTS (Existence test - checks if subquery returns ANY rows, ignores values)
       - ANY / SOME (True if comparison holds for at least one value)
       - ALL (True if comparison holds for EVERY value)
    5. Trap: ANY/ALL with NULL values.
  `,
  'Normalization': `
    Focus on the specific curriculum regarding Normalization:
    1. Goal: Minimize redundancy, avoid Update/Insertion/Deletion anomalies.
    2. Dependencies:
       - Functional Dependency (A -> B)
       - Partial Dependency (Part of composite PK -> Non-prime attribute)
       - Transitive Dependency (Non-prime -> Non-prime)
       - Multivalued Dependency (One key determines multiple independent values)
    3. Normal Forms:
       - 1NF: Table format, PK identified, No repeating groups.
       - 2NF: 1NF + No Partial Dependencies.
       - 3NF: 2NF + No Transitive Dependencies.
       - BCNF: Every determinant is a candidate key.
       - 4NF: 3NF + No Multivalued Dependencies.
    4. Denormalization: Occasional need for performance.
  `,
  'Advanced Modeling': `
    Focus on the specific curriculum regarding Advanced Data Modeling (EER):
    1. Supertypes & Subtypes: Inheritance of attributes and relationships (1:1 implementation).
    2. Specialization Hierarchy: "Is-a" relationships.
    3. Discriminators: Attribute determining the subtype (e.g., EMP_TYPE).
    4. Constraints:
       - Disjoint (d): Instance belongs to ONLY one subtype.
       - Overlapping (o): Instance can belong to multiple subtypes.
       - Partial Completeness (Single line): Supertype DOES NOT have to be a subtype.
       - Total Completeness (Double line): Supertype MUST be a subtype.
    5. Entity Clustering: Grouping entities to simplify diagrams.
    6. Keys: Natural vs Surrogate keys (security, immutability).
  `
};

const getContextForTopic = (topicTitle: string): string => {
    // Simple keyword matching to find the right context
    if (topicTitle.toLowerCase().includes('window')) return CURRICULUM_CONTEXT['Window Functions'];
    if (topicTitle.toLowerCase().includes('subquer')) return CURRICULUM_CONTEXT['Subqueries'];
    if (topicTitle.toLowerCase().includes('normalization')) return CURRICULUM_CONTEXT['Normalization'];
    if (topicTitle.toLowerCase().includes('modeling')) return CURRICULUM_CONTEXT['Advanced Modeling'];
    return "Focus on standard SQL best practices.";
};

export const generateQuizQuestion = async (topic: string, difficulty: Difficulty): Promise<QuizQuestion> => {
  // 1. Try Static Bank First for Speed
  const staticQuestions = STATIC_QUIZ_QUESTIONS[topic];
  if (staticQuestions && staticQuestions.length > 0) {
      // Simple randomization for now
      const randomIndex = Math.floor(Math.random() * staticQuestions.length);
      const q = staticQuestions[randomIndex];
      // Add random ID component to force react re-render
      return { ...q, id: `${q.id}_${Date.now()}` };
  }

  // 2. Fallback to AI Generation
  const curriculumContext = getContextForTopic(topic);
  
  const prompt = `
    Generate a unique, challenging SQL interview question based strictly on the following curriculum context.
    
    CURRICULUM CONTEXT:
    ${curriculumContext}

    Topic: ${topic}
    Difficulty: ${difficulty}
    Source Material Style: LeetCode, FAANG Interview, Academic Exam.
    
    If difficulty is Expert, combine concepts (e.g., Recursive CTEs with Window Functions, or complex BCNF decomposition).
    
    Return a JSON object with:
    - questionText: The problem description. Ensure it strictly uses terminology from the curriculum context.
    - schemaContext: Text description of the tables, columns, and sample data types involved.
    - hints: An array of 2 short hints.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questionText: { type: Type.STRING },
            schemaContext: { type: Type.STRING },
            hints: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["questionText", "schemaContext", "hints"],
        },
      },
    });

    const data = JSON.parse(response.text || '{}');
    
    return {
      id: crypto.randomUUID(),
      topic,
      difficulty,
      type: 'query_writing',
      questionText: data.questionText,
      schemaContext: data.schemaContext,
      hints: data.hints,
    };
  } catch (error) {
    console.error("Error generating question:", error);
    return {
      id: 'fallback',
      topic,
      difficulty,
      type: 'query_writing',
      questionText: "Explain the difference between RANK() and DENSE_RANK() using the Class of '26 schema.",
      schemaContext: "Table: Student_Scores (student_id, subject, score)",
      hints: ["Think about gaps in ranking", "Consider duplicate values"],
    };
  }
};

export const evaluateSubmission = async (
  question: QuizQuestion,
  userQuery: string
): Promise<EvaluationResult> => {
  const curriculumContext = getContextForTopic(question.topic);

  const prompt = `
    You are a Senior SQL Professor for the Class of '26. Grade this submission.
    
    CURRICULUM CONTEXT:
    ${curriculumContext}
    
    Context:
    Question: ${question.questionText}
    Schema: ${question.schemaContext}
    Difficulty: ${question.difficulty}
    
    Student's Answer:
    ${userQuery}
    
    Task:
    1. Determine if the query is logically correct based on the Curriculum Rules provided.
    2. Check for syntax errors.
    3. Check for efficiency.
    4. Provide the optimal correct solution using the specific functions mentioned in the curriculum (e.g. if the curriculum mentions NTH_VALUE, prefer that over self-joins).
    
    Return JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isCorrect: { type: Type.BOOLEAN },
            scoreAwarded: { type: Type.NUMBER, description: "Score between 0 and 100" },
            explanation: { type: Type.STRING, description: "Deep dive explanation relating back to the curriculum slides." },
            correctQuery: { type: Type.STRING, description: "The ideal SQL query." },
            optimizationTip: { type: Type.STRING, description: "How to make it faster." },
            userFeedback: { type: Type.STRING, description: "Specific feedback on the user's specific code." },
            suggestDifficultyIncrease: { type: Type.BOOLEAN },
          },
          required: ["isCorrect", "scoreAwarded", "explanation", "correctQuery", "optimizationTip", "userFeedback", "suggestDifficultyIncrease"],
        },
      },
    });

    return JSON.parse(response.text || '{}') as EvaluationResult;
  } catch (error) {
    console.error("Error evaluating answer:", error);
    return {
      isCorrect: false,
      scoreAwarded: 0,
      explanation: "Error connecting to grading server.",
      correctQuery: "SELECT 'Error';",
      optimizationTip: "N/A",
      userFeedback: "We could not grade your answer at this time.",
      suggestDifficultyIncrease: false
    };
  }
};

export const getTopicDeepDive = async (topicTitle: string): Promise<string> => {
   const curriculumContext = getContextForTopic(topicTitle);
   
   const prompt = `
    Write a comprehensive, textbook-quality tutorial on ${topicTitle} in SQL.
    
    CRITICAL: The content MUST be strictly based on these curriculum notes and rules:
    ${curriculumContext}

    Structure the response using standard Markdown:
    1. **Title**: Use an H1 (#) for the main title.
    2. **Introduction**: Brief summary of the concept.
    3. **Key Concepts**: Use H2 (##) for sections. Use bolding (**text**) for key terms defined in the curriculum.
    4. **Syntax & Examples**: Use code blocks (\`\`\`sql) for ALL SQL examples. Use Markdown Tables for comparing concepts (e.g. RANK vs DENSE_RANK).
    5. **Common Pitfalls**: Use a blockquote (>) to highlight traps mentioned in the slides (e.g. "Fan Traps").
    6. **Real-world Scenario**: Provide a concrete example (e.g. "Class of '26 Database").

    Keep it educational, formal, and visually structured. Ensure headers are clearly marked with #.
   `;
   
   try {
     const response = await ai.models.generateContent({
       model: modelId,
       contents: prompt,
     });
     return response.text || 'Content unavailable.';
   } catch (e) {
     return "## Error loading content.";
   }
}
