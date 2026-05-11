import { Router } from "express";
import * as controller from "../../controllers/client/cart.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router: Router = Router();

router.use(authMiddleware);

router.get("/", controller.index);
router.post("/add", controller.add);
router.patch("/:productId/:size", controller.update);
router.delete("/:productId/:size", controller.destroy);

export const cartClientRoutes: Router = router;
