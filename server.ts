import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MODEL_NAME = 'gemini-4-hydrogen';

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error('MISSING_API_KEY');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function formatAiError(error: unknown): { status: number; message: string } {
  if (error instanceof Error && error.message === 'MISSING_API_KEY') {
    return {
      status: 500,
      message:
        "GEMINI_API_KEY sozlanmagan. Iltimos, AI Studio Settings > Secrets bo'limida API kalitini tekshiring.",
    };
  }
  const msg = error instanceof Error ? error.message : String(error);
  if (msg.includes('403') || msg.includes('PERMISSION_DENIED') || msg.includes('API_KEY_INVALID')) {
    return {
      status: 403,
      message:
        "API kaliti yaroqsiz yoki ruxsat berilmagan. Settings > Secrets panelidan GEMINI_API_KEY ni tekshiring.",
    };
  }
  if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) {
    return {
      status: 429,
      message:
        "So'rovlar limiti tugadi (429). Biroz kuting yoki Settings > Secrets panelidan hisob rejasini tekshiring.",
    };
  }
  return {
    status: 500,
    message: `AI xizmati bilan bog'lanishda xatolik: ${msg}`,
  };
}

const app = express();
app.use(express.json({ limit: '2mb' }));

app.post('/api/ai/generate-bundle', async (req, res) => {
  try {
    const {
      topic,
      subject = 'Umumiy fan',
      grade = '8-sinf',
      durationMinutes = 45,
      questionCount = 6,
      difficulty = "O'rta",
      notes = '',
    } = req.body ?? {};

    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      return res.status(400).json({ error: 'Mavzu nomi kiritilishi shart.' });
    }

    const ai = getAiClient();
    const safeQuestionCount = Math.min(Math.max(Number(questionCount) || 6, 3), 15);
    const safeDuration = Math.min(Math.max(Number(durationMinutes) || 45, 20), 120);

    const isOtm = /otm|bakalavr|magistr|kurs/i.test(String(grade));
    const prompt = `Siz barcha ta'lim bosqichlari (Oliy ta'lim / OTM — bakalavr va magistratura, maktab 1–11-sinf, akademik litsey, texnikum, maktabgacha ta'lim va o'quv markazlari) bo'yicha tajribali o'qituvchi, professor-metodist hamda pedagog AI agentsiz.
Quyidagi mavzu bo'yicha to'liq, amaliy, mashg'ulotda darhol qo'llash mumkin bo'lgan o'zbek tilidagi (lotin yozuvi) o'quv to'plamini yarating:
- Mavzu: ${topic.trim()}
- Fan / Yo'nalish: ${subject}
- Ta'lim bosqichi / Sinf / Kurs / Daraja: ${grade}
- Mashg'ulot davomiyligi: ${safeDuration} daqiqa
- Test savollari soni: ${safeQuestionCount} ta
- Murakkablik darajasi: ${difficulty}
${notes ? `- O'qituvchining qo'shimcha talabi: ${notes}` : ''}

Muhim talablar:
1. Barcha matnlar sof, adabiy va tushunarli o'zbek tilida (lotin yozuvida) bo'lsin.
2. Dars rejasi bosqichlarining daqiqalari yig'indisi aynan ${safeDuration} daqiqaga teng bo'lsin.
${isOtm ? "3. Bu OTM (universitet/institut) bosqichi bo'lgani uchun mashg'ulot rejasini ma'ruza/seminar/amaliy mashg'ulot standartlariga mos ilmiy-akademik tilda tuzing, talabalarning mustaqil ta'lim topshirig'i (referat, keys-stadi yoki laboratoriya) va baholash reyting mezonlarini kiriting." : "3. Bosqich yoshiga mos pedagogik metodlar va faol o'yin/mashqlardan foydalaning."}
4. Har bir test savolida 4 ta aniq javob varianti bo'lsin, "correctIndex" 0 dan 3 gacha bo'lgan to'g'ri indeksni ko'rsatsin va "explanation" maydonida nima uchun shu javob to'g'riligi qisqa tushuntirilsin.
5. Qo'shimcha materiallarda real hayotdan analogiya, sinf/auditoriya mashg'uloti g'oyasi, uyga/mustaqil vazifa va kalit tushunchalar bo'lsin.`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction:
          "Siz O'zbekiston ta'lim standartlariga mos ravishda o'qituvchilar uchun mukammal dars rejalari, testlar va qo'shimcha o'quv materiallari yaratuvchi AI yordamchisiz. Faqat aniq JSON qaytaring.",
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Dars to‘plamining aniq sarlavhasi' },
            summary: { type: Type.STRING, description: 'Dars mazmuni haqida 2-3 jumlalik qisqa sharh' },
            lessonPlan: {
              type: Type.OBJECT,
              properties: {
                objectives: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Darsning asosiy ta’limiy va tarbiyaviy maqsadlari (3-4 ta)',
                },
                materialsNeeded: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Dars uchun kerakli jihoz va tarqatma materiallar',
                },
                stages: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      durationMinutes: { type: Type.INTEGER },
                      teacherAction: { type: Type.STRING },
                      studentAction: { type: Type.STRING },
                    },
                    required: ['name', 'durationMinutes', 'teacherAction', 'studentAction'],
                  },
                },
                differentiation: {
                  type: Type.STRING,
                  description: "Kuchli va qo'shimcha yordamga muhtoj o'quvchilar bilan ishlash usuli",
                },
                assessmentCriteria: {
                  type: Type.STRING,
                  description: "O'quvchilarni dars davomida baholash mezonlari",
                },
              },
              required: [
                'objectives',
                'materialsNeeded',
                'stages',
                'differentiation',
                'assessmentCriteria',
              ],
            },
            tests: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Aynan 4 ta javob varianti',
                  },
                  correctIndex: { type: Type.INTEGER, description: '0 dan 3 gacha indeks' },
                  explanation: { type: Type.STRING },
                  difficulty: { type: Type.STRING, description: "Oson, O'rta yoki Qiyin" },
                },
                required: ['question', 'options', 'correctIndex', 'explanation', 'difficulty'],
              },
            },
            additionalMaterials: {
              type: Type.OBJECT,
              properties: {
                keyConcepts: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      term: { type: Type.STRING },
                      definition: { type: Type.STRING },
                    },
                    required: ['term', 'definition'],
                  },
                },
                classroomActivity: { type: Type.STRING },
                homework: { type: Type.STRING },
                realLifeAnalogy: { type: Type.STRING },
                quickFacts: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: [
                'keyConcepts',
                'classroomActivity',
                'homework',
                'realLifeAnalogy',
                'quickFacts',
              ],
            },
          },
          required: ['title', 'summary', 'lessonPlan', 'tests', 'additionalMaterials'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    const normalizedTests = Array.isArray(parsed.tests)
      ? parsed.tests.map((t: Record<string, unknown>, idx: number) => ({
          id: `q-${Date.now()}-${idx}`,
          question: String(t.question || ''),
          type: 'multiple_choice' as const,
          options: Array.isArray(t.options) ? t.options.slice(0, 4).map(String) : [],
          correctIndex:
            typeof t.correctIndex === 'number' && t.correctIndex >= 0 && t.correctIndex <= 3
              ? t.correctIndex
              : 0,
          explanation: String(t.explanation || ''),
          difficulty:
            t.difficulty === 'Oson' || t.difficulty === 'Qiyin' ? t.difficulty : ("O'rta" as const),
        }))
      : [];

    res.json({
      id: `bundle-${Date.now()}`,
      title: parsed.title || topic.trim(),
      topic: topic.trim(),
      subject,
      grade,
      durationMinutes: safeDuration,
      summary: parsed.summary || '',
      createdAt: new Date().toISOString(),
      lessonPlan: parsed.lessonPlan,
      tests: normalizedTests,
      additionalMaterials: parsed.additionalMaterials,
    });
  } catch (error) {
    const err = formatAiError(error);
    res.status(err.status).json({ error: err.message });
  }
});

