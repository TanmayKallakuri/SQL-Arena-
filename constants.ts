import { SqlTopic, TopicContent, LeaderboardEntry } from "./types";

export const TOPICS: TopicContent[] = [
  {
    id: 'window_functions',
    title: 'Window Functions',
    description: 'Master OVER(), partitioning, frames, and ranking functions like NTH_VALUE and CUME_DIST.',
    keyConcepts: ['PARTITION BY', 'ROWS/RANGE FRAME', 'LAG/LEAD', 'NTH_VALUE', 'CUME_DIST', 'PERCENT_RANK'],
    icon: 'Layers'
  },
  {
    id: 'subqueries',
    title: 'Subqueries',
    description: 'Deep dive into nested queries, correlated subqueries, and existence testing.',
    keyConcepts: ['Correlated Subqueries', 'EXISTS vs IN', 'ANY / ALL Operators', 'Scalar vs Table Subqueries', 'Outer References'],
    icon: 'GitMerge'
  },
  {
    id: 'normalization',
    title: 'Normalization',
    description: 'Eliminate redundancy and anomalies. Master dependencies and Normal Forms (1NF to 4NF).',
    keyConcepts: ['Functional Dependencies', 'Transitive Dependency', '1NF, 2NF, 3NF, BCNF', 'Multivalued Dependency (4NF)', 'Primary/Foreign Keys'],
    icon: 'Database'
  },
  {
    id: 'data_modeling',
    title: 'Advanced Modeling',
    description: 'Extended Entity Relationship (EER) models, supertypes, subtypes, and inheritance.',
    keyConcepts: ['Supertypes & Subtypes', 'Disjoint vs Overlapping', 'Completeness Constraints', 'Entity Clustering', 'Surrogate Keys'],
    icon: 'ListTree'
  }
];

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { name: "Alice_DBA", score: 2500, rank: 1, badges: ["Query God"] },
  { name: "Bob_Builder", score: 2100, rank: 2, badges: ["Join Master"] },
  { name: "Charlie_SQL", score: 1850, rank: 3, badges: [] },
  { name: "Data_Diana", score: 1600, rank: 4, badges: ["Window Wizard"] },
  { name: "Index_Ian", score: 1200, rank: 5, badges: [] },
];