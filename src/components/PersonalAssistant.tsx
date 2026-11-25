import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  Check,
  ClipboardCopy,
  Loader2,
  RotateCcw,
  Send,
  Wand2,
} from 'lucide-react';
import type { AssistantMessage } from '../types';
import { runQuickTool, streamAssistantChat } from '../api/aiClient';
import {
  EDUCATION_LEVEL_GROUPS,
  SUBJECT_OPTIONS,
} from '../constants/educationOptions';

interface PersonalAssistantProps {
  messages: AssistantMessage[];
  recentTopics: string[];
  onUpdateMessages: (messages: AssistantMessage[]) => void;
  onResetMessages: () => void;
}

const QUICK_PROMPTS = [
  "Darsda o'quvchilarning diqqatini jamlash uchun 5 daqiqalik qiziqarli o'yin taklif qil",
  "Kvadrat tenglamalar mavzusi bo'yicha uyga vazifani qanday tekshirishni tezlashtirsam bo'ladi?",
  "Sust o'zlashtiruvchi o'quvchilarni rag'batlantirish uchun 4 ta amaliy usul ber",
  "Sinf majlisi uchun ota-onalarga qisqa va samarali kun tartibi tuzib ber",
];

type QuickToolKey = 'parent_message' | 'rubric' | 'simplify' | 'variant_test';

const QUICK_TOOLS: Array<{
  id: QuickToolKey;
  label: string;
  placeholder: string;
}> = [
  {
    id: 'parent_message',
    label: 'Ota-onaga xabar',
    placeholder: "Masalan: Boburjon oxirgi darslarda faol, ammo uyga vazifani kech topshiryapti...",
  },
  {
    id: 'rubric',
    label: 'Baholash rubrikasi',
    placeholder: "Masalan: Mavzu bo'yicha taqdimot yoki laboratoriya ishi",
  },
  {
    id: 'simplify',
    label: 'Sodda tushuntirish',
    placeholder: "Masalan: Pifagor teoremasi yoki Fotosintez",
  },
  {
    id: 'variant_test',
    label: '2 ta parallel variant',
    placeholder: "Masalan: O'nli kasrlarni ko'paytirish",
  },
];

