import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '15mb' }));

// Initialize Gemini SDK if API key is provided
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    appName: 'Khỏe Mỗi Ngày',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// 1. Food Image / Text Recognition with strict safety disclaimers
app.post('/api/gemini/analyze-food', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', textPrompt, userAllergies = [] } = req.body;

    if (!imageBase64 && !textPrompt) {
      return res.status(400).json({ error: 'Vui lòng cung cấp hình ảnh hoặc mô tả món ăn' });
    }

    if (!ai) {
      // Fallback response when GEMINI_API_KEY is not set
      return res.json({
        dishName: textPrompt || 'Phở bò tái nạm',
        estimatedPortion: '1 tô vừa (khoảng 650g cả nước dùng)',
        estimatedWeightGrams: 650,
        calories: 520,
        proteinG: 28,
        carbsG: 72,
        fatG: 14,
        fiberG: 3,
        ingredients: ['Bánh phở', 'Thịt bò tái', 'Nước dùng hầm xương', 'Hành lá', 'Rau thơm'],
        confidenceNote: 'Dữ liệu ước tính tham khảo từ cơ sở dữ liệu dinh dưỡng món Việt chuẩn. Vui lòng xác nhận và chỉnh sửa trước khi lưu.',
        allergySafetyWarning: 'Lưu ý: Công nghệ nhận diện không thể phát hiện chính xác gia vị ngầm hoặc chất gây dị ứng. Vui lòng tự kiểm tra kỹ.',
        isAiGenerated: false,
      });
    }

    const allergyNote = userAllergies.length > 0 
      ? `Người dùng có dị ứng/cần tránh: ${userAllergies.join(', ')}. Hãy cảnh báo rõ ràng nếu món có nguy cơ chứa thành phần này.` 
      : '';

    const systemInstruction = `
Bạn là chuyên gia dinh dưỡng món ăn Việt Nam cho ứng dụng "Khỏe Mỗi Ngày".
Nhiệm vụ: Phân tích hình ảnh hoặc mô tả món ăn và ước lượng dinh dưỡng theo khẩu phần thông thường của người Việt.
NGUYÊN TẮC BẮT BUỘC:
1. Luôn coi đây là số liệu THAM KHẢO ƯỚC TÍNH, không khẳng định chính xác 100% khối lượng hay thành phần.
2. Không khẳng định món ăn an toàn tuyệt đối với người bị dị ứng. Luôn cảnh báo người dùng cần kiểm tra kỹ.
3. Sử dụng khẩu phần thực tế tại Việt Nam (ví dụ: 1 đĩa cơm tấm, 1 tô phở, 1 ổ bánh mì, 1 đĩa gỏi cuốn 3 cái).
4. Khách quan, trung thực, tích cực.
${allergyNote}
`.trim();

    const parts: any[] = [];
    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType,
          data: imageBase64.replace(/^data:[^;]+;base64,/, ''),
        },
      });
    }

    const promptText = textPrompt
      ? `Hãy nhận diện và phân tích món ăn sau: "${textPrompt}". Ước lượng dinh dưỡng theo khẩu phần chuẩn Việt Nam.`
      : 'Hãy nhận diện món ăn trong ảnh, ước lượng khẩu phần, khối lượng và thành phần dinh dưỡng theo chuẩn món ăn Việt Nam.';

    parts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts },
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            dishName: { type: Type.STRING, description: 'Tên món ăn tiếng Việt chuẩn' },
            estimatedPortion: { type: Type.STRING, description: 'Mô tả khẩu phần (ví dụ: 1 tô vừa, 1 dĩa vừa, 1 ổ)' },
            estimatedWeightGrams: { type: Type.NUMBER, description: 'Khối lượng ước tính theo gam' },
            calories: { type: Type.NUMBER, description: 'Năng lượng ước tính (kcal)' },
            proteinG: { type: Type.NUMBER, description: 'Chất đạm (g)' },
            carbsG: { type: Type.NUMBER, description: 'Carbohydrate (g)' },
            fatG: { type: Type.NUMBER, description: 'Chất béo (g)' },
            fiberG: { type: Type.NUMBER, description: 'Chất xơ (g)' },
            ingredients: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Danh sách nguyên liệu chính nhận diện được',
            },
            confidenceNote: {
              type: Type.STRING,
              description: 'Ghi chú về mức độ ước tính và cơ sở dinh dưỡng',
            },
            allergySafetyWarning: {
              type: Type.STRING,
              description: 'Cảnh báo về chất gây dị ứng và gia vị tiềm ẩn',
            },
          },
          required: [
            'dishName',
            'estimatedPortion',
            'estimatedWeightGrams',
            'calories',
            'proteinG',
            'carbsG',
            'fatG',
            'fiberG',
            'ingredients',
            'confidenceNote',
            'allergySafetyWarning',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      ...parsed,
      isAiGenerated: true,
    });
  } catch (error: any) {
    console.error('Error analyzing food:', error);
    return res.status(500).json({
      error: 'Không thể phân tích ảnh lúc này. Bạn có thể tự nhập thông tin món ăn.',
      details: error.message,
    });
  }
});

