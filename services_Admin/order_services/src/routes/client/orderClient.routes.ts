import {Router} from "express";
import * as controller from '../../controllers/client/order.controller';
import { authMiddleware } from "../../middlewares/auth.middleware";

const router: Router = Router();

router.use(authMiddleware);

router.post('/reserve-stock', controller.reserveStockProxy);
router.post('/release-stock', controller.releaseStockProxy);

router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/:idCart', controller.create);
router.get('/:id/retry-payment', controller.retryPayment);
router.patch('/:id/cancel', controller.cancel);

export const orderClientRoutes: Router = router
