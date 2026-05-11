import {Router} from "express";
import * as controller from '../../controllers/client/category.controller';

const router: Router = Router();

router.get('/', controller.index);

export const categoryClientRoutes: Router = router