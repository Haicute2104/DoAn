import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import * as controller from '../../controllers/admin/collection.controller';
const router : Router = Router();

router.use(authMiddleware);
router.get("/", controller.index);
router.post("/create", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.destroy);
router.get("/:id", controller.getProductByIdCollection);
router.get("/:id/available-products", controller.getAvailableProducts);

export const collectionRoutes: Router = router;