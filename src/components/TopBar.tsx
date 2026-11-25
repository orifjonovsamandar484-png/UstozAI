import { Menu, Plus } from 'lucide-react';
import type { WorkspaceTab } from '../types';

interface TopBarProps {
  activeTab: WorkspaceTab;
  onOpenMobileMenu: () => void;
  onQuickCreateTopic: () => void;
}

const TAB_TITLES: Record<WorkspaceTab, { section: string; page: string }> = {
  overview: { section: 'UstozAI', page: 'Boshqaruv paneli' },
  studio: { section: 'UstozAI', page: 'Dars va test studiyasi' },
  assistant: { section: 'UstozAI', page: 'Shaxsiy AI yordamchi' },
  students: { section: 'UstozAI', page: "O'quvchilar natijalari va tavsiyalar" },
};

export function TopBar({
  activeTab,
  onOpenMobileMenu,
  onQuickCreateTopic,
}: TopBarProps) {
  const breadcrumb = TAB_TITLES[activeTab];

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between gap-8 shrink-0 print:hidden">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Navigatsiyani ochish"
          className="lg:hidden p-2 -ml-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        >
          <Menu className="h-5 w-5" />
        </button>

        <nav aria-label="Sahifa yo'li" className="flex items-center gap-2 text-sm min-w-0">
          <span className="text-slate-400 whitespace-nowrap shrink-0">
            {breadcrumb.section}
          </span>
          <span className="text-slate-300 shrink-0" aria-hidden="true">
            /
          </span>
          <h1 className="font-display font-semibold text-slate-900 truncate">
            {breadcrumb.page}
          </h1>
        </nav>
      </div>

      <div className="flex items-center shrink-0">
        <button
          type="button"
          onClick={onQuickCreateTopic}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-700 text-white text-sm font-medium hover:bg-blue-800 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        >
          <Plus className="h-4 w-4 shrink-0" />
          <span>Yangi mavzu yaratish</span>
        </button>
      </div>
    </header>
  );
}
