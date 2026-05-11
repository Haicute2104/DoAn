import {Router} from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import * as controller from "../../controllers/client/user.controller";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

const router: Router = Router();

// Áp dụng middleware xác thực cho tất cả route
router.use(authMiddleware);

//Lấy thông tin người dùng
router.get("/profile", controller.getProfileUser);

//Cập nhật profile (mỗi tên, số điện thoại, email, ngày sinh, giới tính)
router.patch("/profile/update", controller.updateProfileUser);

//Đổi mật khẩu
router.patch("/profile/password/update", controller.updatePasswordUser);

//Upload ảnh avatar
router.patch("/profile/avatar/update", upload.single("files"), controller.updateAvatarUser);

//Lấy danh sách địa chỉ
router.get("/address/list", controller.getListAddress);

//Thêm địa chỉ
router.post("/address/create", controller.createAddress);

//Sửa địa chỉ
router.patch("/address/update/:id", controller.updateAddress);

//Xóa địa chỉ
router.delete("/address/delete/:id", controller.deleteAddress);

//Set địa chỉ mặc định
router.patch("/address/set-default/:id", controller.setDefaultAddress);

export const userClientRoutes: Router = router