import React from 'react';
import { useApp } from '../../context/AppContext';
import { RotateCcw, X } from 'lucide-react';

export const ToastUndo: React.FC = () => {
  const { lastAction, triggerUndo, dismissToast } = useApp();

  if (!lastAction) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 px-4 py-3 rounded-xl shadow-lg flex items-center justify-between gap-3 text-sm animate-fade-in"
    >
      <span className="truncate flex-1 font-medium">{lastAction.message}</span>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={triggerUndo}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Hoàn tác</span>
        </button>
        <button
          onClick={dismissToast}
          aria-label="Đóng thông báo"
          className="p-1 rounded-md text-stone-400 hover:text-stone-200 dark:hover:text-stone-700 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
