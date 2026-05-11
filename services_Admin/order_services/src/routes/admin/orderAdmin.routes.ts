import {Router} from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import * as controller from '../../controllers/admin/order.controller';

const router: Router = Router();

router.use(authMiddleware);

//Lấy tất cả danh sách đơn hàng
router.get('/', controller.index)

//Lấy báo cáo đơn hàng theo user
router.get('/statement/:idUser', controller.getStatement)

//Lấy chi tiết đơn hàng
router.get('/:id', controller.show)

//Sửa trạng thái đơn hàng
router.patch('/:id/status', controller.updateStatus)

//Xuất excel danh sách đơn hàng

export const orderAdminRoutes: Router = router
