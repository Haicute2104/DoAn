import {Router} from "express";
import * as controller from '../../controllers/admin/product.controller';
import { authMiddleware } from "../../middlewares/auth.middleware";

const router: Router = Router();

// Áp dụng middleware xác thực cho tất cả route
router.use(authMiddleware);

router.get('/', controller.index);

router.get('/stock', controller.getStock);

router.post('/create', controller.create);
router.patch('/change-all', controller.changeAll);

router.get('/:id', controller.show);
router.put('/:id', controller.update);
router.delete('/:id', controller.destroy);
router.patch('/change-status/:id', controller.changeStatus);

router.patch('/inventory/:productId/:sizeId', controller.adjustInventory);




export const productRoutes: Router = router