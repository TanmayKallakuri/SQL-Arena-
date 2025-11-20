
import { QuizQuestion, Difficulty } from "../types";

export const STATIC_CONTENT: Record<string, string> = {
  "Window Functions": `
# Window Functions
Window functions operate on a set of rows and return a single value for each row from the underlying query. The term window describes the set of rows on which the function operates. A window function uses values from the rows in a window to calculate the returned values.

---

## 1. Key Concepts

- **Window**: The set of rows that the function operates on.
- **PARTITION BY**: Divides the result set into partitions (groups) to which the window function is applied.
- **ORDER BY**: Specifies the order of rows within each partition.
- **Frame**: A subset of rows within the partition (e.g., "current row and previous 2 rows").

> **Important**: Unlike \`GROUP BY\`, window functions do **not** reduce the number of rows returned by the query.

---

## 2. Syntax

\`\`\`sql
SELECT 
    column_name, 
    WINDOW_FUNCTION(expression) OVER (
        [PARTITION BY partition_expression] 
        [ORDER BY sort_expression] 
        [frame_clause]
    ) AS alias_name
FROM table_name;
\`\`\`

---

## 3. Ranking Functions

| Function | Description | Example (Scores: 10, 10, 20) |
| :--- | :--- | :--- |
| \`ROW_NUMBER()\` | Sequential integer unique to each row. | 1, 2, 3 |
| \`RANK()\` | Rank with gaps for ties. | 1, 1, 3 |
| \`DENSE_RANK()\` | Rank without gaps. | 1, 1, 2 |
| \`NTILE(N)\` | Distributes rows into N buckets. | 1, 1, 2 (if N=2) |

### Example Usage

\`\`\`sql
SELECT 
    student_name,
    score,
    RANK() OVER (ORDER BY score DESC) as rank_val,
    DENSE_RANK() OVER (ORDER BY score DESC) as dense_rank_val
FROM exam_results;
\`\`\`

---

## 4. Value Functions

These functions allow you to access data from other rows in the window.

- **\`LAG(col, n, default)\`**: Returns value from \`n\` rows *before* current row.
- **\`LEAD(col, n, default)\`**: Returns value from \`n\` rows *after* current row.
- **\`FIRST_VALUE(col)\`**: Returns value from the first row in the window frame.
- **\`LAST_VALUE(col)\`**: Returns value from the last row in the window frame.

### Real-world Scenario: Year-over-Year Growth

\`\`\`sql
SELECT 
    Year,
    Revenue,
    LAG(Revenue, 1, 0) OVER (ORDER BY Year) as Previous_Year_Revenue,
    (Revenue - LAG(Revenue, 1, 0) OVER (ORDER BY Year)) as Growth
FROM Sales;
\`\`\`

---

## 5. Frame Specifications

The frame clause refines the set of rows.

- **\`ROWS\`**: Physical rows (e.g., \`ROWS BETWEEN 1 PRECEDING AND CURRENT ROW\`).
- **\`RANGE\`**: Logical values (e.g., values within 10 units of current value).

**Keywords**:
- \`UNBOUNDED PRECEDING\`: Start of partition.
- \`CURRENT ROW\`: The row being evaluated.
- \`UNBOUNDED FOLLOWING\`: End of partition.

\`\`\`sql
-- Running Total
SUM(amount) OVER (
    PARTITION BY department 
    ORDER BY date 
    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
)
\`\`\`
`,

  "Subqueries": `
# Subqueries (Nested Queries)
A subquery is a query nested inside another query such as \`SELECT\`, \`INSERT\`, \`UPDATE\`, or \`DELETE\`.

---

## 1. Types of Subqueries

| Type | Description | Where it can be used |
| :--- | :--- | :--- |
| **Scalar** | Returns a single value (one row, one column). | \`SELECT\` list, \`WHERE\` clause |
| **Row** | Returns a single row (multiple columns). | \`WHERE\` clause (tuple comparison) |
| **Table** | Returns a result set (multiple rows/cols). | \`FROM\` clause (Derived Table) |

---

## 2. Correlated Subqueries

A correlated subquery uses values from the outer query. It is evaluated **once for each row** processed by the outer query.

**Concept**: The inner query references a column from a table in the outer query (an "Outer Reference").

\`\`\`sql
-- Find employees earning more than the average of THEIR department
SELECT e1.name, e1.salary, e1.dept_id
FROM employees e1
WHERE e1.salary > (
    SELECT AVG(e2.salary)
    FROM employees e2
    WHERE e2.dept_id = e1.dept_id -- Outer Reference
);
\`\`\`

---

## 3. Existence Tests (\`EXISTS\`)

- **\`EXISTS\`**: Returns \`TRUE\` if the subquery returns **one or more rows**.
- It ignores the actual values returned (often used with \`SELECT 1\`).
- More efficient than \`IN\` for large datasets when checking existence.

\`\`\`sql
-- Find customers who have placed at least one order
SELECT name 
FROM customers c
WHERE EXISTS (
    SELECT 1 FROM orders o WHERE o.customer_id = c.id
);
\`\`\`

---

## 4. Quantified Comparison (\`ANY\` / \`ALL\`)

- **\`> ANY\`**: Greater than *at least one* value in the subquery result (equivalent to \`> MIN\`).
- **\`> ALL\`**: Greater than *every* value in the subquery result (equivalent to \`> MAX\`).

> **Pitfall**: If the subquery returns a \`NULL\` value:
> - \`ALL\` comparisons will return unknown (effectively false).
> - \`NOT IN\` will return empty set if the list contains \`NULL\`.

\`\`\`sql
-- Find products cheaper than ALL luxury products
SELECT name FROM products
WHERE price < ALL (
    SELECT price FROM products WHERE category = 'Luxury'
);
\`\`\`
`,

  "Normalization": `
# Database Normalization
Normalization is the process of organizing data in a database. This includes creating tables and establishing relationships between those tables according to rules designed both to protect the data and to make the database more flexible by eliminating redundancy and inconsistent dependency.

---

## 1. The Anomalies (Why we normalize)

- **Insertion Anomaly**: Cannot insert data because other data is missing (e.g., cannot add a student without a class).
- **Deletion Anomaly**: Deleting data causes unintended loss of other data (e.g., deleting the last student in a class deletes the class info).
- **Update Anomaly**: Updating data in one place requires updating duplicates elsewhere.

---

## 2. Normal Forms

### First Normal Form (1NF)
- **Rules**:
  1. Table format (rows and columns).
  2. No repeating groups (atomic values).
  3. Primary Key (PK) identified.

### Second Normal Form (2NF)
- **Rules**:
  1. Must be in 1NF.
  2. **No Partial Dependencies**: All non-key attributes must depend on the *entire* primary key (only applies to composite PKs).
  
*Solution*: Split the table. Move columns dependent on only *part* of the key to a new table.

### Third Normal Form (3NF)
- **Rules**:
  1. Must be in 2NF.
  2. **No Transitive Dependencies**: Non-key attributes must not depend on other non-key attributes.
  
*Solution*: "Determinants should be Candidate Keys". Move the transitive attributes to a lookup table.

### Boyce-Codd Normal Form (BCNF)
- A special case of 3NF where **every determinant is a candidate key**.
- Addresses anomalies in tables with multiple overlapping candidate keys.

### Fourth Normal Form (4NF)
- **Rules**:
  1. Must be in BCNF.
  2. **No Multivalued Dependencies**: One key determines multiple independent attributes.
  
*Example*: A professor teaches multiple subjects AND advises multiple students. These two facts are independent and should be in separate tables to avoid Cartesian product rows.

---

## 3. Denormalization
Deliberately introducing redundancy (e.g., storing a calculated \`total_price\` column) to improve read performance at the cost of write performance and storage.
`,

  "Advanced Modeling": `
# Advanced Data Modeling (EER)
The Extended Entity Relationship (EER) model adds semantic concepts to the standard ER model to handle complex data requirements.

---

## 1. Supertype and Subtype

- **Supertype**: A generic entity type that has a relationship with one or more subtypes. (e.g., \`Employee\`).
- **Subtype**: A subgrouping of the supertype entities that has unique attributes. (e.g., \`Pilot\`, \`Mechanic\`).

> **Inheritance**: Subtypes inherit all attributes and relationships of their supertype.

---

## 2. Constraints

### Disjointness Constraints
- **Disjoint (d)**: An entity instance can be a member of **at most one** of the subtypes. (An employee cannot be both a Pilot and a Mechanic).
- **Overlapping (o)**: An entity instance can be a member of **multiple** subtypes. (A Person can be both an Employee and a Student).

### Completeness Constraints
- **Partial Completeness (Single Line)**: A supertype instance *does not have to* belong to any subtype. (An employee might be neither a pilot nor a mechanic, just general staff).
- **Total Completeness (Double Line)**: Every supertype instance *must* be a member of at least one subtype.

---

## 3. Entity Clustering
Grouping multiple entities and relationships into a single abstract entity to simplify the diagram for high-level viewing. This is purely a visual tool and does not affect the underlying schema.

---

## 4. Keys

- **Natural Key**: A key derived from the data itself (e.g., SSN, Email).
- **Surrogate Key**: A system-generated unique key (e.g., \`id INT AUTO_INCREMENT\`).
  - *Pros*: Immutable, faster joins, no security risk (unlike SSN).
  - *Cons*: Disconnected from real-world meaning.
`
};

