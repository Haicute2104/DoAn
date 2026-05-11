import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import * as controller from "../controllers/report.controller";

const router: Router = Router();

router.use(authMiddleware);

router.get("/dashboard", controller.getDashboard);
router.get("/revenue", controller.getRevenue);
router.get("/revenue/by-category", controller.getRevenueByCategory);
router.get("/revenue/by-payment", controller.getRevenueByPayment);
router.get("/orders", controller.getOrderStats);

export const reportRoutes: Router = router;
