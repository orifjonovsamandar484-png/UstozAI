import { useState, type FormEvent } from 'react';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ClipboardCopy,
  Clock,
  Loader2,
  Plus,
  Search,
  Sparkles,
  UserPlus,
} from 'lucide-react';
import type { Student, StudentRecommendation } from '../types';
import { getStudentAverage } from '../utils/storage';
import { generateStudentRecommendation } from '../api/aiClient';

interface StudentsWorkspaceProps {
  students: Student[];
  selectedStudentId: string | null;
  onSelectStudent: (id: string) => void;
  onAddStudent: (params: {
    name: string;
    grade: string;
    learningStyle: string;
    notes: string;
  }) => void;
  onAddScore: (params: {
    studentId: string;
    subject: string;
    topic: string;
    score: number;
    maxScore: number;
  }) => void;
  onSaveRecommendation: (studentId: string, rec: StudentRecommendation) => void;
}

export function StudentsWorkspace({
  students,
  selectedStudentId,
  onSelectStudent,
  onAddStudent,
  onAddScore,
  onSaveRecommendation,
}: StudentsWorkspaceProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  // Add student panel
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newName, setNewName] = useState('');
  const [newGrade, setNewGrade] = useState('8-A sinf');
  const [newStyle, setNewStyle] = useState('Vizual');
  const [newNotes, setNewNotes] = useState('');

  // Add score panel
  const [showAddScore, setShowAddScore] = useState(false);
  const [scoreSubject, setScoreSubject] = useState('Matematika');
  const [scoreTopic, setScoreTopic] = useState('');
  const [scoreVal, setScoreVal] = useState('80');

  // AI recommendation loading
  const [recLoadingId, setRecLoadingId] = useState<string | null>(null);
  const [recError, setRecError] = useState<string | null>(null);
  const [copiedParentNote, setCopiedParentNote] = useState(false);

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.grade.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    const avg = getStudentAverage(s);
    if (statusFilter === 'high') return avg >= 85;
    if (statusFilter === 'medium') return avg >= 65 && avg < 85;
    if (statusFilter === 'low') return avg < 65;
    return true;
  });

  const activeStudent =
    students.find((s) => s.id === selectedStudentId) ||
    filteredStudents[0] ||
    students[0] ||
    null;

  const handleAddStudentSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onAddStudent({
      name: newName.trim(),
      grade: newGrade,
      learningStyle: newStyle,
      notes: newNotes.trim(),
    });
    setNewName('');
    setNewNotes('');
    setShowAddStudent(false);
  };

  const handleAddScoreSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!activeStudent || !scoreTopic.trim()) return;
    onAddScore({
      studentId: activeStudent.id,
      subject: scoreSubject,
      topic: scoreTopic.trim(),
      score: Math.min(Math.max(Number(scoreVal) || 0, 0), 100),
      maxScore: 100,
    });
    setScoreTopic('');
    setShowAddScore(false);
  };

  const handleGenerateRecommendation = async (student: Student) => {
    setRecLoadingId(student.id);
    setRecError(null);
    try {
      const rec = await generateStudentRecommendation(student);
      onSaveRecommendation(student.id, rec);
    } catch (err) {
      setRecError(err instanceof Error ? err.message : 'Tavsiya olishda xatolik.');
    } finally {
      setRecLoadingId(null);
    }
  };

  return (
    <div className="max-w-[1240px] mx-auto space-y-6">
      {/* Top Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[260px]">
          <div className="relative flex-1 max-w-xs">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="O'quvchi ismi yoki sinf..."
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-blue-700"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {[
              { id: 'all', label: 'Barchasi' },
              { id: 'low', label: 'E’tibor zarur' },
              { id: 'medium', label: 'Barqaror' },
              { id: 'high', label: 'A’lo' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() =>
                  setStatusFilter(tab.id as 'all' | 'high' | 'medium' | 'low')
                }
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                  statusFilter === tab.id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAddStudent((prev) => !prev)}
          className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-800 hover:bg-slate-50 whitespace-nowrap shrink-0"
        >
          <UserPlus className="h-3.5 w-3.5" />
          <span>O‘quvchi qo‘shish</span>
        </button>
      </div>

      {/* Add Student Drawer */}
      {showAddStudent && (
        <form
          onSubmit={handleAddStudentSubmit}
          className="bg-white border border-slate-200 rounded-xl p-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-semibold text-slate-900">
              Yangi o‘quvchi qo‘shish
            </h3>
            <button
              type="button"
              onClick={() => setShowAddStudent(false)}
              className="text-xs text-slate-500 hover:text-slate-900"
            >
              Yopish
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-4">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ism-familiya"
                className="w-full h-9 px-3 rounded-lg border border-slate-300 text-sm"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <input
                type="text"
                value={newGrade}
                onChange={(e) => setNewGrade(e.target.value)}
                placeholder="Sinf / Guruh / Kurs"
                className="w-full h-9 px-3 rounded-lg border border-slate-300 text-sm"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <select
                value={newStyle}
                onChange={(e) => setNewStyle(e.target.value)}
                className="w-full h-9 px-2.5 rounded-lg border border-slate-300 bg-white text-sm"
              >
                <option value="Vizual">Vizual</option>
                <option value="Analitik">Analitik</option>
                <option value="Amaliy">Amaliy</option>
                <option value="Eshitish orqali">Eshitish orqali</option>
              </select>
            </div>
            <div className="sm:col-span-4 flex gap-2">
              <input
                type="text"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="Qisqa kuzatuv izohi"
                className="flex-1 h-9 px-3 rounded-lg border border-slate-300 text-sm"
              />
              <button
                type="submit"
                className="h-9 px-4 rounded-lg bg-blue-700 text-white text-xs font-medium hover:bg-blue-800 whitespace-nowrap"
              >
                Saqlash
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Split Layout: Students Table + Individual Profile & AI Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Students List */}
        <section className="lg:col-span-5 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-medium text-slate-500 bg-slate-50/70">
                  <th className="py-3 px-4">O‘quvchi</th>
                  <th className="py-3 px-3 text-right">O‘rtacha</th>
                  <th className="py-3 px-4 text-right">Holat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {filteredStudents.map((st) => {
                  const avg = getStudentAverage(st);
                  const isSelected = activeStudent?.id === st.id;
                  const isLow = avg < 65;
                  const isHigh = avg >= 85;
                  return (
                    <tr
                      key={st.id}
                      onClick={() => {
                        onSelectStudent(st.id);
                        setRecError(null);
                      }}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-50/70' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-3 px-4">
                        <p className="font-medium text-slate-900">{st.name}</p>
                        <p className="text-xs text-slate-500 tabular-nums">
                          {st.grade} · {st.scores.length} ta baho
                        </p>
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-slate-900">
                        {avg}%
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            <span>E’tibor zarur</span>
                          </span>
                        ) : isHigh ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>A’lo</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700">
                            <Clock className="h-3.5 w-3.5" />
                            <span>Barqaror</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-sm text-slate-500">
                      Qidiruv bo‘yicha o‘quvchi topilmadi.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Individual Student Profile & AI Recommendation */}
        <section className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-6">
          {activeStudent ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>{activeStudent.grade}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">
                      Davomat: {activeStudent.attendanceRate}%
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{activeStudent.learningStyle}</span>
                  </div>
                  <h2 className="font-display text-2xl font-bold text-slate-900 mt-1">
                    {activeStudent.name}
                  </h2>
                  {activeStudent.notes && (
                    <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                      {activeStudent.notes}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowAddScore((prev) => !prev)}
                    className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-slate-300 text-xs font-medium text-slate-800 hover:bg-slate-50 whitespace-nowrap"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Ball qo‘shish</span>
                  </button>
                  <button
                    type="button"
                    disabled={recLoadingId === activeStudent.id}
                    onClick={() => void handleGenerateRecommendation(activeStudent)}
                    className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-blue-700 text-white text-xs font-medium hover:bg-blue-800 disabled:opacity-50 whitespace-nowrap"
                  >
                    {recLoadingId === activeStudent.id ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Tahlil qilinmoqda...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Individual AI tavsiya olish</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {showAddScore && (
                <form
                  onSubmit={handleAddScoreSubmit}
                  className="p-4 rounded-lg bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-3"
                >
                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      value={scoreSubject}
                      onChange={(e) => setScoreSubject(e.target.value)}
                      placeholder="Fan"
                      className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white text-sm"
                      required
                    />
                  </div>
                  <div className="sm:col-span-5">
                    <input
                      type="text"
                      value={scoreTopic}
                      onChange={(e) => setScoreTopic(e.target.value)}
                      placeholder="Mavzu nomi"
                      className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white text-sm"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={scoreVal}
                      onChange={(e) => setScoreVal(e.target.value)}
                      placeholder="Ball"
                      className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white text-sm tabular-nums"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      className="w-full h-9 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800"
                    >
                      Qo‘shish
                    </button>
                  </div>
                </form>
              )}

              {/* Scores Progress Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Fan va mavzular bo‘yicha natijalar
                  </h3>
                  <span className="text-xs font-mono tabular-nums text-slate-500">
                    O‘rtacha: {getStudentAverage(activeStudent)}%
                  </span>
                </div>

                {activeStudent.scores.length > 0 ? (
                  <div className="space-y-3">
                    {activeStudent.scores.map((sc) => {
                      const pct = Math.round((sc.score / Math.max(sc.maxScore, 1)) * 100);
                      const barColor =
                        pct >= 85
                          ? 'bg-emerald-600'
                          : pct >= 65
                            ? 'bg-amber-500'
                            : 'bg-red-600';

                      return (
                        <div key={sc.id} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-slate-800">
                              {sc.subject} · {sc.topic}
                            </span>
                            <span className="font-mono tabular-nums text-slate-600">
                              {sc.score}/{sc.maxScore} ({pct}%) · {sc.date}
                            </span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${barColor}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">
                    Hozircha test natijalari kiritilmagan. “Ball qo‘shish” tugmasi orqali
                    natija kiriting.
                  </p>
                )}
              </div>

              {recError && (
                <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
                  {recError}
                </p>
              )}

              {/* Individual AI Recommendation Output */}
              <div className="pt-6 border-t border-slate-200 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-base font-semibold text-slate-900">
                    O‘quvchi uchun individual AI tavsiyalar
                  </h3>
                  {activeStudent.recommendation && (
                    <span className="text-xs text-slate-400 tabular-nums">
                      Yangilandi:{' '}
                      {new Date(activeStudent.recommendation.generatedAt).toLocaleDateString(
                        'uz-UZ'
                      )}
                    </span>
                  )}
                </div>

                {activeStudent.recommendation ? (
                  <div className="space-y-5">
                    <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 border border-slate-200 rounded-lg p-4">
                      {activeStudent.recommendation.overallSummary}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-xs font-semibold text-emerald-800 mb-2">
                          Kuchli tomonlari
                        </h4>
                        <ul className="space-y-1.5 text-sm text-slate-700">
                          {activeStudent.recommendation.strengths.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-emerald-600">+</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-red-800 mb-2">
                          Mustahkamlash zarur mavzular
                        </h4>
                        <ul className="space-y-1.5 text-sm text-slate-700">
                          {activeStudent.recommendation.weakTopics.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-red-600">!</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200">
                      <h4 className="text-xs font-semibold text-slate-900 mb-3">
                        2 haftalik individual rivojlanish rejasi
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activeStudent.recommendation.twoWeekPlan.map((wk, idx) => (
                          <div
                            key={idx}
                            className="p-4 rounded-lg border border-slate-200 bg-white space-y-2"
                          >
                            <p className="text-xs font-semibold text-blue-700">{wk.week}</p>
                            <p className="text-sm font-medium text-slate-900">{wk.focus}</p>
                            <ul className="space-y-1 text-xs text-slate-600">
                              {wk.exercises.map((ex, eIdx) => (
                                <li key={eIdx}>· {ex}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200">
                      <h4 className="text-xs font-semibold text-slate-900 mb-2">
                        O‘qituvchi uchun metodik maslahatlar
                      </h4>
                      <ul className="space-y-1.5 text-sm text-slate-700">
                        {activeStudent.recommendation.teacherTips.map((tip, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="font-mono text-xs text-slate-400 mt-0.5">
                              0{idx + 1}.
                            </span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-4 border-t border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-semibold text-slate-900">
                          Ota-onaga yuborish uchun tayyor xabar
                        </h4>
                        <button
                          type="button"
                          onClick={async () => {
                            await navigator.clipboard.writeText(
                              activeStudent.recommendation?.parentNote || ''
                            );
                            setCopiedParentNote(true);
                            setTimeout(() => setCopiedParentNote(false), 1800);
                          }}
                          className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-800"
                        >
                          {copiedParentNote ? (
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
                      <p className="text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-3.5 leading-relaxed">
                        {activeStudent.recommendation.parentNote}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 border border-dashed border-slate-300 rounded-lg text-center space-y-2.5">
                    <p className="text-sm text-slate-600">
                      Ushbu o‘quvchi uchun hali individual AI tavsiya yaratilmagan.
                    </p>
                    <button
                      type="button"
                      disabled={recLoadingId === activeStudent.id}
                      onClick={() => void handleGenerateRecommendation(activeStudent)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-700 text-white text-xs font-medium hover:bg-blue-800"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Hozir tahlil va tavsiya yaratish</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-sm text-slate-500">
              Ro‘yxatdan o‘quvchini tanlang yoki yangisini qo‘shing.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
