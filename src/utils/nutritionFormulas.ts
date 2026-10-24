import { ActivityLevel, GoalType, UnitSystem } from '../types';

/**
 * Tính BMR (Tỷ lệ trao đổi chất cơ bản) theo công thức Mifflin-St Jeor (1990)
 * Nguồn: The American Journal of Clinical Nutrition
 * Giả định: Người trưởng thành không mắc bệnh chuyển hóa cấp tính.
 * Giới hạn: Không tính đến tỷ lệ mỡ cơ thể cụ thể; mang tính chất ước tính sinh lý trung bình.
 */
export function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: 'male' | 'female' | 'unspecified'
): number {
  if (weightKg <= 0 || heightCm <= 0 || age <= 0) return 1600;

  let base = 10 * weightKg + 6.25 * heightCm - 5 * age;

  if (gender === 'male') {
    return Math.round(base + 5);
  } else if (gender === 'female') {
    return Math.round(base - 161);
  } else {
    // Trung vị trung tính nếu người dùng không muốn chia sẻ giới tính sinh học
    return Math.round(base - 78);
  }
}

/**
 * Hệ số mức độ vận động thể chất (Physical Activity Level - PAL)
 * Nguồn: Tổ chức Y tế Thế giới (WHO) & FAO
 */
export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, { factor: number; label: string; desc: string }> = {
  sedentary: {
    factor: 1.2,
    label: 'Ít vận động',
    desc: 'Công việc bàn giấy, hầu như chỉ ngồi, ít đi lại (< 5.000 bước/ngày)',
  },
  light: {
    factor: 1.375,
    label: 'Vận động nhẹ',
    desc: 'Đi bộ nhẹ nhàng, làm việc nhà hoặc tập nhẹ 1–3 ngày/tuần',
  },
  moderate: {
    factor: 1.55,
    label: 'Vận động vừa phải',
    desc: 'Tập thể dục nhịp điệu vừa, đi bộ nhanh 3–5 ngày/tuần (30–60 phút/buổi)',
  },
  active: {
    factor: 1.725,
    label: 'Năng động',
    desc: 'Vận động thể thao cường độ cao hoặc công việc chân tay 6–7 ngày/tuần',
  },
  very_active: {
    factor: 1.9,
    label: 'Rất năng động',
    desc: 'Vận động viên hoặc lao động nặng thể lực hằng ngày',
  },
};

/**
 * Tính Tổng năng lượng tiêu hao hằng ngày (TDEE)
 */
export function calculateTDEE(
  bmr: number,
  activityLevel: ActivityLevel
): number {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel]?.factor || 1.2;
  return Math.round(bmr * multiplier);
}

/**
 * Ước tính ngân sách năng lượng tham khảo an toàn theo mục tiêu
 * Nguyên tắc an toàn: Thâm hụt vừa phải (300 - 400 kcal/ngày ~ 15%),
 * tuyệt đối không thấp hơn sàn an toàn (1.200 kcal với nữ, 1.500 kcal với nam).
 */
export function calculateTargetCalories(
  tdee: number,
  goal: GoalType,
  gender: 'male' | 'female' | 'unspecified',
  habitOnlyMode: boolean
): number | null {
  if (habitOnlyMode || goal === 'build_habits') {
    return null; // Chế độ tập trung vào thói quen, không hiển thị/áp đặt số calo
  }

  const minSafeFloor = gender === 'female' ? 1200 : gender === 'male' ? 1500 : 1350;

  if (goal === 'maintain') {
    return Math.max(tdee, minSafeFloor);
  }

  if (goal === 'manage_weight') {
    // Thâm hụt an toàn bền vững 350 kcal/ngày
    const sustainableDeficit = Math.round(tdee - 350);
    return Math.max(sustainableDeficit, minSafeFloor);
  }

  return Math.round(tdee);
}

/**
 * Tính nhu cầu nước uống tham khảo (ml)
 * Tiêu chuẩn: Khoảng 35ml / kg thể trọng, điều chỉnh theo mức vận động.
 * Khoảng hợp lý: 1.500ml - 3.200ml.
 */
export function calculateRecommendedWaterMl(
  weightKg: number,
  activityLevel: ActivityLevel
): number {
  if (weightKg <= 0) return 2000;
  let base = weightKg * 35;
  if (activityLevel === 'moderate') base += 300;
  if (activityLevel === 'active' || activityLevel === 'very_active') base += 500;
  return Math.min(3200, Math.max(1500, Math.round(base / 100) * 100));
}

/**
 * Phân tích chỉ số khối cơ thể (BMI) theo chuẩn dành cho người châu Á (WHO WPRO)
 */
export interface BMIAnalysis {
  bmi: number;
  category: string;
  categoryCode: 'underweight' | 'normal' | 'overweight' | 'obese';
  color: string;
  advice: string;
  caveat: string;
}

