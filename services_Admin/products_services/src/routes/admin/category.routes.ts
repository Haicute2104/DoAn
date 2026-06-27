import { Router } from "express";
import * as controller from '../../controllers/admin/category.controller';
import { authMiddleware } from "../../middlewares/auth.middleware";

const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

const router : Router = Router();

router.use(authMiddleware);
router.get("/", controller.index);
router.post("/create", upload.single("image"), controller.create);
router.put("/:id", upload.single("image"), controller.update);
router.delete("/:id", controller.destroy);

export const categoryRoutes: Router = router;