// New Static Quiz Bank for Instant Loading
export const STATIC_QUIZ_QUESTIONS: Record<string, QuizQuestion[]> = {
  "window_functions": [
    {
      id: "wf_1",
      topic: "Window Functions",
      difficulty: Difficulty.INTERMEDIATE,
      type: "query_writing",
      questionText: "Write a query to rank employees by salary within each department. Use `DENSE_RANK()` so that if two employees have the same salary, they share the same rank, and the next rank is sequential.",
      schemaContext: "Table: EMPLOYEES\n- EMP_ID (INT)\n- NAME (VARCHAR)\n- DEPT_ID (INT)\n- SALARY (INT)",
      hints: ["Use PARTITION BY to group by department", "Use ORDER BY to sort by salary descending"]
    },
    {
      id: "wf_2",
      topic: "Window Functions",
      difficulty: Difficulty.ADVANCED,
      type: "query_writing",
      questionText: "Calculate the 'Running Total' of sales for each sales representative, ordered by the date of sale.",
      schemaContext: "Table: SALES\n- SALE_ID (INT)\n- REP_ID (INT)\n- SALE_DATE (DATE)\n- AMOUNT (DECIMAL)",
      hints: ["Use SUM() as a window function", "The frame should be UNBOUNDED PRECEDING to CURRENT ROW"]
    }
  ],
  "subqueries": [
    {
      id: "sq_1",
      topic: "Subqueries",
      difficulty: Difficulty.INTERMEDIATE,
      type: "query_writing",
      questionText: "Find the names of all products that have a price higher than the average price of ALL products.",
      schemaContext: "Table: PRODUCTS\n- PROD_ID (INT)\n- PROD_NAME (VARCHAR)\n- PRICE (DECIMAL)",
      hints: ["Calculate the average price in a subquery", "Use > operator with the scalar result"]
    },
    {
      id: "sq_2",
      topic: "Subqueries",
      difficulty: Difficulty.ADVANCED,
      type: "query_writing",
      questionText: "List employees who earn more than the average salary of their respective department (Correlated Subquery).",
      schemaContext: "Table: EMPLOYEES\n- EMP_ID (INT)\n- NAME (VARCHAR)\n- DEPT_ID (INT)\n- SALARY (INT)",
      hints: ["The inner query needs to reference the outer query's department ID", "This creates an 'Outer Reference'"]
    }
  ],
  "normalization": [
    {
      id: "norm_1",
      topic: "Normalization",
      difficulty: Difficulty.INTERMEDIATE,
      type: "query_writing",
      questionText: "Given a table `STUDENT_CLASSES (Student_ID, Student_Name, Class_ID, Class_Name)`, identify the partial dependency and write the SQL to split it into 2NF.",
      schemaContext: "Current PK: (Student_ID, Class_ID)\nDependencies:\n- Student_ID -> Student_Name\n- Class_ID -> Class_Name",
      hints: ["Student_Name depends only on part of the key", "Create separate tables for Students and Classes"]
    }
  ]
};
