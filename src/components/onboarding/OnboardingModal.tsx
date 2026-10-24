import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ActivityLevel,
  GoalType,
  UserProfile,
  UserSpecialConditions,
} from '../../types';
import { ACTIVITY_MULTIPLIERS } from '../../utils/nutritionFormulas';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ShieldAlert,
  Info,
  Heart,
  Scale,
  Utensils,
  Clock,
  Sparkles,
  X,
} from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEditing?: boolean;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  isEditing = false,
}) => {
  const { user, updateProfile } = useApp();

  const [step, setStep] = useState<number>(1);
  const totalSteps = 5;

  // Form states initialized from existing user or defaults
  const [name, setName] = useState(user?.name || '');
  const [age, setAge] = useState(user?.age || 28);
  const [gender, setGender] = useState<'male' | 'female' | 'unspecified'>(user?.gender || 'female');
  const [heightCm, setHeightCm] = useState(user?.heightCm || 162);
  const [currentWeightKg, setCurrentWeightKg] = useState(user?.currentWeightKg || 58);
  const [targetWeightKg, setTargetWeightKg] = useState<number | ''>(user?.targetWeightKg ?? 55);

  // Special conditions
  const [specialConditions, setSpecialConditions] = useState<UserSpecialConditions>(
    user?.specialConditions || {
      isUnder18: false,
      isPregnantOrNursing: false,
      hasEatingDisorderHistory: false,
      hasMedicalCondition: false,
      medicalConditionDetails: '',
    }
  );

  // Goals & Lifestyle
  const [primaryGoal, setPrimaryGoal] = useState<GoalType>(user?.primaryGoal || 'manage_weight');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(user?.activityLevel || 'light');
  const [exerciseTime, setExerciseTime] = useState(user?.exerciseTimeMinutesPerDay || 30);
  const [workoutLocations, setWorkoutLocations] = useState<('home' | 'outdoor' | 'gym')[]>(
    user?.workoutLocations || ['home', 'outdoor']
  );
  const [workoutEquipment, setWorkoutEquipment] = useState<string[]>(
    user?.workoutEquipment || ['Thảm tập']
  );

  // Nutrition Preferences
  const [dietaryPreferences, setDietaryPreferences] = useState<string[]>(
    user?.dietaryPreferences || ['Cơm gia đình', 'Ăn đa dạng']
  );
  const [foodsToAvoid, setFoodsToAvoid] = useState<string>(
    user?.foodsToAvoid?.join(', ') || ''
  );
  const [foodAllergies, setFoodAllergies] = useState<string>(
    user?.foodAllergies?.join(', ') || ''
  );
  const [cookingBudget, setCookingBudget] = useState<'low' | 'medium' | 'flexible'>(
    user?.cookingBudget || 'medium'
  );
  const [cookingTime, setCookingTime] = useState(user?.cookingTimeMinutes || 30);

  // Living schedule
  const [wakeTime, setWakeTime] = useState(user?.wakeTime || '06:30');
  const [sleepTime, setSleepTime] = useState(user?.sleepTime || '23:00');
  const [hideCaloriesAndWeight, setHideCaloriesAndWeight] = useState(
    user?.hideCaloriesAndWeight || false
  );

  if (!isOpen) return null;

  // Determine if safety condition triggered
  const hasSpecialCondition =
    specialConditions.isUnder18 ||
    specialConditions.isPregnantOrNursing ||
    specialConditions.hasEatingDisorderHistory ||
    specialConditions.hasMedicalCondition;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    const allergiesList = foodAllergies
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const avoidList = foodsToAvoid
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    // If has special condition, force habit-only mode and do not enforce weight loss / deficit
    const habitOnly = hasSpecialCondition;

    updateProfile({
      name: name.trim() || 'Người dùng',
      age: Number(age),
      gender,
      heightCm: Number(heightCm),
      currentWeightKg: Number(currentWeightKg),
      targetWeightKg: habitOnly || primaryGoal === 'build_habits' ? null : Number(targetWeightKg) || null,
      primaryGoal: habitOnly ? 'build_habits' : primaryGoal,
      activityLevel,
      exerciseTimeMinutesPerDay: Number(exerciseTime),
      workoutLocations,
      workoutEquipment,
      dietaryPreferences,
      foodsToAvoid: avoidList,
      foodAllergies: allergiesList,
      cookingBudget,
      cookingTimeMinutes: Number(cookingTime),
      wakeTime,
      sleepTime,
      specialConditions,
      habitOnlyMode: habitOnly,
      hideCaloriesAndWeight: hideCaloriesAndWeight || habitOnly,
    });

    onClose();
  };

  const toggleLocation = (loc: 'home' | 'outdoor' | 'gym') => {
    setWorkoutLocations((prev) =>
      prev.includes(loc) ? prev.filter((l) => l !== loc) : [...prev, loc]
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    >
      <div className="bg-[#FAF9F6] dark:bg-stone-900 w-full max-w-xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-stone-200 dark:border-stone-800">
        {/* Header & Progress Bar */}
        <div className="px-6 pt-5 pb-4 border-b border-stone-200/80 dark:border-stone-800 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Bước {step} / {totalSteps}
              </span>
              <span className="text-xs text-stone-400">·</span>
              <span className="text-xs text-stone-500 dark:text-stone-400">
                {step === 1 && 'Thông tin cơ bản'}
                {step === 2 && 'Kiểm tra an toàn sức khỏe'}
                {step === 3 && 'Mục tiêu & Vận động'}
                {step === 4 && 'Ăn uống & Dị ứng'}
                {step === 5 && 'Sinh hoạt & Tùy chọn'}
              </span>
            </div>
            <button
              onClick={onClose}
              aria-label="Đóng"
              className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress bar line */}
          <div className="w-full bg-stone-200 dark:bg-stone-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-600 h-full transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Scrollable Step Body */}
        <div className="px-6 py-5 overflow-y-auto flex-1 space-y-5 text-stone-800 dark:text-stone-200">
          {/* STEP 1: Cơ bản */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
                  Chào mừng bạn đến với Khỏe Mỗi Ngày
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                  Một vài thông tin cơ bản giúp chúng mình gợi ý khẩu phần phù hợp nhất với bạn.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-stone-700 dark:text-stone-300">
                  Tên hoặc biệt danh bạn muốn gọi
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Minh Anh"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-stone-700 dark:text-stone-300">
                    Tuổi
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-stone-700 dark:text-stone-300">
                    Chiều cao (cm)
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="220"
                    value={heightCm}
                    onChange={(e) => setHeightCm(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-stone-700 dark:text-stone-300">
                    Cân nặng hiện tại (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="30"
                    max="200"
                    value={currentWeightKg}
                    onChange={(e) => setCurrentWeightKg(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-stone-700 dark:text-stone-300">
                    Cân nặng mục tiêu (kg, tùy chọn)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="30"
                    max="200"
                    placeholder="Không bắt buộc"
                    value={targetWeightKg}
                    onChange={(e) => setTargetWeightKg(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Biological gender clarification */}
              <div className="p-3 bg-stone-100 dark:bg-stone-800/60 rounded-xl space-y-2 border border-stone-200/60 dark:border-stone-700/60">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-stone-600 dark:text-stone-400">
                    Giới tính sinh học được dùng cho công thức ước tính chuyển hóa cơ bản (Mifflin-St Jeor). Bạn hoàn toàn có thể chọn &quot;Bỏ qua/Không nêu&quot; và ứng dụng sẽ sử dụng trung vị sinh lý trung tính.
                  </p>
                </div>
                <div className="flex gap-2">
                  {(['female', 'male', 'unspecified'] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                        gender === g
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      {g === 'female' ? 'Nữ' : g === 'male' ? 'Nam' : 'Không nêu'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: An toàn sức khỏe (Special Conditions Check) */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-emerald-600" />
                  Kiểm tra điều kiện phù hợp
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                  Khỏe Mỗi Ngày đặt sự an toàn và sức khỏe tâm lý của bạn lên hàng đầu. Vui lòng cho biết nếu bạn thuộc các trường hợp sau:
                </p>
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    key: 'isUnder18' as const,
                    title: 'Người dưới 18 tuổi',
                    desc: 'Cơ thể đang trong giai đoạn phát triển tự nhiên, không nên áp dụng chế độ thâm hụt calo.',
                  },
                  {
                    key: 'isPregnantOrNursing' as const,
                    title: 'Đang mang thai hoặc cho con bú',
                    desc: 'Cần năng lượng và vi chất dinh dưỡng tối ưu cho mẹ và bé.',
                  },
                  {
                    key: 'hasEatingDisorderHistory' as const,
                    title: 'Có tiền sử rối loạn ăn uống hoặc lo âu về cân nặng',
                    desc: 'Ứng dụng sẽ tắt hoàn toàn việc đếm calo để tránh gây áp lực ngoại hình.',
                  },
                  {
                    key: 'hasMedicalCondition' as const,
                    title: 'Đang điều trị bệnh lý (tiểu đường, thận, tim mạch...) có chỉ định riêng',
                    desc: 'Chế độ ăn cần tuân thủ hướng dẫn của bác sĩ chuyên khoa.',
                  },
                ].map((item) => (
                  <label
                    key={item.key}
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      specialConditions[item.key]
                        ? 'border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40'
                        : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={specialConditions[item.key]}
                      onChange={(e) =>
                        setSpecialConditions((prev) => ({
                          ...prev,
                          [item.key]: e.target.checked,
                        }))
                      }
                      className="mt-1 w-4 h-4 text-emerald-600 rounded border-stone-300 focus:ring-emerald-500"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                        {item.title}
                      </div>
                      <div className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                        {item.desc}
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              {hasSpecialCondition && (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800/50 space-y-2">
                  <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-semibold text-xs">
                    <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600" />
                    <span>Cam kết bảo vệ sức khỏe của bạn</span>
                  </div>
                  <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                    Vì bạn thuộc trường hợp cần chăm sóc đặc biệt, ứng dụng sẽ <strong>chuyển sang Chế độ Xây dựng Thói quen</strong>. Chúng mình sẽ KHÔNG áp đặt mục tiêu giảm cân, KHÔNG tạo thâm hụt năng lượng và KHÔNG bắt buộc đếm calo. Bạn có thể thoải mái ghi nhận thói quen ăn rau, uống nước, vận động nhẹ và giấc ngủ. Hãy luôn trao đổi với bác sĩ của bạn nhé!
                  </p>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Mục tiêu & Vận động */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
                  Mục tiêu & Thói quen vận động
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                  Lựa chọn cách tiếp cận phù hợp nhất với nhịp sống của bạn lúc này.
                </p>
              </div>

              {/* Primary Goal */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                  Mục tiêu chính
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'manage_weight' as const, label: 'Quản lý cân nặng', sub: 'Giảm nhẹ nhàng, bền vững' },
                    { id: 'maintain' as const, label: 'Duy trì vóc dáng', sub: 'Cân bằng dinh dưỡng' },
                    { id: 'build_habits' as const, label: 'Xây dựng thói quen', sub: 'Ăn lành mạnh, ngủ ngon' },
                  ].map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      disabled={hasSpecialCondition && g.id === 'manage_weight'}
                      onClick={() => setPrimaryGoal(g.id)}
                      className={`p-3 text-left rounded-xl border transition-all cursor-pointer ${
                        primaryGoal === g.id
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-100'
                          : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                      } ${hasSpecialCondition && g.id === 'manage_weight' ? 'opacity-40 cursor-not-allowed' : ''}`}
                    >
                      <div className="text-xs font-semibold">{g.label}</div>
                      <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">{g.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Activity Level */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                  Mức độ vận động hiện tại (có mô tả cụ thể)
                </label>
                <div className="space-y-2">
                  {(Object.keys(ACTIVITY_MULTIPLIERS) as ActivityLevel[]).map((level) => {
                    const info = ACTIVITY_MULTIPLIERS[level];
                    return (
                      <label
                        key={level}
                        className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                          activityLevel === level
                            ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30'
                            : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800'
                        }`}
                      >
                        <input
                          type="radio"
                          name="activityLevel"
                          value={level}
                          checked={activityLevel === level}
                          onChange={() => setActivityLevel(level)}
                          className="mt-1 w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                        />
                        <div>
                          <div className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                            {info.label}
                          </div>
                          <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                            {info.desc}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Workout details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-stone-700 dark:text-stone-300">
                    Thời gian có thể tập (phút/ngày)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="180"
                    value={exerciseTime}
                    onChange={(e) => setExerciseTime(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-stone-700 dark:text-stone-300">
                    Địa điểm tập ưu tiên
                  </label>
                  <div className="flex gap-1.5">
                    {[
                      { id: 'home' as const, label: 'Tại nhà' },
                      { id: 'outdoor' as const, label: 'Ngoài trời' },
                      { id: 'gym' as const, label: 'Phòng gym' },
                    ].map((loc) => (
                      <button
                        key={loc.id}
                        type="button"
                        onClick={() => toggleLocation(loc.id)}
                        className={`flex-1 py-2 text-xs font-medium rounded-xl border transition-all cursor-pointer ${
                          workoutLocations.includes(loc.id)
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                        }`}
                      >
                        {loc.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Ăn uống & Dị ứng */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
                  Sở thích ăn uống & Dị ứng thực phẩm
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                  Giúp gợi ý món ăn Việt Nam hợp khẩu vị gia đình và an toàn.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-stone-700 dark:text-stone-300">
                  Dị ứng thực phẩm (rất quan trọng)
                </label>
                <input
                  type="text"
                  value={foodAllergies}
                  onChange={(e) => setFoodAllergies(e.target.value)}
                  placeholder="Ví dụ: Đậu phộng, hải sản tôm cua, sữa bò..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-[11px] text-stone-500 mt-1 block">
                  Ngăn cách các chất dị ứng bằng dấu phẩy.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-stone-700 dark:text-stone-300">
                  Món ăn hoặc gia vị không thích / cần tránh
                </label>
                <input
                  type="text"
                  value={foodsToAvoid}
                  onChange={(e) => setFoodsToAvoid(e.target.value)}
                  placeholder="Ví dụ: Rau mùi gai, mắm tôm, quá cay, dầu mỡ ngập..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-stone-700 dark:text-stone-300">
                    Ngân sách nấu ăn
                  </label>
                  <select
                    value={cookingBudget}
                    onChange={(e: any) => setCookingBudget(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="low">Tiết kiệm / Bình dân</option>
                    <option value="medium">Vừa phải / Cơm nhà tiêu chuẩn</option>
                    <option value="flexible">Thoải mái</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-stone-700 dark:text-stone-300">
                    Thời gian nấu (phút/bữa)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="120"
                    value={cookingTime}
                    onChange={(e) => setCookingTime(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Sinh hoạt & Tùy chọn */}
          {step === 5 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
                  Giờ sinh hoạt & Trải nghiệm
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                  Khung giờ nghỉ ngơi và tùy chọn cá nhân hóa hiển thị.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-stone-700 dark:text-stone-300">
                    Giờ thức dậy thông thường
                  </label>
                  <input
                    type="time"
                    value={wakeTime}
                    onChange={(e) => setWakeTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-stone-700 dark:text-stone-300">
                    Giờ đi ngủ thông thường
                  </label>
                  <input
                    type="time"
                    value={sleepTime}
                    onChange={(e) => setSleepTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="p-4 bg-stone-100 dark:bg-stone-800/60 rounded-2xl space-y-3 border border-stone-200/60 dark:border-stone-700/60">
                <div className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                  Tùy chọn thoải mái tâm lý
                </div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hideCaloriesAndWeight}
                    onChange={(e) => setHideCaloriesAndWeight(e.target.checked)}
                    className="mt-1 w-4 h-4 text-emerald-600 rounded border-stone-300 focus:ring-emerald-500"
                  />
                  <div className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                    <strong>Ẩn số calo và cân nặng:</strong> Giao diện chỉ tập trung vào việc ăn đúng bữa, uống đủ nước, ngủ ngon và các thói quen vận động tích cực.
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-stone-100/60 dark:bg-stone-800/40 border-t border-stone-200/80 dark:border-stone-800 flex items-center justify-between shrink-0">
          {step > 1 ? (
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại</span>
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 active:scale-[0.98] transition-all cursor-pointer shadow-sm"
          >
            <span>{step === totalSteps ? 'Hoàn tất hồ sơ' : 'Tiếp theo'}</span>
            {step === totalSteps ? <Check className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
