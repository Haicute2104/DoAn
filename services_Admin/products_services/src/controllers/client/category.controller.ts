import { NextFunction, Request, Response } from "express";
import Category from "../../models/category.model";
import { TryCatch } from "../../helpers/tryCatch";

export const index = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
  const categories = await Category.find({
    isDeleted: false,
  });
  return res.status(200).json({
    message: "Tất cả danh mục đã có",
    categories,
  });
});