export function PersonalAssistant({
  messages,
  recentTopics,
  onUpdateMessages,
  onResetMessages,
}: PersonalAssistantProps) {
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  // Quick tool state
  const [activeTool, setActiveTool] = useState<QuickToolKey>('parent_message');
  const [toolInput, setToolInput] = useState('');
  const [toolGrade, setToolGrade] = useState('8-sinf');
  const [toolSubject, setToolSubject] = useState('Matematika');
  const [toolResult, setToolResult] = useState('');
  const [toolLoading, setToolLoading] = useState(false);
  const [toolError, setToolError] = useState<string | null>(null);
  const [toolCopied, setToolCopied] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, isStreaming]);

  const sendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isStreaming) return;

    setChatError(null);
    const userMsg: AssistantMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: trimmed,
      timestamp: new Date().toISOString(),
    };
    const modelMsgId = `m-${Date.now() + 1}`;
    const placeholderModelMsg: AssistantMessage = {
      id: modelMsgId,
      role: 'model',
      text: '',
      timestamp: new Date().toISOString(),
    };

    const nextHistory = [...messages, userMsg];
    onUpdateMessages([...nextHistory, placeholderModelMsg]);
    setInput('');
    setIsStreaming(true);

    let accumulated = '';
    try {
      await streamAssistantChat(nextHistory, recentTopics, (chunk) => {
        accumulated += chunk;
        onUpdateMessages([
          ...nextHistory,
          {
            ...placeholderModelMsg,
            text: accumulated,
          },
        ]);
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Xatolik yuz berdi.';
      setChatError(msg);
      if (!accumulated) {
        onUpdateMessages(nextHistory);
      }
    } finally {
      setIsStreaming(false);
    }
  };

  const handleChatSubmit = (e: FormEvent) => {
    e.preventDefault();
    void sendMessage(input);
  };

  const handleToolSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!toolInput.trim() || toolLoading) return;
    setToolLoading(true);
    setToolError(null);
    try {
      const result = await runQuickTool({
        toolType: activeTool,
        input: toolInput.trim(),
        grade: toolGrade,
        subject: toolSubject,
      });
      setToolResult(result);
    } catch (err) {
      setToolError(err instanceof Error ? err.message : 'Xatolik yuz berdi.');
    } finally {
      setToolLoading(false);
    }
  };

  const activeToolMeta = QUICK_TOOLS.find((t) => t.id === activeTool) || QUICK_TOOLS[0];

  return (
    <div className="max-w-[1240px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Main Conversational Assistant */}
      <section className="lg:col-span-7 bg-white border border-slate-200 rounded-xl flex flex-col h-[700px] overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4 shrink-0">
          <div>
            <h2 className="font-display text-base font-semibold text-slate-900">
              Shaxsiy pedagogik AI yordamchi
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Metodika, dars g‘oyalari va kundalik yozishmalarda vaqtingizni tejang
            </p>
          </div>
          <button
            type="button"
            onClick={onResetMessages}
            disabled={isStreaming}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 whitespace-nowrap shrink-0"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Yangi suhbat</span>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-blue-700 text-white'
                    : 'bg-slate-50 border border-slate-200 text-slate-800'
                }`}
              >
                {msg.text || (isStreaming && msg.role === 'model' ? 'Javob yozilmoqda...' : '')}
                {msg.role === 'model' && msg.text && (
                  <div className="mt-2 pt-2 border-t border-slate-200/70 flex justify-end">
                    <button
                      type="button"
                      onClick={async () => {
                        await navigator.clipboard.writeText(msg.text);
                        setCopiedMsgId(msg.id);
                        setTimeout(() => setCopiedMsgId(null), 1800);
                      }}
                      className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900"
                    >
                      {copiedMsgId === msg.id ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-600" />
                          <span>Nusxalandi</span>
                        </>
                      ) : (
                        <>
                          <ClipboardCopy className="h-3 w-3" />
                          <span>Nusxalash</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Quick Prompts & Input */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50 space-y-3 shrink-0">
          {chatError && (
            <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {chatError}
            </p>
          )}

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {QUICK_PROMPTS.map((q, idx) => (
              <button
                key={idx}
                type="button"
                disabled={isStreaming}
                onClick={() => void sendMessage(q)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 hover:border-blue-600 hover:text-blue-700 transition-colors whitespace-nowrap shrink-0"
              >
                {q.length > 44 ? `${q.slice(0, 44)}…` : q}
              </button>
            ))}
          </div>

          <form onSubmit={handleChatSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Savol yoki topshirig'ingizni yozing..."
              disabled={isStreaming}
              className="flex-1 h-10 px-3.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700/20 focus:border-blue-700"
            />
            <button
              type="submit"
              disabled={isStreaming || !input.trim()}
              className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-blue-700 text-white text-sm font-medium hover:bg-blue-800 disabled:opacity-50 whitespace-nowrap shrink-0"
            >
              {isStreaming ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span>Yuborish</span>
            </button>
          </form>
        </div>
      </section>

      {/* Time-Saving Quick Tools */}
      <section className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-5">
        <div>
          <h3 className="font-display text-base font-semibold text-slate-900">
            Vaqtni tejovchi tezkor vositalar
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Bir marta bosish bilan tayyor matn, rubrika yoki variant oling
          </p>
        </div>

        {/* Segmented tool selector */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-lg">
          {QUICK_TOOLS.map((tool) => (
            <button
              key={tool.id}
              type="button"
              onClick={() => {
                setActiveTool(tool.id);
                setToolError(null);
              }}
              className={`px-2.5 py-2 rounded-md text-xs font-medium transition-colors text-center whitespace-nowrap truncate ${
                activeTool === tool.id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tool.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleToolSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Bosqich / Daraja
              </label>
              <select
                value={toolGrade}
                onChange={(e) => setToolGrade(e.target.value)}
                className="w-full h-9 px-2.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-900"
              >
                {EDUCATION_LEVEL_GROUPS.map((grp) => (
                  <optgroup key={grp.label} label={grp.label}>
                    {grp.options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Fan / Yo‘nalish
              </label>
              <select
                value={toolSubject}
                onChange={(e) => setToolSubject(e.target.value)}
                className="w-full h-9 px-2.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-900"
              >
                {SUBJECT_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Tavsif yoki mavzu
            </label>
            <textarea
              rows={3}
              value={toolInput}
              onChange={(e) => setToolInput(e.target.value)}
              placeholder={activeToolMeta.placeholder}
              className="w-full p-3 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-700/20 focus:border-blue-700"
              required
            />
          </div>

          {toolError && (
            <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {toolError}
            </p>
          )}

          <button
            type="submit"
            disabled={toolLoading || !toolInput.trim()}
            className="w-full h-10 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-50 inline-flex items-center justify-center gap-2"
          >
            {toolLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Tayyorlanmoqda...</span>
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" />
                <span>Natija yaratish</span>
              </>
            )}
          </button>
        </form>

        {toolResult && (
          <div className="pt-4 border-t border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-900">Tayyor natija</span>
              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(toolResult);
                  setToolCopied(true);
                  setTimeout(() => setToolCopied(false), 1800);
                }}
                className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-800"
              >
                {toolCopied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Nusxalandi</span>
                  </>
                ) : (
                  <>
                    <ClipboardCopy className="h-3.5 w-3.5" />
                    <span>Nusxalash</span>
                  </>
                )}
              </button>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-800 whitespace-pre-wrap leading-relaxed max-h-[260px] overflow-y-auto">
              {toolResult}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
