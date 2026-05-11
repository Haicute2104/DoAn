import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { checkContent } from "../configs/openAI.config";

export const moderateContentTool = tool(
  async ({ content }) => {
    try {
      const result = await checkContent(content);
      return JSON.stringify(result, null, 2);
    } catch (err) {
      return `Lỗi kiểm duyệt: ${(err as Error).message}`;
    }
  },
  {
    name: "moderate_content",
    description:
      "Kiểm duyệt nội dung bài viết. " +
      "Phân tích xem nội dung có vi phạm (bạo lực, thù địch, tình dục, spam...) hay không. " +
      "Trả về kết quả: safe/unsafe, điểm số, lý do, danh mục vi phạm.",
    schema: z.object({
      content: z.string().describe("Nội dung cần kiểm duyệt (title + summary + content)"),
    }),
  },
);

export const moderationTools = [moderateContentTool];
