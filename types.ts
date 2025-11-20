export enum Difficulty {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced',
  EXPERT = 'Expert' // "God Mode" for optimization/recursive CTEs
}

export enum SqlTopic {
  WINDOW_FUNCTIONS = 'Window Functions',
  SUBQUERIES = 'Subqueries & CTEs',
  NORMALIZATION = 'Normalization (1NF - 4NF)',
  DATA_MODELING = 'Advanced Data Modeling (EER)',
  JOINS = 'Joins & Set Operations'
}

export interface UserProfile {
  name: string;
  currentScore: number;
  streak: number;
  selectedDifficulty: Difficulty;
}

export interface LeaderboardEntry {
  name: string;
  score: number;
  rank: number;
  badges: string[];
}

export interface QuizQuestion {
  id: string;
  topic: string;
  difficulty: Difficulty;
  questionText: string;
  schemaContext: string; // Description of tables
  hints: string[];
  type: 'query_writing' | 'multiple_choice';
  // For multiple choice (optional fallback)
  options?: string[]; 
}

export interface EvaluationResult {
  isCorrect: boolean;
  scoreAwarded: number;
  explanation: string;
  correctQuery: string;
  optimizationTip: string;
  userFeedback: string; // Specific feedback on user's error
  suggestDifficultyIncrease: boolean;
}

export interface TopicContent {
  id: string;
  title: string;
  description: string;
  keyConcepts: string[];
  icon: string;
}