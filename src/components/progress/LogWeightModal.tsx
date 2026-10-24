import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Scale, Lock, Heart, Zap, X, ShieldAlert } from 'lucide-react';

interface LogWeightModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LogWeightModal: React.FC<LogWeightModalProps> = ({ isOpen, onClose }) => {
  const { user, selectedDate, addProgressLog } = useApp();

  const [weight, setWeight] = useState<number | ''>(user?.currentWeightKg || 58);
  const [waist, setWaist] = useState<number | ''>('');
  const [mood, setMood] = useState<number>(4);
  const [energy, setEnergy] = useState<number>(4);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (weight === '' || Number(weight) <= 0) return;

    addProgressLog({
      date: selectedDate,
      weightKg: Number(weight),
      waistCm: waist === '' ? undefined : Number(waist),
      moodRating: mood,
      energyRating: energy,
      notes: notes.trim() || undefined,
    });

    onClose();
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
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
              Ghi nhận chỉ số thể chất
            </h2>
            <div className="text-xs text-stone-500">
              Ngày: {selectedDate} · Bảo mật riêng tư
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1 text-stone-700 dark:text-stone-300">
                Cân nặng (kg)
              </label>
              <input
                type="number"
                step="0.1"
                min="20"
                max="250"
                required
                value={weight}
                onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-stone-700 dark:text-stone-300">
                Vòng eo (cm, tùy chọn)
              </label>
              <input
                type="number"
                step="0.5"
                placeholder="Ví dụ: 68"
                value={waist}
                onChange={(e) => setWaist(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Mood & Energy */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1 text-stone-700 dark:text-stone-300">
                Tâm trạng hôm nay
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setMood(lvl)}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${
                      mood === lvl
                        ? 'bg-emerald-600 text-white'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-stone-700 dark:text-stone-300">
                Mức năng lượng
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setEnergy(lvl)}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${
                      energy === lvl
                        ? 'bg-orange-600 text-white'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-stone-700 dark:text-stone-300">
              Ghi chú cảm nhận cơ thể
            </label>
            <input
              type="text"
              placeholder="Hôm nay thấy người nhẹ nhõm, không bị đầy bụng..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs focus:outline-none"
            />
          </div>

          <div className="p-3 bg-stone-100 dark:bg-stone-800/50 rounded-2xl flex items-center gap-2 text-[11px] text-stone-500">
            <Lock className="w-3.5 h-3.5 shrink-0" />
            <span>Dữ liệu này chỉ hiển thị trên máy của bạn và hoàn toàn riêng tư.</span>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-500 active:scale-98 transition-all cursor-pointer shadow-sm"
          >
            Lưu chỉ số thể chất
          </button>
        </form>
      </div>
    </div>
  );
};
