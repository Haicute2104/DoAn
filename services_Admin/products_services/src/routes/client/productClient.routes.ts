import {Router} from "express";
import * as controller from '../../controllers/client/productClient.controller';

const router: Router = Router();

router.get('/', controller.index);
router.get('/new', controller.isNew);
router.get('/featured', controller.isFeatured);
router.get('/best-seller', controller.isBestSeller);
router.get('/:id', controller.show);



export const productClientRoutes: Router = router