export type GoalType = 'manage_weight' | 'maintain' | 'build_habits';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

export type UnitSystem = 'metric' | 'imperial';

export interface UserSpecialConditions {
  isUnder18: boolean;
  isPregnantOrNursing: boolean;
  hasEatingDisorderHistory: boolean;
  hasMedicalCondition: boolean;
  medicalConditionDetails?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  age: number;
  gender: 'male' | 'female' | 'unspecified';
  heightCm: number;
  currentWeightKg: number;
  targetWeightKg: number | null;
  activityLevel: ActivityLevel;
  primaryGoal: GoalType;
  exerciseTimeMinutesPerDay: number;
  workoutLocations: ('home' | 'outdoor' | 'gym')[];
  workoutEquipment: string[];
  dietaryPreferences: string[];
  foodsToAvoid: string[];
  foodAllergies: string[];
  cookingBudget: 'low' | 'medium' | 'flexible';
  cookingTimeMinutes: number;
  wakeTime: string; // HH:mm
  sleepTime: string; // HH:mm
  specialConditions: UserSpecialConditions;
  habitOnlyMode: boolean; // Activated for special conditions or user preference
  hideCaloriesAndWeight: boolean;
  unitSystem: UnitSystem;
  dailyCalorieTarget: number | null;
  dailyWaterTargetMl: number;
  notificationsEnabled: {
    meals: boolean;
    water: boolean;
    exercise: boolean;
    sleep: boolean;
    progress: boolean;
    weeklySummary: boolean;
  };
  quietHoursStart: string;
  quietHoursEnd: string;
  isDemoUser: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FoodItem {
  id: string;
  name: string;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'drink' | 'fruit' | 'staple';
  servingUnit: string;
  servingSizeGrams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  ingredients?: string[];
  recipeInstructions?: string[];
  prepTimeMinutes?: number;
  source: 'Viện Dinh dưỡng Quốc gia' | 'USDA Database' | 'Người dùng tạo' | 'Ước tính AI';
  verified: boolean;
  isCustom?: boolean;
}

export interface MealEntry {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foodId?: string;
  foodName: string;
  servings: number;
  unit: string;
  weightGrams?: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  notes?: string;
  photoUrl?: string;
  time: string; // HH:mm
  sourceNote: string;
}

export interface WaterLog {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  timestamp: string; // ISO
  amountMl: number;
}

export type ExerciseCategory = 'walking' | 'running' | 'cycling' | 'swimming' | 'strength' | 'yoga' | 'custom';

export interface ExerciseLog {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  type: ExerciseCategory;
  name: string;
  durationMinutes: number;
  intensity: 'light' | 'moderate' | 'vigorous';
  distanceKm?: number;
  caloriesBurnedEstimated: number;
  notes?: string;
  isDeviceSynced: boolean;
}

export interface WorkoutRoutine {
  id: string;
  title: string;
  category: ExerciseCategory;
  level: 'Cơ bản' | 'Trung bình' | 'Nâng cao';
  durationMin: number;
  equipmentNeeded: string;
  caloriesEstimate: number;
  instructions: string[];
  precautions: string;
  alternativeMoves: string[];
}

export interface SleepLog {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD (date of morning wake up)
  sleepTime: string; // HH:mm (e.g. 23:30)
  wakeTime: string; // HH:mm (e.g. 06:45)
  durationHours: number;
  qualityRating: number; // 1-5
  moodRating: number; // 1-5
  notes?: string;
}

export interface Habit {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category: 'nutrition' | 'exercise' | 'hydration' | 'mindset' | 'sleep';
  targetDaysPerWeek: number;
  color: string;
  createdAt: string;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
}

export interface ProgressLog {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  weightKg: number;
  waistCm?: number;
  moodRating: number; // 1-5
  energyRating: number; // 1-5
  notes?: string;
  photoUrl?: string; // stored as local data URL, private
}

export interface ShoppingItem {
  id: string;
  name: string;
  category: string;
  amount: string;
  checked: boolean;
  addedFromMealPlan?: boolean;
}

export interface PlannedMeal {
  id: string;
  date: string; // YYYY-MM-DD
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foodItem: FoodItem;
  servings: number;
  isLoggedToDiary: boolean;
}

export interface InAppNotification {
  id: string;
  title: string;
  message: string;
  category: 'meal' | 'water' | 'exercise' | 'sleep' | 'system';
  timestamp: string;
  read: boolean;
}
