import { useState, type FormEvent } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Loader2,
  Plus,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import type { LessonBundle, Student, TeacherTask } from '../types';
import { getStudentAverage } from '../utils/storage';
import {
  EDUCATION_LEVEL_GROUPS,
  SUBJECT_OPTIONS,
} from '../constants/educationOptions';

interface OverviewDashboardProps {
  bundles: LessonBundle[];
  students: Student[];
  tasks: TeacherTask[];
  isGenerating: boolean;
  generationError: string | null;
  onGenerateTopic: (params: {
    topic: string;
    subject: string;
    grade: string;
  }) => Promise<void>;
  onOpenBundle: (bundleId: string) => void;
  onOpenStudent: (studentId: string) => void;
  onAddTask: (title: string, dueLabel: string) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onNavigateStudio: () => void;
  onNavigateStudents: () => void;
}

export function OverviewDashboard({
  bundles,
  students,
  tasks,
  isGenerating,
  generationError,
  onGenerateTopic,
  onOpenBundle,
  onOpenStudent,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onNavigateStudio,
  onNavigateStudents,
}: OverviewDashboardProps) {
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('Matematika');
  const [grade, setGrade] = useState('8-sinf');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [heroImgFailed, setHeroImgFailed] = useState(false);

  const totalQuestions = bundles.reduce((acc, b) => acc + b.tests.length, 0);
  const avgClassScore =
    students.length > 0
      ? Math.round(
          students.reduce((acc, s) => acc + getStudentAverage(s), 0) / students.length
        )
      : 0;
  const savedHours = (bundles.length * 1.5 + students.filter((s) => s.recommendation).length * 0.5).toFixed(1);

  const sortedStudents = [...students].sort(
    (a, b) => getStudentAverage(a) - getStudentAverage(b)
  );

  const handleQuickSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || isGenerating) return;
    await onGenerateTopic({ topic: topic.trim(), subject, grade });
    setTopic('');
  };

  const handleTaskSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    onAddTask(newTaskTitle.trim(), 'Bugun');
    setNewTaskTitle('');
  };

  return (
    <div className="space-y-8 max-w-[1240px] mx-auto">
      {/* Focal Anchor: Instant AI Topic Generator + Editorial Visual */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-8 p-6 sm:p-8 flex flex-col justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <p className="text-xs font-medium text-blue-700 tracking-wide">
                Tezkor AI studiya
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight text-balance">
                Mavzuni kiriting — dars rejasi, test va materiallarni bir zumda oling
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Maktab, litsey, universitet yoki o‘quv markazi uchun istalgan fan va
                bosqich mavzusini yozing. Tizim dars konspekti, javob kalitli test va
                amaliy materiallarni avtomatik tayyorlaydi.
              </p>
            </div>

            <form onSubmit={handleQuickSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-6">
                  <label htmlFor="quick-topic" className="sr-only">
                    Dars mavzusi
                  </label>
                  <input
                    id="quick-topic"
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Masalan: Pifagor teoremasi, Present Perfect yoki React Hooks"
                    className="w-full h-11 px-3.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-700/20 focus:border-blue-700"
                    required
                  />
                </div>
                <div className="sm:col-span-3">
                  <label htmlFor="quick-subject" className="sr-only">
                    Fan yoki yo‘nalish
                  </label>
                  <select
                    id="quick-subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full h-11 px-3 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700/20 focus:border-blue-700"
                  >
                    {SUBJECT_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-3">
                  <label htmlFor="quick-grade" className="sr-only">
                    Bosqich, sinf yoki daraja
                  </label>
                  <select
                    id="quick-grade"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full h-11 px-3 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700/20 focus:border-blue-700"
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
              </div>

              {generationError && (
                <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">
                  {generationError}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span>Tezkor namuna:</span>
                  {[
                    'Differensial tenglamalar',
                    'Kasrlarni qo‘shish',
                    'Mikroiqtisodiyot: Talab va taklif',
                  ].map((sample) => (
                      <button
                        key={sample}
                        type="button"
                        onClick={() => setTopic(sample)}
                        className="text-slate-700 underline decoration-slate-300 underline-offset-4 hover:text-blue-700 hover:decoration-blue-700 transition-colors"
                      >
                        {sample}
                      </button>
                    )
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isGenerating || !topic.trim()}
                  className="inline-flex items-center gap-2 h-11 px-5 rounded-lg bg-blue-700 text-white text-sm font-medium hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Yaratilmoqda...</span>
                    </>
                  ) : (
                    <>
                      <span>Bir zumda yaratish</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-4 relative min-h-[200px] border-t lg:border-t-0 lg:border-l border-slate-200 bg-slate-100">
            {!heroImgFailed ? (
              <img
                src="/src/assets/images/studio_academic_desk_1795410824211.jpg"
                alt="O'qituvchi ish stoli va dars daftari"
                referrerPolicy="no-referrer"
                onError={() => setHeroImgFailed(true)}
                className="w-full h-full lg:h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-slate-100">
                <BookOpen className="h-8 w-8 text-slate-400 mb-2" />
                <p className="text-sm font-medium text-slate-700">
                  Dars rejalari va testlar studiyasi
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4-Column KPI Strip */}
      <section aria-label="Asosiy ko'rsatkichlar" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Tayyor dars rejalari</span>
            <BookOpen className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-slate-900 tabular-nums">
            {bundles.length} ta
          </p>
          <p className="mt-1 text-xs text-slate-500">Saqlangan to‘plamlar</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Tuzilgan test savollari</span>
            <CheckCircle2 className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-slate-900 tabular-nums">
            {totalQuestions} ta
          </p>
          <p className="mt-1 text-xs text-slate-500">Javob kaliti va izohi bilan</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Sinflar o‘rtacha bali</span>
            <TrendingUp className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-slate-900 tabular-nums">
            {avgClassScore}%
          </p>
          <p className="mt-1 text-xs text-slate-500 tabular-nums">
            {students.length} nafar o‘quvchi bo‘yicha
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Tejalgan tayyorgarlik vaqti</span>
            <Clock className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-slate-900 tabular-nums">
            {savedHours} soat
          </p>
          <p className="mt-1 text-xs text-slate-500">Avtomatlashtirish hisobiga</p>
        </div>
      </section>

      {/* Two-column Operational Area: Student Monitoring + Teacher Tasks & Recent Bundles */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-7 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-base font-semibold text-slate-900">
                O‘quvchilar natijalari va diqqat markazi
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Individual AI tavsiya olish uchun o‘quvchini tanlang
              </p>
            </div>
            <button
              type="button"
              onClick={onNavigateStudents}
              className="text-xs font-medium text-blue-700 hover:text-blue-800 whitespace-nowrap shrink-0"
            >
              Barchasini ko‘rish
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-medium text-slate-500 bg-slate-50/60">
                  <th className="py-2.5 px-6">O‘quvchi</th>
                  <th className="py-2.5 px-4">Sinf</th>
                  <th className="py-2.5 px-4 text-right">O‘rtacha ball</th>
                  <th className="py-2.5 px-6 text-right">Holat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {sortedStudents.slice(0, 6).map((st) => {
                  const avg = getStudentAverage(st);
                  const isLow = avg < 65;
                  const isHigh = avg >= 85;
                  return (
                    <tr
                      key={st.id}
                      onClick={() => onOpenStudent(st.id)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-6 font-medium text-slate-900">
                        {st.name}
                      </td>
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        {st.grade}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums font-medium text-slate-900">
                        {avg}%
                      </td>
                      <td className="py-3 px-6 text-right whitespace-nowrap">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-700">
                            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                            <span>E’tibor zarur</span>
                          </span>
                        ) : isHigh ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                            <span>A’lo</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700">
                            <Clock className="h-3.5 w-3.5 shrink-0" />
                            <span>Barqaror</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <div className="lg:col-span-5 space-y-6">
          {/* Teacher Time-Saving Task Checklist */}
          <section className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-base font-semibold text-slate-900">
                Ustozning kunlik rejasi
              </h3>
              <span className="text-xs font-mono tabular-nums text-slate-500">
                {tasks.filter((t) => t.completed).length}/{tasks.length} bajarildi
              </span>
            </div>

            <form onSubmit={handleTaskSubmit} className="flex gap-2 mb-4">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Yangi vazifa qo'shish..."
                className="flex-1 h-9 px-3 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-700/20 focus:border-blue-700"
              />
              <button
                type="submit"
                aria-label="Vazifa qo'shish"
                className="h-9 px-3 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 inline-flex items-center gap-1 shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Qo‘shish</span>
              </button>
            </form>

            <ul className="divide-y divide-slate-200">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className="py-2.5 flex items-start justify-between gap-3 group"
                >
                  <label className="flex items-start gap-3 cursor-pointer min-w-0 flex-1">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => onToggleTask(task.id)}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-700"
                    />
                    <span className="min-w-0">
                      <span
                        className={`block text-sm leading-snug ${
                          task.completed
                            ? 'line-through text-slate-400'
                            : 'text-slate-800'
                        }`}
                      >
                        {task.title}
                      </span>
                      <span className="block text-xs text-slate-400 mt-0.5">
                        {task.dueLabel}
                      </span>
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => onDeleteTask(task.id)}
                    aria-label="Vazifani o'chirish"
                    className="p-1 text-slate-400 hover:text-red-600 transition-colors shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
              {tasks.length === 0 && (
                <li className="py-4 text-sm text-slate-500 text-center">
                  Hozircha vazifalar yo‘q. Yuqoridan yangi vazifa qo‘shing.
                </li>
              )}
            </ul>
          </section>

          {/* Recent Generated Lesson Bundles */}
          <section className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-base font-semibold text-slate-900">
                So‘nggi yaratilgan materiallar
              </h3>
              <button
                type="button"
                onClick={onNavigateStudio}
                className="text-xs font-medium text-blue-700 hover:text-blue-800 whitespace-nowrap"
              >
                Studiyani ochish
              </button>
            </div>
            <div className="divide-y divide-slate-200">
              {bundles.slice(0, 3).map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => onOpenBundle(b.id)}
                  className="w-full py-3 text-left hover:bg-slate-50 -mx-2 px-2 rounded-lg transition-colors flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {b.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                      {b.subject} · {b.grade} · {b.tests.length} ta test ·{' '}
                      {b.durationMinutes} daq
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 shrink-0" />
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
