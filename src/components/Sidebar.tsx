import { useState } from 'react';
import {
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  MessageSquareText,
  Users,
  X,
} from 'lucide-react';
import type { WorkspaceTab } from '../types';

interface SidebarProps {
  activeTab: WorkspaceTab;
  onSelectTab: (tab: WorkspaceTab) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  bundleCount: number;
  studentCount: number;
}

const NAV_ITEMS: Array<{
  id: WorkspaceTab;
  label: string;
  icon: typeof LayoutDashboard;
}> = [
  { id: 'overview', label: 'Boshqaruv paneli', icon: LayoutDashboard },
  { id: 'studio', label: 'Dars va testlar', icon: BookOpen },
  { id: 'assistant', label: 'Shaxsiy yordamchi', icon: MessageSquareText },
  { id: 'students', label: "O'quvchilar tahlili", icon: Users },
];

export function Sidebar({
  activeTab,
  onSelectTab,
  mobileOpen,
  onCloseMobile,
  bundleCount,
  studentCount,
}: SidebarProps) {
  const [avatarFailed, setAvatarFailed] = useState(false);

  const navContent = (
    <div className="flex h-full flex-col justify-between bg-white border-r border-slate-200 w-64">
      <div>
        <div className="flex items-center justify-between px-6 h-16 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-700 text-white">
              <GraduationCap className="h-4.5 w-4.5" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0">
              UstozAI
            </span>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Menyuni yopish"
            className="lg:hidden p-1.5 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="px-3 py-5 space-y-1" aria-label="Asosiy navigatsiya">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const countText =
              item.id === 'studio'
                ? String(bundleCount)
                : item.id === 'students'
                  ? String(studentCount)
                  : null;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`h-4.5 w-4.5 shrink-0 ${
                      isActive ? 'text-blue-700' : 'text-slate-400'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </span>
                {countText !== null && (
                  <span
                    className={`text-xs font-mono tabular-nums ${
                      isActive ? 'text-blue-700' : 'text-slate-400'
                    }`}
                  >
                    {countText}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center gap-3">
          {!avatarFailed ? (
            <img
              src="/src/assets/images/avatar_teacher_profile_1795410824414.jpg"
              alt="O'qituvchi profil surati"
              referrerPolicy="no-referrer"
              onError={() => setAvatarFailed(true)}
              className="h-10 w-10 rounded-lg object-cover border border-slate-200 shrink-0"
            />
          ) : (
            <div className="h-10 w-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-sm font-semibold text-slate-700 shrink-0">
              NK
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">
              Nilufar Karimova
            </p>
            <p className="text-xs text-slate-500 truncate">
              Pedagog · Barcha bosqichlar
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block shrink-0 print:hidden">{navContent}</aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden print:hidden">
          <div
            className="fixed inset-0 bg-slate-900/40"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative z-10 flex">{navContent}</div>
        </div>
      )}
    </>
  );
}
