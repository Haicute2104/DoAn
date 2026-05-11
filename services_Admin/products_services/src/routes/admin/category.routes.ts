import { Router } from "express";
import * as controller from '../../controllers/admin/category.controller';
import { authMiddleware } from "../../middlewares/auth.middleware";

const router : Router = Router();

router.use(authMiddleware);
router.get("/", controller.index);
router.post("/create", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.destroy);

export const categoryRoutes: Router = router;