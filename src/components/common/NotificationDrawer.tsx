import React from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, CheckCheck, Trash2, X, Clock, Info } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { user, notifications, markNotificationRead, clearAllNotifications } = useApp();

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-xs"
    >
      <div className="bg-[#FAF9F6] dark:bg-stone-900 w-full max-w-sm h-full shadow-2xl flex flex-col border-l border-stone-200 dark:border-stone-800 animate-slide-left">
        {/* Header */}
        <div className="p-4 border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-600" />
            <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
              Thông báo trong ứng dụng
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Đóng"
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quiet hours notice */}
        <div className="p-3 bg-stone-100 dark:bg-stone-800/60 border-b border-stone-200/60 dark:border-stone-800 text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <span>
            Khung giờ yên lặng đang bật ({user?.quietHoursStart} - {user?.quietHoursEnd})
          </span>
        </div>

        {/* Notifications stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-2.5">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-xs text-stone-400 italic">
              Không có thông báo mới nào.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => markNotificationRead(n.id)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  n.read
                    ? 'border-stone-200 dark:border-stone-800 bg-white/50 dark:bg-stone-850/50 opacity-75'
                    : 'border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/40 dark:bg-emerald-950/20'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold text-xs text-stone-900 dark:text-stone-100">
                    {n.title}
                  </span>
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0 mt-1" />
                  )}
                </div>
                <p className="text-xs text-stone-600 dark:text-stone-300 mt-1 leading-relaxed">
                  {n.message}
                </p>
                <span className="text-[10px] text-stone-400 mt-1.5 block">
                  {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Bottom Actions */}
        {notifications.length > 0 && (
          <div className="p-3 border-t border-stone-200/80 dark:border-stone-800 bg-stone-50 dark:bg-stone-850 flex justify-between">
            <button
              onClick={clearAllNotifications}
              className="text-xs text-stone-500 hover:text-red-600 flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa tất cả</span>
            </button>
            <span className="text-[11px] text-stone-400">
              Chỉ hiển thị thông báo nội bộ
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
