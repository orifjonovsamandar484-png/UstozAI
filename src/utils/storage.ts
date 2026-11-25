import type { AssistantMessage, LessonBundle, Student, TeacherTask } from '../types';
import { INITIAL_BUNDLES, INITIAL_STUDENTS, INITIAL_TASKS } from '../data/seedData';

const KEYS = {
  bundles: 'ustozai_bundles_v1',
  students: 'ustozai_students_v1',
  tasks: 'ustozai_tasks_v1',
  assistant: 'ustozai_assistant_v1',
};

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveJson<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors gracefully
  }
}

export function loadBundles(): LessonBundle[] {
  return loadJson<LessonBundle[]>(KEYS.bundles, INITIAL_BUNDLES);
}

export function saveBundles(bundles: LessonBundle[]): void {
  saveJson(KEYS.bundles, bundles);
}

export function loadStudents(): Student[] {
  return loadJson<Student[]>(KEYS.students, INITIAL_STUDENTS);
}

export function saveStudents(students: Student[]): void {
  saveJson(KEYS.students, students);
}

export function loadTasks(): TeacherTask[] {
  return loadJson<TeacherTask[]>(KEYS.tasks, INITIAL_TASKS);
}

export function saveTasks(tasks: TeacherTask[]): void {
  saveJson(KEYS.tasks, tasks);
}

export function loadAssistantMessages(): AssistantMessage[] {
  return loadJson<AssistantMessage[]>(KEYS.assistant, [
    {
      id: 'welcome-1',
      role: 'model',
      text: "Assalomu alaykum, ustoz! Men sizning shaxsiy AI yordamchingizman. Dars rejasini boyitish, murakkab mavzuni sodda tushuntirish, ota-onalarga xabar yozish yoki nazorat ishi rubrikasini tuzishda bir zumda yordam beraman. Bugun qaysi vazifada vaqtingizni tejaymiz?",
      timestamp: new Date().toISOString(),
    },
  ]);
}

export function saveAssistantMessages(messages: AssistantMessage[]): void {
  saveJson(KEYS.assistant, messages);
}

export function getStudentAverage(student: Student): number {
  if (!student.scores || student.scores.length === 0) return 0;
  const totalPct = student.scores.reduce((sum, s) => {
    const pct = (s.score / Math.max(s.maxScore, 1)) * 100;
    return sum + pct;
  }, 0);
  return Math.round(totalPct / student.scores.length);
}
