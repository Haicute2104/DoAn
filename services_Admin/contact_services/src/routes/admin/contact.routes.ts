import {Router} from "express";
import * as controller from '../../controller/admin/contact.controller';
import { authMiddleware } from "../../middlewares/auth.middleware";

const router: Router = Router();

router.use(authMiddleware);
router.get('/', controller.index);
router.put('/:id', controller.update);


export const contactAdminRoutes: Router = router