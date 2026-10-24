import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Moon, Sparkles, Check, Plus, Trash2, X, Star, Heart } from 'lucide-react';

interface SleepHabitsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'sleep' | 'habits';
}

export const SleepHabitsModal: React.FC<SleepHabitsModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'sleep',
}) => {
  const {
    user,
    selectedDate,
    sleepLogs,
    saveSleepLog,
    habits,
    habitCompletions,
    addHabit,
    toggleHabitCompletion,
    archiveHabit,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'sleep' | 'habits'>(defaultTab);

  // Sleep State for selected date
  const existingSleep = sleepLogs.find((s) => s.date === selectedDate);
  const [sleepTime, setSleepTime] = useState(existingSleep?.sleepTime || '23:00');
  const [wakeTime, setWakeTime] = useState(existingSleep?.wakeTime || '06:30');
  const [qualityRating, setQualityRating] = useState(existingSleep?.qualityRating || 4);
  const [moodRating, setMoodRating] = useState(existingSleep?.moodRating || 4);
  const [sleepNotes, setSleepNotes] = useState(existingSleep?.notes || '');

  // New Habit State
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState<
    'nutrition' | 'exercise' | 'hydration' | 'mindset' | 'sleep'
  >('nutrition');

  if (!isOpen) return null;

  // Calculate duration supporting across-midnight sleep
  const calculateSleepDurationHours = (bed: string, wake: string): number => {
    const [bH, bM] = bed.split(':').map(Number);
    const [wH, wM] = wake.split(':').map(Number);
    let bedMins = bH * 60 + bM;
    let wakeMins = wH * 60 + wM;
    if (wakeMins < bedMins) {
      // Sleep across midnight
      wakeMins += 24 * 60;
    }
    const diffMins = wakeMins - bedMins;
    return parseFloat((diffMins / 60).toFixed(1));
  };

  const calculatedHours = calculateSleepDurationHours(sleepTime, wakeTime);

  const handleSaveSleep = (e: React.FormEvent) => {
    e.preventDefault();
    saveSleepLog({
      date: selectedDate,
      sleepTime,
      wakeTime,
      durationHours: calculatedHours,
      qualityRating,
      moodRating,
      notes: sleepNotes.trim() || undefined,
    });
    onClose();
  };

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitTitle.trim()) return;

    const colors: Record<string, string> = {
      nutrition: '#10b981',
      exercise: '#ea580c',
      hydration: '#06b6d4',
      mindset: '#8b5cf6',
      sleep: '#6366f1',
    };

    addHabit({
      title: newHabitTitle.trim(),
      category: newHabitCategory,
      targetDaysPerWeek: 7,
      color: colors[newHabitCategory] || '#10b981',
    });

    setNewHabitTitle('');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm"
    >
      <div className="bg-[#FAF9F6] dark:bg-stone-900 w-full max-w-lg max-h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-stone-200 dark:border-stone-800">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Moon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Giấc ngủ & Thói quen lành mạnh
              </h2>
              <span className="text-[11px] text-stone-500">
                Ngày: {selectedDate} · Không áp lực, nuôi dưỡng lối sống tích cực
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Đóng"
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-stone-200/80 dark:border-stone-800 px-5 bg-stone-100/50 dark:bg-stone-800/30 shrink-0">
          <button
            onClick={() => setActiveTab('sleep')}
            className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'sleep'
                ? 'border-indigo-600 text-indigo-700 dark:text-indigo-400'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            Ghi nhận giấc ngủ
          </button>
          <button
            onClick={() => setActiveTab('habits')}
            className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'habits'
                ? 'border-indigo-600 text-indigo-700 dark:text-indigo-400'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            Quản lý thói quen
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'sleep' ? (
            <form onSubmit={handleSaveSleep} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-stone-700 dark:text-stone-300">
                    Giờ lên giường ngủ
                  </label>
                  <input
                    type="time"
                    value={sleepTime}
                    onChange={(e) => setSleepTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-stone-700 dark:text-stone-300">
                    Giờ thức dậy
                  </label>
                  <input
                    type="time"
                    value={wakeTime}
                    onChange={(e) => setWakeTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>
              </div>

              {/* Calculated Sleep Time */}
              <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/30 rounded-2xl border border-indigo-200/60 dark:border-indigo-800/40 flex items-center justify-between">
                <div>
                  <span className="text-xs text-indigo-800 dark:text-indigo-300 font-medium">
                    Tổng thời gian ngủ (tính qua nửa đêm):
                  </span>
                  <div className="text-xl font-bold text-indigo-950 dark:text-indigo-100 tabular-nums">
                    {calculatedHours} tiếng
                  </div>
                </div>
                <div className="text-xs text-indigo-700 dark:text-indigo-400 text-right">
                  {calculatedHours >= 7 && calculatedHours <= 9
                    ? 'Thời lượng lý tưởng'
                    : calculatedHours < 6
                    ? 'Hơi ít ngủ, tối nay cố gắng ngủ sớm nhé'
                    : 'Ngủ đủ giấc'}
                </div>
              </div>

              {/* Quality & Mood Rating */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-stone-700 dark:text-stone-300">
                    Chất lượng giấc ngủ
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setQualityRating(star)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                          qualityRating >= star
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-500'
                            : 'bg-stone-100 dark:bg-stone-800 text-stone-400'
                        }`}
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-stone-700 dark:text-stone-300">
                    Tâm trạng buổi sáng
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setMoodRating(level)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                          moodRating >= level
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600'
                            : 'bg-stone-100 dark:bg-stone-800 text-stone-400'
                        }`}
                      >
                        <Heart className="w-4 h-4 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-stone-700 dark:text-stone-300">
                  Ghi chú cảm giác khi thức dậy
                </label>
                <input
                  type="text"
                  placeholder="Thức dậy tỉnh táo, có nằm mơ..."
                  value={sleepNotes}
                  onChange={(e) => setSleepNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-500 active:scale-[0.98] transition-all cursor-pointer shadow-sm"
              >
                Lưu nhật ký giấc ngủ
              </button>
            </form>
          ) : (
            /* TAB 2: HABITS */
            <div className="space-y-4">
              <div className="p-3 bg-stone-100 dark:bg-stone-800/60 rounded-2xl text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                Tích lũy từng thói quen nhỏ mỗi ngày. Nếu có ngày bạn bỏ lỡ, điều đó hoàn toàn bình thường và không cần áp lực!
              </div>

              {/* Add New Habit Form */}
              <form onSubmit={handleAddHabit} className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="Tên thói quen mới (ví dụ: Ăn 1 quả táo...)"
                  value={newHabitTitle}
                  onChange={(e) => setNewHabitTitle(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <select
                  value={newHabitCategory}
                  onChange={(e: any) => setNewHabitCategory(e.target.value)}
                  className="px-2.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs focus:outline-none"
                >
                  <option value="nutrition">Ăn uống</option>
                  <option value="exercise">Vận động</option>
                  <option value="hydration">Uống nước</option>
                  <option value="sleep">Giấc ngủ</option>
                  <option value="mindset">Tâm trí</option>
                </select>
                <button
                  type="submit"
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 cursor-pointer shrink-0"
                >
                  Thêm
                </button>
              </form>

              {/* List of habits */}
              <div className="space-y-2">
                {habits.map((h) => {
                  const isCompletedToday = habitCompletions.some(
                    (hc) => hc.habitId === h.id && hc.date === selectedDate
                  );
                  return (
                    <div
                      key={h.id}
                      className="p-3 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800/80 flex items-center justify-between gap-3"
                    >
                      <button
                        type="button"
                        onClick={() => toggleHabitCompletion(h.id, selectedDate)}
                        className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                          isCompletedToday
                            ? 'bg-emerald-600 text-white'
                            : 'border border-stone-300 dark:border-stone-600 hover:border-emerald-500'
                        }`}
                      >
                        {isCompletedToday && <Check className="w-4 h-4 stroke-[3]" />}
                      </button>

                      <div className="flex-1 text-xs">
                        <span
                          className={`font-semibold ${
                            isCompletedToday
                              ? 'line-through text-stone-400 dark:text-stone-500'
                              : 'text-stone-900 dark:text-stone-100'
                          }`}
                        >
                          {h.title}
                        </span>
                        <div className="text-[10px] text-stone-500">
                          Mục tiêu {h.targetDaysPerWeek} ngày/tuần
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => archiveHabit(h.id)}
                        className="p-1 text-stone-400 hover:text-red-500 transition-colors cursor-pointer"
                        title="Xóa thói quen"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
