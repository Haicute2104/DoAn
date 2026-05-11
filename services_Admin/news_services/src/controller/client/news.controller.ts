import { TryCatch } from "../../helpers/tryCatch";
import { Request, Response, NextFunction } from "express";
import News from "../../model/news.model";

export const index = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
  const news = await News.find({ status: "published" }).sort({ createdAt: -1 }).select("-moderation -reviewHistory -contentImages -content");
  return res.status(200).json({
    message: "Tất cả bài viết đã có",
    news,
  });
})

export const show = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  if(!id) {
    return res.status(400).json({
      message: "ID không hợp lệ",
    });
  }
  const news = await News.findOne({ _id: id }).select("-moderation -reviewHistory -contentImages ");
  if(!news) {
    return res.status(404).json({
      message: "Bài viết không tồn tại",
    });
  }
  return res.status(200).json({
    message: "Bài viết đã có",
    news,
  });
})