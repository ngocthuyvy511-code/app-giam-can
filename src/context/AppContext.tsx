import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  MealEntry,
  WaterLog,
  ExerciseLog,
  SleepLog,
  Habit,
  HabitCompletion,
  ProgressLog,
  FoodItem,
  ShoppingItem,
  PlannedMeal,
  InAppNotification,
  UnitSystem,
} from '../types';
import { INITIAL_VIETNAMESE_FOODS } from '../data/mockVietnameseFoods';
import { calculateBMR, calculateTDEE, calculateTargetCalories, calculateRecommendedWaterMl } from '../utils/nutritionFormulas';

// Initial default user profile (Vietnamese adult demo profile)
const DEFAULT_DEMO_USER: UserProfile = {
  id: 'user-demo-vietnam',
  name: 'Minh Anh',
  email: 'minhanh.demo@khoemoingay.vn',
  age: 29,
  gender: 'female',
  heightCm: 162,
  currentWeightKg: 58.5,
  targetWeightKg: 55.0,
  activityLevel: 'light',
  primaryGoal: 'manage_weight',
  exerciseTimeMinutesPerDay: 30,
  workoutLocations: ['home', 'outdoor'],
  workoutEquipment: ['Thảm tập yoga', 'Giày đi bộ'],
  dietaryPreferences: ['Thích rau xanh', 'Cơm gia đình', 'Ít dầu mỡ'],
  foodsToAvoid: ['Đồ chiên rán ngập dầu'],
  foodAllergies: [],
  cookingBudget: 'medium',
  cookingTimeMinutes: 30,
  wakeTime: '06:30',
  sleepTime: '23:00',
  specialConditions: {
    isUnder18: false,
    isPregnantOrNursing: false,
    hasEatingDisorderHistory: false,
    hasMedicalCondition: false,
  },
  habitOnlyMode: false,
  hideCaloriesAndWeight: false,
  unitSystem: 'metric',
  dailyCalorieTarget: 1550,
  dailyWaterTargetMl: 2100,
  notificationsEnabled: {
    meals: true,
    water: true,
    exercise: true,
    sleep: true,
    progress: true,
    weeklySummary: true,
  },
  quietHoursStart: '22:30',
  quietHoursEnd: '06:30',
  isDemoUser: true,
  createdAt: '2026-10-18T00:00:00.000Z',
  updatedAt: '2026-10-24T00:00:00.000Z',
};

// Initial Habits
const INITIAL_HABITS: Habit[] = [
  {
    id: 'habit-water-morning',
    userId: 'user-demo-vietnam',
    title: 'Uống 1 ly nước ấm ngay khi thức dậy',
    category: 'hydration',
    targetDaysPerWeek: 7,
    color: '#059669',
    createdAt: '2026-10-18',
  },
  {
    id: 'habit-veggie-plate',
    userId: 'user-demo-vietnam',
    title: 'Ăn kèm 1 đĩa rau luộc hoặc canh rau bữa trưa',
    category: 'nutrition',
    targetDaysPerWeek: 6,
    color: '#10b981',
    createdAt: '2026-10-18',
  },
  {
    id: 'habit-walk-lunch',
    userId: 'user-demo-vietnam',
    title: 'Đi bộ thư giãn 15-20 phút buổi chiều',
    category: 'exercise',
    targetDaysPerWeek: 5,
    color: '#ea580c',
    createdAt: '2026-10-18',
  },
  {
    id: 'habit-screen-off',
    userId: 'user-demo-vietnam',
    title: 'Rời màn hình điện thoại 30 phút trước khi ngủ',
    category: 'sleep',
    targetDaysPerWeek: 6,
    color: '#6366f1',
    createdAt: '2026-10-18',
  },
];

const INITIAL_SHOPPING_ITEMS: ShoppingItem[] = [
  { id: 'shop-1', name: 'Rau muống non', category: 'Rau củ', amount: '1 bó', checked: true, addedFromMealPlan: true },
  { id: 'shop-2', name: 'Ức gà tươi hoặc cá nạc', category: 'Đạm tươi', amount: '500g', checked: false, addedFromMealPlan: true },
  { id: 'shop-3', name: 'Chuối tiêu chín', category: 'Trái cây', amount: '1 nải', checked: false, addedFromMealPlan: false },
  { id: 'shop-4', name: 'Cà chua chín & dưa leo', category: 'Rau củ', amount: '4 quả', checked: true, addedFromMealPlan: true },
];