app.post('/api/ai/assistant', async (req, res) => {
  try {
    const { messages, context } = req.body ?? {};
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Xabarlar ro'yxati bo'sh." });
    }

    const ai = getAiClient();
    const recentTopics = Array.isArray(context?.recentTopics)
      ? context.recentTopics.join(', ')
      : '';

    const systemInstruction = `Siz UstozAI — o'qituvchining vaqtini tejaydigan shaxsiy AI yordamchisisiz.
Vazifangiz:
- Darsga tayyorgarlik, pedagogik metodika, o'quvchilarni qiziqtirish, ota-onalar bilan muloqot xatlari, baholash mezonlari, uyga vazifa g'oyalari va sinf boshqaruvi bo'yicha tezkor, amaliy yordam berish.
- Javoblaringiz lo'nda, tizimli (ro'yxat va aniq qadamlar bilan) va darhol foydalanishga tayyor bo'lsin.
- Faqat o'zbek tilida (lotin yozuvida) javob bering.
${recentTopics ? `- O'qituvchining so'nggi o'tgan mavzulari: ${recentTopics}` : ''}`;

    const history = messages.slice(0, -1).map((m: { role: string; text: string }) => ({
      role: m.role === 'model' ? 'model' : 'user',
      parts: [{ text: String(m.text || '') }],
    }));
    const lastMessage = String(messages[messages.length - 1]?.text || '');

    const chat = ai.chats.create({
      model: MODEL_NAME,
      config: { systemInstruction },
      history,
    });

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const stream = await chat.sendMessageStream({ message: lastMessage });
    for await (const chunk of stream) {
      const text = chunk.text;
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error) {
    const err = formatAiError(error);
    if (!res.headersSent) {
      res.status(err.status).json({ error: err.message });
    } else {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    }
  }
});