// 2. AI Wellness Coach & Culinary Assistant
app.post('/api/gemini/assistant', async (req: Request, res: Response) => {
  try {
    const { messages, userContext } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Thiếu tin nhắn người dùng' });
    }

    if (!ai) {
      return res.json({
        reply: `Chào bạn! Mình là Trợ lý Khỏe Mỗi Ngày. Hiện tại đang ở chế độ ngoại tuyến mô phỏng. 
Mẹo lành mạnh cho bạn hôm nay: Hãy ưu tiên bữa ăn cân bằng với 1/2 rau củ, 1/4 đạm và 1/4 tinh bột phức, uống đủ nước và duy trì giấc ngủ 7-8 tiếng mỗi đêm!`,
      });
    }

    const systemInstruction = `
Bạn là Trợ lý sức khỏe thông minh và thân thiện của ứng dụng "Khỏe Mỗi Ngày".
Bạn giao tiếp hoàn toàn bằng tiếng Việt dịu dàng, tôn trọng, khích lệ và không phán xét.

NGUYÊN TẮC BẢO VỆ NGƯỜI DÙNG:
1. KHÔNG chẩn đoán bệnh tật, KHÔNG kê đơn thuốc hay chỉ định thực phẩm chức năng giảm cân.
2. KHÔNG khuyến khích nhịn ăn cực đoan, bỏ bữa, ăn kiêng khắc nghiệt hay tập luyện để trừng phạt bản thân vì đã ăn nhiều.
3. KHÔNG tự ý thay đổi dữ liệu hay mục tiêu sức khỏe của người dùng mà chưa có xác nhận rõ ràng.
4. KHÔNG bịa đặt dữ liệu nhật ký mà người dùng chưa từng nhập.
5. Luôn nhắc nhở tham khảo ý kiến bác sĩ/chuyên gia dinh dưỡng nếu có dấu hiệu bệnh lý, mang thai, rối loạn ăn uống.
6. Khi gợi ý món ăn, ưu tiên món ăn Việt Nam quen thuộc, nguyên liệu dễ tìm tại chợ/siêu thị Việt.
7. Khi gợi ý danh sách mua sắm hoặc món thay thế, giải thích lý do thực tế và cân bằng dưỡng chất.

BỐI CẢNH NGƯỜI DÙNG HIỆN TẠI (nếu có):
${JSON.stringify(userContext || {}, null, 2)}
`.trim();

    // Map messages for Gemini
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return res.json({
      reply: response.text || 'Rất tiếc, mình chưa thể phản hồi câu hỏi này lúc này. Bạn thử hỏi lại nhé!',
    });
  } catch (error: any) {
    console.error('Error in AI assistant:', error);
    return res.status(500).json({
      error: 'Không thể kết nối trợ lý AI. Vui lòng thử lại sau.',
      details: error.message,
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server Khỏe Mỗi Ngày running on http://0.0.0.0:${port}`);
  });
}

startServer();
