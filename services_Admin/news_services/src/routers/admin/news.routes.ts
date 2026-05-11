import {Router} from "express";
import * as controller from '../../controller/admin/news.controller';
import { authMiddleware } from "../../middlewares/auth.middleware";

const router: Router = Router();

// Áp dụng middleware xác thực cho tất cả route
router.use(authMiddleware);

router.get('/', controller.index);

router.get('/:id', controller.show);

router.post('/create', controller.create);

router.put('/:id', controller.update);

router.delete('/:id', controller.destroy);

router.patch('/:id/status', controller.changeStatus);


export const newsAdminRoutes: Router = router