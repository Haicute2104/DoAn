import {Router} from "express";
import * as controller from '../../controllers/client/authClient.controller';

const router: Router = Router();

router.get('/', controller.index)
//Đăng ký tài khoản
router.post('/register', controller.registerUser);
//Đăng nhập tài khoản
router.post('/login', controller.loginUser);
//Đăng xuất tài khoản
router.post('/logout', controller.logoutUser);
//Quên mật khẩu
router.post('/forgot-password', controller.forgotPassword);
//Đặt lại mật khẩu
router.post('/reset-password/:token', controller.resetPassword);

// Routes kích hoạt tài khoản (hỗ trợ cả query parameter và route parameter)
router.get('/activate/:token', controller.activateAccount);
router.post('/resend-activation', controller.resendActivationEmail);

router.post('/refresh-token', controller.refreshToken);
export const authClientRoutes: Router = router