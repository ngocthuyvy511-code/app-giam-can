import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  User,
  Settings,
  Shield,
  Download,
  Trash2,
  Bell,
  Eye,
  EyeOff,
  Globe,
  Sliders,
  LogOut,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface ProfileViewProps {
  onOpenEditProfile: () => void;
  onOpenAuthModal: () => void;
  onOpenAdmin: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  onOpenEditProfile,
  onOpenAuthModal,
  onOpenAdmin,
}) => {
  const {
    user,
    updateProfile,
    logoutUser,
    loadDemoUser,
    exportAllUserData,
    deleteAllUserData,
  } = useApp();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');

  const toggleNotification = (key: keyof NonNullable<typeof user>['notificationsEnabled']) => {
    if (!user) return;
    updateProfile({
      notificationsEnabled: {
        ...user.notificationsEnabled,
        [key]: !user.notificationsEnabled[key],
      },
    });
  };

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    setFeedbackSent(true);
    setFeedbackText('');
    setTimeout(() => setFeedbackSent(false), 4000);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header Profile Card */}
      <div className="p-5 sm:p-6 rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-850 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white font-bold text-2xl flex items-center justify-center shadow-sm shrink-0">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'K'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100">
                {user?.name || 'Khách trải nghiệm'}
              </h1>
              {user?.isDemoUser && (
                <span className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold">
                  (Dữ liệu mẫu)
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500 mt-0.5">{user?.email}</p>
            {/* Unboxed metadata */}
            <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 mt-1">
              <span>{user?.age} tuổi</span>
              <span aria-hidden="true">·</span>
              <span>{user?.heightCm} cm</span>
              <span aria-hidden="true">·</span>
              <span>{user?.currentWeightKg} kg</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={onOpenEditProfile}
            className="px-4 py-2 rounded-xl bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
          >
            Chỉnh sửa hồ sơ
          </button>
          {user ? (
            <button
              onClick={logoutUser}
              className="p-2 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 cursor-pointer"
            >
              Đăng nhập
            </button>
          )}
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Unit & Display Preferences */}
        <div className="p-5 rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-850 shadow-xs space-y-4">
          <div className="flex items-center gap-2 font-bold text-sm text-stone-900 dark:text-stone-100">
            <Sliders className="w-4 h-4 text-emerald-600" />
            <span>Tùy chọn hiển thị & Đơn vị</span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Unit switch */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60">
              <div>
                <span className="font-semibold block text-stone-900 dark:text-stone-100">
                  Hệ thống đơn vị
                </span>
                <span className="text-stone-500">
                  {user?.unitSystem === 'metric' ? 'Hệ mét (kg, cm, ml)' : 'Hệ Anh-Mỹ (lb, ft/in, oz)'}
                </span>
              </div>
              <div className="flex bg-stone-200 dark:bg-stone-700 p-0.5 rounded-lg">
                <button
                  type="button"
                  onClick={() => updateProfile({ unitSystem: 'metric' })}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                    user?.unitSystem === 'metric'
                      ? 'bg-white dark:bg-stone-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                      : 'text-stone-600 dark:text-stone-400'
                  }`}
                >
                  Metric
                </button>
                <button
                  type="button"
                  onClick={() => updateProfile({ unitSystem: 'imperial' })}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                    user?.unitSystem === 'imperial'
                      ? 'bg-white dark:bg-stone-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                      : 'text-stone-600 dark:text-stone-400'
                  }`}
                >
                  Imperial
                </button>
              </div>
            </div>

            {/* Calorie & Weight Toggle */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60">
              <div className="pr-2">
                <span className="font-semibold block text-stone-900 dark:text-stone-100">
                  Ẩn số calo & cân nặng
                </span>
                <span className="text-stone-500">
                  Chuyển sang chế độ thuần thói quen sống và dinh dưỡng lành mạnh
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  updateProfile({ hideCaloriesAndWeight: !user?.hideCaloriesAndWeight })
                }
                className={`p-2 rounded-xl transition-colors cursor-pointer ${
                  user?.hideCaloriesAndWeight
                    ? 'bg-emerald-600 text-white'
                    : 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300'
                }`}
              >
                {user?.hideCaloriesAndWeight ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Notifications Manager */}
        <div className="p-5 rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-850 shadow-xs space-y-4">
          <div className="flex items-center gap-2 font-bold text-sm text-stone-900 dark:text-stone-100">
            <Bell className="w-4 h-4 text-emerald-600" />
            <span>Quản lý thông báo trong ứng dụng</span>
          </div>

          <div className="space-y-2 text-xs">
            {[
              { key: 'meals' as const, label: 'Nhắc ghi nhận bữa ăn' },
              { key: 'water' as const, label: 'Nhắc uống nước trong ngày' },
              { key: 'exercise' as const, label: 'Nhắc vận động thể chất' },
              { key: 'sleep' as const, label: 'Nhắc nhở giờ ngủ thư giãn' },
              { key: 'weeklySummary' as const, label: 'Báo cáo tổng kết tuần' },
            ].map((n) => (
              <label
                key={n.key}
                className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 cursor-pointer"
              >
                <span className="text-stone-800 dark:text-stone-200 font-medium">
                  {n.label}
                </span>
                <input
                  type="checkbox"
                  checked={user?.notificationsEnabled?.[n.key] ?? true}
                  onChange={() => toggleNotification(n.key)}
                  className="w-4 h-4 text-emerald-600 rounded border-stone-300 focus:ring-emerald-500"
                />
              </label>
            ))}
          </div>
          <div className="text-[11px] text-stone-500">
            Khung giờ yên lặng: {user?.quietHoursStart} đến {user?.quietHoursEnd} (không thông báo).
          </div>
        </div>
      </div>

      {/* Privacy, Third-Party Policies & Data Management */}
      <div className="p-5 rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-850 shadow-xs space-y-4">
        <div className="flex items-center gap-2 font-bold text-sm text-stone-900 dark:text-stone-100">
          <Shield className="w-4 h-4 text-emerald-600" />
          <span>Chính sách quyền riêng tư & Quản lý dữ liệu</span>
        </div>

        <div className="p-4 bg-stone-50 dark:bg-stone-800/60 rounded-2xl text-xs text-stone-600 dark:text-stone-400 space-y-2 leading-relaxed">
          <p>
            • <strong>Dữ liệu cá nhân:</strong> Toàn bộ nhật ký ăn uống, số đo cân nặng và ghi chú sức khỏe được lưu an toàn tại thiết bị của bạn.
          </p>
          <p>
            • <strong>Mật khẩu:</strong> Ứng dụng không tự lưu hoặc xử lý mật khẩu dạng văn bản thuần trong cơ sở dữ liệu.
          </p>
          <p>
            • <strong>Dịch vụ AI bên thứ ba (Gemini API):</strong> Khi bạn sử dụng tính năng quét ảnh món ăn hoặc trò chuyện với trợ lý, dữ liệu hình ảnh/văn bản được gửi qua cổng bảo mật server proxy và không được chia sẻ cho mục đích quảng cáo.
          </p>
        </div>

        {/* Data Export & Delete Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={exportAllUserData}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 text-xs font-semibold hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất toàn bộ dữ liệu cá nhân (JSON)</span>
          </button>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer ml-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Xóa tài khoản & Toàn bộ dữ liệu</span>
          </button>
        </div>
      </div>

      {/* Feedback & Support Section */}
      <div className="p-5 rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-850 shadow-xs space-y-3">
        <div className="flex items-center gap-2 font-bold text-sm text-stone-900 dark:text-stone-100">
          <HelpCircle className="w-4 h-4 text-emerald-600" />
          <span>Gửi phản hồi đóng góp cho Khỏe Mỗi Ngày</span>
        </div>
        <p className="text-xs text-stone-500">
          Ý kiến của bạn giúp chúng mình cải thiện dữ liệu món Việt và trải nghiệm ứng dụng tốt hơn mỗi ngày.
        </p>

        {feedbackSent ? (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Cảm ơn bạn đã gửi đóng góp! Đội ngũ phát triển đã tiếp nhận.</span>
          </div>
        ) : (
          <form onSubmit={handleSendFeedback} className="flex gap-2">
            <input
              type="text"
              required
              placeholder="Chia sẻ đóng góp hoặc báo lỗi..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-500 cursor-pointer"
            >
              Gửi
            </button>
          </form>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[#FAF9F6] dark:bg-stone-900 w-full max-w-sm rounded-3xl p-6 border border-stone-200 dark:border-stone-800 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Xác nhận xóa toàn bộ dữ liệu?
              </h3>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Hành động này sẽ xóa vĩnh viễn hồ sơ, nhật ký ăn uống, cân nặng và các thói quen trên thiết bị này. Không thể khôi phục sau khi xóa.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2 text-xs font-semibold rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 cursor-pointer"
              >
                Giữ lại
              </button>
              <button
                onClick={() => {
                  deleteAllUserData();
                  setShowDeleteConfirm(false);
                }}
                className="flex-1 py-2 text-xs font-semibold rounded-xl bg-red-600 text-white hover:bg-red-500 cursor-pointer"
              >
                Xóa vĩnh viễn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
