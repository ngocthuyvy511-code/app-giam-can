import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FoodItem, PlannedMeal } from '../../types';
import {
  CalendarRange,
  ShoppingBag,
  RefreshCw,
  Check,
  Plus,
  Trash2,
  ChefHat,
  Clock,
  Sparkles,
  Info,
  CheckSquare,
  Square,
  Users,
} from 'lucide-react';

export const PlanView: React.FC = () => {
  const {
    user,
    foods,
    plannedMeals,
    swapPlannedMeal,
    togglePlannedMealLogged,
    shoppingList,
    addShoppingItem,
    toggleShoppingItem,
    deleteShoppingItem,
    clearCompletedShoppingItems,
    generateShoppingFromPlan,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'plan' | 'shopping'>('plan');
  const [swappingMealId, setSwappingMealId] = useState<string | null>(null);

  // New shopping item form
  const [newShopName, setNewShopName] = useState('');
  const [newShopAmount, setNewShopAmount] = useState('1 phần');
  const [newShopCategory, setNewShopCategory] = useState('Rau củ quả');

  // Diners adjustment state
  const [dinersCount, setDinersCount] = useState<number>(1);

  const mealTypeLabels = {
    breakfast: 'Bữa sáng',
    lunch: 'Bữa trưa',
    dinner: 'Bữa tối',
    snack: 'Bữa phụ',
  };

  const handleSwap = (planId: string, food: FoodItem) => {
    swapPlannedMeal(planId, food);
    setSwappingMealId(null);
  };

  const handleAddShoppingItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShopName.trim()) return;
    addShoppingItem(newShopName.trim(), newShopCategory, newShopAmount.trim());
    setNewShopName('');
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Kế hoạch ăn uống & Mua sắm
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Dựa trên sở thích món Việt, thời gian nấu {user?.cookingTimeMinutes} phút và ngân sách {user?.cookingBudget === 'low' ? 'tiết kiệm' : user?.cookingBudget === 'medium' ? 'tiêu chuẩn' : 'thoải mái'}.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-stone-200/60 dark:bg-stone-800 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('plan')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === 'plan'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                : 'text-stone-600 dark:text-stone-400'
            }`}
          >
            <CalendarRange className="w-3.5 h-3.5" />
            <span>Thực đơn theo ngày</span>
          </button>
          <button
            onClick={() => setActiveTab('shopping')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === 'shopping'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                : 'text-stone-600 dark:text-stone-400'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Danh sách mua sắm ({shoppingList.filter((s) => !s.checked).length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: THỰC ĐƠN KẾ HOẠCH */}
      {activeTab === 'plan' && (
        <div className="space-y-5">
          {/* Healthy Philosophy Banner */}
          <div className="p-4 rounded-3xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 flex items-start gap-3">
            <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
              <span className="font-semibold block">Triết lý dinh dưỡng tích cực:</span>
              <p className="leading-relaxed">
                Chúng mình không gắn nhãn món ăn là &quot;tốt&quot; hay &quot;xấu&quot;. Mọi món ăn Việt Nam truyền thống đều có thể thưởng thức một cách hài hòa và ngon miệng mà không cần nhịn ăn hay tập bù tội lỗi.
              </p>
            </div>
          </div>

          {/* Diners Control & Shopping Sync */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white dark:bg-stone-850 rounded-3xl border border-stone-200/80 dark:border-stone-800">
            <div className="flex items-center gap-2 text-xs">
              <Users className="w-4 h-4 text-stone-500" />
              <span className="font-semibold text-stone-800 dark:text-stone-200">
                Khẩu phần nấu cho:
              </span>
              <div className="flex items-center gap-1 ml-1">
                {[1, 2, 4].map((count) => (
                  <button
                    key={count}
                    onClick={() => setDinersCount(count)}
                    className={`px-2.5 py-1 rounded-lg font-semibold text-xs transition-colors cursor-pointer ${
                      dinersCount === count
                        ? 'bg-emerald-600 text-white'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    {count} người
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={generateShoppingFromPlan}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Gộp nguyên liệu vào Danh sách mua sắm</span>
            </button>
          </div>

          {/* Meal Plan List */}
          <div className="space-y-4">
            {plannedMeals.map((plan) => {
              const item = plan.foodItem;
              return (
                <div
                  key={plan.id}
                  className="p-5 rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-850 shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                          {mealTypeLabels[plan.mealType]}
                        </span>
                        <span className="text-xs text-stone-400">·</span>
                        <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                          {item.name}
                        </h3>
                      </div>

                      {/* Unboxed metadata */}
                      <div className="flex items-center flex-wrap gap-2 text-xs text-stone-500 dark:text-stone-400 mt-1">
                        <span>{item.servingUnit} ({item.servingSizeGrams * dinersCount}g)</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-semibold text-stone-800 dark:text-stone-200">
                          {item.calories * dinersCount} kcal
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>Đạm {item.protein * dinersCount}g</span>
                        <span aria-hidden="true">·</span>
                        <span>Carb {item.carbs * dinersCount}g</span>
                        <span aria-hidden="true">·</span>
                        <span>Béo {item.fat * dinersCount}g</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setSwappingMealId(plan.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs font-semibold hover:bg-stone-100 transition-colors cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Đổi món</span>
                      </button>

                      <button
                        onClick={() => togglePlannedMealLogged(plan.id)}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs ${
                          plan.isLoggedToDiary
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                            : 'bg-emerald-600 text-white hover:bg-emerald-500'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>
                          {plan.isLoggedToDiary ? 'Đã ghi vào nhật ký' : 'Xác nhận đã ăn'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Ingredients & Prep info */}
                  {item.ingredients && item.ingredients.length > 0 && (
                    <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-2xl text-xs space-y-1.5 border border-stone-200/60 dark:border-stone-700/60">
                      <div className="font-semibold text-stone-800 dark:text-stone-200">
                        Nguyên liệu chuẩn bị ({dinersCount} phần):
                      </div>
                      <div className="text-stone-600 dark:text-stone-400 leading-relaxed">
                        {item.ingredients.join(' · ')}
                      </div>
                    </div>
                  )}

                  {item.recipeInstructions && item.recipeInstructions.length > 0 && (
                    <div className="text-xs text-stone-600 dark:text-stone-400 space-y-1">
                      <span className="font-semibold text-stone-800 dark:text-stone-200 block">
                        Cách nấu tham khảo:
                      </span>
                      {item.recipeInstructions.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-1.5">
                          <span className="font-semibold text-emerald-700 dark:text-emerald-400 shrink-0">
                            {idx + 1}.
                          </span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Swap modal popup */}
          {swappingMealId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <div className="bg-[#FAF9F6] dark:bg-stone-900 w-full max-w-md max-h-[80vh] rounded-3xl p-5 border border-stone-200 dark:border-stone-800 flex flex-col">
                <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800 mb-3">
                  <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                    Chọn món Việt thay thế
                  </h3>
                  <button
                    onClick={() => setSwappingMealId(null)}
                    className="text-stone-400 hover:text-stone-600 cursor-pointer text-xs"
                  >
                    Đóng
                  </button>
                </div>
                <div className="overflow-y-auto space-y-2 flex-1">
                  {foods.map((food) => (
                    <button
                      key={food.id}
                      onClick={() => handleSwap(swappingMealId, food)}
                      className="w-full p-3 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800 text-left hover:border-emerald-500 transition-all flex items-center justify-between cursor-pointer"
                    >
                      <div>
                        <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
                          {food.name}
                        </div>
                        <div className="text-[11px] text-stone-500 mt-0.5">
                          {food.calories} kcal · {food.servingUnit}
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-emerald-600">Chọn</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DANH SÁCH MUA SẮM */}
      {activeTab === 'shopping' && (
        <div className="space-y-4">
          {/* Add item form */}
          <form
            onSubmit={handleAddShoppingItem}
            className="p-4 rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-850 flex flex-col sm:flex-row gap-2 shadow-xs"
          >
            <input
              type="text"
              required
              placeholder="Tên thực phẩm / nguyên liệu (rau cải, thịt bò...)"
              value={newShopName}
              onChange={(e) => setNewShopName(e.target.value)}
              className="flex-1 px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <input
              type="text"
              placeholder="Khối lượng (500g, 1 bó...)"
              value={newShopAmount}
              onChange={(e) => setNewShopAmount(e.target.value)}
              className="w-full sm:w-36 px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-500 transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm món</span>
            </button>
          </form>

          {/* Action strip */}
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>
              Tổng cộng {shoppingList.length} món · Đã mua{' '}
              {shoppingList.filter((s) => s.checked).length}
            </span>
            {shoppingList.some((s) => s.checked) && (
              <button
                onClick={clearCompletedShoppingItems}
                className="text-red-600 hover:underline cursor-pointer"
              >
                Xóa các món đã mua xong
              </button>
            )}
          </div>

          {/* Shopping Items List */}
          <div className="space-y-2">
            {shoppingList.length === 0 ? (
              <div className="text-center py-8 text-stone-400 border border-dashed border-stone-200 dark:border-stone-800 rounded-2xl text-xs">
                Danh sách mua sắm đang trống. Bạn có thể nhấn &quot;Gộp nguyên liệu từ kế hoạch&quot; ở tab trên.
              </div>
            ) : (
              shoppingList.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    item.checked
                      ? 'border-stone-200 dark:border-stone-800 bg-stone-100/60 dark:bg-stone-900/60 text-stone-400'
                      : 'border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-850 text-stone-900 dark:text-stone-100'
                  }`}
                >
                  <button
                    onClick={() => toggleShoppingItem(item.id)}
                    className="flex items-center gap-3 flex-1 text-left cursor-pointer"
                  >
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                        item.checked
                          ? 'bg-emerald-600 text-white'
                          : 'border border-stone-300 dark:border-stone-600'
                      }`}
                    >
                      {item.checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>

                    <div>
                      <span
                        className={`text-xs font-semibold ${
                          item.checked ? 'line-through text-stone-400' : ''
                        }`}
                      >
                        {item.name}
                      </span>
                      <div className="text-[10px] text-stone-400">
                        {item.amount} {item.category && `· ${item.category}`}
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => deleteShoppingItem(item.id)}
                    className="p-1 text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
