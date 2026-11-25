import { useState, type FormEvent } from 'react';
import {
  BookOpen,
  Check,
  CheckCircle2,
  ClipboardCopy,
  Clock,
  FileText,
  HelpCircle,
  Loader2,
  Plus,
  Printer,
  Search,
  Trash2,
  UserCheck,
} from 'lucide-react';
import type { LessonBundle, Student } from '../types';
import {
  EDUCATION_LEVEL_GROUPS,
  SUBJECT_OPTIONS,
} from '../constants/educationOptions';

interface StudioWorkspaceProps {
  bundles: LessonBundle[];
  selectedBundleId: string | null;
  students: Student[];
  isGenerating: boolean;
  generationError: string | null;
  showCreateForm: boolean;
  onToggleCreateForm: (open: boolean) => void;
  onSelectBundle: (id: string) => void;
  onDeleteBundle: (id: string) => void;
  onGenerateBundle: (params: {
    topic: string;
    subject: string;
    grade: string;
    durationMinutes: number;
    questionCount: number;
    difficulty: string;
    notes: string;
  }) => Promise<void>;
  onRecordTestScore: (params: {
    studentId: string;
    subject: string;
    topic: string;
    score: number;
    maxScore: number;
  }) => void;
}

export function StudioWorkspace({
  bundles,
  selectedBundleId,
  students,
  isGenerating,
  generationError,
  showCreateForm,
  onToggleCreateForm,
  onSelectBundle,
  onDeleteBundle,
  onGenerateBundle,
  onRecordTestScore,
}: StudioWorkspaceProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'plan' | 'test' | 'materials'>('plan');
  const [quizMode, setQuizMode] = useState<'teacher' | 'interactive'>('teacher');
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Record score modal state
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [scoreStudentId, setScoreStudentId] = useState(students[0]?.id || '');
  const [scoreValue, setScoreValue] = useState('85');
  const [scoreSavedNotice, setScoreSavedNotice] = useState(false);

  // Generator form fields
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('Matematika');
  const [customSubject, setCustomSubject] = useState('');
  const [grade, setGrade] = useState('8-sinf');
  const [customGrade, setCustomGrade] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [questionCount, setQuestionCount] = useState(6);
  const [difficulty, setDifficulty] = useState("O'rta");
  const [notes, setNotes] = useState('');

  const filteredBundles = bundles.filter(
    (b) =>
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedBundle =
    bundles.find((b) => b.id === selectedBundleId) || filteredBundles[0] || bundles[0] || null;

  const handleCreateSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || isGenerating) return;
    const finalSubject = subject === '__custom__' ? customSubject.trim() || 'Umumiy fan' : subject;
    const finalGrade = grade === '__custom__' ? customGrade.trim() || 'Umumiy guruh' : grade;
    await onGenerateBundle({
      topic: topic.trim(),
      subject: finalSubject,
      grade: finalGrade,
      durationMinutes,
      questionCount,
      difficulty,
      notes: notes.trim(),
    });
    setTopic('');
    setNotes('');
    setUserAnswers({});
    setQuizSubmitted(false);
  };

  const handleCopyBundle = async (bundle: LessonBundle) => {
    const planText = [
      `MAVZU: ${bundle.title} (${bundle.subject}, ${bundle.grade}, ${bundle.durationMinutes} daqiqa)`,
      '',
      'DARS MAQSADLARI:',
      ...bundle.lessonPlan.objectives.map((o, i) => `${i + 1}. ${o}`),
      '',
      'DARS BOSQICHLARI:',
      ...bundle.lessonPlan.stages.map(
        (s) =>
          `- ${s.name} (${s.durationMinutes} daq)\n  O'qituvchi: ${s.teacherAction}\n  O'quvchi: ${s.studentAction}`
      ),
      '',
      'TEST SAVOLLARI:',
      ...bundle.tests.map(
        (t, i) =>
          `${i + 1}. ${t.question}\n` +
          t.options.map((opt, oi) => `   ${String.fromCharCode(65 + oi)}) ${opt}`).join('\n') +
          `\n   To'g'ri javob: ${String.fromCharCode(65 + t.correctIndex)}) ${t.options[t.correctIndex]}`
      ),
    ].join('\n');

    await navigator.clipboard.writeText(planText);
    setCopiedId(bundle.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRecordScoreSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedBundle || !scoreStudentId) return;
    const numericScore = Math.min(Math.max(Number(scoreValue) || 0, 0), 100);
    onRecordTestScore({
      studentId: scoreStudentId,
      subject: selectedBundle.subject,
      topic: selectedBundle.topic,
      score: numericScore,
      maxScore: 100,
    });
    setShowScoreModal(false);
    setScoreSavedNotice(true);
    setTimeout(() => setScoreSavedNotice(false), 3000);
  };

  const interactiveCorrectCount = selectedBundle
    ? selectedBundle.tests.filter((t) => userAnswers[t.id] === t.correctIndex).length
    : 0;

  return (
    <div className="max-w-[1240px] mx-auto space-y-6">
      {/* Collapsible Generator Panel */}
      {showCreateForm && (
        <section className="bg-white border border-slate-200 rounded-xl p-6 print:hidden">
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <h2 className="font-display text-lg font-semibold text-slate-900">
                Yangi mavzu bo‘yicha dars va test yaratish
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                AI agent dars rejasi, test savollari va qo‘shimcha materiallarni bir vaqtda tuzadi
              </p>
            </div>
            <button
              type="button"
              onClick={() => onToggleCreateForm(false)}
              className="text-xs font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200"
            >
              Yopish
            </button>
          </div>

          <form onSubmit={handleCreateSubmit} className="mt-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-6">
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Dars mavzusi
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Masalan: Kvadrat funksiyalar va ularning grafiklari"
                  className="w-full h-10 px-3.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700/20 focus:border-blue-700"
                  required
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Fan yoki yo‘nalish
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm text-slate-900 bg-white"
                >
                  {SUBJECT_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                  <option value="__custom__">Boshqa (qo‘lda yozish)...</option>
                </select>
                {subject === '__custom__' && (
                  <input
                    type="text"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    placeholder="Fan nomini kiriting"
                    className="mt-2 w-full h-9 px-3 rounded-lg border border-slate-300 text-sm text-slate-900"
                    required
                  />
                )}
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Bosqich / Sinf / Daraja
                </label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm text-slate-900 bg-white"
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
                  <option value="__custom__">Boshqa (qo‘lda yozish)...</option>
                </select>
                {grade === '__custom__' && (
                  <input
                    type="text"
                    value={customGrade}
                    onChange={(e) => setCustomGrade(e.target.value)}
                    placeholder="Masalan: 3-kurs yoki IELTS 6.5"
                    className="mt-2 w-full h-9 px-3 rounded-lg border border-slate-300 text-sm text-slate-900"
                    required
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-3">
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Dars davomiyligi
                </label>
                <select
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm text-slate-900 bg-white"
                >
                  <option value={40}>40 daqiqa</option>
                  <option value={45}>45 daqiqa (maktab darsi)</option>
                  <option value={80}>80 daqiqa (OTM / litsey parasi)</option>
                  <option value={90}>90 daqiqa (OTM ma’ruza)</option>
                </select>
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Test savollari soni
                </label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm text-slate-900 bg-white"
                >
                  <option value={4}>4 ta savol</option>
                  <option value={6}>6 ta savol</option>
                  <option value={10}>10 ta savol</option>
                  <option value={12}>12 ta savol</option>
                </select>
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Murakkablik darajasi
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm text-slate-900 bg-white"
                >
                  <option value="Oson">Oson (boshlang‘ich)</option>
                  <option value="O'rta">O‘rta (standart)</option>
                  <option value="Qiyin">Qiyin (chuqurlashtirilgan)</option>
                </select>
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Qo‘shimcha ko‘rsatma
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Masalan: Guruhli o'yin qo'shilsin"
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm text-slate-900"
                />
              </div>
            </div>

            {generationError && (
              <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">
                {generationError}
              </p>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isGenerating || !topic.trim()}
                className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-blue-700 text-white text-sm font-medium hover:bg-blue-800 disabled:opacity-50 transition-colors whitespace-nowrap"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Dars va test yaratilmoqda...</span>
                  </>
                ) : (
                  <span>Reja, test va materiallarni yaratish</span>
                )}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Main Split: Saved Bundles List + Active Bundle Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Saved Library Column */}
        <aside className="lg:col-span-4 bg-white border border-slate-200 rounded-xl overflow-hidden print:hidden">
          <div className="p-4 border-b border-slate-200 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-display text-sm font-semibold text-slate-900">
                Mavzular kutubxonasi
              </h3>
              {!showCreateForm && (
                <button
                  type="button"
                  onClick={() => onToggleCreateForm(true)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-800 whitespace-nowrap"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Yangi mavzu</span>
                </button>
              )}
            </div>
            <div className="relative">
              <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Mavzu yoki fan qidirish..."
                className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-700"
              />
            </div>
          </div>

          <div className="divide-y divide-slate-200 max-h-[640px] overflow-y-auto">
            {filteredBundles.map((bundle) => {
              const isSelected = selectedBundle?.id === bundle.id;
              return (
                <div
                  key={bundle.id}
                  className={`p-4 transition-colors ${
                    isSelected ? 'bg-blue-50/60' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectBundle(bundle.id);
                        setUserAnswers({});
                        setQuizSubmitted(false);
                      }}
                      className="text-left min-w-0 flex-1"
                    >
                      <p
                        className={`text-sm font-semibold leading-snug ${
                          isSelected ? 'text-blue-800' : 'text-slate-900'
                        }`}
                      >
                        {bundle.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-1 tabular-nums">
                        {bundle.subject} · {bundle.grade} · {bundle.tests.length} ta test
                      </p>
                    </button>

                    {confirmDeleteId === bundle.id ? (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            onDeleteBundle(bundle.id);
                            setConfirmDeleteId(null);
                          }}
                          className="text-xs font-medium text-red-700 hover:underline px-1.5 py-0.5"
                        >
                          O‘chirish
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="text-xs text-slate-500 hover:text-slate-800 px-1"
                        >
                          Bekor
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(bundle.id)}
                        aria-label="Mavzuni o'chirish"
                        className="p-1 text-slate-400 hover:text-red-600 shrink-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredBundles.length === 0 && (
              <div className="p-6 text-center text-sm text-slate-500">
                Mos mavzu topilmadi. Yuqoridagi tugma orqali yangisini yarating.
              </div>
            )}
          </div>
        </aside>

        {/* Active Bundle Viewer */}
        <section className="lg:col-span-8 bg-white border border-slate-200 rounded-xl overflow-hidden">
          {selectedBundle ? (
            <div>
              {/* Header */}
              <div className="p-6 border-b border-slate-200 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span>{selectedBundle.subject}</span>
                      <span aria-hidden="true">·</span>
                      <span>{selectedBundle.grade}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">
                        {selectedBundle.durationMinutes} daqiqa
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">
                        {selectedBundle.tests.length} ta test
                      </span>
                    </div>
                    <h2 className="font-display text-2xl font-bold text-slate-900 tracking-tight text-balance">
                      {selectedBundle.title}
                    </h2>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {selectedBundle.summary}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 print:hidden">
                    <button
                      type="button"
                      onClick={() => handleCopyBundle(selectedBundle)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap"
                    >
                      {copiedId === selectedBundle.id ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Nusxalandi</span>
                        </>
                      ) : (
                        <>
                          <ClipboardCopy className="h-3.5 w-3.5" />
                          <span>Matnni nusxalash</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap"
                    >
                      <Printer className="h-3.5 w-3.5" />
                      <span>Chop etish</span>
                    </button>
                  </div>
                </div>

                {/* Segmented Tabs */}
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-fit print:hidden">
                  <button
                    type="button"
                    onClick={() => setActiveSubTab('plan')}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                      activeSubTab === 'plan'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>Dars rejasi</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSubTab('test')}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                      activeSubTab === 'test'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <HelpCircle className="h-3.5 w-3.5" />
                    <span>Test savollari ({selectedBundle.tests.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSubTab('materials')}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                      activeSubTab === 'materials'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>Qo‘shimcha materiallar</span>
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeSubTab === 'plan' && (
                  <div className="space-y-8">
                    {/* Objectives & Materials */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900 mb-3">
                          Darsning asosiy maqsadlari
                        </h3>
                        <ul className="space-y-2 text-sm text-slate-700">
                          {selectedBundle.lessonPlan.objectives.map((obj, idx) => (
                            <li key={idx} className="flex items-start gap-2.5">
                              <span className="font-mono text-xs text-blue-700 mt-0.5 tabular-nums">
                                0{idx + 1}.
                              </span>
                              <span>{obj}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900 mb-3">
                          Kerakli jihoz va materiallar
                        </h3>
                        <ul className="space-y-2 text-sm text-slate-700">
                          {selectedBundle.lessonPlan.materialsNeeded.map((mat, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-slate-400">–</span>
                              <span>{mat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Stages Table */}
                    <div className="pt-6 border-t border-slate-200">
                      <h3 className="text-sm font-semibold text-slate-900 mb-4">
                        Dars bosqichlari va vaqt taqsimoti
                      </h3>
                      <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg overflow-hidden">
                        {selectedBundle.lessonPlan.stages.map((stage, idx) => (
                          <div key={idx} className="p-4 bg-white">
                            <div className="flex items-center justify-between gap-4 mb-2">
                              <h4 className="text-sm font-semibold text-slate-900">
                                {stage.name}
                              </h4>
                              <span className="inline-flex items-center gap-1 text-xs font-mono tabular-nums text-slate-600 shrink-0">
                                <Clock className="h-3.5 w-3.5 text-slate-400" />
                                {stage.durationMinutes} daqiqa
                              </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="block text-xs font-medium text-slate-500 mb-0.5">
                                  O‘qituvchi faoliyati
                                </span>
                                <p className="text-slate-700 leading-relaxed">
                                  {stage.teacherAction}
                                </p>
                              </div>
                              <div>
                                <span className="block text-xs font-medium text-slate-500 mb-0.5">
                                  O‘quvchi faoliyati
                                </span>
                                <p className="text-slate-700 leading-relaxed">
                                  {stage.studentAction}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Differentiation & Assessment */}
                    <div className="pt-6 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900 mb-2">
                          Tabaqalashtirilgan yondashuv
                        </h3>
                        <p className="text-sm text-slate-700 leading-relaxed">
                          {selectedBundle.lessonPlan.differentiation}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900 mb-2">
                          Baholash mezonlari
                        </h3>
                        <p className="text-sm text-slate-700 leading-relaxed">
                          {selectedBundle.lessonPlan.assessmentCriteria}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeSubTab === 'test' && (
                  <div className="space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 print:hidden">
                      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                        <button
                          type="button"
                          onClick={() => setQuizMode('teacher')}
                          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                            quizMode === 'teacher'
                              ? 'bg-white text-slate-900 shadow-sm'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Javob kaliti bilan
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setQuizMode('interactive');
                            setQuizSubmitted(false);
                            setUserAnswers({});
                          }}
                          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                            quizMode === 'interactive'
                              ? 'bg-white text-slate-900 shadow-sm'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Interaktiv sinov rejimi
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setScoreStudentId(students[0]?.id || '');
                          setShowScoreModal((prev) => !prev);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-800 hover:bg-slate-50 whitespace-nowrap"
                      >
                        <UserCheck className="h-3.5 w-3.5" />
                        <span>O‘quvchiga natija yozish</span>
                      </button>
                    </div>

                    {scoreSavedNotice && (
                      <div className="flex items-center gap-2 text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2.5">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        <span>Natija o‘quvchi profiliga muvaffaqiyatli saqlandi.</span>
                      </div>
                    )}

                    {showScoreModal && (
                      <form
                        onSubmit={handleRecordScoreSubmit}
                        className="p-4 border border-slate-200 bg-slate-50 rounded-lg space-y-3 print:hidden"
                      >
                        <p className="text-xs font-semibold text-slate-900">
                          Ushbu mavzu bo‘yicha o‘quvchi balini qayd etish
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                          <div className="sm:col-span-6">
                            <select
                              value={scoreStudentId}
                              onChange={(e) => setScoreStudentId(e.target.value)}
                              className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white text-sm"
                              required
                            >
                              {students.map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.name} ({s.grade})
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="sm:col-span-3">
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={scoreValue}
                              onChange={(e) => setScoreValue(e.target.value)}
                              placeholder="Ball (0-100)"
                              className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white text-sm tabular-nums"
                              required
                            />
                          </div>
                          <div className="sm:col-span-3 flex gap-2">
                            <button
                              type="submit"
                              className="flex-1 h-9 px-3 rounded-lg bg-blue-700 text-white text-xs font-medium hover:bg-blue-800"
                            >
                              Saqlash
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowScoreModal(false)}
                              className="h-9 px-2.5 rounded-lg border border-slate-300 text-xs text-slate-600 bg-white"
                            >
                              Bekor
                            </button>
                          </div>
                        </div>
                      </form>
                    )}

                    {quizMode === 'interactive' && quizSubmitted && (
                      <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            Sinov natijasi:{' '}
                            <span className="font-mono tabular-nums">
                              {interactiveCorrectCount} / {selectedBundle.tests.length}
                            </span>{' '}
                            to‘g‘ri javob (
                            <span className="font-mono tabular-nums">
                              {Math.round(
                                (interactiveCorrectCount /
                                  Math.max(selectedBundle.tests.length, 1)) *
                                  100
                              )}
                              %
                            </span>
                            )
                          </p>
                          <p className="text-xs text-slate-600 mt-0.5">
                            Har bir savol ostida to‘g‘ri javob va tushuntirish ko‘rsatilgan.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setQuizSubmitted(false);
                            setUserAnswers({});
                          }}
                          className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-medium text-slate-800 hover:bg-slate-50 whitespace-nowrap"
                        >
                          Qayta yechish
                        </button>
                      </div>
                    )}

                    <div className="divide-y divide-slate-200">
                      {selectedBundle.tests.map((q, qIdx) => {
                        const selectedOption = userAnswers[q.id];
                        const showKey = quizMode === 'teacher' || quizSubmitted;

                        return (
                          <div key={q.id} className="py-5 first:pt-0 last:pb-0">
                            <div className="flex items-start justify-between gap-4 mb-3">
                              <p className="text-sm font-semibold text-slate-900 leading-snug">
                                <span className="font-mono tabular-nums text-slate-500 mr-2">
                                  {qIdx + 1}.
                                </span>
                                {q.question}
                              </p>
                              <span className="text-xs text-slate-500 whitespace-nowrap shrink-0">
                                {q.difficulty}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              {q.options.map((opt, oIdx) => {
                                const letter = String.fromCharCode(65 + oIdx);
                                const isCorrect = oIdx === q.correctIndex;
                                const isChosen = selectedOption === oIdx;

                                let optionClasses =
                                  'border-slate-200 bg-white text-slate-800 hover:bg-slate-50';
                                if (showKey && isCorrect) {
                                  optionClasses =
                                    'border-emerald-300 bg-emerald-50 text-emerald-950 font-medium';
                                } else if (
                                  quizMode === 'interactive' &&
                                  quizSubmitted &&
                                  isChosen &&
                                  !isCorrect
                                ) {
                                  optionClasses =
                                    'border-red-300 bg-red-50 text-red-900';
                                } else if (
                                  quizMode === 'interactive' &&
                                  !quizSubmitted &&
                                  isChosen
                                ) {
                                  optionClasses =
                                    'border-blue-600 bg-blue-50 text-blue-900 font-medium';
                                }

                                return (
                                  <button
                                    key={oIdx}
                                    type="button"
                                    disabled={quizMode === 'teacher' || quizSubmitted}
                                    onClick={() =>
                                      setUserAnswers((prev) => ({
                                        ...prev,
                                        [q.id]: oIdx,
                                      }))
                                    }
                                    className={`text-left px-3.5 py-2.5 rounded-lg border text-sm transition-colors flex items-start gap-2.5 ${optionClasses}`}
                                  >
                                    <span className="font-mono text-xs mt-0.5 shrink-0">
                                      {letter})
                                    </span>
                                    <span>{opt}</span>
                                  </button>
                                );
                              })}
                            </div>

                            {showKey && q.explanation && (
                              <p className="mt-2.5 text-xs text-slate-600 leading-relaxed">
                                <span className="font-semibold text-slate-700">Izoh: </span>
                                {q.explanation}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {quizMode === 'interactive' && !quizSubmitted && (
                      <div className="pt-4 border-t border-slate-200 flex justify-end">
                        <button
                          type="button"
                          onClick={() => setQuizSubmitted(true)}
                          className="px-5 py-2.5 rounded-lg bg-blue-700 text-white text-sm font-medium hover:bg-blue-800 transition-colors"
                        >
                          Natijani tekshirish
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {activeSubTab === 'materials' && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 mb-3">
                        Hayotiy analogiya va tushuntirish
                      </h3>
                      <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 border border-slate-200 rounded-lg p-4">
                        {selectedBundle.additionalMaterials.realLifeAnalogy}
                      </p>
                    </div>

                    <div className="pt-6 border-t border-slate-200">
                      <h3 className="text-sm font-semibold text-slate-900 mb-3">
                        Kalit tushunchalar lug‘ati
                      </h3>
                      <dl className="divide-y divide-slate-200 border border-slate-200 rounded-lg">
                        {selectedBundle.additionalMaterials.keyConcepts.map((kc, idx) => (
                          <div key={idx} className="p-4 grid grid-cols-1 sm:grid-cols-12 gap-2">
                            <dt className="sm:col-span-4 text-sm font-semibold text-slate-900">
                              {kc.term}
                            </dt>
                            <dd className="sm:col-span-8 text-sm text-slate-700">
                              {kc.definition}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </div>

                    <div className="pt-6 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900 mb-2">
                          Sinf mashg‘uloti g‘oyasi
                        </h3>
                        <p className="text-sm text-slate-700 leading-relaxed">
                          {selectedBundle.additionalMaterials.classroomActivity}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900 mb-2">
                          Uyga vazifa topshirig‘i
                        </h3>
                        <p className="text-sm text-slate-700 leading-relaxed">
                          {selectedBundle.additionalMaterials.homework}
                        </p>
                      </div>
                    </div>

                    {selectedBundle.additionalMaterials.quickFacts?.length > 0 && (
                      <div className="pt-6 border-t border-slate-200">
                        <h3 className="text-sm font-semibold text-slate-900 mb-2.5">
                          Qiziqarli faktlar
                        </h3>
                        <ul className="space-y-2 text-sm text-slate-700">
                          {selectedBundle.additionalMaterials.quickFacts.map((fact, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-blue-700 font-bold">·</span>
                              <span>{fact}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center space-y-3">
              <BookOpen className="h-8 w-8 text-slate-300 mx-auto" />
              <p className="text-sm font-medium text-slate-700">
                Hozircha tanlangan dars to‘plami yo‘q
              </p>
              <button
                type="button"
                onClick={() => onToggleCreateForm(true)}
                className="px-4 py-2 rounded-lg bg-blue-700 text-white text-sm font-medium hover:bg-blue-800"
              >
                Birinchi mavzuni yaratish
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
