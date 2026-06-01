import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import * as controller from '../../controllers/admin/collection.controller';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

const router : Router = Router();

router.use(authMiddleware);
router.get("/", controller.index);
router.post("/create", upload.single("image"), controller.create);
router.put("/:id", upload.single("image"), controller.update);
router.delete("/:id", controller.destroy);
router.get("/:id", controller.getProductByIdCollection);
router.get("/:id/available-products", controller.getAvailableProducts);

export const collectionRoutes: Router = router;