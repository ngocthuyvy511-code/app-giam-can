import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Camera,
  Upload,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Edit2,
  X,
  Info,
  RefreshCw,
  Plus,
} from 'lucide-react';

interface AiFoodScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

interface AnalyzedResult {
  dishName: string;
  estimatedPortion: string;
  estimatedWeightGrams: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  ingredients: string[];
  confidenceNote: string;
  allergySafetyWarning: string;
  isAiGenerated: boolean;
}

export const AiFoodScanModal: React.FC<AiFoodScanModalProps> = ({
  isOpen,
  onClose,
  defaultMealType = 'lunch',
}) => {
  const { user, selectedDate, addMealEntry } = useApp();

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [textDescription, setTextDescription] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzedResult | null>(null);

  // Editable fields before user confirms
  const [editName, setEditName] = useState('');
  const [editPortion, setEditPortion] = useState('');
  const [editGrams, setEditGrams] = useState<number>(300);
  const [editCalories, setEditCalories] = useState<number>(450);
  const [editProtein, setEditProtein] = useState<number>(20);
  const [editCarbs, setEditCarbs] = useState<number>(60);
  const [editFat, setEditFat] = useState<number>(12);
  const [editFiber, setEditFiber] = useState<number>(3);
  const [editIngredients, setEditIngredients] = useState<string>('');
  const [userConfirmedAllergies, setUserConfirmedAllergies] = useState(false);
  const [mealType, setMealType] = useState(defaultMealType);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn một tệp hình ảnh (JPEG, PNG, WebP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
      setError(null);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!imagePreview && !textDescription.trim()) {
      setError('Vui lòng tải ảnh lên hoặc nhập mô tả món ăn để AI nhận diện');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/gemini/analyze-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imagePreview,
          textPrompt: textDescription.trim() || undefined,
          userAllergies: user?.foodAllergies || [],
        }),
      });

      if (!response.ok) {
        throw new Error('Máy chủ không thể phân tích hình ảnh lúc này.');
      }

      const data: AnalyzedResult = await response.json();
      setResult(data);

      // Pre-fill editable state for user confirmation
      setEditName(data.dishName);
      setEditPortion(data.estimatedPortion);
      setEditGrams(data.estimatedWeightGrams);
      setEditCalories(data.calories);
      setEditProtein(data.proteinG);
      setEditCarbs(data.carbsG);
      setEditFat(data.fatG);
      setEditFiber(data.fiberG);
      setEditIngredients(data.ingredients.join(', '));
    } catch (err: any) {
      console.error(err);
      setError(
        'Không thể phân tích ảnh lúc này. Bạn có thể sử dụng dữ liệu món mẫu hoặc tự nhập thông tin thủ công.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmAndSave = () => {
    if (!editName.trim()) {
      setError('Vui lòng nhập tên món ăn');
      return;
    }

    const ings = editIngredients
      .split(',')
      .map((i) => i.trim())
      .filter(Boolean);

    addMealEntry({
      date: selectedDate,
      mealType,
      foodName: editName.trim(),
      servings: 1,
      unit: editPortion || '1 khẩu phần',
      weightGrams: Number(editGrams),
      calories: Number(editCalories),
      protein: Number(editProtein),
      carbs: Number(editCarbs),
      fat: Number(editFat),
      fiber: Number(editFiber),
      photoUrl: imagePreview || undefined,
      notes: `Ghi qua nhận diện AI: ${ings.slice(0, 3).join(', ')}`,
      time: new Date().toTimeString().substring(0, 5),
      sourceNote: 'Ước tính AI (đã qua người dùng kiểm tra và xác nhận)',
    });

    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm"
    >
      <div className="bg-[#FAF9F6] dark:bg-stone-900 w-full max-w-xl max-h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-stone-200 dark:border-stone-800">
        {/* Top Header */}
        <div className="px-5 py-4 border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Nhận diện món ăn bằng AI
              </h2>
              <span className="text-[11px] text-stone-500 dark:text-stone-400">
                Hỗ trợ món Việt · Ước tính dinh dưỡng tham khảo
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

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* Privacy & Safety Disclaimer Notice */}
          <div className="p-3 bg-stone-100 dark:bg-stone-800/60 rounded-2xl border border-stone-200/60 dark:border-stone-700/60 text-xs text-stone-600 dark:text-stone-400 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-stone-800 dark:text-stone-200">
              <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Chính sách an toàn & Quyền riêng tư:</span>
            </div>
            <p className="leading-relaxed text-[11px]">
              • Hình ảnh được gửi an toàn đến dịch vụ Gemini API để nhận diện và không lưu trữ vĩnh viễn trên máy chủ bên ngoài.
              <br />
              • <strong>Kết quả AI là ước tính:</strong> AI không thể xác định chính xác 100% khối lượng, gia vị nêm nếm hoặc thành phần ngầm.
              <br />
              • <strong>Không dùng để bảo đảm dị ứng:</strong> Nếu bạn có dị ứng thực phẩm nặng, hãy luôn hỏi người nấu hoặc tự kiểm tra kỹ.
            </p>
          </div>

          {/* Upload and Preview Zone */}
          {!result && (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {imagePreview ? (
                <div className="relative rounded-2xl overflow-hidden border border-stone-300 dark:border-stone-700 max-h-56 bg-stone-950 flex items-center justify-center">
                  <img
                    src={imagePreview}
                    alt="Ảnh món ăn"
                    referrerPolicy="no-referrer"
                    className="max-h-56 w-auto object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-stone-300 dark:border-stone-700 rounded-2xl p-6 text-center hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors cursor-pointer bg-white dark:bg-stone-800/40"
                >
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-semibold text-stone-800 dark:text-stone-200">
                    Chụp ảnh hoặc tải ảnh bữa ăn của bạn
                  </div>
                  <div className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                    Hỗ trợ ảnh tô phở, đĩa cơm tấm, bánh mì, bữa cơm gia đình...
                  </div>
                </div>
              )}

              {/* Text description option if camera unavailable */}
              <div>
                <label className="block text-xs font-semibold mb-1 text-stone-700 dark:text-stone-300">
                  Hoặc mô tả món ăn bằng lời
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: 1 tô bún chả Hà Nội có 4 miếng chả nướng và 1 đĩa bún nhỏ..."
                  value={textDescription}
                  onChange={(e) => setTextDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="button"
                disabled={isLoading || (!imagePreview && !textDescription.trim())}
                onClick={handleAnalyze}
                className="w-full py-3 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Đang phân tích hình ảnh...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Phân tích món ăn</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Result Review & Edit Section before saving */}
          {result && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200 font-semibold text-xs mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Kết quả nhận diện AI (Vui lòng kiểm tra & chỉnh sửa nếu cần)</span>
                </div>
                <p className="text-xs text-emerald-900/80 dark:text-emerald-300 leading-relaxed">
                  {result.confidenceNote}
                </p>
                {result.allergySafetyWarning && (
                  <div className="mt-2 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-1.5 font-medium">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>{result.allergySafetyWarning}</span>
                  </div>
                )}
              </div>

              {/* Editable Fields */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-stone-700 dark:text-stone-300">
                      Tên món
                    </label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-stone-700 dark:text-stone-300">
                      Ghi vào bữa
                    </label>
                    <select
                      value={mealType}
                      onChange={(e: any) => setMealType(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="breakfast">Bữa sáng</option>
                      <option value="lunch">Bữa trưa</option>
                      <option value="dinner">Bữa tối</option>
                      <option value="snack">Bữa phụ</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-stone-700 dark:text-stone-300">
                      Khẩu phần ước tính
                    </label>
                    <input
                      type="text"
                      value={editPortion}
                      onChange={(e) => setEditPortion(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-stone-700 dark:text-stone-300">
                      Khối lượng (gam)
                    </label>
                    <input
                      type="number"
                      value={editGrams}
                      onChange={(e) => setEditGrams(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Macro breakdown */}
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-0.5">
                      Calo (kcal)
                    </label>
                    <input
                      type="number"
                      value={editCalories}
                      onChange={(e) => setEditCalories(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs text-center font-bold text-emerald-700 dark:text-emerald-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-0.5">
                      Đạm (g)
                    </label>
                    <input
                      type="number"
                      value={editProtein}
                      onChange={(e) => setEditProtein(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-0.5">
                      Carb (g)
                    </label>
                    <input
                      type="number"
                      value={editCarbs}
                      onChange={(e) => setEditCarbs(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-0.5">
                      Béo (g)
                    </label>
                    <input
                      type="number"
                      value={editFat}
                      onChange={(e) => setEditFat(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs text-center"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-stone-700 dark:text-stone-300">
                    Nguyên liệu chính
                  </label>
                  <input
                    type="text"
                    value={editIngredients}
                    onChange={(e) => setEditIngredients(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs focus:outline-none"
                  />
                </div>

                {/* Explicit Allergy Check Confirmation */}
                <label className="flex items-start gap-2.5 p-3 rounded-xl bg-stone-100 dark:bg-stone-800/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={userConfirmedAllergies}
                    onChange={(e) => setUserConfirmedAllergies(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-emerald-600 rounded border-stone-300 focus:ring-emerald-500"
                  />
                  <span className="text-[11px] text-stone-700 dark:text-stone-300 leading-snug">
                    Tôi đã kiểm tra thông tin và hiểu rằng số liệu từ hình ảnh là ước lượng tham khảo.
                  </span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResult(null)}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs font-medium hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  Quét ảnh khác
                </button>
                <button
                  type="button"
                  disabled={!userConfirmedAllergies}
                  onClick={handleConfirmAndSave}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-500 disabled:opacity-50 transition-all cursor-pointer shadow-sm"
                >
                  Xác nhận & Ghi vào nhật ký
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
