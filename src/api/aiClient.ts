import type {
  AssistantMessage,
  LessonBundle,
  Student,
  StudentRecommendation,
} from '../types';

export interface GenerateBundleParams {
  topic: string;
  subject: string;
  grade: string;
  durationMinutes: number;
  questionCount: number;
  difficulty: string;
  notes?: string;
}

export async function generateLessonBundle(
  params: GenerateBundleParams
): Promise<LessonBundle> {
  const res = await fetch('/api/ai/generate-bundle', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Dars to'plamini yaratishda xatolik yuz berdi.");
  }
  return data as LessonBundle;
}

export async function streamAssistantChat(
  messages: AssistantMessage[],
  recentTopics: string[],
  onChunk: (text: string) => void
): Promise<void> {
  const res = await fetch('/api/ai/assistant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: messages.map((m) => ({ role: m.role, text: m.text })),
      context: { recentTopics },
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || "Yordamchi bilan bog'lanishda xatolik.");
  }

  const reader = res.body?.getReader();
  if (!reader) {
    throw new Error("Oqimli javobni o'qib bo'lmadi.");
  }

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data: ')) continue;
      const payloadStr = trimmed.slice(6);
      try {
        const parsed = JSON.parse(payloadStr) as {
          text?: string;
          error?: string;
          done?: boolean;
        };
        if (parsed.error) {
          throw new Error(parsed.error);
        }
        if (parsed.text) {
          onChunk(parsed.text);
        }
      } catch (e) {
        if (e instanceof Error && e.message !== 'Unexpected end of JSON input') {
          throw e;
        }
      }
    }
  }
}

export async function runQuickTool(params: {
  toolType: 'parent_message' | 'rubric' | 'simplify' | 'variant_test';
  input: string;
  grade: string;
  subject: string;
}): Promise<string> {
  const res = await fetch('/api/ai/quick-tool', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Tezkor vosita xatosi.');
  }
  return String(data.result || '');
}

export async function generateStudentRecommendation(
  student: Student
): Promise<StudentRecommendation> {
  const res = await fetch('/api/ai/recommend-student', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ student }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Individual tavsiya yaratishda xatolik.');
  }
  return data as StudentRecommendation;
}
