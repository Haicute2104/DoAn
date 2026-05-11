import {Router} from "express";
import * as controller from '../../controller/client/news.controller';

const router: Router = Router();

// Áp dụng middleware xác thực cho tất cả route

router.get('/', controller.index);

router.get('/:id', controller.show);

export const newsClientRoutes: Router = router