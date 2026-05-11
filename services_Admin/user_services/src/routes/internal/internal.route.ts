import { Router, Request, Response } from "express";
import * as controller from "../../controllers/internal/user.controller";
const router: Router = Router();

// Route nội bộ - KHÔNG có auth middleware
// Chỉ accessible trong Docker network, không expose qua API gateway
router.get("/:id", controller.show);

export const internalRoutes: Router = router;
