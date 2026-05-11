import { Router } from "express";
import * as controller from "../controller/momo.controller";

const router: Router = Router();

router.post("/create", controller.createPayment);
router.get("/redirect", controller.momoRedirect);
router.post("/callback", controller.momoCallback);

export const momoRoutes: Router = router;
