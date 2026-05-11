import { Request, Response } from "express";
import { checkContent } from "../configs/openAI.config";

export const moderation = async (req: Request, res: Response) => {
  try {
    const { title, summary, content } = req.body as { title?: string; summary?: string; content?: string };
    console.log(title, summary, content);

    if (!title && !summary && !content) {
      return res.status(400).json({
        message: "Vui lòng truyền 'title' hoặc 'summary' hoặc 'content' để kiểm tra.",
      });
    }

    const text = `Title: ${title ?? ""}\nSummary: ${summary ?? ""}\nContent: ${content ?? ""}`;
    const result = await checkContent(text);
    console.log("Kết quả AI trả ra", result);

    return res.status(200).json({
      isPass: result.safe,
      score: result.score,
      reason: result.reason,
      categories: result.categories,
      safe: result.safe,
    });
  } catch (error) {
    console.error("Moderation error:", error);
    return res.status(500).json({ message: "AI moderation error" });
  }
};
