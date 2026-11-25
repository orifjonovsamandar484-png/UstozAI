import { useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { OverviewDashboard } from './components/OverviewDashboard';
import { StudioWorkspace } from './components/StudioWorkspace';
import { PersonalAssistant } from './components/PersonalAssistant';
import { StudentsWorkspace } from './components/StudentsWorkspace';
import { generateLessonBundle } from './api/aiClient';
import {
  loadAssistantMessages,
  loadBundles,
  loadStudents,
  loadTasks,
  saveAssistantMessages,
  saveBundles,
  saveStudents,
  saveTasks,
} from './utils/storage';
import type {
  AssistantMessage,
  LessonBundle,
  Student,
  StudentRecommendation,
  TeacherTask,
  WorkspaceTab,
} from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [bundles, setBundles] = useState<LessonBundle[]>(() => loadBundles());
  const [selectedBundleId, setSelectedBundleId] = useState<string | null>(
    () => loadBundles()[0]?.id ?? null
  );
  const [showStudioCreateForm, setShowStudioCreateForm] = useState(false);

  const [students, setStudents] = useState<Student[]>(() => loadStudents());
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    () => loadStudents()[0]?.id ?? null
  );

  const [tasks, setTasks] = useState<TeacherTask[]>(() => loadTasks());
  const [assistantMessages, setAssistantMessages] = useState<AssistantMessage[]>(() =>
    loadAssistantMessages()
  );

  const [isGeneratingBundle, setIsGeneratingBundle] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  useEffect(() => {
    saveBundles(bundles);
  }, [bundles]);

  useEffect(() => {
    saveStudents(students);
  }, [students]);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    saveAssistantMessages(assistantMessages);
  }, [assistantMessages]);

  const handleGenerateBundle = async (params: {
    topic: string;
    subject: string;
    grade: string;
    durationMinutes?: number;
    questionCount?: number;
    difficulty?: string;
    notes?: string;
  }) => {
    setIsGeneratingBundle(true);
    setGenerationError(null);
    try {
      const created = await generateLessonBundle({
        topic: params.topic,
        subject: params.subject,
        grade: params.grade,
        durationMinutes: params.durationMinutes ?? 45,
        questionCount: params.questionCount ?? 6,
        difficulty: params.difficulty ?? "O'rta",
        notes: params.notes ?? '',
      });
      setBundles((prev) => [created, ...prev]);
      setSelectedBundleId(created.id);
      setShowStudioCreateForm(false);
      setActiveTab('studio');
    } catch (err) {
      setGenerationError(
        err instanceof Error ? err.message : 'AI generatsiyasida xatolik yuz berdi.'
      );
    } finally {
      setIsGeneratingBundle(false);
    }
  };

  const handleDeleteBundle = (id: string) => {
    setBundles((prev) => {
      const next = prev.filter((b) => b.id !== id);
      if (selectedBundleId === id) {
        setSelectedBundleId(next[0]?.id ?? null);
      }
      return next;
    });
  };

  const handleAddTask = (title: string, dueLabel: string) => {
    const newTask: TeacherTask = {
      id: `task-${Date.now()}`,
      title,
      dueLabel,
      completed: false,
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleAddStudent = (params: {
    name: string;
    grade: string;
    learningStyle: string;
    notes: string;
  }) => {
    const newStudent: Student = {
      id: `st-${Date.now()}`,
      name: params.name,
      grade: params.grade,
      attendanceRate: 100,
      learningStyle: params.learningStyle,
      notes: params.notes,
      scores: [],
    };
    setStudents((prev) => [newStudent, ...prev]);
    setSelectedStudentId(newStudent.id);
  };

  const handleAddScore = (params: {
    studentId: string;
    subject: string;
    topic: string;
    score: number;
    maxScore: number;
  }) => {
    const today = new Date().toISOString().slice(0, 10);
    setStudents((prev) =>
      prev.map((st) =>
        st.id === params.studentId
          ? {
              ...st,
              scores: [
                {
                  id: `sc-${Date.now()}`,
                  subject: params.subject,
                  topic: params.topic,
                  score: params.score,
                  maxScore: params.maxScore,
                  date: today,
                },
                ...st.scores,
              ],
            }
          : st
      )
    );
  };

  const handleSaveRecommendation = (studentId: string, rec: StudentRecommendation) => {
    setStudents((prev) =>
      prev.map((st) => (st.id === studentId ? { ...st, recommendation: rec } : st))
    );
  };

  const handleResetAssistant = () => {
    setAssistantMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'model',
        text: "Yangi suhbat ochildi. Dars rejalari, testlar, ota-onalar bilan muloqot yoki sinf boshqaruvi bo'yicha istalgan savolingizni yozing.",
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        bundleCount={bundles.length}
        studentCount={students.length}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          activeTab={activeTab}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onQuickCreateTopic={() => {
            setActiveTab('studio');
            setShowStudioCreateForm(true);
            setGenerationError(null);
          }}
        />

        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          {activeTab === 'overview' && (
            <OverviewDashboard
              bundles={bundles}
              students={students}
              tasks={tasks}
              isGenerating={isGeneratingBundle}
              generationError={generationError}
              onGenerateTopic={handleGenerateBundle}
              onOpenBundle={(id) => {
                setSelectedBundleId(id);
                setShowStudioCreateForm(false);
                setActiveTab('studio');
              }}
              onOpenStudent={(id) => {
                setSelectedStudentId(id);
                setActiveTab('students');
              }}
              onAddTask={handleAddTask}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              onNavigateStudio={() => setActiveTab('studio')}
              onNavigateStudents={() => setActiveTab('students')}
            />
          )}

          {activeTab === 'studio' && (
            <StudioWorkspace
              bundles={bundles}
              selectedBundleId={selectedBundleId}
              students={students}
              isGenerating={isGeneratingBundle}
              generationError={generationError}
              showCreateForm={showStudioCreateForm}
              onToggleCreateForm={setShowStudioCreateForm}
              onSelectBundle={setSelectedBundleId}
              onDeleteBundle={handleDeleteBundle}
              onGenerateBundle={handleGenerateBundle}
              onRecordTestScore={handleAddScore}
            />
          )}

          {activeTab === 'assistant' && (
            <PersonalAssistant
              messages={assistantMessages}
              recentTopics={bundles.slice(0, 5).map((b) => `${b.topic} (${b.subject})`)}
              onUpdateMessages={setAssistantMessages}
              onResetMessages={handleResetAssistant}
            />
          )}

          {activeTab === 'students' && (
            <StudentsWorkspace
              students={students}
              selectedStudentId={selectedStudentId}
              onSelectStudent={setSelectedStudentId}
              onAddStudent={handleAddStudent}
              onAddScore={handleAddScore}
              onSaveRecommendation={handleSaveRecommendation}
            />
          )}
        </main>
      </div>
    </div>
  );
}
