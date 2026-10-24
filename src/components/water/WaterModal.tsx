import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatWater } from '../../utils/nutritionFormulas';
import { Droplet, Plus, Trash2, X, Clock, Settings2 } from 'lucide-react';

interface WaterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WaterModal: React.FC<WaterModalProps> = ({ isOpen, onClose }) => {
  const { user, selectedDate, waterLogs, addWaterLog, deleteWaterLog, updateDailyWaterTarget } = useApp();

  const [customAmount, setCustomAmount] = useState<number | ''>(250);
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [targetInput, setTargetInput] = useState(user?.dailyWaterTargetMl || 2000);

  if (!isOpen) return null;

  const dayLogs = waterLogs.filter((w) => w.date === selectedDate);
  const totalMl = dayLogs.reduce((sum, item) => sum + item.amountMl, 0);
  const targetMl = user?.dailyWaterTargetMl || 2000;
  const progressPercent = Math.min(100, Math.round((totalMl / targetMl) * 100));

  const quickAmounts = [150, 250, 350, 500];

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (customAmount && customAmount > 0) {
      addWaterLog(Number(customAmount));
      setCustomAmount(250);
    }
  };

  const handleSaveTarget = () => {
    updateDailyWaterTarget(Number(targetInput));
    setIsEditingTarget(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    >
      <div className="bg-[#FAF9F6] dark:bg-stone-900 w-full max-w-md rounded-3xl shadow-2xl p-6 border border-stone-200 dark:border-stone-800 relative">
        <button
          onClick={onClose}
          aria-label="Đóng"
          className="absolute top-4 right-4 p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
            <Droplet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
              Ghi nhận nước uống
            </h2>
            <div className="text-xs text-stone-500">
              Ngày: {selectedDate}
            </div>
          </div>
        </div>

        {/* Progress Card */}
        <div className="p-4 bg-cyan-50/70 dark:bg-cyan-950/30 rounded-2xl border border-cyan-200/60 dark:border-cyan-800/40 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-2xl font-bold tabular-nums text-cyan-900 dark:text-cyan-100">
                {formatWater(totalMl, user?.unitSystem)}
              </span>
              <span className="text-xs text-cyan-700 dark:text-cyan-300 ml-1">
                / {formatWater(targetMl, user?.unitSystem)}
              </span>
            </div>
            <button
              onClick={() => setIsEditingTarget(!isEditingTarget)}
              className="text-xs font-semibold text-cyan-800 dark:text-cyan-300 flex items-center gap-1 hover:underline cursor-pointer"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>Chỉnh mục tiêu</span>
            </button>
          </div>

          <div className="w-full bg-cyan-200 dark:bg-cyan-900/60 h-2 rounded-full overflow-hidden mb-1.5">
            <div
              className="bg-cyan-600 h-full transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-cyan-700 dark:text-cyan-400">
            <span>Đạt {progressPercent}%</span>
            <span>Mỗi cơ thể có nhu cầu nước riêng</span>
          </div>

          {isEditingTarget && (
            <div className="mt-3 pt-3 border-t border-cyan-200 dark:border-cyan-800/60 flex items-center gap-2">
              <input
                type="number"
                step="50"
                min="1000"
                max="4000"
                value={targetInput}
                onChange={(e) => setTargetInput(Number(e.target.value))}
                className="w-28 px-2.5 py-1 text-xs rounded-lg border border-cyan-300 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none"
              />
              <span className="text-xs text-cyan-800 dark:text-cyan-200">ml/ngày</span>
              <button
                type="button"
                onClick={handleSaveTarget}
                className="px-3 py-1 rounded-lg bg-cyan-700 text-white text-xs font-semibold hover:bg-cyan-600 transition-colors ml-auto cursor-pointer"
              >
                Lưu
              </button>
            </div>
          )}
        </div>

        {/* Quick Add Buttons */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-2">
            Thêm nhanh theo cốc / chai
          </label>
          <div className="grid grid-cols-4 gap-2">
            {quickAmounts.map((amt) => (
              <button
                key={amt}
                onClick={() => addWaterLog(amt)}
                className="p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:border-cyan-500 text-center transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <div className="text-xs font-bold text-cyan-700 dark:text-cyan-400 tabular-nums">
                  +{amt}
                </div>
                <div className="text-[10px] text-stone-500">ml</div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Input */}
        <form onSubmit={handleAddCustom} className="flex gap-2 mb-4">
          <input
            type="number"
            step="10"
            min="10"
            max="2000"
            placeholder="Dung tích khác (ml)"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value === '' ? '' : Number(e.target.value))}
            className="flex-1 px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-cyan-600 text-white font-semibold text-xs hover:bg-cyan-500 transition-all cursor-pointer flex items-center gap-1 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm</span>
          </button>
        </form>

        {/* History List for today */}
        <div className="border-t border-stone-200 dark:border-stone-800 pt-3">
          <span className="text-xs font-semibold text-stone-700 dark:text-stone-300 mb-2 block">
            Các lần uống hôm nay ({dayLogs.length})
          </span>
          <div className="max-h-36 overflow-y-auto space-y-1.5">
            {dayLogs.length === 0 ? (
              <div className="text-xs text-stone-400 py-2 text-center">
                Chưa có lần uống nào được ghi nhận cho ngày này.
              </div>
            ) : (
              dayLogs.map((log) => {
                const timeStr = new Date(log.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });
                return (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-stone-100/70 dark:bg-stone-800/60 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <Droplet className="w-3.5 h-3.5 text-cyan-600" />
                      <span className="font-semibold text-stone-800 dark:text-stone-200 tabular-nums">
                        {log.amountMl} ml
                      </span>
                      <span className="text-stone-400">· {timeStr}</span>
                    </div>
                    <button
                      onClick={() => deleteWaterLog(log.id)}
                      aria-label="Xóa lần ghi"
                      className="p-1 text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
