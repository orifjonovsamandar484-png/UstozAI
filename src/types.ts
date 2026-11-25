export type WorkspaceTab = 'overview' | 'studio' | 'assistant' | 'students';

export interface LessonStage {
  name: string;
  durationMinutes: number;
  teacherAction: string;
  studentAction: string;
}

export interface LessonPlan {
  objectives: string[];
  materialsNeeded: string[];
  stages: LessonStage[];
  differentiation: string;
  assessmentCriteria: string;
}

export interface TestQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'open';
  options: string[];
  correctIndex: number;
  correctAnswerText?: string;
  explanation: string;
  difficulty: 'Oson' | "O'rta" | 'Qiyin';
}

export interface KeyConcept {
  term: string;
  definition: string;
}

export interface AdditionalMaterials {
  keyConcepts: KeyConcept[];
  classroomActivity: string;
  homework: string;
  realLifeAnalogy: string;
  quickFacts: string[];
}

export interface LessonBundle {
  id: string;
  title: string;
  topic: string;
  subject: string;
  grade: string;
  durationMinutes: number;
  summary: string;
  createdAt: string;
  lessonPlan: LessonPlan;
  tests: TestQuestion[];
  additionalMaterials: AdditionalMaterials;
}

export interface StudentScore {
  id: string;
  subject: string;
  topic: string;
  score: number;
  maxScore: number;
  date: string;
  notes?: string;
}

export interface RecommendationWeek {
  week: string;
  focus: string;
  exercises: string[];
}

export interface StudentRecommendation {
  generatedAt: string;
  overallSummary: string;
  strengths: string[];
  weakTopics: string[];
  twoWeekPlan: RecommendationWeek[];
  teacherTips: string[];
  parentNote: string;
}

export interface Student {
  id: string;
  name: string;
  grade: string;
  attendanceRate: number;
  learningStyle: string;
  notes: string;
  scores: StudentScore[];
  recommendation?: StudentRecommendation;
}

export interface AssistantMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export interface TeacherTask {
  id: string;
  title: string;
  dueLabel: string;
  completed: boolean;
}
