export enum QuestionType {
  MCQ = 'MCQ', // Multiple Choice Question
  MSQ = 'MSQ', // Multiple Select Question
  NAT = 'NAT', // Numerical Answer Type
}

export enum Difficulty {
  EASY = 'Easy',
  MEDIUM = 'Medium',
  HARD = 'Hard',
}

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options?: string[]; // For MCQ and MSQ
  correctAnswer: string[]; // Array of strings (even for NAT/MCQ for consistency)
  explanation: string;
  topic: string;
}

export interface QuizConfig {
  topic: string;
  examType: string; // 'GATE', 'SSC', 'UPSC', 'General'
  difficulty: Difficulty;
  questionCount: number;
}

export interface UserAnswer {
  questionId: string;
  selectedOptions: string[]; // What the user picked/typed
  isCorrect: boolean;
  timeTaken: number; // in seconds
}

export interface GameState {
  questions: Question[];
  currentQuestionIndex: number;
  score: number;
  streak: number;
  answers: UserAnswer[];
  status: 'idle' | 'loading' | 'playing' | 'review' | 'results';
}