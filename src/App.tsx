import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Navbar, TabType } from './components/layout/Navbar';
import { HomeView } from './components/home/HomeView';
import { LogView } from './components/log/LogView';
import { PlanView } from './components/plan/PlanView';
import { ProgressView } from './components/progress/ProgressView';
import { ProfileView } from './components/profile/ProfileView';

// Modals
import { OnboardingModal } from './components/onboarding/OnboardingModal';
import { AuthModal } from './components/auth/AuthModal';
import { FoodSearchModal } from './components/food/FoodSearchModal';
import { AiFoodScanModal } from './components/food/AiFoodScanModal';
import { WaterModal } from './components/water/WaterModal';
import { ExerciseModal } from './components/exercise/ExerciseModal';
import { SleepHabitsModal } from './components/sleep/SleepHabitsModal';
import { AiAssistantModal } from './components/assistant/AiAssistantModal';
import { LogWeightModal } from './components/progress/LogWeightModal';
import { AdminModal } from './components/admin/AdminModal';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { ToastUndo } from './components/common/ToastUndo';

function MainAppContent() {
  const { user } = useApp();

  const [currentTab, setCurrentTab] = useState<TabType>('home');

  // Modal controls
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isFoodSearchOpen, setIsFoodSearchOpen] = useState(false);
  const [foodSearchMealType, setFoodSearchMealType] = useState<
    'breakfast' | 'lunch' | 'dinner' | 'snack'
  >('breakfast');
  const [isAiScanOpen, setIsAiScanOpen] = useState(false);
  const [aiScanMealType, setAiScanMealType] = useState<
    'breakfast' | 'lunch' | 'dinner' | 'snack'
  >('lunch');
  const [isWaterOpen, setIsWaterOpen] = useState(false);
  const [isExerciseOpen, setIsExerciseOpen] = useState(false);
  const [isSleepOpen, setIsSleepOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isLogWeightOpen, setIsLogWeightOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const openSearchWithMealType = (mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    setFoodSearchMealType(mealType);
    setIsFoodSearchOpen(true);
  };

  const openAiScanWithMealType = (mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    setAiScanMealType(mealType);
    setIsAiScanOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] dark:bg-[#121614] text-stone-900 dark:text-stone-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Header */}
      <Header
        onOpenAssistant={() => setIsAssistantOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Primary Navigation */}
      <Navbar currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-5">
        {currentTab === 'home' && (
          <HomeView
            onOpenAddMeal={() => openSearchWithMealType('breakfast')}
            onOpenWater={() => setIsWaterOpen(true)}
            onOpenExercise={() => setIsExerciseOpen(true)}
            onOpenSleep={() => setIsSleepOpen(true)}
            onOpenProgressModal={() => setIsLogWeightOpen(true)}
            onNavigateToTab={(tab) => setCurrentTab(tab)}
            onOpenAssistant={() => setIsAssistantOpen(true)}
          />
        )}

        {currentTab === 'log' && (
          <LogView
            onOpenSearchFood={openSearchWithMealType}
            onOpenAiScan={openAiScanWithMealType}
          />
        )}

        {currentTab === 'plan' && <PlanView />}

        {currentTab === 'progress' && (
          <ProgressView onOpenLogWeightModal={() => setIsLogWeightOpen(true)} />
        )}

        {currentTab === 'profile' && (
          <ProfileView
            onOpenEditProfile={() => setIsOnboardingOpen(true)}
            onOpenAuthModal={() => setIsAuthOpen(true)}
            onOpenAdmin={() => setIsAdminOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="hidden md:block py-6 border-t border-stone-200/80 dark:border-stone-800 text-center text-xs text-stone-500 dark:text-stone-400">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-700 dark:text-stone-300">
              Khỏe Mỗi Ngày
            </span>
            <span>· Ứng dụng quản lý cân nặng và thói quen sống tích cực cho người Việt</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsOnboardingOpen(true)}
              className="hover:underline cursor-pointer"
            >
              Cập nhật hồ sơ
            </button>
            <button
              onClick={() => setIsAdminOpen(true)}
              className="hover:underline cursor-pointer"
            >
              Quản trị viên
            </button>
          </div>
        </div>
      </footer>

      {/* Modals & Overlays */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        isEditing={true}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      <FoodSearchModal
        isOpen={isFoodSearchOpen}
        onClose={() => setIsFoodSearchOpen(false)}
        defaultMealType={foodSearchMealType}
        onOpenAiScan={() => openAiScanWithMealType(foodSearchMealType)}
      />

      <AiFoodScanModal
        isOpen={isAiScanOpen}
        onClose={() => setIsAiScanOpen(false)}
        defaultMealType={aiScanMealType}
      />

      <WaterModal
        isOpen={isWaterOpen}
        onClose={() => setIsWaterOpen(false)}
      />

      <ExerciseModal
        isOpen={isExerciseOpen}
        onClose={() => setIsExerciseOpen(false)}
      />

      <SleepHabitsModal
        isOpen={isSleepOpen}
        onClose={() => setIsSleepOpen(false)}
      />

      <AiAssistantModal
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
      />

      <LogWeightModal
        isOpen={isLogWeightOpen}
        onClose={() => setIsLogWeightOpen(false)}
      />

      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />

      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      {/* Toast with Undo */}
      <ToastUndo />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