app.post('/api/ai/quick-tool', async (req, res) => {
  try {
    const { toolType, input, grade = '8-sinf', subject = 'Umumiy fan' } = req.body ?? {};
    if (!input || typeof input !== 'string' || !input.trim()) {
      return res.status(400).json({ error: 'Matn yoki mavzu kiritilishi shart.' });
    }

    const ai = getAiClient();
    const prompts: Record<string, string> = {
      parent_message: `O'quvchining ota-onasi (yoki tinglovchining o'zi) uchun hurmatli, iliq va konstruktiv Telegram/SMS xabarini o'zbek tilida yozib bering. Bosqich/guruh: ${grade}. Vaziyat/izoh: ${input}`,
      rubric: `${grade}, ${subject} yo'nalishi bo'yicha "${input}" topshirig'i uchun 4 darajali (A'lo, Yaxshi, Qoniqarli, Qo'shimcha mashq kerak) aniq baholash rubrikasi jadvalini matn shaklida tuzib bering.`,
      simplify: `"${input}" mavzusini ${grade} o'quvchilari/tinglovchilari bir qarashda tushunishi uchun hayotiy misollar bilan sodda va qiziqarli qilib tushuntirib bering.`,
      variant_test: `${grade}, ${subject} yo'nalishi bo'yicha "${input}" mavzusidan bir-biriga teng qiyinlikdagi 2 ta parallel mini-nazorat ishi variantini (har birida 3 tadan savol va javob kaliti bilan) tuzib bering.`,
    };

    const selectedPrompt = prompts[String(toolType)] || prompts.simplify;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: selectedPrompt,
      config: {
        systemInstruction:
          "Siz o'qituvchining kundalik ishlarini tezlashtiruvchi yordamchisiz. O'zbek tilida (lotin yozuvi), aniq va darhol nusxalab ishlatishga tayyor natija bering.",
      },
    });

    res.json({ result: response.text || '' });
  } catch (error) {
    const err = formatAiError(error);
    res.status(err.status).json({ error: err.message });
  }
});

app.post('/api/ai/recommend-student', async (req, res) => {
  try {
    const { student } = req.body ?? {};
    if (!student || !student.name) {
      return res.status(400).json({ error: "O'quvchi ma'lumotlari yetarli emas." });
    }

    const ai = getAiClient();
    const scoresText = Array.isArray(student.scores)
      ? student.scores
          .map(
            (s: { subject: string; topic: string; score: number; maxScore: number; date: string }) =>
              `- ${s.subject} (${s.topic}): ${s.score}/${s.maxScore} (${Math.round(
                (s.score / Math.max(s.maxScore, 1)) * 100
              )}%) [${s.date}]`
          )
          .join('\n')
      : "Natijalar hali kiritilmagan.";

    const prompt = `Quyidagi o'quvchi / talaba / tinglovchi uchun individual o'quv va metodik tavsiyalar tayyorlang:
- Ism-familiya: ${student.name}
- Bosqich / Sinf / Guruh: ${student.grade}
- Davomat: ${student.attendanceRate}%
- O'rganish uslubi: ${student.learningStyle || "Aralash"}
- O'qituvchi kuzatuvi: ${student.notes || "Izoh yo'q"}
- Test va nazorat natijalari:
${scoresText}

Talablar:
1. O'quvchining haqiqiy ballari asosida kuchli tomonlari va qiynalayotgan mavzularini aniqlang.
2. Keyingi 2 hafta uchun aniq, bajarilishi mumkin bo'lgan individual mashg'ulot rejasini tuzing.
3. O'qituvchi darsda qo'llashi uchun 3 ta amaliy metodik maslahat bering.
4. Ota-onaga yuborish uchun qisqa, qo'llab-quvvatlovchi tavsiya matnini yozing.`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction:
          "Siz individual pedagogika va o'quvchi natijalari tahlili bo'yicha mutaxassissiz. Faqat o'zbek tilida (lotin yozuvi) aniq JSON qaytaring.",
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallSummary: { type: Type.STRING },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weakTopics: { type: Type.ARRAY, items: { type: Type.STRING } },
            twoWeekPlan: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  week: { type: Type.STRING },
                  focus: { type: Type.STRING },
                  exercises: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ['week', 'focus', 'exercises'],
              },
            },
            teacherTips: { type: Type.ARRAY, items: { type: Type.STRING } },
            parentNote: { type: Type.STRING },
          },
          required: [
            'overallSummary',
            'strengths',
            'weakTopics',
            'twoWeekPlan',
            'teacherTips',
            'parentNote',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({
      generatedAt: new Date().toISOString(),
      ...parsed,
    });
  } catch (error) {
    const err = formatAiError(error);
    res.status(err.status).json({ error: err.message });
  }
});

async function startServer() {
  const port = Number(process.env.PORT) || 3000;

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`UstozAI server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
