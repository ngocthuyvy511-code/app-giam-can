import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  Send,
  Refrigerator,
  RefreshCw,
  ShoppingBag,
  HeartHandshake,
  AlertTriangle,
  X,
  Check,
  Bot,
  User,
} from 'lucide-react';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenShopping?: () => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  actionProposal?: {
    type: 'add_shopping' | 'swap_dish' | 'create_habit';
    payload: any;
    label: string;
  };
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  onOpenShopping,
}) => {
  const { user, selectedDate, mealEntries, waterLogs, exerciseLogs, addShoppingItem, addHabit } = useApp();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      content: `Chào bạn! Mình là Trợ lý Khỏe Mỗi Ngày. 
Mình có thể giúp bạn:
1. Gợi ý món Việt ngon từ nguyên liệu còn trong tủ lạnh của bạn.
2. Đề xuất món thay thế thanh đạm, ít dầu mỡ hơn.
3. Giải thích các báo cáo dinh dưỡng bằng lời đơn giản.
4. Lập danh sách mua sắm cho tuần này.

Hôm nay bạn cần hỗ trợ gì nhé?`,
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  // Build context for AI
  const todayMeals = mealEntries.filter((m) => m.date === selectedDate);
  const todayWater = waterLogs.filter((w) => w.date === selectedDate).reduce((s, i) => s + i.amountMl, 0);
  const todayEx = exerciseLogs.filter((e) => e.date === selectedDate);

  const userContext = {
    userName: user?.name,
    primaryGoal: user?.primaryGoal,
    dietaryPreferences: user?.dietaryPreferences,
    foodAllergies: user?.foodAllergies,
    foodsToAvoid: user?.foodsToAvoid,
    habitOnlyMode: user?.habitOnlyMode,
    todayRecorded: {
      mealsCount: todayMeals.length,
      meals: todayMeals.map((m) => `${m.mealType}: ${m.foodName} (${m.calories} kcal)`),
      waterMl: todayWater,
      exercises: todayEx.map((e) => `${e.name} (${e.durationMinutes}p)`),
    },
  };

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text.trim(),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({ role: m.role, content: m.content })),
          userContext,
        }),
      });

      const data = await response.json();
      const reply = data.reply || 'Mình đã nhận được câu hỏi của bạn!';

      // Detect if user asked for shopping list to propose safe action button
      let actionProposal = undefined;
      if (text.toLowerCase().includes('mua sắm') || text.toLowerCase().includes('nguyên liệu')) {
        actionProposal = {
          type: 'add_shopping' as const,
          payload: ['Rau xanh theo mùa', 'Cá nạc hoặc đậu phụ', 'Gia vị gừng tỏi'],
          label: 'Thêm gợi ý này vào Danh sách mua sắm',
        };
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `msg-ai-${Date.now()}`,
          role: 'assistant',
          content: reply,
          actionProposal,
        },
      ]);
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          role: 'assistant',
          content: 'Không thể kết nối với dịch vụ trợ lý lúc này. Bạn thử lại câu hỏi sau một lát nhé!',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteProposal = (proposal: any) => {
    if (proposal.type === 'add_shopping') {
      proposal.payload.forEach((item: string) => {
        addShoppingItem(item, 'Gợi ý từ trợ lý AI', '1 phần');
      });
      alert('Đã thêm nguyên liệu vào Danh sách mua sắm!');
    }
  };

  const quickPrompts = [
    'Tủ lạnh còn trứng và cà chua, nấu món gì nhanh?',
    'Đề xuất món thay thế cơm tấm ít dầu mỡ hơn',
    'Giải thích giúp mình lượng đạm và calo hôm nay',
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm"
    >
      <div className="bg-[#FAF9F6] dark:bg-stone-900 w-full max-w-xl h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-stone-200 dark:border-stone-800">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Trợ lý Khỏe Mỗi Ngày
              </h2>
              <span className="text-[11px] text-stone-500">
                Tư vấn ăn uống món Việt · Không chẩn đoán bệnh tật
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

        {/* Guardrail Disclaimer Banner */}
        <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200/60 dark:border-amber-800/40 px-4 py-2 text-[11px] text-amber-800 dark:text-amber-200 flex items-start gap-1.5 shrink-0">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
          <span>
            Trợ lý cung cấp gợi ý lối sống mang tính tham khảo. Không chẩn đoán bệnh, kê đơn thuốc hoặc khuyến khích nhịn ăn cực đoan.
          </span>
        </div>

        {/* Chat message stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed whitespace-pre-wrap ${
                    isUser
                      ? 'bg-emerald-600 text-white rounded-br-xs'
                      : 'bg-white dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700 text-stone-800 dark:text-stone-200 rounded-bl-xs shadow-xs'
                  }`}
                >
                  {msg.content}

                  {/* Proposal Confirmation Button */}
                  {msg.actionProposal && (
                    <div className="mt-3 pt-2.5 border-t border-stone-200 dark:border-stone-700">
                      <button
                        onClick={() => handleExecuteProposal(msg.actionProposal)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-500 transition-colors cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{msg.actionProposal.label}</span>
                      </button>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-lg bg-stone-300 dark:bg-stone-700 text-stone-700 dark:text-stone-200 flex items-center justify-center shrink-0 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-2.5 items-center text-xs text-stone-400">
              <div className="w-7 h-7 rounded-lg bg-emerald-600/50 text-white flex items-center justify-center animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <span className="italic">Trợ lý đang suy nghĩ câu trả lời...</span>
            </div>
          )}
        </div>

        {/* Quick questions chips */}
        <div className="p-2.5 border-t border-stone-200/80 dark:border-stone-800 bg-stone-50 dark:bg-stone-850 flex gap-1.5 overflow-x-auto text-[11px] shrink-0">
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="px-3 py-1 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 whitespace-nowrap hover:border-emerald-500 transition-colors cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              placeholder="Hỏi về món ăn, thay thế món, tủ lạnh, thói quen..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-500 disabled:opacity-40 transition-all cursor-pointer shadow-sm flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
