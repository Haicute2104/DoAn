import { TryCatch } from "../../helpers/tryCatch";
import User from "../../models/user.model";
import { Request, Response, NextFunction } from "express";


export const show = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) {
    return res.status(404).json({ message: "User không tồn tại" });
  }
  return res.status(200).json({ user });
});