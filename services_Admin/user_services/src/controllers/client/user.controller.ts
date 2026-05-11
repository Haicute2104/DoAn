import { TryCatch } from "../../helpers/tryCatch";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { Response, NextFunction } from "express";
import User from "../../models/user.model";
import bcrypt from "bcrypt";
import axios from "axios";
const FormData = require("form-data") as typeof import("form-data");

type MulterFile = {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};

const checkUser = async (idUser: string | undefined) => {
  if(!idUser){
    throw new Error("User không tồn tại");
  }
  const user = await User.findById(idUser).select('-role -isActive -isDeleted');
  if(!user){
    throw new Error("User không tồn tại");
  }
  if(user.isActive === false){
    throw new Error("User chưa được kích hoạt");
  }
  if(user.isDeleted === true){
    throw new Error("User đã bị xóa");
  }
  return user;
}

//Lấy thông tin người dùng
export const getProfileUser = TryCatch(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const idUser = req.userId;
  const user = (await checkUser(idUser));
  return res.status(200).json({
    message: "User đã có",
    user,
  });
})

//Cập nhật profile (mỗi tên, số điện thoại, email, ngày sinh, giới tính)
export const updateProfileUser = TryCatch(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const idUser = req.userId;
  const user = await checkUser(idUser);
  const {fullName, phone, email, dateOfBirth, gender} = req.body as {fullName: string, phone: string, email: string, dateOfBirth: string, gender: string};
  await user.updateOne({
    fullName,
    phone,
    email,
    dateOfBirth,
    gender,
  });
  return res.status(200).json({
    message: "Cập nhật profile thành công",
  });
})

//Đổi mật khẩu
export const updatePasswordUser = TryCatch(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const idUser = req.userId;
  const user = await checkUser(idUser);

  const { password, newPassword } = req.body as { password: string; newPassword: string };
  console.log(password, newPassword);

  if(!password || !newPassword){
    return res.status(400).json({
      message: "Vui lòng nhập đầy đủ mật khẩu cũ và mật khẩu mới",
    });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if(!isMatch){
    return res.status(400).json({
      message: "Mật khẩu cũ không đúng",
    });
  }

  if(await bcrypt.compare(newPassword, user.password)){
    return res.status(400).json({
      message: "Mật khẩu mới không được trùng với mật khẩu cũ",
    });
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  try {
    await axios.post(`${process.env.AUTH_SERVICE_URL}/logout`);
  } catch (e) {
  }

  return res.status(200).json({
    message: "Đổi mật khẩu thành công, vui lòng đăng nhập lại",
  });
})

//Upload ảnh avatar
export const updateAvatarUser = TryCatch(async (req: AuthRequest, res: Response, next: NextFunction) => {
  //Lấy ra id và user người dùng
  const idUser = req.userId;

  //Check user
  const user = await checkUser(idUser);

  //Lấy file từ request
  const file = (req as AuthRequest & { file?: MulterFile }).file;

  //Check file
  if (!file) {
    return res.status(400).json({ message: "Vui lòng chọn ảnh" });
  }

  //Tạo form data
  const formData = new FormData();
  formData.append("files", file.buffer, {
    filename: file.originalname,
    contentType: file.mimetype,
  });

  //Upload ảnh lên Cloudinary
  const uploadRes = await axios.post(`${process.env.CLOUDINARY_URL}/upload-multiple`, formData, {
    headers: formData.getHeaders(),
  });

  //Lấy ra ảnh đã upload
  const uploaded = uploadRes.data.data[0] as { url: string; public_id: string };

  //Lấy ra id của ảnh cũ
  const oldPublicId = user.avatarPublicId;

  //Cập nhật ảnh avatar mới
  await user.updateOne({
    avatarUrl: uploaded.url,
    avatarPublicId: uploaded.public_id,
  });

  //Xóa ảnh cũ
  if (oldPublicId) {
    try {
      await axios.post(`${process.env.CLOUDINARY_URL}/delete-images`, {
        public_ids: [oldPublicId],
      });
    } catch {
      // Xóa ảnh cũ thất bại không ảnh hưởng kết quả
    }
  }

  return res.status(200).json({
    message: "Cập nhật ảnh avatar thành công",
    avatarUrl: uploaded.url,
  });
})

//Lấy danh sách địa chỉ
export const getListAddress = TryCatch(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const idUser = req.userId;
  const user = await checkUser(idUser);
  const address = user.address;
  return res.status(200).json({
    message: "Lấy danh sách địa chỉ thành công",
    address,
  });
})

//Thêm địa chỉ
export const createAddress = TryCatch(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const idUser = req.userId;
  const user = await checkUser(idUser);
  const {fullName, phone, street, ward,  province} = req.body as {fullName: string, phone: string, street: string, ward: string, province: string};
  await user.updateOne({
    $push: {
      address: {
        fullName,
        phone,
        street,
        ward,
        province,
      },
    },
  });
  return res.status(200).json({
    message: "Thêm địa chỉ thành công",
  });
})

//Sửa địa chỉ
export const updateAddress = TryCatch(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const idUser = req.userId;
  const user = await checkUser(idUser);
  const {id} = req.params as {id: string};
  const {fullName, phone, street, ward, province, isDefault} = req.body as {fullName: string, phone: string, street: string, ward: string, province: string, isDefault: boolean};

  await User.updateOne(
    { _id: idUser, "address._id": id },
    {
      $set: {
        "address.$.fullName": fullName,
        "address.$.phone": phone,
        "address.$.street": street,
        "address.$.ward": ward,
        "address.$.province": province,
        "address.$.isDefault": isDefault,
      },
    }
  );
  return res.status(200).json({
    message: "Sửa địa chỉ thành công",
  });
})

//Xóa địa chỉ
export const deleteAddress = TryCatch(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const idUser = req.userId;
  const user = await checkUser(idUser);
  const {id} = req.params as {id: string};
  await user.updateOne({
    $pull: {
      address: {_id: id},
    },
  });
  return res.status(200).json({
    message: "Xóa địa chỉ thành công",
  });
})

//Set địa chỉ mặc định
export const setDefaultAddress = TryCatch(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const idUser = req.userId;
  const user = await checkUser(idUser);
  const {id} = req.params as {id: string};

  // Bỏ default cũ trước
  await User.updateOne(
    { _id: idUser },
    { $set: { "address.$[].isDefault": false } }
  );

  // Set default mới
  await User.updateOne(
    { _id: idUser, "address._id": id },
    { $set: { "address.$.isDefault": true } }
  );

  return res.status(200).json({
    message: "Địa chỉ đặt làm mặc định thành công",
  });
})

