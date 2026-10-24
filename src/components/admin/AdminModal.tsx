import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FoodItem } from '../../types';
import {
  ShieldCheck,
  Database,
  Dumbbell,
  BarChart3,
  MessageSquare,
  FileText,
  Check,
  Plus,
  Trash2,
  X,
  Lock,
  Eye,
} from 'lucide-react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose }) => {
  const { foods, addCustomFood } = useApp();

  const [activeTab, setActiveTab] = useState<'foods' | 'stats' | 'audit'>('foods');

  // New catalog item state
  const [newFoodName, setNewFoodName] = useState('');
  const [newFoodCals, setNewFoodCals] = useState(350);
  const [newFoodSource, setNewFoodSource] = useState('Viện Dinh dưỡng Quốc gia');
  const [newFoodUnit, setNewFoodUnit] = useState('1 đĩa vừa');

  if (!isOpen) return null;

  const handleAddCatalogItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFoodName.trim()) return;

    addCustomFood({
      name: newFoodName.trim(),
      category: 'lunch',
      servingUnit: newFoodUnit.trim(),
      servingSizeGrams: 300,
      calories: Number(newFoodCals),
      protein: 20,
      carbs: 45,
      fat: 10,
      fiber: 3,
    });

    setNewFoodName('');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm"
    >
      <div className="bg-[#FAF9F6] dark:bg-stone-900 w-full max-w-3xl max-h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-stone-200 dark:border-stone-800">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between shrink-0 bg-stone-900 text-white">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-base font-bold">
                Cổng Quản trị Vận hành (Admin Portal)
              </h2>
              <span className="text-[11px] text-stone-400">
                Quản lý cơ sở dữ liệu món Việt · Phân quyền bảo vệ dữ liệu nhạy cảm
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Đóng"
            className="p-1 rounded-lg text-stone-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-stone-200/80 dark:border-stone-800 px-6 bg-stone-100/60 dark:bg-stone-850 shrink-0">
          <button
            onClick={() => setActiveTab('foods')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'foods'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Danh mục món ăn ({foods.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'stats'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Thống kê vận hành</span>
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'audit'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Bảo vệ quyền riêng tư & Audit Log</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'foods' && (
            <div className="space-y-4">
              {/* Add item */}
              <form
                onSubmit={handleAddCatalogItem}
                className="p-4 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 space-y-3"
              >
                <div className="text-xs font-bold text-stone-800 dark:text-stone-200">
                  Thêm món mới vào cơ sở dữ liệu hệ thống
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Tên món ăn Việt"
                    value={newFoodName}
                    onChange={(e) => setNewFoodName(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 text-xs focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Calo chuẩn (kcal)"
                    value={newFoodCals}
                    onChange={(e) => setNewFoodCals(Number(e.target.value))}
                    className="px-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 text-xs focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Khẩu phần (1 tô, 1 đĩa...)"
                    value={newFoodUnit}
                    onChange={(e) => setNewFoodUnit(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 text-xs focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-500 cursor-pointer"
                >
                  Duyệt & Thêm vào hệ thống
                </button>
              </form>

              {/* Table of items */}
              <div className="overflow-x-auto rounded-2xl border border-stone-200 dark:border-stone-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-b border-stone-200 dark:border-stone-700">
                    <tr>
                      <th className="p-3">Tên món</th>
                      <th className="p-3">Khẩu phần</th>
                      <th className="p-3">Năng lượng</th>
                      <th className="p-3">Nguồn dữ liệu</th>
                      <th className="p-3">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                    {foods.map((food) => (
                      <tr key={food.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/40">
                        <td className="p-3 font-semibold text-stone-900 dark:text-stone-100">
                          {food.name}
                        </td>
                        <td className="p-3 text-stone-500">
                          {food.servingUnit} ({food.servingSizeGrams}g)
                        </td>
                        <td className="p-3 font-medium tabular-nums">{food.calories} kcal</td>
                        <td className="p-3 text-stone-500">{food.source}</td>
                        <td className="p-3">
                          <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
                            {food.verified ? 'Đã kiểm duyệt' : 'Người dùng tạo'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                  <span className="text-xs text-stone-500">Tổng số món ăn chuẩn hóa</span>
                  <div className="text-2xl font-bold text-stone-900 dark:text-stone-100 mt-1 tabular-nums">
                    {foods.length}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                  <span className="text-xs text-stone-500">Thời gian phản hồi AI trung bình</span>
                  <div className="text-2xl font-bold text-emerald-600 mt-1 tabular-nums">
                    1.2s
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                  <span className="text-xs text-stone-500">Tỷ lệ hài lòng thói quen</span>
                  <div className="text-2xl font-bold text-indigo-600 mt-1 tabular-nums">
                    98.5%
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-stone-100 dark:bg-stone-800/60 text-xs text-stone-600 dark:text-stone-400 space-y-2">
                <div className="font-semibold text-stone-800 dark:text-stone-200">
                  Nguyên tắc vận hành hệ thống:
                </div>
                <p>
                  1. Không thu thập thông tin định danh y tế nhạy cảm vào nhật ký truy vết.
                  <br />
                  2. Mọi chỉnh sửa dữ liệu dinh dưỡng cốt lõi phải dựa trên Bảng thành phần thực phẩm Việt Nam (Viện Dinh dưỡng).
                  <br />
                  3. Không sử dụng thuật toán tạo áp lực giảm cân cấp tốc.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-800 dark:text-red-200 flex items-start gap-3">
                <Lock className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="block">Chính sách cô lập dữ liệu nhạy cảm:</strong>
                  <p>
                    Quản trị viên <strong>KHÔNG ĐƯỢC PHÉP</strong> truy cập trực tiếp nhật ký sức khỏe cá nhân, hình ảnh riêng tư hoặc số đo của người dùng. Mọi truy cập hệ thống bắt buộc phải có lý do kiểm toán rõ ràng.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 space-y-2">
                <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
                  Nhật ký kiểm toán truy cập hệ thống gần đây (Audit Log)
                </span>
                <div className="space-y-1.5 text-[11px] font-mono text-stone-600 dark:text-stone-400">
                  <div className="p-2 rounded-lg bg-stone-50 dark:bg-stone-900/60">
                    [2026-10-24 08:30:15] Admin #01: Cập nhật cơ sở dữ liệu món phở bò tái (Nguồn Viện Dinh Dưỡng).
                  </div>
                  <div className="p-2 rounded-lg bg-stone-50 dark:bg-stone-900/60">
                    [2026-10-23 15:12:00] System: Kiểm tra toàn vẹn bảng tra cứu dinh dưỡng - OK.
                  </div>
                  <div className="p-2 rounded-lg bg-stone-50 dark:bg-stone-900/60">
                    [2026-10-22 09:45:22] Admin #01: Phê duyệt bài tập Yoga giải tỏa căng thẳng.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
