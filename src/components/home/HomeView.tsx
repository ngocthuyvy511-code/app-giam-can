import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatWater, formatWeight } from '../../utils/nutritionFormulas';
import {
  Utensils,
  Droplet,
  Activity,
  Moon,
  Plus,
  CheckCircle2,
  ChevronRight,
  Flame,
  ShieldCheck,
  Sparkles,
  Info,
  Calendar,
} from 'lucide-react';

interface HomeViewProps {
  onOpenAddMeal: () => void;
  onOpenWater: () => void;
  onOpenExercise: () => void;
  onOpenSleep: () => void;
  onOpenProgressModal: () => void;
  onNavigateToTab: (tab: 'log' | 'plan' | 'progress' | 'profile') => void;
  onOpenAssistant: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onOpenAddMeal,
  onOpenWater,
  onOpenExercise,
  onOpenSleep,
  onOpenProgressModal,
  onNavigateToTab,
  onOpenAssistant,
}) => {
  const {
    user,
    selectedDate,
    mealEntries,
    waterLogs,
    exerciseLogs,
    sleepLogs,
    habits,
    habitCompletions,
    toggleHabitCompletion,
  } = useApp();

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  // Daily sums
  const dayMeals = mealEntries.filter((m) => m.date === selectedDate);
  const totalCalories = dayMeals.reduce((sum, m) => sum + m.calories, 0);
  const totalProtein = dayMeals.reduce((sum, m) => sum + m.protein, 0);
  const totalCarbs = dayMeals.reduce((sum, m) => sum + m.carbs, 0);
  const totalFat = dayMeals.reduce((sum, m) => sum + m.fat, 0);

  const dayWater = waterLogs.filter((w) => w.date === selectedDate);
  const totalWaterMl = dayWater.reduce((sum, w) => sum + w.amountMl, 0);
  const waterTarget = user?.dailyWaterTargetMl || 2000;

  const dayExercises = exerciseLogs.filter((e) => e.date === selectedDate);
  const totalExerciseMins = dayExercises.reduce((sum, e) => sum + e.durationMinutes, 0);
  const totalExerciseBurn = dayExercises.reduce((sum, e) => sum + e.caloriesBurnedEstimated, 0);

  const daySleep = sleepLogs.find((s) => s.date === selectedDate);

  const habitMode = user?.habitOnlyMode || user?.hideCaloriesAndWeight;
  const calorieTarget = user?.dailyCalorieTarget;

  // Next suggested action
  const getNextSuggestion = () => {
    if (dayMeals.length === 0) {
      return {
        title: 'Ghi lại bữa ăn đầu tiên trong ngày',
        desc: 'Một bữa sáng với protein và tinh bột tốt sẽ tiếp năng lượng cho bạn.',
        action: onOpenAddMeal,
        actionLabel: 'Ghi bữa ăn',
      };
    }
    if (totalWaterMl < 1000) {
      return {
        title: 'Bổ sung thêm 1 cốc nước ấm',
        desc: 'Uống từng ngụm nhỏ giúp duy trì sự tỉnh táo và hỗ trợ tiêu hóa.',
        action: onOpenWater,
        actionLabel: 'Thêm nước',
      };
    }
    if (dayExercises.length === 0) {
      return {
        title: 'Vận động nhẹ 15–20 phút',
        desc: 'Đi bộ hoặc giãn cơ nhẹ nhàng giúp giải phóng căng thẳng lưng vai.',
        action: onOpenExercise,
        actionLabel: 'Thêm bài tập',
      };
    }
    return {
      title: 'Hôm nay bạn đang chăm sóc bản thân rất tốt!',
      desc: 'Hãy chuẩn bị một buổi tối thư giãn và đi ngủ đúng giờ nhé.',
      action: onOpenSleep,
      actionLabel: 'Ghi giấc ngủ',
    };
  };

  const suggestion = getNextSuggestion();

  return (
    <div className="space-y-5 pb-20 md:pb-8">
      {/* Greeting & Header Anchor */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Xin chào, {user?.name || 'Bạn'}
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Mục tiêu: {user?.primaryGoal === 'manage_weight' ? 'Quản lý cân nặng bền vững' : user?.primaryGoal === 'maintain' ? 'Duy trì vóc dáng & sức khỏe' : 'Nuôi dưỡng thói quen sống tích cực'}
            {user?.currentWeightKg && !habitMode && (
              <> · Cân nặng hiện tại: {formatWeight(user.currentWeightKg, user.unitSystem)}</>
            )}
          </p>
        </div>

        {/* Quick Actions Strip */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={onOpenAddMeal}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 transition-colors shadow-xs whitespace-nowrap cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm bữa ăn</span>
          </button>
          <button
            onClick={onOpenWater}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-cyan-600 text-white hover:bg-cyan-500 transition-colors shadow-xs whitespace-nowrap cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm nước</span>
          </button>
          <button
            onClick={onOpenProgressModal}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-stone-800 text-white dark:bg-stone-200 dark:text-stone-900 hover:opacity-90 transition-opacity shadow-xs whitespace-nowrap cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ghi cân nặng</span>
          </button>
          <button
            onClick={onOpenExercise}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-orange-600 text-white hover:bg-orange-500 transition-colors shadow-xs whitespace-nowrap cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm vận động</span>
          </button>
        </div>
      </div>

      {/* Hero Suggestion Card */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-50 via-[#FAF9F6] to-orange-50/40 dark:from-emerald-950/40 dark:via-stone-900 dark:to-orange-950/20 border border-emerald-200/70 dark:border-emerald-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Gợi ý hành động tiếp theo</span>
          </div>
          <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
            {suggestion.title}
          </h3>
          <p className="text-xs text-stone-600 dark:text-stone-300">
            {suggestion.desc}
          </p>
        </div>
        <button
          onClick={suggestion.action}
          className="self-start sm:self-center px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 active:scale-95 transition-all shadow-xs cursor-pointer whitespace-nowrap"
        >
          {suggestion.actionLabel}
        </button>
      </div>

      {/* Core KPI Cards Grid (Zero-pill, clean unboxed typography) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Năng lượng / Dinh dưỡng */}
        <div className="p-4 rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-850 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-500 text-xs">
            <div className="flex items-center gap-1.5 font-medium">
              <Utensils className="w-4 h-4 text-emerald-600" />
              <span>Năng lượng đã nạp</span>
            </div>
            <button
              onClick={() => onNavigateToTab('log')}
              className="hover:text-stone-800 dark:hover:text-stone-200 cursor-pointer"
            >
              Chi tiết →
            </button>
          </div>

          {!habitMode && calorieTarget ? (
            <>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold tabular-nums text-stone-900 dark:text-stone-100">
                  {totalCalories}
                </span>
                <span className="text-xs text-stone-500">
                  / {calorieTarget} kcal tham khảo
                </span>
              </div>
              <div className="w-full bg-stone-100 dark:bg-stone-700 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, Math.round((totalCalories / calorieTarget) * 100))}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
                <span>Đạm: {totalProtein}g</span>
                <span>Carb: {totalCarbs}g</span>
                <span>Béo: {totalFat}g</span>
              </div>
            </>
          ) : (
            <div className="py-2">
              <div className="text-xl font-bold text-stone-900 dark:text-stone-100">
                {dayMeals.length} bữa ăn
              </div>
              <p className="text-xs text-stone-500 mt-1">
                Chế độ thói quen: Tập trung ăn đa dạng, không tính calo.
              </p>
            </div>
          )}
        </div>

        {/* Card 2: Nước uống */}
        <div className="p-4 rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-850 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-500 text-xs">
            <div className="flex items-center gap-1.5 font-medium">
              <Droplet className="w-4 h-4 text-cyan-600" />
              <span>Nước uống hôm nay</span>
            </div>
            <button
              onClick={onOpenWater}
              className="text-cyan-700 dark:text-cyan-400 font-semibold cursor-pointer"
            >
              + Ghi nước
            </button>
          </div>

          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold tabular-nums text-stone-900 dark:text-stone-100">
              {formatWater(totalWaterMl, user?.unitSystem)}
            </span>
            <span className="text-xs text-stone-500">
              / {formatWater(waterTarget, user?.unitSystem)}
            </span>
          </div>

          <div className="w-full bg-cyan-100 dark:bg-cyan-950/60 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-cyan-600 h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, Math.round((totalWaterMl / waterTarget) * 100))}%` }}
            />
          </div>

          <div className="text-[11px] text-stone-500 pt-1">
            {dayWater.length} lần uống · Khoảng {Math.round(totalWaterMl / 250)} cốc nước
          </div>
        </div>

        {/* Card 3: Vận động thể chất */}
        <div className="p-4 rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-850 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-500 text-xs">
            <div className="flex items-center gap-1.5 font-medium">
              <Activity className="w-4 h-4 text-orange-600" />
              <span>Vận động hôm nay</span>
            </div>
            <button
              onClick={onOpenExercise}
              className="text-orange-700 dark:text-orange-400 font-semibold cursor-pointer"
            >
              + Bài tập
            </button>
          </div>

          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold tabular-nums text-stone-900 dark:text-stone-100">
              {totalExerciseMins}
            </span>
            <span className="text-xs text-stone-500">phút</span>
            {totalExerciseBurn > 0 && (
              <span className="text-xs text-orange-600 font-medium ml-1">
                (~{totalExerciseBurn} kcal)
              </span>
            )}
          </div>

          <div className="w-full bg-orange-100 dark:bg-orange-950/60 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-orange-600 h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, Math.round((totalExerciseMins / 30) * 100))}%` }}
            />
          </div>

          <div className="text-[11px] text-stone-500 pt-1 truncate">
            {dayExercises.length > 0
              ? dayExercises.map((e) => e.name).join(', ')
              : 'Chưa ghi nhận buổi tập nào'}
          </div>
        </div>

        {/* Card 4: Giấc ngủ & Tinh thần */}
        <div className="p-4 rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-850 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-500 text-xs">
            <div className="flex items-center gap-1.5 font-medium">
              <Moon className="w-4 h-4 text-indigo-600" />
              <span>Giấc ngủ đêm qua</span>
            </div>
            <button
              onClick={onOpenSleep}
              className="text-indigo-700 dark:text-indigo-400 font-semibold cursor-pointer"
            >
              + Ghi ngủ
            </button>
          </div>

          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold tabular-nums text-stone-900 dark:text-stone-100">
              {daySleep ? daySleep.durationHours : '--'}
            </span>
            <span className="text-xs text-stone-500">tiếng</span>
          </div>

          <div className="w-full bg-indigo-100 dark:bg-indigo-950/60 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, Math.round(((daySleep?.durationHours || 0) / 8) * 100))}%` }}
            />
          </div>

          <div className="text-[11px] text-stone-500 pt-1">
            {daySleep
              ? `Chất lượng ${daySleep.qualityRating}/5 · ${daySleep.sleepTime} đến ${daySleep.wakeTime}`
              : 'Chạm để cập nhật giờ ngủ'}
          </div>
        </div>
      </div>

      {/* Two Columns Split: Nhật ký bữa ăn hôm nay & Thói quen */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Nhật ký bữa ăn nhanh */}
        <div className="lg:col-span-2 p-5 rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-850 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Nhật ký ăn uống {isToday ? 'hôm nay' : selectedDate}
              </h2>
              <span className="text-xs text-stone-500">
                {dayMeals.length} món đã ghi nhận
              </span>
            </div>
            <button
              onClick={() => onNavigateToTab('log')}
              className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              Xem toàn bộ nhật ký →
            </button>
          </div>

          {dayMeals.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-stone-200 dark:border-stone-700 rounded-2xl">
              <Utensils className="w-8 h-8 text-stone-300 dark:text-stone-600 mx-auto mb-2" />
              <p className="text-xs font-medium text-stone-600 dark:text-stone-300">
                Chưa có bữa ăn nào được ghi lại cho ngày này.
              </p>
              <button
                onClick={onOpenAddMeal}
                className="mt-3 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 transition-colors cursor-pointer"
              >
                + Ghi bữa ăn đầu tiên
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {dayMeals.slice(0, 4).map((meal) => (
                <div
                  key={meal.id}
                  className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/60 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-stone-900 dark:text-stone-100">
                        {meal.foodName}
                      </span>
                      <span className="text-[10px] text-stone-400 capitalize">
                        ({meal.mealType === 'breakfast' ? 'Sáng' : meal.mealType === 'lunch' ? 'Trưa' : meal.mealType === 'dinner' ? 'Tối' : 'Phụ'})
                      </span>
                    </div>
                    {/* Unboxed metadata */}
                    <div className="flex items-center gap-2 text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                      <span>{meal.servings} {meal.unit}</span>
                      <span aria-hidden="true">·</span>
                      <span>Lúc {meal.time}</span>
                      {meal.notes && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="italic">{meal.notes}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {!habitMode && (
                    <div className="text-right">
                      <div className="text-xs font-bold text-stone-900 dark:text-stone-100 tabular-nums">
                        {meal.calories} kcal
                      </div>
                      <div className="text-[10px] text-stone-400">
                        Đạm {meal.protein}g · Béo {meal.fat}g
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Thói quen hôm nay */}
        <div className="p-5 rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-850 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
              Thói quen hôm nay
            </h2>
            <button
              onClick={onOpenSleep}
              className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              Quản lý →
            </button>
          </div>

          <div className="space-y-2">
            {habits.map((habit) => {
              const completed = habitCompletions.some(
                (hc) => hc.habitId === habit.id && hc.date === selectedDate
              );
              return (
                <button
                  key={habit.id}
                  onClick={() => toggleHabitCompletion(habit.id, selectedDate)}
                  className={`w-full p-3 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                    completed
                      ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30'
                      : 'border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/40 hover:border-emerald-400'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                      completed
                        ? 'bg-emerald-600 text-white'
                        : 'border border-stone-300 dark:border-stone-600'
                    }`}
                  >
                    {completed && <CheckCircle2 className="w-4 h-4" />}
                  </div>

                  <div className="flex-1">
                    <span
                      className={`text-xs font-semibold block ${
                        completed
                          ? 'line-through text-stone-400 dark:text-stone-500'
                          : 'text-stone-900 dark:text-stone-100'
                      }`}
                    >
                      {habit.title}
                    </span>
                    <span className="text-[10px] text-stone-400 mt-0.5 block">
                      Chạm để đánh dấu hoàn thành
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="p-3 bg-stone-100 dark:bg-stone-800/50 rounded-2xl text-[11px] text-stone-600 dark:text-stone-400 leading-relaxed">
            Nuôi dưỡng thói quen tự nhiên. Ngày nghỉ ngơi cũng là một phần quan trọng của hành trình bền vững.
          </div>
        </div>
      </div>
    </div>
  );
};
