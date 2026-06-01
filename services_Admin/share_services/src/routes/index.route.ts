import express from "express";
import multer from 'multer';
import cloudinary from "../configs/cloudnari";

const router = express.Router();

// Sử dụng memoryStorage để lưu file vào RAM giúp xử lý nhanh hơn
const upload = multer({ storage: multer.memoryStorage() });

// Hàm phụ trợ: Upload một file lên Cloudinary
const uploadToCloudinary = (fileBuffer: Buffer, folder: string = "products") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, timeout: 120000 },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          url: result?.secure_url,
          public_id: result?.public_id,
        });
      }
    );
    stream.end(fileBuffer);
  });
};

// API xóa ảnh trên Cloudinary
router.post("/api/v1/delete-images", async (req, res) => {
  try {
    const { public_ids } = req.body;

    if (!public_ids || !Array.isArray(public_ids) || public_ids.length === 0) {
      return res.status(400).json({
        message: "Vui lòng cung cấp danh sách public_ids cần xóa",
        success: false
      });
    }

    // Xóa song song tất cả ảnh
    const deleteResults = await Promise.allSettled(
      public_ids.map((id: string) => cloudinary.uploader.destroy(id))
    );

    // Phân loại kết quả
    const succeeded = deleteResults.filter(r => r.status === 'fulfilled');
    const failed = deleteResults.filter(r => r.status === 'rejected');

    return res.status(200).json({
      message: `Đã xóa ${succeeded.length}/${public_ids.length} ảnh`,
      success: true,
      deleted: succeeded.length,
      failed: failed.length,
      details: deleteResults
    });

  } catch (error) {
    console.error("Delete images error:", error);
    return res.status(500).json({
      message: "Xóa ảnh thất bại",
      success: false,
      error: (error as any).message
    });
  }
});

router.post(
  "/api/v1/upload-multiple",
  // 1. Đổi thành upload.array. "files" là tên field, 10 là số lượng tối đa cho phép
  upload.array("files", 10), 
  async (req, res) => {
    try {
      // Ép kiểu req.files về mảng Multer File để TypeScript hiểu
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return res.status(400).json({ message: "Không có file nào được gửi lên" });
      }

      // 2. Logic xóa ảnh cũ (nếu có gửi kèm danh sách public_ids cần xóa)
      // Frontend có thể gửi field "deleted_public_ids" dạng chuỗi JSON hoặc mảng
      const { deleted_public_ids } = req.body;
      if (deleted_public_ids) {
         const idsToDelete = Array.isArray(deleted_public_ids) ? deleted_public_ids : [deleted_public_ids];
         // Xóa song song
         await Promise.all(
            idsToDelete.map((id: string) => cloudinary.uploader.destroy(id))
         );
      }

      // 3. Upload tuần tự từng ảnh để tránh timeout khi có nhiều file
      const results = [];
      for (const file of files) {
        const result = await uploadToCloudinary(file.buffer);
        results.push(result);
      }

      res.status(200).json({
        message: "Upload thành công",
        count: results.length,
        data: results, 
      });

    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({
        message: "Upload thất bại",
        error: (error as any).message,
      });
    }
  }
);

export default router;