import { NextFunction, Request, Response } from "express";
import { TryCatch } from "../../helpers/tryCatch";
import Contact from "../../model/contact.model";
import { AuthRequest } from "../../middlewares/auth.middleware";

export const index = TryCatch(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const contacts = await Contact.findOne();
    return res.status(200).json({
        message: "Tất cả liên hệ đã có",
        contacts,
    });
})

export const update = TryCatch(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { contact } = req.body;
    console.log(contact);
    const updatedContact = await Contact.findByIdAndUpdate(id, contact, { new: true });
    return res.status(200).json({
        message: "Liên hệ đã được cập nhật",
        updatedContact,
    });
})