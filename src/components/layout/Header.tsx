import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Moon,
  Sun,
  Bell,
  Sparkles,
  ShieldAlert,
  Type,
  UserCheck,
} from 'lucide-react';

interface HeaderProps {
  onOpenAssistant: () => void;
  onOpenNotifications: () => void;
  onOpenAdmin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAssistant,
  onOpenNotifications,
  onOpenAdmin,
}) => {
  const {
    user,
    selectedDate,
    setSelectedDate,
    darkMode,
    toggleDarkMode,
    largeFont,
    toggleLargeFont,
    notifications,
  } = useApp();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const todayStr = new Date().toISOString().split('T')[0];
  const isToday = selectedDate === todayStr;

  const formatDateLabel = (dateStr: string) => {
    if (dateStr === todayStr) return 'Hôm nay';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  return (
    <header className="sticky top-0 z-30 bg-[#FDFBF7]/90 dark:bg-stone-900/90 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800 transition-colors">
      {/* Top Banner if in Demo or Habit-Only Mode */}
      {user?.isDemoUser && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200/60 dark:border-amber-800/40 px-4 py-1.5 text-xs text-amber-800 dark:text-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-1.5 truncate">
            <span className="font-semibold">Bản mẫu minh họa:</span>
            <span className="truncate">Đang dùng dữ liệu thử nghiệm. Bạn có thể tự chỉnh sửa hoặc tạo tài khoản mới.</span>
          </div>
          <button
            onClick={onOpenAdmin}
            className="text-xs font-medium underline text-amber-900 dark:text-amber-100 hover:text-amber-950 shrink-0 ml-2 cursor-pointer"
          >
            Quản trị viên
          </button>
        </div>
      )}

      {user?.habitOnlyMode && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-200/60 dark:border-emerald-800/40 px-4 py-1 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
          <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
          <span>Chế độ an toàn: Tập trung vào thói quen và dinh dưỡng lành mạnh, không áp lực cân nặng/calo.</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Brand Zone */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            K
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base sm:text-lg tracking-tight text-stone-900 dark:text-stone-100 leading-none">
              Khỏe Mỗi Ngày
            </span>
            <span className="text-[10px] text-stone-500 dark:text-stone-400 leading-tight">
              Quản lý cân nặng tích cực
            </span>
          </div>
        </div>

        {/* Date Selector Center */}
        <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800/80 rounded-xl p-1 border border-stone-200/60 dark:border-stone-700/60">
          <button
            onClick={handlePrevDay}
            aria-label="Ngày trước"
            className="w-7 h-7 flex items-center justify-center rounded-lg text-stone-600 dark:text-stone-300 hover:bg-white dark:hover:bg-stone-700 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <label className="flex items-center gap-1.5 px-2 py-0.5 text-xs font-semibold text-stone-800 dark:text-stone-200 cursor-pointer">
            <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{formatDateLabel(selectedDate)}</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
              className="sr-only"
            />
          </label>

          <button
            onClick={handleNextDay}
            aria-label="Ngày sau"
            className="w-7 h-7 flex items-center justify-center rounded-lg text-stone-600 dark:text-stone-300 hover:bg-white dark:hover:bg-stone-700 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* AI Assistant Button */}
          <button
            onClick={onOpenAssistant}
            aria-label="Trợ lý AI Khỏe Mỗi Ngày"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Trợ lý AI</span>
          </button>

          {/* Text Size toggle */}
          <button
            onClick={toggleLargeFont}
            aria-label="Chỉnh cỡ chữ"
            title={largeFont ? 'Chuyển về cỡ chữ bình thường' : 'Chuyển cỡ chữ lớn dễ đọc'}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <Type className={`w-4 h-4 ${largeFont ? 'text-emerald-600 font-bold' : ''}`} />
          </button>

          {/* Dark Mode toggle */}
          <button
            onClick={toggleDarkMode}
            aria-label="Chuyển chế độ sáng tối"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Notifications button */}
          <button
            onClick={onOpenNotifications}
            aria-label="Xem thông báo"
            className="relative w-8 h-8 rounded-lg flex items-center justify-center text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-orange-500" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
