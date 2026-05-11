import {Router} from "express";
import * as controller from '../../controller/client/contact.controller';

const router: Router = Router();

router.get('/', controller.index);

export const contactClientRoutes: Router = router