import { TryCatch } from "../../helpers/tryCatch";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { Response, NextFunction } from "express";
import News, { INews, IContentImage } from "../../model/news.model";
import axios from "axios";
import * as cheerio from "cheerio";


function htmlToText(html: string) {
  const $ = cheerio.load(html || "");
  return $("body").text().replace(/\s+/g, " ").trim();
}


export interface ModerationResult {
  safe: boolean;
  /** 0.0 = hoàn toàn an toàn, 1.0 = vi phạm nghiêm trọng */
  score: number;
  reason: string;
  categories: string[];
}

export const index = TryCatch(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const news = await News.find({});
  return res.status(200).json({
    message: "Tất cả bài viết đã có",
    news,
  });
});

export const create = TryCatch(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const userId = req.userId;
  
  // 1. Check User
  let user;
  try {
    user = await axios.get(`${process.env.USER_SERVICE_URL}/${userId}`);
  } catch (error: any) {
    return res.status(502).json({ message: "Không thể kết nối đến User Service" });
  }

  if(!user || !user.data?.user){
    return res.status(404).json({ message: "User không tồn tại" });
  }

  const { title, summary, content, thumbnail, contentImages } = req.body;
  const contentText = htmlToText(content); // Chỉ dùng text để check AI

  // 2. Lưu nháp vào DB TRƯỚC để tránh mất dữ liệu nếu AI Service tèo
  let news = await News.create({
    title,
    summary,
    content, // LƯU Ý QUAN TRỌNG: Lưu content HTML gốc vào DB, không lưu contentText
    thumbnail,
    contentImages: contentImages ?? [],
    author: user.data.user.fullName,
    status: "pending_review",
  });
  
  // 3. Gọi AI Moderation
  try {
    const result = await axios.post<ModerationResult>(
      `${process.env.AI_SERVICE_URL}/moderation`,
      { title, summary, content: contentText }
    );
    
    // 4. Cập nhật lại trạng thái dựa trên AI
    if (result.data.safe === false) {
      news = (await News.findByIdAndUpdate(
        news._id,
        { status: "rejected", moderation: result.data },
        { new: true }
      ))!;
    
      return res.status(400).json({
        message: "Bài viết vi phạm tiêu chuẩn cộng đồng và đã bị từ chối.",
        news,
      });
    }
    
    news = (await News.findByIdAndUpdate(
      news._id,
      { status: "published", moderation: result.data, publishedAt: new Date() },
      { new: true }
    ))!;
    
    return res.status(200).json({
      message: "Bài viết an toàn và đã được đăng thành công",
      news,
    });

  } catch (aiError) {
    // Nếu AI chết, bài viết vẫn được lưu dưới dạng pending để duyệt tay
    return res.status(201).json({
      message: "Đã lưu bài viết. Hệ thống kiểm duyệt đang bận, bài viết sẽ được duyệt sau.",
      news,
    });
  }
});

export const show = TryCatch(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const news = await News.findById(req.params.id);
  if(!news){
    return res.status(404).json({
      message: "Bài viết không tồn tại",
    });
  }
  return res.status(200).json({
    message: "Bài viết đã có",
    news,
  });
});

