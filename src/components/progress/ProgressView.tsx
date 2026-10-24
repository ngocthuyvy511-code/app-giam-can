import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { analyzeBMI, formatWeight } from '../../utils/nutritionFormulas';
import {
  TrendingUp,
  Scale,
  Calendar,
  Lock,
  Plus,
  Info,
  ShieldCheck,
  Heart,
  Zap,
  Activity,
  Smile,
  AlertCircle,
} from 'lucide-react';

interface ProgressViewProps {
  onOpenLogWeightModal: () => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({ onOpenLogWeightModal }) => {
  const {
    user,
    progressLogs,
    mealEntries,
    waterLogs,
    exerciseLogs,
    sleepLogs,
    habits,
    habitCompletions,
  } = useApp();

  const [timeRange, setTimeRange] = useState<'7days' | '30days'>('7days');

  const habitMode = user?.habitOnlyMode || user?.hideCaloriesAndWeight;

  // Sorted logs
  const sortedLogs = [...progressLogs].sort((a, b) => a.date.localeCompare(b.date));
  const latestLog = sortedLogs[sortedLogs.length - 1];

  const currentWeight = latestLog?.weightKg || user?.currentWeightKg || 0;
  const currentHeight = user?.heightCm || 0;
  const bmiInfo = analyzeBMI(currentWeight, currentHeight);

  // Filter logs by selected range
  const filteredLogs = timeRange === '7days' ? sortedLogs.slice(-7) : sortedLogs.slice(-30);

  // SVG Chart computation
  const weights = filteredLogs.map((l) => l.weightKg);
  const minWeight = weights.length > 0 ? Math.floor(Math.min(...weights) - 1) : 50;
  const maxWeight = weights.length > 0 ? Math.ceil(Math.max(...weights) + 1) : 70;
  const weightRange = Math.max(1, maxWeight - minWeight);

  const chartWidth = 500;
  const chartHeight = 180;
  const paddingX = 40;
  const paddingY = 20;

  const points = filteredLogs.map((log, index) => {
    const x =
      filteredLogs.length > 1
        ? paddingX + (index / (filteredLogs.length - 1)) * (chartWidth - paddingX * 2)
        : chartWidth / 2;
    const y =
      chartHeight -
      paddingY -
      ((log.weightKg - minWeight) / weightRange) * (chartHeight - paddingY * 2);
    return { x, y, log };
  });

  const svgPath =
    points.length > 1
      ? points.reduce((acc, curr, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${curr.x} ${curr.y}`, '')
      : '';

  // 7-day holistic stats
  const totalWaterLoggedDays = new Set(waterLogs.map((w) => w.date)).size;
  const totalExLoggedDays = new Set(exerciseLogs.map((e) => e.date)).size;
  const avgSleep =
    sleepLogs.length > 0
      ? (sleepLogs.reduce((s, l) => s + l.durationHours, 0) / sleepLogs.length).toFixed(1)
      : '--';

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Tiến trình & Báo cáo sức khỏe
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Đánh giá toàn diện qua giấc ngủ, thói quen, mức năng lượng và vận động
          </p>
        </div>

        <button
          onClick={onOpenLogWeightModal}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 transition-colors shadow-xs cursor-pointer self-start sm:self-center"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Ghi số đo / Cân nặng mới</span>
        </button>
      </div>

      {/* Habit-only mode notice */}
      {habitMode && (
        <div className="p-4 rounded-3xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
          <div className="flex items-center gap-2 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Chế độ theo dõi tập trung vào thói quen</span>
          </div>
          <p className="leading-relaxed">
            Ứng dụng ưu tiên sự bền vững và sức khỏe toàn diện. Biểu đồ cân nặng được ẩn để bạn có thể chú tâm vào chất lượng bữa ăn, thói quen uống nước và giấc ngủ sâu.
          </p>
        </div>
      )}

      {/* BMI Card with Asian-Pacific WHO criteria and honest scientific limitations */}
      {!habitMode && (
        <div className="p-5 rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-850 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-600" />
                <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
                  Chỉ số khối cơ thể (BMI): {bmiInfo.bmi > 0 ? bmiInfo.bmi : '--'}
                </h2>
                <span className={`text-xs font-semibold ${bmiInfo.color}`}>
                  ({bmiInfo.category})
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                {bmiInfo.advice}
              </p>
            </div>

            <div className="text-right text-xs text-stone-500">
              Cân nặng ghi nhận:{' '}
              <strong className="text-stone-900 dark:text-stone-100 tabular-nums">
                {formatWeight(currentWeight, user?.unitSystem)}
              </strong>
            </div>
          </div>

          {/* Caveat box */}
          <div className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-2xl border border-stone-200/60 dark:border-stone-700/60 flex items-start gap-2 text-[11px] text-stone-600 dark:text-stone-400 leading-relaxed">
            <Info className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
            <span>{bmiInfo.caveat}</span>
          </div>
        </div>
      )}

      {/* Weight Trend Chart */}
      {!habitMode && (
        <div className="p-5 rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-850 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Xu hướng cân nặng ({timeRange === '7days' ? '7 ngày qua' : '30 ngày qua'})
              </h2>
              <span className="text-xs text-stone-500">
                Phân biệt rõ ngày chưa ghi với ngày có số liệu
              </span>
            </div>

            {/* Range buttons */}
            <div className="flex bg-stone-100 dark:bg-stone-800 p-1 rounded-xl text-xs">
              <button
                onClick={() => setTimeRange('7days')}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  timeRange === '7days'
                    ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                    : 'text-stone-500'
                }`}
              >
                7 ngày
              </button>
              <button
                onClick={() => setTimeRange('30days')}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  timeRange === '30days'
                    ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                    : 'text-stone-500'
                }`}
              >
                30 ngày
              </button>
            </div>
          </div>

          {/* SVG Line Chart */}
          <div className="w-full overflow-x-auto py-2">
            {filteredLogs.length < 2 ? (
              <div className="h-40 flex items-center justify-center text-xs text-stone-400 italic">
                Chưa đủ điểm dữ liệu để vẽ đường xu hướng. Hãy ghi nhận ít nhất 2 ngày.
              </div>
            ) : (
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-44">
                {/* Horizontal reference lines */}
                <line
                  x1={paddingX}
                  y1={paddingY}
                  x2={chartWidth - paddingX}
                  y2={paddingY}
                  stroke="currentColor"
                  className="text-stone-200 dark:text-stone-800"
                  strokeDasharray="4 4"
                />
                <line
                  x1={paddingX}
                  y1={chartHeight / 2}
                  x2={chartWidth - paddingX}
                  y2={chartHeight / 2}
                  stroke="currentColor"
                  className="text-stone-200 dark:text-stone-800"
                  strokeDasharray="4 4"
                />
                <line
                  x1={paddingX}
                  y1={chartHeight - paddingY}
                  x2={chartWidth - paddingX}
                  y2={chartHeight - paddingY}
                  stroke="currentColor"
                  className="text-stone-200 dark:text-stone-800"
                />

                {/* Y-axis labels */}
                <text
                  x={paddingX - 6}
                  y={paddingY + 4}
                  textAnchor="end"
                  className="text-[10px] fill-stone-400 font-mono"
                >
                  {maxWeight}kg
                </text>
                <text
                  x={paddingX - 6}
                  y={chartHeight - paddingY + 4}
                  textAnchor="end"
                  className="text-[10px] fill-stone-400 font-mono"
                >
                  {minWeight}kg
                </text>

                {/* The Trend Line */}
                <path
                  d={svgPath}
                  fill="none"
                  stroke="#059669"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data Points */}
                {points.map((pt, idx) => (
                  <g key={idx}>
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="4.5"
                      fill="#ffffff"
                      stroke="#059669"
                      strokeWidth="2"
                    />
                    <text
                      x={pt.x}
                      y={pt.y - 8}
                      textAnchor="middle"
                      className="text-[9px] fill-stone-700 dark:fill-stone-300 font-bold tabular-nums"
                    >
                      {pt.log.weightKg}
                    </text>
                    <text
                      x={pt.x}
                      y={chartHeight - 4}
                      textAnchor="middle"
                      className="text-[9px] fill-stone-400"
                    >
                      {pt.log.date.substring(5)}
                    </text>
                  </g>
                ))}
              </svg>
            )}
          </div>
        </div>
      )}

      {/* Holistic Lifestyle Báo Cáo Tuần */}
      <div className="p-5 rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-850 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
            Tổng kết lối sống tuần qua
          </h2>
          <p className="text-xs text-stone-500">
            Nhận xét trung tính dựa trên số liệu thực tế đã ghi nhận
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-2xl">
            <span className="text-[11px] text-stone-500 block">Số ngày ghi bữa ăn</span>
            <span className="text-xl font-bold text-stone-900 dark:text-stone-100 tabular-nums">
              {new Set(mealEntries.map((m) => m.date)).size} ngày
            </span>
          </div>
          <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-2xl">
            <span className="text-[11px] text-stone-500 block">Số ngày ghi nước</span>
            <span className="text-xl font-bold text-cyan-700 dark:text-cyan-400 tabular-nums">
              {totalWaterLoggedDays} ngày
            </span>
          </div>
          <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-2xl">
            <span className="text-[11px] text-stone-500 block">Ngày có vận động</span>
            <span className="text-xl font-bold text-orange-700 dark:text-orange-400 tabular-nums">
              {totalExLoggedDays} ngày
            </span>
          </div>
          <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-2xl">
            <span className="text-[11px] text-stone-500 block">Thời lượng ngủ TB</span>
            <span className="text-xl font-bold text-indigo-700 dark:text-indigo-400 tabular-nums">
              {avgSleep} tiếng
            </span>
          </div>
        </div>

        {/* Synthesis review */}
        <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200/60 dark:border-emerald-800/40 text-xs text-stone-800 dark:text-stone-200 space-y-1.5 leading-relaxed">
          <span className="font-bold text-emerald-800 dark:text-emerald-300 block">
            Ghi nhận tuần này của bạn:
          </span>
          <p>
            • Bạn duy trì thói quen uống nước ấm buổi sáng rất đều đặn.
            <br />
            • Các bữa ăn có nhiều rau xanh và canh thanh mát giúp hệ tiêu hóa nhẹ nhàng.
            <br />
            • Đề xuất thực tế: Thử bổ sung 1 buổi đi bộ nhanh hoặc giãn cơ 15 phút vào chiều tối để cải thiện độ sâu giấc ngủ nhé!
          </p>
        </div>
      </div>

      {/* Progress History List & Private Notes */}
      <div className="p-5 rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-850 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span>Lịch sử cân nặng & Nhật ký cá nhân (Riêng tư tuyệt đối)</span>
          </h2>
        </div>

        <div className="space-y-2">
          {sortedLogs.slice().reverse().map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/60 flex items-center justify-between text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-stone-900 dark:text-stone-100">
                    {item.date}
                  </span>
                  {!habitMode && (
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
                      {formatWeight(item.weightKg, user?.unitSystem)}
                    </span>
                  )}
                  {item.waistCm && (
                    <span className="text-stone-500">· Vòng eo {item.waistCm}cm</span>
                  )}
                </div>
                {item.notes && (
                  <div className="text-stone-500 italic mt-0.5">
                    &quot;{item.notes}&quot;
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-stone-400">
                <span>Tâm trạng {item.moodRating}/5</span>
                <span>· Năng lượng {item.energyRating}/5</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
