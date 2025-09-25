
export interface Definitions {
  bahasa?: string;
  istilah?: string;
  kenapaAda?: string;
  contoh?: string;
  referensi?: string[];
}

export interface Term {
  id: string;
  title: string;
  definitions: Definitions;
  isUnderstood?: boolean;
}

export interface Category {
  id: string;
  name: string;
  terms: Term[];
}

export interface GlossaryData {
  categories: Category[];
}

// --- Tipe baru untuk Kuis ---

export interface QuizQuestion {
  term: Term;
  questionText: string;
  options: string[];
  correctAnswer: string;
}

export interface UserAnswer {
  question: QuizQuestion;
  userAnswer: string;
  isCorrect: boolean;
}

// --- Tipe baru untuk Grafik Dependensi ---

export interface Node {
  id: string;
  title: string;
  radius: number;
  // d3-force properties
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface Link {
  source: string; // term ID
  target: string; // term ID
}

export interface GraphData {
    nodes: Node[];
    links: Link[];
}