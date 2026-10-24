import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ExerciseCategory, WorkoutRoutine } from '../../types';
import { INITIAL_WORKOUT_ROUTINES } from '../../data/mockWorkouts';
import { estimateExerciseCalories, EXERCISE_METS } from '../../utils/nutritionFormulas';
import {
  Activity,
  Play,
  Pause,
  RotateCcw,
  Square,
  AlertTriangle,
  Info,
  Clock,
  Flame,
  Plus,
  X,
  Dumbbell,
  Compass,
} from 'lucide-react';

interface ExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExerciseModal: React.FC<ExerciseModalProps> = ({ isOpen, onClose }) => {
  const { user, selectedDate, addExerciseLog } = useApp();

  const [activeTab, setActiveTab] = useState<'log' | 'timer' | 'routines'>('log');

  // Manual Log Form State
  const [exerciseType, setExerciseType] = useState<ExerciseCategory>('walking');
  const [exerciseName, setExerciseName] = useState('Đi bộ nhanh ngoài trời');
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [intensity, setIntensity] = useState<'light' | 'moderate' | 'vigorous'>('moderate');
  const [distanceKm, setDistanceKm] = useState<number | ''>('');
  const [notes, setNotes] = useState('');

  // Live Timer State
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerType, setTimerType] = useState<ExerciseCategory>('strength');
  const [timerWorkoutName, setTimerWorkoutName] = useState('Tập luyện tại nhà');

  // Selected routine for detailed viewing
  const [selectedRoutine, setSelectedRoutine] = useState<WorkoutRoutine | null>(null);

  // Timer interval effect
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  if (!isOpen) return null;

  const currentWeight = user?.currentWeightKg || 60;
  const estimatedCalories = estimateExerciseCalories(
    exerciseType,
    Number(durationMinutes) || 0,
    currentWeight,
    intensity
  );

  const formatTimerDisplay = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSaveManualLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exerciseName.trim() || durationMinutes <= 0) return;

    addExerciseLog({
      date: selectedDate,
      time: new Date().toTimeString().substring(0, 5),
      type: exerciseType,
      name: exerciseName.trim(),
      durationMinutes: Number(durationMinutes),
      intensity,
      distanceKm: distanceKm === '' ? undefined : Number(distanceKm),
      caloriesBurnedEstimated: estimatedCalories,
      notes: notes.trim() || undefined,
      isDeviceSynced: false,
    });

    onClose();
  };

  const handleFinishTimer = () => {
    setIsTimerRunning(false);
    const finalMinutes = Math.max(1, Math.round(timerSeconds / 60));
    const cals = estimateExerciseCalories(timerType, finalMinutes, currentWeight, 'moderate');

    addExerciseLog({
      date: selectedDate,
      time: new Date().toTimeString().substring(0, 5),
      type: timerType,
      name: timerWorkoutName,
      durationMinutes: finalMinutes,
      intensity: 'moderate',
      caloriesBurnedEstimated: cals,
      notes: `Hoàn thành qua đồng hồ bấm giờ (${formatTimerDisplay(timerSeconds)})`,
      isDeviceSynced: false,
    });

    setTimerSeconds(0);
    onClose();
  };

  const handleStartRoutine = (routine: WorkoutRoutine) => {
    setTimerType(routine.category);
    setTimerWorkoutName(routine.title);
    setTimerSeconds(0);
    setIsTimerRunning(true);
    setActiveTab('timer');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm"
    >
      <div className="bg-[#FAF9F6] dark:bg-stone-900 w-full max-w-xl max-h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-stone-200 dark:border-stone-800">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Vận động & Bài tập
              </h2>
              <span className="text-[11px] text-stone-500">
                Tập luyện lành mạnh · Không tính trùng ngân sách ăn uống
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

        {/* Tab Switcher */}
        <div className="flex border-b border-stone-200/80 dark:border-stone-800 px-5 bg-stone-100/50 dark:bg-stone-800/30 shrink-0">
          <button
            onClick={() => setActiveTab('log')}
            className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'log'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            Ghi vận động
          </button>
          <button
            onClick={() => setActiveTab('timer')}
            className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'timer'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            Bộ đếm thời gian
          </button>
          <button
            onClick={() => setActiveTab('routines')}
            className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'routines'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            Thư viện bài tập an toàn
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: GHI THỦ CÔNG */}
          {activeTab === 'log' && (
            <form onSubmit={handleSaveManualLog} className="space-y-4">
              <div className="p-3 bg-stone-100 dark:bg-stone-800/50 rounded-xl text-xs text-stone-600 dark:text-stone-400 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-stone-800 dark:text-stone-200">
                  <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Nguyên tắc khoa học:</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Ứng dụng <strong>không tự động cộng toàn bộ calo tập luyện vào ngân sách ăn uống</strong> để tránh tình trạng ăn bù quá mức và tính trùng vận động thông thường trong ngày.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-stone-700 dark:text-stone-300">
                  Loại hoạt động
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'walking' as const, label: 'Đi bộ' },
                    { id: 'running' as const, label: 'Chạy bộ' },
                    { id: 'cycling' as const, label: 'Đạp xe' },
                    { id: 'swimming' as const, label: 'Bơi lội' },
                    { id: 'strength' as const, label: 'Sức mạnh' },
                    { id: 'yoga' as const, label: 'Yoga' },
                    { id: 'custom' as const, label: 'Khác' },
                  ].map((act) => (
                    <button
                      key={act.id}
                      type="button"
                      onClick={() => {
                        setExerciseType(act.id);
                        setExerciseName(EXERCISE_METS[act.id]?.label || act.label);
                      }}
                      className={`p-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        exerciseType === act.id
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200'
                          : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      {act.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-stone-700 dark:text-stone-300">
                  Tên cụ thể của hoạt động
                </label>
                <input
                  type="text"
                  required
                  value={exerciseName}
                  onChange={(e) => setExerciseName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-stone-700 dark:text-stone-300">
                    Thời lượng (phút)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="300"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-stone-700 dark:text-stone-300">
                    Cường độ cảm nhận
                  </label>
                  <select
                    value={intensity}
                    onChange={(e: any) => setIntensity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="light">Nhẹ nhàng (vừa đi vừa nói chuyện dễ)</option>
                    <option value="moderate">Vừa phải (thở hơi dốc, vẫn trò chuyện được)</option>
                    <option value="vigorous">Nhiệt tình (thở mạnh, nhịp tim cao)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-stone-700 dark:text-stone-300">
                    Quãng đường (km, tùy chọn)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="km"
                    value={distanceKm}
                    onChange={(e) => setDistanceKm(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-orange-50/70 dark:bg-orange-950/30 rounded-xl border border-orange-200/60 dark:border-orange-800/40 flex items-center justify-between text-xs text-orange-900 dark:text-orange-200">
                <span className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-orange-600" />
                  <span>Ước tính tiêu hao (tham khảo METs):</span>
                </span>
                <span className="font-bold text-sm tabular-nums text-orange-700 dark:text-orange-300">
                  ~{estimatedCalories} kcal
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-stone-700 dark:text-stone-300">
                  Ghi chú cảm xúc sau buổi tập
                </label>
                <input
                  type="text"
                  placeholder="Cảm giác sảng khoái, không đau mỏi..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-500 active:scale-[0.98] transition-all cursor-pointer shadow-sm"
              >
                Lưu vào nhật ký hôm nay
              </button>
            </form>
          )}

          {/* TAB 2: LIVE TIMER */}
          {activeTab === 'timer' && (
            <div className="space-y-5 text-center py-4">
              <div>
                <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                  {timerWorkoutName}
                </h3>
                <span className="text-xs text-stone-500">
                  Đồng hồ bấm giờ chính xác · Tự động tính thời lượng
                </span>
              </div>

              {/* Big Timer Display */}
              <div className="w-48 h-48 rounded-full border-4 border-emerald-600/30 bg-emerald-50/50 dark:bg-emerald-950/30 flex items-center justify-center mx-auto shadow-inner">
                <span className="text-4xl font-extrabold tabular-nums tracking-wider text-emerald-800 dark:text-emerald-200">
                  {formatTimerDisplay(timerSeconds)}
                </span>
              </div>

              {/* Timer Control Buttons */}
              <div className="flex items-center justify-center gap-3">
                {!isTimerRunning ? (
                  <button
                    type="button"
                    onClick={() => setIsTimerRunning(true)}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-500 active:scale-95 transition-all shadow-sm cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>{timerSeconds === 0 ? 'Bắt đầu tập' : 'Tiếp tục'}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsTimerRunning(false)}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-amber-600 text-white font-semibold text-sm hover:bg-amber-500 active:scale-95 transition-all shadow-sm cursor-pointer"
                  >
                    <Pause className="w-4 h-4 fill-white" />
                    <span>Tạm dừng</span>
                  </button>
                )}

                {timerSeconds > 0 && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setIsTimerRunning(false);
                        setTimerSeconds(0);
                      }}
                      className="p-2.5 rounded-2xl border border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-100 cursor-pointer"
                      title="Đặt lại từ đầu"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={handleFinishTimer}
                      className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 font-semibold text-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-sm"
                    >
                      <Square className="w-4 h-4 fill-current" />
                      <span>Kết thúc & Lưu</span>
                    </button>
                  </>
                )}
              </div>

              {/* Stop advice */}
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded-2xl text-left flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <p className="text-xs text-red-800 dark:text-red-300 leading-relaxed">
                  <strong>Chú ý an toàn:</strong> Dừng tập ngay lập tức nếu bạn cảm thấy tức ngực, hoa mắt, chóng mặt hoặc đau nhói ở bất kỳ khớp xương nào.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: THƯ VIỆN BÀI TẬP */}
          {activeTab === 'routines' && (
            <div className="space-y-3">
              {INITIAL_WORKOUT_ROUTINES.map((routine) => (
                <div
                  key={routine.id}
                  className="p-4 rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-800/80 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                        {routine.title}
                      </h4>
                      {/* Zero-pill unboxed metadata */}
                      <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                        <span>Cấp độ: {routine.level}</span>
                        <span aria-hidden="true">·</span>
                        <span>{routine.durationMin} phút</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-orange-600 dark:text-orange-400 font-medium">
                          ~{routine.caloriesEstimate} kcal
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleStartRoutine(routine)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 active:scale-95 transition-all flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <Play className="w-3 h-3 fill-white" />
                      <span>Bắt đầu tập</span>
                    </button>
                  </div>

                  <div className="text-xs text-stone-600 dark:text-stone-300">
                    <span className="font-semibold text-stone-700 dark:text-stone-200">
                      Dụng cụ:
                    </span>{' '}
                    {routine.equipmentNeeded}
                  </div>

                  <div className="space-y-1 bg-stone-50 dark:bg-stone-850 p-2.5 rounded-xl text-xs text-stone-600 dark:text-stone-300">
                    <span className="font-semibold text-stone-800 dark:text-stone-200 block mb-1">
                      Các bước động tác:
                    </span>
                    {routine.instructions.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-1.5">
                        <span className="font-bold text-emerald-700 dark:text-emerald-400 shrink-0">
                          {idx + 1}.
                        </span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>

                  {/* Safety note */}
                  <div className="text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-1 font-medium">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>{routine.precautions}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
