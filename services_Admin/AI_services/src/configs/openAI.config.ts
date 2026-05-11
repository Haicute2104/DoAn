import OpenAI from "openai";

if (!process.env.GITHUB_TOKEN) {
  console.error("CRITICAL ERROR: Thiếu GITHUB_TOKEN trong file .env");
  process.exit(1);
}

const client = new OpenAI({
  baseURL: "https://models.github.ai/inference",
  apiKey: process.env.GITHUB_TOKEN,
});

const MODEL = "gpt-4o-mini";

export interface ModerationResult {
  safe: boolean;
  /** 0.0 = hoàn toàn an toàn, 1.0 = vi phạm nghiêm trọng */
  score: number;
  reason: string;
  categories: string[];
}

export const checkContent = async (content: string): Promise<ModerationResult> => {
  const prompt = `Phân tích bài viết sau để tìm các vi phạm nguyên tắc cộng đồng (bạo lực, ngôn từ kích động thù địch, nội dung tình dục, thông tin sai lệch, spam, v.v.).

  Hãy trả về DUY NHẤT một JSON hợp lệ với cấu trúc chính xác như sau (LƯU Ý: phần giải thích và danh mục vi phạm phải viết bằng Tiếng Việt):
  {
    "safe": true hoặc false,
    "score": <số thực từ 0.0 đến 1.0>,
    "reason": "<giải thích ngắn gọn bằng Tiếng Việt nếu bài viết vi phạm, để chuỗi rỗng nếu an toàn>",
    "categories": ["<tên danh mục vi phạm bằng Tiếng Việt>", ...]
  }
  
  Hướng dẫn chấm điểm (score):
  - 0.0 → hoàn toàn an toàn
  - 0.1–0.3 → có chút vấn đề nhỏ nhưng vẫn có thể chấp nhận
  - 0.4–0.6 → ranh giới, cần người duyệt lại
  - 0.7–1.0 → vi phạm rõ ràng, không được phép đăng
  
  Bài viết cần kiểm tra:
  ${content}`;

  const response = await client.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "Bạn là một trợ lý kiểm duyệt nội dung nghiêm ngặt. Luôn trả về định dạng JSON hợp lệ, không dùng markdown, không thêm bất kỳ văn bản nào khác ngoài JSON.",
      },
      { role: "user", content: prompt },
    ],
    model: MODEL,
    response_format: { type: "json_object" },
  }).withResponse();

  console.log("📊 TRẠNG THÁI RATE LIMIT:");
  console.log("- Lượt gọi tối đa/phút:", response.response.headers.get("x-ratelimit-limit-requests"));
  console.log("- Lượt gọi CÒN LẠI:", response.response.headers.get("x-ratelimit-remaining-requests"));
  console.log("- Số Token CÒN LẠI:", response.response.headers.get("x-ratelimit-remaining-tokens"));
  console.log("-----------------------");

  const raw = (response.data.choices[0].message.content ?? "{}")
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return {
      safe: Boolean(parsed.safe),
      score: Math.min(1, Math.max(0, Number(parsed.score ?? 0))),
      reason: String(parsed.reason ?? ""),
      categories: Array.isArray(parsed.categories)
        ? (parsed.categories as string[])
        : [],
    };
  } catch {
    return { safe: true, score: 0, reason: "", categories: [] };
  }
};
