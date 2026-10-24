import React from 'react';
import { Home, BookOpen, CalendarRange, TrendingUp, User } from 'lucide-react';

export type TabType = 'home' | 'log' | 'plan' | 'progress' | 'profile';

interface NavbarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab }) => {
  const tabs = [
    { id: 'home', label: 'Trang chủ', icon: Home },
    { id: 'log', label: 'Nhật ký', icon: BookOpen },
    { id: 'plan', label: 'Kế hoạch', icon: CalendarRange },
    { id: 'progress', label: 'Tiến trình', icon: TrendingUp },
    { id: 'profile', label: 'Cá nhân', icon: User },
  ] as const;

  return (
    <>
      {/* Desktop Navigation Bar (Integrated in main layout container) */}
      <nav aria-label="Điều hướng chính máy tính" className="hidden md:flex items-center gap-1 bg-[#FBF9F5] dark:bg-stone-900 border-b border-stone-200/80 dark:border-stone-800 px-6 py-2">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
          <div className="text-xs text-stone-500 dark:text-stone-400">
            Ứng dụng sức khỏe không áp lực
          </div>
        </div>
      </nav>

      {/* Mobile Fixed Bottom Tab Bar */}
      <nav
        aria-label="Điều hướng chính điện thoại"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FDFBF7]/95 dark:bg-stone-900/95 backdrop-blur-md border-t border-stone-200/80 dark:border-stone-800 pb-safe shadow-lg"
      >
        <div className="grid grid-cols-5 h-16">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex flex-col items-center justify-center min-h-[44px] py-1 transition-all cursor-pointer ${
                  isActive
                    ? 'text-emerald-700 dark:text-emerald-400 font-semibold'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                <div className={`p-1 rounded-xl transition-colors ${isActive ? 'bg-emerald-100/60 dark:bg-emerald-950/60' : ''}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[11px] tracking-tight mt-0.5 whitespace-nowrap">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
