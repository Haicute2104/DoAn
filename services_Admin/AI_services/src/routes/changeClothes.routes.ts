import { Router } from "express";
import multer from "multer";
import {
  changeClothUrl,
  proxyImage,
} from "../controllers/changeClothes.controller";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/change-cloth-url", upload.single("person"), changeClothUrl);
router.get("/proxy-image", proxyImage);

export const changeClothesRoutes = router;
