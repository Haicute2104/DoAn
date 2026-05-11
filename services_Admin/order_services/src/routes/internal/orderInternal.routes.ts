import {Router} from "express";
import * as controller from '../../controllers/internal/order.controller';

const router: Router = Router();

// Áp dụng middleware xác thực cho tất cả route
// Routes không có params - đặt TRƯỚC

router.post('/:orderId/payment-status', controller.updatePaymentStatus);

router.get('/statement/:idUser', controller.getStatement);


export const orderInternalRoutes: Router = router