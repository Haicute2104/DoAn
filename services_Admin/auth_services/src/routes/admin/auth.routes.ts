import {Router} from "express";
import * as controller from '../../controllers/admin/auth.controller';

const router: Router = Router();

router.get('/', controller.index)
router.post('/register', controller.registerUser);
router.post('/login', controller.loginUser);
router.post('/logout', controller.logoutUser);
router.post('/forgot-password', controller.forgotPassword);
router.post('/reset-password/:token', controller.resetPassword);

// Routes kích hoạt tài khoản (hỗ trợ cả query parameter và route parameter)
router.get('/activate/:token', controller.activateAccount);
router.post('/resend-activation', controller.resendActivationEmail);

router.post('/refresh-token', controller.refreshToken);
export const authRoutes: Router = router