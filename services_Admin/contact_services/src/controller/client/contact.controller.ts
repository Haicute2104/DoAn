import { NextFunction, Request, Response } from "express";
import { TryCatch } from "../../helpers/tryCatch";
import Contact from "../../model/contact.model";

export const index = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
    const contacts = await Contact.findOne();
    console.log(contacts);
    return res.status(200).json({
        message: "Tất cả liên hệ đã có",
        contacts,
    });
})
