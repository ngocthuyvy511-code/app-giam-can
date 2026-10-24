import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MealEntry } from '../../types';
import {
  Plus,
  Trash2,
  Edit2,
  Copy,
  Calendar,
  Utensils,
  Sparkles,
  Info,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';

interface LogViewProps {
  onOpenSearchFood: (mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => void;
  onOpenAiScan: (mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => void;
}

export const LogView: React.FC<LogViewProps> = ({ onOpenSearchFood, onOpenAiScan }) => {
  const {
    user,
    selectedDate,
    setSelectedDate,
    mealEntries,
    deleteMealEntry,
    updateMealEntry,
    copyMealsToDate,
  } = useApp();

  const [copyTargetDate, setCopyTargetDate] = useState<string>('');
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<MealEntry | null>(null);

  const mealTypes = [
    { id: 'breakfast' as const, label: 'Bữa sáng', timeHint: '06:00 - 09:00' },
    { id: 'lunch' as const, label: 'Bữa trưa', timeHint: '11:30 - 13:30' },
    { id: 'dinner' as const, label: 'Bữa tối', timeHint: '18:00 - 20:00' },
    { id: 'snack' as const, label: 'Bữa phụ / Tráng miệng', timeHint: 'Trong ngày' },
  ];

  const dayMeals = mealEntries.filter((m) => m.date === selectedDate);
  const totalCalories = dayMeals.reduce((s, m) => s + m.calories, 0);
  const totalProtein = dayMeals.reduce((s, m) => s + m.protein, 0);
  const totalCarbs = dayMeals.reduce((s, m) => s + m.carbs, 0);
  const totalFat = dayMeals.reduce((s, m) => s + m.fat, 0);

  const habitMode = user?.habitOnlyMode || user?.hideCaloriesAndWeight;

  const handleCopy = () => {
    if (copyTargetDate) {
      copyMealsToDate(selectedDate, copyTargetDate);
      setIsCopyModalOpen(false);
      setCopyTargetDate('');
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMeal) return;
    updateMealEntry(editingMeal.id, {
      foodName: editingMeal.foodName,
      servings: Number(editingMeal.servings),
      calories: Number(editingMeal.calories),
      protein: Number(editingMeal.protein),
      carbs: Number(editingMeal.carbs),
      fat: Number(editingMeal.fat),
      notes: editingMeal.notes,
    });
    setEditingMeal(null);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Nhật ký ăn uống theo ngày
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Ngày đang xem: {selectedDate} · Dữ liệu có cơ sở khẩu phần rõ ràng
          </p>
        </div>

        <div className="flex items-center gap-2">
          {dayMeals.length > 0 && (
            <button
              onClick={() => setIsCopyModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-850 text-stone-700 dark:text-stone-200 hover:bg-stone-100 transition-colors cursor-pointer shadow-xs"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Sao chép sang ngày khác</span>
            </button>
          )}
        </div>
      </div>

      {/* Daily Nutrients Summary Banner */}
      {!habitMode && (
        <div className="p-4 rounded-3xl bg-white dark:bg-stone-850 border border-stone-200/80 dark:border-stone-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-xs text-stone-500 block">Tổng năng lượng</span>
              <span className="text-xl font-bold tabular-nums text-stone-900 dark:text-stone-100">
                {totalCalories} kcal
              </span>
            </div>
            {user?.dailyCalorieTarget && (
              <div className="border-l border-stone-200 dark:border-stone-700 pl-4">
                <span className="text-xs text-stone-500 block">Mục tiêu tham khảo</span>
                <span className="text-xl font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
                  {user.dailyCalorieTarget} kcal
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-6 text-xs text-stone-600 dark:text-stone-300">
            <div>
              <span className="text-stone-400 block text-[10px]">Đạm (Protein)</span>
              <strong className="text-stone-900 dark:text-stone-100 tabular-nums">{totalProtein}g</strong>
            </div>
            <div>
              <span className="text-stone-400 block text-[10px]">Carbohydrate</span>
              <strong className="text-stone-900 dark:text-stone-100 tabular-nums">{totalCarbs}g</strong>
            </div>
            <div>
              <span className="text-stone-400 block text-[10px]">Chất béo</span>
              <strong className="text-stone-900 dark:text-stone-100 tabular-nums">{totalFat}g</strong>
            </div>
          </div>
        </div>
      )}

      {/* 4 Meal Sections */}
      <div className="space-y-4">
        {mealTypes.map((type) => {
          const sectionMeals = dayMeals.filter((m) => m.mealType === type.id);
          const sectionCals = sectionMeals.reduce((s, m) => s + m.calories, 0);

          return (
            <div
              key={type.id}
              className="p-5 rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-850 shadow-xs space-y-3"
            >
              {/* Section Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
                    {type.label}
                  </h2>
                  <span className="text-xs text-stone-400">· {type.timeHint}</span>
                  {!habitMode && sectionMeals.length > 0 && (
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 ml-2">
                      {sectionCals} kcal
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onOpenAiScan(type.id)}
                    className="p-1.5 rounded-xl text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/40 transition-colors cursor-pointer"
                    title="Chụp ảnh quét món bằng AI"
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onOpenSearchFood(type.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 transition-colors shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm món</span>
                  </button>
                </div>
              </div>

              {/* Meals list in this section */}
              {sectionMeals.length === 0 ? (
                <div className="py-4 text-center text-xs text-stone-400 italic border border-dashed border-stone-200 dark:border-stone-800 rounded-2xl">
                  Chưa ghi món nào cho {type.label.toLowerCase()}.
                </div>
              ) : (
                <div className="space-y-2">
                  {sectionMeals.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-stone-900 dark:text-stone-100">
                            {item.foodName}
                          </span>
                          <span className="text-xs text-stone-500">
                            ({item.servings} {item.unit})
                          </span>
                        </div>

                        {/* Unboxed Metadata */}
                        <div className="flex items-center flex-wrap gap-2 text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                          {!habitMode && (
                            <>
                              <span className="font-medium text-stone-800 dark:text-stone-200">
                                {item.calories} kcal
                              </span>
                              <span aria-hidden="true">·</span>
                              <span>Đạm {item.protein}g</span>
                              <span aria-hidden="true">·</span>
                              <span>Carb {item.carbs}g</span>
                              <span aria-hidden="true">·</span>
                              <span>Béo {item.fat}g</span>
                              <span aria-hidden="true">·</span>
                            </>
                          )}
                          <span>Lúc {item.time}</span>
                          {item.weightGrams && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span>{item.weightGrams}g</span>
                            </>
                          )}
                        </div>

                        {item.notes && (
                          <div className="text-xs italic text-stone-600 dark:text-stone-400 mt-1">
                            Ghi chú: {item.notes}
                          </div>
                        )}

                        <div className="text-[10px] text-stone-400 mt-1">
                          Nguồn dinh dưỡng: {item.sourceNote}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                        <button
                          onClick={() => setEditingMeal(item)}
                          aria-label="Sửa món"
                          className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-white dark:hover:bg-stone-700 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteMealEntry(item.id)}
                          aria-label="Xóa món"
                          className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-white dark:hover:bg-stone-700 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Copy to other date modal */}
      {isCopyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[#FAF9F6] dark:bg-stone-900 w-full max-w-sm rounded-3xl p-5 border border-stone-200 dark:border-stone-800 space-y-4">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
              Sao chép bữa ăn sang ngày khác
            </h3>
            <p className="text-xs text-stone-500">
              Sao chép toàn bộ {dayMeals.length} món ăn từ ngày {selectedDate} sang một ngày bạn chọn.
            </p>
            <input
              type="date"
              required
              value={copyTargetDate}
              onChange={(e) => setCopyTargetDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs focus:outline-none"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setIsCopyModalOpen(false)}
                className="px-3.5 py-1.5 text-xs rounded-xl text-stone-500 hover:bg-stone-100 cursor-pointer"
              >
                Hủy
              </button>
              <button
                disabled={!copyTargetDate}
                onClick={handleCopy}
                className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50 cursor-pointer"
              >
                Sao chép ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Meal modal */}
      {editingMeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <form
            onSubmit={handleSaveEdit}
            className="bg-[#FAF9F6] dark:bg-stone-900 w-full max-w-md rounded-3xl p-5 border border-stone-200 dark:border-stone-800 space-y-4"
          >
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
              Chỉnh sửa món ăn
            </h3>
            <div>
              <label className="block text-xs font-semibold mb-1 text-stone-700 dark:text-stone-300">
                Tên món
              </label>
              <input
                type="text"
                required
                value={editingMeal.foodName}
                onChange={(e) => setEditingMeal({ ...editingMeal, foodName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1 text-stone-700 dark:text-stone-300">
                  Khẩu phần (số lượng)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={editingMeal.servings}
                  onChange={(e) => setEditingMeal({ ...editingMeal, servings: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-stone-700 dark:text-stone-300">
                  Calo (kcal)
                </label>
                <input
                  type="number"
                  value={editingMeal.calories}
                  onChange={(e) => setEditingMeal({ ...editingMeal, calories: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-stone-700 dark:text-stone-300">
                Ghi chú
              </label>
              <input
                type="text"
                value={editingMeal.notes || ''}
                onChange={(e) => setEditingMeal({ ...editingMeal, notes: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs focus:outline-none"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setEditingMeal(null)}
                className="px-3.5 py-1.5 text-xs rounded-xl text-stone-500 hover:bg-stone-100 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 cursor-pointer"
              >
                Lưu thay đổi
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
