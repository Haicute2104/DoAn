import { Router } from "express";
import * as controller from "../controllers/openAI.controller";
import * as chatController from "../controllers/chat.controller";

const router: Router = Router();

router.post("/moderation", controller.moderation);
router.post("/chat", chatController.chat);
router.post("/refresh-products", chatController.refreshProducts);

router.get("/conversations", chatController.getConversations);
router.get("/conversations/:id", chatController.getConversation);
router.delete("/conversations/:id", chatController.deleteConversation);

export const openAIRoutes: Router = router;
