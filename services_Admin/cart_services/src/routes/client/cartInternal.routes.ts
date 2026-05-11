import { Router } from "express";
import * as controller from "../../controllers/client/cart.controller";


const router: Router = Router();

router.get("/:id", controller.show);
router.delete("/:id", controller.destroyInternal);

export const cartInternalRoutes: Router = router;