export function analyzeBMI(weightKg: number, heightCm: number): BMIAnalysis {
  if (weightKg <= 0 || heightCm <= 0) {
    return {
      bmi: 0,
      category: 'Chưa đủ dữ liệu',
      categoryCode: 'normal',
      color: 'text-slate-600',
      advice: 'Vui lòng cập nhật chiều cao và cân nặng để xem chỉ số.',
      caveat: 'BMI là chỉ số tham khảo quần thể.',
    };
  }

  const heightM = heightCm / 100;
  const bmi = parseFloat((weightKg / (heightM * heightM)).toFixed(1));

  let category = 'Bình thường';
  let categoryCode: 'underweight' | 'normal' | 'overweight' | 'obese' = 'normal';
  let color = 'text-emerald-700 dark:text-emerald-400';
  let advice = 'Chỉ số ở ngưỡng cân đối theo khuyến nghị dinh dưỡng châu Á. Hãy tiếp tục duy trì các thói quen lành mạnh!';

  if (bmi < 18.5) {
    category = 'Thiếu cân';
    categoryCode = 'underweight';
    color = 'text-amber-700 dark:text-amber-400';
    advice = 'Khuyên bạn nên chú trọng bữa ăn đủ chất đạm, chất béo lành mạnh và không áp dụng bất kỳ hình thức thâm hụt calo nào.';
  } else if (bmi >= 23.0 && bmi < 25.0) {
    category = 'Tiền béo phì / Ngưỡng lưu ý';
    categoryCode = 'overweight';
    color = 'text-orange-700 dark:text-orange-400';
    advice = 'Mức cân nặng hơi cao hơn ngưỡng chuẩn quần thể một chút. Điều chỉnh nhẹ khẩu phần và tăng bước chân mỗi ngày sẽ rất hữu ích.';
  } else if (bmi >= 25.0) {
    category = 'Thừa cân / Béo phì';
    categoryCode = 'obese';
    color = 'text-red-700 dark:text-red-400';
    advice = 'Ưu tiên cải thiện chất lượng thực phẩm, ăn nhiều rau xanh và vận động đều đặn để chăm sóc sức khỏe tim mạch và khớp gối.';
  }

  const caveat =
    'Lưu ý quan trọng: BMI chỉ dựa trên chiều cao và cân nặng nên KHÔNG phân biệt được khối lượng cơ bắp, mật độ xương và lượng mỡ. Người có nhiều cơ (tập gym) có thể có BMI cao nhưng cơ thể rất khỏe mạnh.';

  return { bmi, category, categoryCode, color, advice, caveat };
}

/**
 * Ước tính năng lượng tiêu hao khi tập luyện (dựa trên METs - Compendium of Physical Activities)
 */
export const EXERCISE_METS: Record<string, { met: number; label: string }> = {
  walking: { met: 3.5, label: 'Đi bộ (khoảng 5km/h)' },
  running: { met: 8.0, label: 'Chạy bộ vừa (khoảng 8-9km/h)' },
  cycling: { met: 6.0, label: 'Đạp xe ngoài trời hoặc máy' },
  swimming: { met: 6.0, label: 'Bơi lội tự do' },
  strength: { met: 4.5, label: 'Tập sức mạnh / Kháng lực / Gym' },
  yoga: { met: 2.8, label: 'Yoga / Giãn cơ / Pilates' },
  custom: { met: 4.0, label: 'Hoạt động thể chất khác' },
};

export function estimateExerciseCalories(
  type: string,
  durationMinutes: number,
  weightKg: number,
  intensity: 'light' | 'moderate' | 'vigorous' = 'moderate'
): number {
  if (durationMinutes <= 0 || weightKg <= 0) return 0;
  const baseMet = EXERCISE_METS[type]?.met || 4.0;
  let intensityModifier = 1.0;
  if (intensity === 'light') intensityModifier = 0.8;
  if (intensity === 'vigorous') intensityModifier = 1.25;

  const hours = durationMinutes / 60;
  const calories = baseMet * intensityModifier * weightKg * hours;
  return Math.round(calories);
}

/**
 * Đơn vị chuyển đổi
 */
export function formatWeight(kg: number | null | undefined, unit: UnitSystem = 'metric'): string {
  if (kg === null || kg === undefined || isNaN(kg)) return '--';
  if (unit === 'imperial') {
    const lbs = (kg * 2.20462).toFixed(1);
    return `${lbs} lb`;
  }
  return `${kg.toFixed(1)} kg`;
}

export function formatHeight(cm: number | null | undefined, unit: UnitSystem = 'metric'): string {
  if (cm === null || cm === undefined || isNaN(cm)) return '--';
  if (unit === 'imperial') {
    const totalInches = cm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return `${feet}ft ${inches}in`;
  }
  return `${Math.round(cm)} cm`;
}

export function formatWater(ml: number, unit: UnitSystem = 'metric'): string {
  if (unit === 'imperial') {
    const flOz = (ml * 0.033814).toFixed(0);
    return `${flOz} fl oz`;
  }
  return `${ml} ml`;
}

/**
 * Tìm kiếm không phân biệt dấu tiếng Việt
 */
export function removeVietnameseAccents(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}
