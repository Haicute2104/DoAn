import {Router} from "express";
import * as controller from '../../controllers/internal/productInternal.controller';

const router: Router = Router();

router.patch('/updateQuantity/:productId/:size/:status', controller.updateQuantity);

router.post('/reserve-stock', controller.reserveStockHandler);
router.post('/confirm-stock', controller.confirmStockHandler);
router.post('/release-stock', controller.releaseStockHandler);

router.get('/category-map', controller.getCategoryMap);

export const productInternalRoutes: Router = router