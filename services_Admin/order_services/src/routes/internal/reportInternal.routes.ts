import { Router } from "express";
import * as controller from "../../controllers/internal/report.controller";

const router: Router = Router();

router.get("/orders", controller.getOrdersForReport);

export const reportInternalRoutes: Router = router;