interface AppContextType {
  user: UserProfile | null;
  selectedDate: string; // YYYY-MM-DD
  setSelectedDate: (date: string) => void;
  updateProfile: (updated: Partial<UserProfile>) => void;
  loginUser: (email: string, name?: string) => void;
  registerUser: (email: string, name: string) => void;
  logoutUser: () => void;
  loadDemoUser: () => void;
  
  // Theme & Accessibility
  darkMode: boolean;
  toggleDarkMode: () => void;
  largeFont: boolean;
  toggleLargeFont: () => void;

  // Food & Meals
  foods: FoodItem[];
  addCustomFood: (food: Omit<FoodItem, 'id' | 'source' | 'verified'>) => FoodItem;
  mealEntries: MealEntry[];
  addMealEntry: (entry: Omit<MealEntry, 'id' | 'userId'>) => void;
  updateMealEntry: (id: string, updated: Partial<MealEntry>) => void;
  deleteMealEntry: (id: string) => void;
  copyMealsToDate: (sourceDate: string, targetDate: string) => void;

  // Hydration
  waterLogs: WaterLog[];
  addWaterLog: (amountMl: number) => void;
  deleteWaterLog: (id: string) => void;
  updateDailyWaterTarget: (ml: number) => void;

  // Exercises
  exerciseLogs: ExerciseLog[];
  addExerciseLog: (log: Omit<ExerciseLog, 'id' | 'userId'>) => void;
  deleteExerciseLog: (id: string) => void;

  // Sleep
  sleepLogs: SleepLog[];
  saveSleepLog: (log: Omit<SleepLog, 'id' | 'userId'>) => void;

  // Habits
  habits: Habit[];
  habitCompletions: HabitCompletion[];
  addHabit: (habit: Omit<Habit, 'id' | 'userId' | 'createdAt'>) => void;
  toggleHabitCompletion: (habitId: string, date: string) => void;
  archiveHabit: (habitId: string) => void;

  // Progress
  progressLogs: ProgressLog[];
  addProgressLog: (log: Omit<ProgressLog, 'id' | 'userId'>) => void;

  // Meal Plan & Shopping
  plannedMeals: PlannedMeal[];
  swapPlannedMeal: (planId: string, newFood: FoodItem) => void;
  togglePlannedMealLogged: (planId: string) => void;
  shoppingList: ShoppingItem[];
  addShoppingItem: (name: string, category: string, amount: string) => void;
  toggleShoppingItem: (id: string) => void;
  deleteShoppingItem: (id: string) => void;
  clearCompletedShoppingItems: () => void;
  generateShoppingFromPlan: () => void;

  // Notifications
  notifications: InAppNotification[];
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;

  // Undo and Alerts
  lastAction: { message: string; undoFn: () => void } | null;
  triggerUndo: () => void;
  dismissToast: () => void;