export const update = TryCatch(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { title, summary, content, thumbnail, contentImages } = req.body;
  
  // 1. Kiểm tra bài viết tồn tại không
  const existingNews = await News.findById(req.params.id);
  if (!existingNews) {
    return res.status(404).json({ message: "Bài viết không tồn tại" });
  }

  const contentText = htmlToText(content || existingNews.content);

  let moderationData = existingNews.moderation;
  let newStatus = existingNews.status; // Giữ nguyên status cũ làm mặc định

  // 2. Gọi AI để check nội dung mới (Chỉ update DB KHI VÀ CHỈ KHI biết kết quả AI)
  try {
    const result = await axios.post<ModerationResult>(
      `${process.env.AI_SERVICE_URL}/moderation`,
      {
        title: title || existingNews.title,
        summary: summary || existingNews.summary,
        content: contentText,
      }
    );

    moderationData = result.data;
    if (result.data.safe === false) {
      newStatus = "rejected";
    } else {
      // Nếu bài trước đó bị rejected, sửa lại an toàn thì cho publish lại
      newStatus = "published"; 
    }
  } catch (aiError) {
     // AI lỗi -> Chuyển về pending để đợi admin duyệt
     newStatus = "pending_review";
  }

  // 3. Cập nhật DB với dữ liệu và trạng thái đã được AI quyết định
  const updatedNews = (await News.findByIdAndUpdate(
    req.params.id, 
    { 
      title, summary, content, thumbnail, contentImages,
      status: newStatus,
      moderation: moderationData,
      ...(newStatus === "published" && existingNews.status !== "published" ? { publishedAt: new Date() } : {})
    }, 
    { new: true }
  ))!;

  // 4. Xóa ảnh cũ bị thay thế / xóa khỏi Cloudinary (fire-and-forget)
  const idsToDelete: string[] = [];

  // Thumbnail bị thay thế hoặc bị xóa
  if (existingNews.thumbnail?.public_id) {
    const newThumbId = thumbnail?.public_id ?? null;
    if (newThumbId !== existingNews.thumbnail.public_id) {
      idsToDelete.push(existingNews.thumbnail.public_id);
    }
  }

  // contentImages bị xóa khỏi nội dung
  if (contentImages) {
    const newIds = new Set(
      (contentImages as IContentImage[]).map((img) => img.public_id)
    );
    existingNews.contentImages.forEach((img) => {
      if (img.public_id && !newIds.has(img.public_id)) {
        idsToDelete.push(img.public_id);
      }
    });
  }

  if (idsToDelete.length > 0) {
    axios
      .post(`${process.env.SHARE_SERVICE_URL}/delete-images`, { public_ids: idsToDelete })
      .catch((e) => console.error("Lỗi xóa ảnh Cloudinary:", e));
  }

  if (newStatus === "rejected") {
    return res.status(400).json({
      message: "Nội dung cập nhật vi phạm tiêu chuẩn và đã bị gỡ/từ chối.",
      news: updatedNews,
    });
  }

  return res.status(200).json({
    message: "Bài viết đã được cập nhật thành công",
    news: updatedNews,
  });
});

export const destroy = TryCatch(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const id = req.params.id;

  // 1. Tìm bài viết trước — 404 nếu không tồn tại
  const news = await News.findById(id);
  if (!news) {
    return res.status(404).json({ message: "Bài viết không tồn tại" });
  }

  // 2. Thu thập tất cả public_ids cần xóa (thumbnail + contentImages)
  const publicIds: string[] = [];
  if (news.thumbnail?.public_id) publicIds.push(news.thumbnail.public_id);
  news.contentImages.forEach((img) => {
    if (img.public_id) publicIds.push(img.public_id);
  });

  // 3. Xóa ảnh trên Cloudinary (không chặn luồng chính nếu thất bại)
  if (publicIds.length > 0) {
    try {
      await axios.post(`${process.env.SHARE_SERVICE_URL}/delete-images`, {
        public_ids: publicIds,
      });
    } catch (imgError) {
      console.error("Lỗi xóa ảnh Cloudinary:", imgError);
    }
  }

  // 4. Xóa bài viết khỏi DB
  await News.findByIdAndDelete(id);

  return res.status(200).json({ message: "Bài viết đã được xóa thành công" });
});

export const changeStatus = TryCatch(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const userId = req.userId;

  // Lấy thông tin user từ User Service
  const user = await axios.get(`${process.env.USER_SERVICE_URL}/${userId}`);

  if(!user || !user.data?.user){
    return res.status(404).json({ message: "User không tồn tại" });
  }

  const id = req.params.id;
  const { status, review } = req.body; 

  // Tạo object chứa các thay đổi
  const updateQuery: any = {
    $set: { status },
    $push: {
      reviewHistory: {
        actor: user.data.user.fullName,
        review,
        reviewedAt: new Date()
      }
    }
  };

  // Thêm publishedAt nếu status là published
  if (status === "published") {
    updateQuery.$set.publishedAt = new Date();
  }

  // Thực thi update
  const news = await News.findByIdAndUpdate(
    id, 
    updateQuery, 
    { new: true }
  );

  if(!news){
    return res.status(404).json({ message: "Bài viết không tồn tại" });
  }

  return res.status(200).json({
    success: true,
    message: `Đã duyệt bài viết thành công`,
    news,
  });
});