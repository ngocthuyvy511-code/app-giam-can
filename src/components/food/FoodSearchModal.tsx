import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FoodItem } from '../../types';
import { removeVietnameseAccents } from '../../utils/nutritionFormulas';
import {
  Search,
  Plus,
  X,
  BookOpen,
  ChefHat,
  Sparkles,
  Info,
  Check,
  Clock,
} from 'lucide-react';

interface FoodSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  onOpenAiScan: () => void;
}

export const FoodSearchModal: React.FC<FoodSearchModalProps> = ({
  isOpen,
  onClose,
  defaultMealType = 'breakfast',
  onOpenAiScan,
}) => {
  const { foods, selectedDate, addMealEntry, addCustomFood } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>(defaultMealType);
  const [activeTab, setActiveTab] = useState<'catalog' | 'custom' | 'recipe'>('catalog');

  // Selected food item for logging
  const [activeItem, setActiveItem] = useState<FoodItem | null>(null);
  const [servings, setServings] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');

  // Form for custom food
  const [customName, setCustomName] = useState('');
  const [customUnit, setCustomUnit] = useState('1 phần');
  const [customGrams, setCustomGrams] = useState(200);
  const [customCalories, setCustomCalories] = useState<number | ''>(250);
  const [customProtein, setCustomProtein] = useState<number | ''>(15);
  const [customCarbs, setCustomCarbs] = useState<number | ''>(30);
  const [customFat, setCustomFat] = useState<number | ''>(8);
  const [customFiber, setCustomFiber] = useState<number | ''>(2);

  // Form for Recipe Builder
  const [recipeName, setRecipeName] = useState('');
  const [recipeServings, setRecipeServings] = useState(2);
  const [recipeIngredients, setRecipeIngredients] = useState<string>('');
  const [recipeInstructions, setRecipeInstructions] = useState<string>('');
  const [recipeTotalCalories, setRecipeTotalCalories] = useState<number | ''>(600);

  if (!isOpen) return null;

  // Filter foods based on accent-insensitive search and category
  const filteredFoods = foods.filter((food) => {
    const matchesSearch =
      removeVietnameseAccents(food.name).includes(removeVietnameseAccents(searchQuery)) ||
      (food.ingredients &&
        food.ingredients.some((ing) =>
          removeVietnameseAccents(ing).includes(removeVietnameseAccents(searchQuery))
        ));

    const matchesCategory =
      selectedCategory === 'all' || food.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleLogItem = (food: FoodItem) => {
    const factor = Number(servings) || 1;
    addMealEntry({
      date: selectedDate,
      mealType,
      foodId: food.id,
      foodName: food.name,
      servings: factor,
      unit: food.servingUnit,
      weightGrams: Math.round(food.servingSizeGrams * factor),
      calories: Math.round(food.calories * factor),
      protein: Math.round(food.protein * factor),
      carbs: Math.round(food.carbs * factor),
      fat: Math.round(food.fat * factor),
      fiber: food.fiber ? Math.round(food.fiber * factor) : undefined,
      notes: notes.trim() || undefined,
      time: new Date().toTimeString().substring(0, 5),
      sourceNote: `${food.source} (${food.servingSizeGrams}g / ${food.servingUnit})`,
    });

    setActiveItem(null);
    onClose();
  };

  const handleSaveCustomFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const created = addCustomFood({
      name: customName.trim(),
      category: 'lunch',
      servingUnit: customUnit.trim() || '1 phần',
      servingSizeGrams: Number(customGrams) || 200,
      calories: customCalories === '' ? 0 : Number(customCalories),
      protein: customProtein === '' ? 0 : Number(customProtein),
      carbs: customCarbs === '' ? 0 : Number(customCarbs),
      fat: customFat === '' ? 0 : Number(customFat),
      fiber: customFiber === '' ? 0 : Number(customFiber),
    });

    // Directly log it as well
    handleLogItem(created);
  };

  const handleSaveRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipeName.trim()) return;

    const totalCals = recipeTotalCalories === '' ? 0 : Number(recipeTotalCalories);
    const servingsCount = Math.max(1, Number(recipeServings) || 1);
    const perServingCalories = Math.round(totalCals / servingsCount);

    const ings = recipeIngredients
      .split('\n')
      .map((i) => i.trim())
      .filter(Boolean);

    const instrs = recipeInstructions
      .split('\n')
      .map((i) => i.trim())
      .filter(Boolean);

    const created = addCustomFood({
      name: recipeName.trim(),
      category: 'dinner',
      servingUnit: `1 phần (công thức ${servingsCount} người)`,
      servingSizeGrams: 300,
      calories: perServingCalories,
      protein: Math.round(perServingCalories * 0.05),
      carbs: Math.round(perServingCalories * 0.12),
      fat: Math.round(perServingCalories * 0.03),
      fiber: 2,
      ingredients: ings,
      recipeInstructions: instrs,
      prepTimeMinutes: 30,
    });

    handleLogItem(created);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm"
    >
      <div className="bg-[#FAF9F6] dark:bg-stone-900 w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-stone-200 dark:border-stone-800">
        {/* Top Header */}
        <div className="px-5 py-4 border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
              Ghi bữa ăn vào nhật ký
            </h2>
            <div className="flex items-center gap-2 text-xs text-stone-500 mt-0.5">
              <span>Bữa:</span>
              <div className="flex gap-1">
                {[
                  { id: 'breakfast' as const, label: 'Sáng' },
                  { id: 'lunch' as const, label: 'Trưa' },
                  { id: 'dinner' as const, label: 'Tối' },
                  { id: 'snack' as const, label: 'Phụ' },
                ].map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setMealType(b.id)}
                    className={`px-2 py-0.5 rounded-md font-medium text-xs transition-colors cursor-pointer ${
                      mealType === b.id
                        ? 'bg-emerald-600 text-white'
                        : 'bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenAiScan();
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 text-xs font-semibold hover:bg-orange-100 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Quét ảnh AI</span>
            </button>
            <button
              onClick={onClose}
              aria-label="Đóng"
              className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab switcher: Tra cứu món / Thêm món mới / Tạo công thức */}
        <div className="flex border-b border-stone-200/80 dark:border-stone-800 px-5 bg-stone-100/50 dark:bg-stone-800/30 shrink-0">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'catalog'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            Tra cứu món Việt
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'custom'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            Thêm món cá nhân
          </button>
          <button
            onClick={() => setActiveTab('recipe')}
            className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'recipe'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            Tạo công thức món nhà
          </button>
        </div>

        {/* Main Content Area */}
        <div className="p-5 overflow-y-auto flex-1">
          {/* TAB 1: CATALOG TRA CỨU */}
          {activeTab === 'catalog' && (
            <div className="space-y-4">
              {/* Search input with accent-insensitive support */}
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Tìm món Việt (gõ phở bò, bún riêu, bánh mì, rau muống...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Category Filters */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
                {[
                  { id: 'all', label: 'Tất cả' },
                  { id: 'breakfast', label: 'Bữa sáng' },
                  { id: 'lunch', label: 'Bữa trưa / tối' },
                  { id: 'snack', label: 'Ăn vặt / Phụ' },
                  { id: 'fruit', label: 'Trái cây' },
                  { id: 'drink', label: 'Đồ uống' },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.id)}
                    className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                      selectedCategory === c.id
                        ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 font-medium'
                        : 'bg-stone-200/60 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-300/60'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              {/* Food List */}
              <div className="space-y-2">
                {filteredFoods.length === 0 ? (
                  <div className="text-center py-8 text-stone-500 dark:text-stone-400">
                    <p className="text-sm">Không tìm thấy món phù hợp với từ khóa.</p>
                    <p className="text-xs mt-1">
                      Bạn có thể chuyển qua tab &quot;Thêm món cá nhân&quot; để tự nhập bất kỳ món nào.
                    </p>
                  </div>
                ) : (
                  filteredFoods.map((food) => (
                    <div
                      key={food.id}
                      className="p-3.5 rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-800/80 hover:border-emerald-500/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-stone-900 dark:text-stone-100">
                            {food.name}
                          </span>
                          {food.verified && (
                            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                              (Đã chuẩn hóa)
                            </span>
                          )}
                        </div>

                        {/* Unboxed Metadata */}
                        <div className="flex items-center flex-wrap gap-2 text-xs text-stone-500 dark:text-stone-400 mt-1">
                          <span className="font-medium text-stone-700 dark:text-stone-300">
                            {food.calories} kcal
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{food.servingUnit} ({food.servingSizeGrams}g)</span>
                          <span aria-hidden="true">·</span>
                          <span>Đạm {food.protein}g</span>
                          <span aria-hidden="true">·</span>
                          <span>Carb {food.carbs}g</span>
                          <span aria-hidden="true">·</span>
                          <span>Béo {food.fat}g</span>
                        </div>

                        <div className="text-[10px] text-stone-400 dark:text-stone-500 mt-0.5">
                          Nguồn: {food.source}
                        </div>
                      </div>

                      <button
                        onClick={() => setActiveItem(food)}
                        className="self-end sm:self-center px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 active:scale-[0.98] transition-all cursor-pointer"
                      >
                        Chọn món
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: THÊM MÓN CÁ NHÂN */}
          {activeTab === 'custom' && (
            <form onSubmit={handleSaveCustomFood} className="space-y-4">
              <div className="p-3 bg-stone-100 dark:bg-stone-800/50 rounded-xl text-xs text-stone-600 dark:text-stone-400">
                Ghi món ăn gia đình hoặc đồ ăn bạn tự nấu. Bạn có thể để trống calo nếu muốn tập trung theo dõi thực phẩm thay vì tính số.
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-stone-700 dark:text-stone-300">
                  Tên món ăn
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Cá điêu hồng chiên xù, chả lá lốt..."
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-stone-700 dark:text-stone-300">
                    Đơn vị khẩu phần
                  </label>
                  <input
                    type="text"
                    value={customUnit}
                    onChange={(e) => setCustomUnit(e.target.value)}
                    placeholder="1 đĩa, 1 chén..."
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-stone-700 dark:text-stone-300">
                    Khối lượng ước tính (gam)
                  </label>
                  <input
                    type="number"
                    value={customGrams}
                    onChange={(e) => setCustomGrams(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-stone-700 dark:text-stone-300">
                    Năng lượng (kcal)
                  </label>
                  <input
                    type="number"
                    placeholder="Tùy chọn"
                    value={customCalories}
                    onChange={(e) => setCustomCalories(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-stone-700 dark:text-stone-300">
                    Đạm (g)
                  </label>
                  <input
                    type="number"
                    placeholder="g"
                    value={customProtein}
                    onChange={(e) => setCustomProtein(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-stone-700 dark:text-stone-300">
                    Carb (g)
                  </label>
                  <input
                    type="number"
                    placeholder="g"
                    value={customCarbs}
                    onChange={(e) => setCustomCarbs(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-stone-700 dark:text-stone-300">
                    Chất béo (g)
                  </label>
                  <input
                    type="number"
                    placeholder="g"
                    value={customFat}
                    onChange={(e) => setCustomFat(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-500 active:scale-[0.98] transition-all cursor-pointer shadow-sm"
              >
                Lưu vào thư viện & Ghi vào nhật ký
              </button>
            </form>
          )}

          {/* TAB 3: TẠO CÔNG THỨC MÓN NHÀ */}
          {activeTab === 'recipe' && (
            <form onSubmit={handleSaveRecipe} className="space-y-4">
              <div className="p-3 bg-stone-100 dark:bg-stone-800/50 rounded-xl text-xs text-stone-600 dark:text-stone-400">
                Tạo công thức nấu ăn cho gia đình. Hệ thống sẽ tự động chia khẩu phần dinh dưỡng theo số người ăn.
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-stone-700 dark:text-stone-300">
                  Tên món ăn / Công thức
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Canh sườn hầm củ dền, thịt gà xào sả ớt..."
                  value={recipeName}
                  onChange={(e) => setRecipeName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-stone-700 dark:text-stone-300">
                    Số khẩu phần (người ăn)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={recipeServings}
                    onChange={(e) => setRecipeServings(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-stone-700 dark:text-stone-300">
                    Tổng calo cả nồi (ước tính)
                  </label>
                  <input
                    type="number"
                    value={recipeTotalCalories}
                    onChange={(e) => setRecipeTotalCalories(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-stone-700 dark:text-stone-300">
                  Danh sách nguyên liệu (mỗi dòng một nguyên liệu)
                </label>
                <textarea
                  rows={3}
                  value={recipeIngredients}
                  onChange={(e) => setRecipeIngredients(e.target.value)}
                  placeholder="Sườn heo 300g&#10;Củ dền 1 củ&#10;Cà rốt 1 củ&#10;Hành hoa, tiêu..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-stone-700 dark:text-stone-300">
                  Cách nấu ngắn gọn (tùy chọn)
                </label>
                <textarea
                  rows={2}
                  value={recipeInstructions}
                  onChange={(e) => setRecipeInstructions(e.target.value)}
                  placeholder="Chần qua sườn, ninh cùng củ dền và nêm gia vị vừa ăn..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-500 active:scale-[0.98] transition-all cursor-pointer shadow-sm"
              >
                Lưu công thức & Ghi vào nhật ký (1 khẩu phần)
              </button>
            </form>
          )}
        </div>

        {/* Modal Sub-Sheet for Serving confirmation */}
        {activeItem && (
          <div className="border-t border-stone-200 dark:border-stone-800 p-4 bg-emerald-50/60 dark:bg-emerald-950/40 shrink-0">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-bold text-sm text-stone-900 dark:text-stone-100">
                  {activeItem.name}
                </div>
                <div className="text-xs text-stone-500">
                  Chuẩn: {activeItem.calories} kcal / {activeItem.servingUnit}
                </div>
              </div>
              <button
                onClick={() => setActiveItem(null)}
                className="text-xs text-stone-500 hover:text-stone-800 cursor-pointer"
              >
                Hủy
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-semibold mb-1 text-stone-700 dark:text-stone-300">
                  Số lượng khẩu phần
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setServings(Math.max(0.5, servings - 0.5))}
                    className="w-8 h-8 rounded-lg bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 font-bold text-sm cursor-pointer"
                  >
                    -
                  </button>
                  <span className="font-semibold text-sm w-12 text-center tabular-nums">
                    {servings}
                  </span>
                  <button
                    type="button"
                    onClick={() => setServings(servings + 0.5)}
                    className="w-8 h-8 rounded-lg bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 font-bold text-sm cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-stone-700 dark:text-stone-300">
                  Ghi chú (tùy chọn)
                </label>
                <input
                  type="text"
                  placeholder="Ít bánh phở, không mỡ hành..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-xs text-stone-700 dark:text-stone-300">
                Tổng cộng:{' '}
                <strong className="text-emerald-700 dark:text-emerald-400 font-bold">
                  {Math.round(activeItem.calories * servings)} kcal
                </strong>{' '}
                · {Math.round(activeItem.servingSizeGrams * servings)}g
              </div>
              <button
                type="button"
                onClick={() => handleLogItem(activeItem)}
                className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-500 active:scale-[0.98] transition-all cursor-pointer shadow-sm"
              >
                Xác nhận ghi món
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