  // Data Privacy & Export
  exportAllUserData: () => void;
  deleteAllUserData: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

function getTodayString(): string {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. User state
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('kmn_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_DEMO_USER;
      }
    }
    return DEFAULT_DEMO_USER; // Default to demo user so app is immediately usable
  });

  // 2. Selected Date
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString);

  // 3. Theme & accessibility
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('kmn_dark_mode') === 'true';
  });

  const [largeFont, setLargeFont] = useState<boolean>(() => {
    return localStorage.getItem('kmn_large_font') === 'true';
  });

  // Apply dark mode class to html document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('kmn_dark_mode', darkMode ? 'true' : 'false');
  }, [darkMode]);

  // Apply large font class
  useEffect(() => {
    if (largeFont) {
      document.documentElement.classList.add('text-lg');
    } else {
      document.documentElement.classList.remove('text-lg');
    }
    localStorage.setItem('kmn_large_font', largeFont ? 'true' : 'false');
  }, [largeFont]);

  // Save user changes to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('kmn_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('kmn_user');
    }
  }, [user]);

  // 4. Foods catalog
  const [foods, setFoods] = useState<FoodItem[]>(() => {
    const saved = localStorage.getItem('kmn_foods');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_VIETNAMESE_FOODS;
  });

  useEffect(() => {
    localStorage.setItem('kmn_foods', JSON.stringify(foods));
  }, [foods]);

  // 5. Meal entries
  const [mealEntries, setMealEntries] = useState<MealEntry[]>(() => {
    const saved = localStorage.getItem('kmn_meal_entries');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    // Initial sample data for today
    const today = getTodayString();
    return [
      {
        id: 'meal-today-1',
        userId: 'user-demo-vietnam',
        date: today,
        mealType: 'breakfast',
        foodName: 'Phở bò tái nạm',
        servings: 1,
        unit: 'tô vừa',
        weightGrams: 650,
        calories: 520,
        protein: 28,
        carbs: 72,
        fat: 14,
        fiber: 3.2,
        time: '07:15',
        sourceNote: 'Viện Dinh dưỡng Quốc gia',
      },
      {
        id: 'meal-today-2',
        userId: 'user-demo-vietnam',
        date: today,
        mealType: 'snack',
        foodName: 'Chuối tiêu chín tự nhiên',
        servings: 1,
        unit: 'quả vừa',
        weightGrams: 110,
        calories: 95,
        protein: 1.2,
        carbs: 24,
        fat: 0.3,
        fiber: 2.8,
        time: '10:00',
        sourceNote: 'USDA Database',
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem('kmn_meal_entries', JSON.stringify(mealEntries));
  }, [mealEntries]);

  // 6. Water logs
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>(() => {
    const saved = localStorage.getItem('kmn_water_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    const today = getTodayString();
    return [
      { id: 'water-1', userId: 'user-demo-vietnam', date: today, timestamp: new Date().toISOString(), amountMl: 300 },
      { id: 'water-2', userId: 'user-demo-vietnam', date: today, timestamp: new Date().toISOString(), amountMl: 250 },
      { id: 'water-3', userId: 'user-demo-vietnam', date: today, timestamp: new Date().toISOString(), amountMl: 500 },
    ];
  });

  useEffect(() => {
    localStorage.setItem('kmn_water_logs', JSON.stringify(waterLogs));
  }, [waterLogs]);

  // 7. Exercise logs
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>(() => {
    const saved = localStorage.getItem('kmn_exercise_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    const today = getTodayString();
    return [
      {
        id: 'ex-today-1',
        userId: 'user-demo-vietnam',
        date: today,
        time: '17:30',
        type: 'walking',
        name: 'Đi bộ nhanh sau giờ làm',
        durationMinutes: 30,
        intensity: 'moderate',
        distanceKm: 2.4,
        caloriesBurnedEstimated: 135,
        notes: 'Thời tiết mát mẻ, tinh thần sảng khoái',
        isDeviceSynced: false,
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem('kmn_exercise_logs', JSON.stringify(exerciseLogs));
  }, [exerciseLogs]);

  // 8. Sleep logs
  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>(() => {
    const saved = localStorage.getItem('kmn_sleep_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    const today = getTodayString();
    return [
      {
        id: 'sleep-1',
        userId: 'user-demo-vietnam',
        date: today,
        sleepTime: '23:15',
        wakeTime: '06:45',
        durationHours: 7.5,
        qualityRating: 4,
        moodRating: 4,
        notes: 'Ngủ sâu, không thức giấc giữa đêm',
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem('kmn_sleep_logs', JSON.stringify(sleepLogs));
  }, [sleepLogs]);

  // 9. Habits & completions
  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem('kmn_habits');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_HABITS;
  });

  useEffect(() => {
    localStorage.setItem('kmn_habits', JSON.stringify(habits));
  }, [habits]);

  const [habitCompletions, setHabitCompletions] = useState<HabitCompletion[]>(() => {
    const saved = localStorage.getItem('kmn_habit_completions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    const today = getTodayString();
    return [
      { id: 'hc-1', habitId: 'habit-water-morning', date: today, completed: true },
      { id: 'hc-2', habitId: 'habit-veggie-plate', date: today, completed: true },
    ];
  });

  useEffect(() => {
    localStorage.setItem('kmn_habit_completions', JSON.stringify(habitCompletions));
  }, [habitCompletions]);

  // 10. Progress logs (weight & waist)
  const [progressLogs, setProgressLogs] = useState<ProgressLog[]>(() => {
    const saved = localStorage.getItem('kmn_progress_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    // 7 days of realistic gentle progress
    const d = new Date();
    const result: ProgressLog[] = [];
    const weights = [59.2, 59.0, 58.8, 58.9, 58.7, 58.6, 58.5];
    for (let i = 6; i >= 0; i--) {
      const past = new Date(d);
      past.setDate(d.getDate() - i);
      const dateStr = past.toISOString().split('T')[0];
      result.push({
        id: `prog-${dateStr}`,
        userId: 'user-demo-vietnam',
        date: dateStr,
        weightKg: weights[6 - i],
        waistCm: 68 - (6 - i) * 0.1,
        moodRating: 4,
        energyRating: 4,
        notes: i === 0 ? 'Cảm thấy người nhẹ nhõm, tiêu hóa tốt hơn' : undefined,
      });
    }
    return result;
  });

  useEffect(() => {
    localStorage.setItem('kmn_progress_logs', JSON.stringify(progressLogs));
  }, [progressLogs]);

  // 11. Planned Meals
  const [plannedMeals, setPlannedMeals] = useState<PlannedMeal[]>(() => {
    const saved = localStorage.getItem('kmn_planned_meals');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    const today = getTodayString();
    const pho = INITIAL_VIETNAMESE_FOODS[0];
    const comGiaDinh = INITIAL_VIETNAMESE_FOODS[7];
    const bunRieu = INITIAL_VIETNAMESE_FOODS[3];
    return [
      { id: 'plan-1', date: today, mealType: 'breakfast', foodItem: pho, servings: 1, isLoggedToDiary: true },
      { id: 'plan-2', date: today, mealType: 'lunch', foodItem: bunRieu, servings: 1, isLoggedToDiary: false },
      { id: 'plan-3', date: today, mealType: 'dinner', foodItem: comGiaDinh, servings: 1, isLoggedToDiary: false },
    ];
  });

  useEffect(() => {
    localStorage.setItem('kmn_planned_meals', JSON.stringify(plannedMeals));
  }, [plannedMeals]);

  // 12. Shopping List
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>(() => {
    const saved = localStorage.getItem('kmn_shopping_list');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_SHOPPING_ITEMS;
  });

  useEffect(() => {
    localStorage.setItem('kmn_shopping_list', JSON.stringify(shoppingList));
  }, [shoppingList]);

  // 13. Notifications
  const [notifications, setNotifications] = useState<InAppNotification[]>([
    {
      id: 'notif-1',
      title: 'Chào mừng bạn đến với Khỏe Mỗi Ngày!',
      message: 'Ứng dụng đã sẵn sàng hỗ trợ bạn theo dõi ăn uống và lối sống nhẹ nhàng, bền vững.',
      category: 'system',
      timestamp: new Date().toISOString(),
      read: false,
    },
    {
      id: 'notif-2',
      title: 'Nhắc nhở uống nước buổi chiều',
      message: 'Bạn đã hoàn thành 50% mục tiêu nước hôm nay. Uống thêm 1 ly nước nhé!',
      category: 'water',
      timestamp: new Date().toISOString(),
      read: false,
    },
  ]);

  // 14. Undo stack
  const [lastAction, setLastAction] = useState<{ message: string; undoFn: () => void } | null>(null);

  const dismissToast = () => setLastAction(null);

  const triggerUndo = () => {
    if (lastAction) {
      lastAction.undoFn();
      setLastAction(null);
    }
  };

  // Helper actions
  const toggleDarkMode = () => setDarkMode((prev) => !prev);
  const toggleLargeFont = () => setLargeFont((prev) => !prev);

  const updateProfile = (updated: Partial<UserProfile>) => {
    setUser((prev) => {
      if (!prev) return null;
      const merged = { ...prev, ...updated, updatedAt: new Date().toISOString() };
      
      // Auto recalculate target calories if needed
      if (merged.currentWeightKg && merged.heightCm && merged.age && !merged.habitOnlyMode) {
        const bmr = calculateBMR(merged.currentWeightKg, merged.heightCm, merged.age, merged.gender);
        const tdee = calculateTDEE(bmr, merged.activityLevel);
        merged.dailyCalorieTarget = calculateTargetCalories(tdee, merged.primaryGoal, merged.gender, merged.habitOnlyMode);
        merged.dailyWaterTargetMl = calculateRecommendedWaterMl(merged.currentWeightKg, merged.activityLevel);
      }

      return merged;
    });
  };

  const loginUser = (email: string, name?: string) => {
    const isDemo = email.includes('demo');
    const newUser: UserProfile = {
      ...DEFAULT_DEMO_USER,
      id: `user-${Date.now()}`,
      email,
      name: name || email.split('@')[0],
      isDemoUser: isDemo,
      createdAt: new Date().toISOString(),
    };
    setUser(newUser);
  };

  const registerUser = (email: string, name: string) => {
    loginUser(email, name);
  };

  const logoutUser = () => {
    setUser(null);
  };

  const loadDemoUser = () => {
    setUser(DEFAULT_DEMO_USER);
  };

  const addCustomFood = (foodData: Omit<FoodItem, 'id' | 'source' | 'verified'>): FoodItem => {
    const newFood: FoodItem = {
      ...foodData,
      id: `custom-food-${Date.now()}`,
      source: 'Người dùng tạo',
      verified: false,
      isCustom: true,
    };
    setFoods((prev) => [newFood, ...prev]);
    return newFood;
  };

  const addMealEntry = (entryData: Omit<MealEntry, 'id' | 'userId'>) => {
    const newEntry: MealEntry = {
      ...entryData,
      id: `meal-${Date.now()}`,
      userId: user?.id || 'guest',
    };
    setMealEntries((prev) => [newEntry, ...prev]);

    setLastAction({
      message: `Đã thêm món "${entryData.foodName}" vào nhật ký`,
      undoFn: () => {
        setMealEntries((prev) => prev.filter((m) => m.id !== newEntry.id));
      },
    });
  };

  const updateMealEntry = (id: string, updated: Partial<MealEntry>) => {
    const old = mealEntries.find((m) => m.id === id);
    if (!old) return;
    setMealEntries((prev) => prev.map((m) => (m.id === id ? { ...m, ...updated } : m)));
    setLastAction({
      message: `Đã cập nhật món "${old.foodName}"`,
      undoFn: () => {
        setMealEntries((prev) => prev.map((m) => (m.id === id ? old : m)));
      },
    });
  };

  const deleteMealEntry = (id: string) => {
    const target = mealEntries.find((m) => m.id === id);
    if (!target) return;
    setMealEntries((prev) => prev.filter((m) => m.id !== id));
    setLastAction({
      message: `Đã xóa món "${target.foodName}"`,
      undoFn: () => {
        setMealEntries((prev) => [target, ...prev]);
      },
    });
  };

  const copyMealsToDate = (sourceDate: string, targetDate: string) => {
    const sourceItems = mealEntries.filter((m) => m.date === sourceDate);
    if (sourceItems.length === 0) return;
    const copies = sourceItems.map((item) => ({
      ...item,
      id: `meal-copy-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      date: targetDate,
    }));
    setMealEntries((prev) => [...copies, ...prev]);
    setLastAction({
      message: `Đã sao chép ${copies.length} bữa ăn sang ngày ${targetDate}`,
      undoFn: () => {
        const copyIds = new Set(copies.map((c) => c.id));
        setMealEntries((prev) => prev.filter((m) => !copyIds.has(m.id)));
      },
    });
  };

  const addWaterLog = (amountMl: number) => {
    const newLog: WaterLog = {
      id: `water-${Date.now()}`,
      userId: user?.id || 'guest',
      date: selectedDate,
      timestamp: new Date().toISOString(),
      amountMl,
    };
    setWaterLogs((prev) => [...prev, newLog]);
    setLastAction({
      message: `Đã ghi nhận +${amountMl}ml nước`,
      undoFn: () => {
        setWaterLogs((prev) => prev.filter((w) => w.id !== newLog.id));
      },
    });
  };

  const deleteWaterLog = (id: string) => {
    const target = waterLogs.find((w) => w.id === id);
    if (!target) return;
    setWaterLogs((prev) => prev.filter((w) => w.id !== id));
    setLastAction({
      message: `Đã xóa ${target.amountMl}ml nước`,
      undoFn: () => {
        setWaterLogs((prev) => [...prev, target]);
      },
    });
  };

  const updateDailyWaterTarget = (ml: number) => {
    updateProfile({ dailyWaterTargetMl: ml });
  };

  const addExerciseLog = (logData: Omit<ExerciseLog, 'id' | 'userId'>) => {
    const newLog: ExerciseLog = {
      ...logData,
      id: `ex-${Date.now()}`,
      userId: user?.id || 'guest',
    };
    setExerciseLogs((prev) => [newLog, ...prev]);
    setLastAction({
      message: `Đã ghi nhận buổi tập "${newLog.name}" (${newLog.durationMinutes} phút)`,
      undoFn: () => {
        setExerciseLogs((prev) => prev.filter((e) => e.id !== newLog.id));
      },
    });
  };

  const deleteExerciseLog = (id: string) => {
    const target = exerciseLogs.find((e) => e.id === id);
    if (!target) return;
    setExerciseLogs((prev) => prev.filter((e) => e.id !== id));
    setLastAction({
      message: `Đã xóa hoạt động "${target.name}"`,
      undoFn: () => {
        setExerciseLogs((prev) => [target, ...prev]);
      },
    });
  };

  const saveSleepLog = (logData: Omit<SleepLog, 'id' | 'userId'>) => {
    const existingIndex = sleepLogs.findIndex((s) => s.date === logData.date);
    if (existingIndex >= 0) {
      const old = sleepLogs[existingIndex];
      const updated = { ...old, ...logData };
      setSleepLogs((prev) => prev.map((s, idx) => (idx === existingIndex ? updated : s)));
    } else {
      const newLog: SleepLog = {
        ...logData,
        id: `sleep-${Date.now()}`,
        userId: user?.id || 'guest',
      };
      setSleepLogs((prev) => [newLog, ...prev]);
    }
  };

  const addHabit = (habitData: Omit<Habit, 'id' | 'userId' | 'createdAt'>) => {
    const newHabit: Habit = {
      ...habitData,
      id: `habit-${Date.now()}`,
      userId: user?.id || 'guest',
      createdAt: new Date().toISOString(),
    };
    setHabits((prev) => [...prev, newHabit]);
  };

  const toggleHabitCompletion = (habitId: string, date: string) => {
    const existing = habitCompletions.find((hc) => hc.habitId === habitId && hc.date === date);
    if (existing) {
      setHabitCompletions((prev) => prev.filter((hc) => hc.id !== existing.id));
    } else {
      const newComp: HabitCompletion = {
        id: `hc-${Date.now()}`,
        habitId,
        date,
        completed: true,
      };
      setHabitCompletions((prev) => [...prev, newComp]);
    }
  };

  const archiveHabit = (habitId: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== habitId));
  };

  const addProgressLog = (logData: Omit<ProgressLog, 'id' | 'userId'>) => {
    const existingIndex = progressLogs.findIndex((p) => p.date === logData.date);
    if (existingIndex >= 0) {
      setProgressLogs((prev) =>
        prev.map((p, idx) => (idx === existingIndex ? { ...p, ...logData } : p))
      );
    } else {
      const newLog: ProgressLog = {
        ...logData,
        id: `prog-${Date.now()}`,
        userId: user?.id || 'guest',
      };
      setProgressLogs((prev) => [newLog, ...prev].sort((a, b) => a.date.localeCompare(b.date)));
    }

    // Also update current weight in user profile
    updateProfile({ currentWeightKg: logData.weightKg });
  };

  const swapPlannedMeal = (planId: string, newFood: FoodItem) => {
    setPlannedMeals((prev) =>
      prev.map((p) => (p.id === planId ? { ...p, foodItem: newFood, isLoggedToDiary: false } : p))
    );
  };

  const togglePlannedMealLogged = (planId: string) => {
    const plan = plannedMeals.find((p) => p.id === planId);
    if (!plan) return;

    if (!plan.isLoggedToDiary) {
      // Add to actual diary with user confirmation
      addMealEntry({
        date: plan.date,
        mealType: plan.mealType,
        foodName: plan.foodItem.name,
        foodId: plan.foodItem.id,
        servings: plan.servings,
        unit: plan.foodItem.servingUnit,
        weightGrams: plan.foodItem.servingSizeGrams * plan.servings,
        calories: Math.round(plan.foodItem.calories * plan.servings),
        protein: Math.round(plan.foodItem.protein * plan.servings),
        carbs: Math.round(plan.foodItem.carbs * plan.servings),
        fat: Math.round(plan.foodItem.fat * plan.servings),
        fiber: plan.foodItem.fiber ? Math.round(plan.foodItem.fiber * plan.servings) : undefined,
        time: '12:00',
        sourceNote: `Ghi từ kế hoạch ăn uống (${plan.foodItem.source})`,
      });
      setPlannedMeals((prev) =>
        prev.map((p) => (p.id === planId ? { ...p, isLoggedToDiary: true } : p))
      );
    } else {
      setPlannedMeals((prev) =>
        prev.map((p) => (p.id === planId ? { ...p, isLoggedToDiary: false } : p))
      );
    }
  };

  const addShoppingItem = (name: string, category: string, amount: string) => {
    const newItem: ShoppingItem = {
      id: `shop-${Date.now()}`,
      name,
      category,
      amount,
      checked: false,
    };
    setShoppingList((prev) => [newItem, ...prev]);
  };

  const toggleShoppingItem = (id: string) => {
    setShoppingList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const deleteShoppingItem = (id: string) => {
    setShoppingList((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCompletedShoppingItems = () => {
    setShoppingList((prev) => prev.filter((item) => !item.checked));
  };

  const generateShoppingFromPlan = () => {
    const newItems: ShoppingItem[] = [];
    plannedMeals.forEach((pm) => {
      pm.foodItem.ingredients?.forEach((ing) => {
        newItems.push({
          id: `shop-gen-${Math.random().toString(36).substring(2, 8)}`,
          name: ing,
          category: 'Theo kế hoạch món ăn',
          amount: '1 phần',
          checked: false,
          addedFromMealPlan: true,
        });
      });
    });
    setShoppingList((prev) => [...newItems, ...prev]);
    setLastAction({
      message: `Đã thêm ${newItems.length} nguyên liệu từ kế hoạch vào danh sách mua sắm`,
      undoFn: () => {
        const ids = new Set(newItems.map((n) => n.id));
        setShoppingList((prev) => prev.filter((item) => !ids.has(item.id)));
      },
    });
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Export full user data as JSON
  const exportAllUserData = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      appName: 'Khỏe Mỗi Ngày',
      userProfile: user,
      mealEntries,
      waterLogs,
      exerciseLogs,
      sleepLogs,
      habits,
      habitCompletions,
      progressLogs,
      shoppingList,
      customFoods: foods.filter((f) => f.isCustom),
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `khoe_moi_ngay_du_lieu_${getTodayString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Delete all account data
  const deleteAllUserData = () => {
    localStorage.clear();
    setUser(null);
    setMealEntries([]);
    setWaterLogs([]);
    setExerciseLogs([]);
    setSleepLogs([]);
    setProgressLogs([]);
    setShoppingList([]);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        selectedDate,
        setSelectedDate,
        updateProfile,
        loginUser,
        registerUser,
        logoutUser,
        loadDemoUser,
        darkMode,
        toggleDarkMode,
        largeFont,
        toggleLargeFont,
        foods,
        addCustomFood,
        mealEntries,
        addMealEntry,
        updateMealEntry,
        deleteMealEntry,
        copyMealsToDate,
        waterLogs,
        addWaterLog,
        deleteWaterLog,
        updateDailyWaterTarget,
        exerciseLogs,
        addExerciseLog,
        deleteExerciseLog,
        sleepLogs,
        saveSleepLog,
        habits,
        habitCompletions,
        addHabit,
        toggleHabitCompletion,
        archiveHabit,
        progressLogs,
        addProgressLog,
        plannedMeals,
        swapPlannedMeal,
        togglePlannedMealLogged,
        shoppingList,
        addShoppingItem,
        toggleShoppingItem,
        deleteShoppingItem,
        clearCompletedShoppingItems,
        generateShoppingFromPlan,
        notifications,
        markNotificationRead,
        clearAllNotifications,
        lastAction,
        triggerUndo,
        dismissToast,
        exportAllUserData,
        deleteAllUserData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
