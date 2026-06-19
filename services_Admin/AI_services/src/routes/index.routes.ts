import { Express } from "express";
import { openAIRoutes } from "./openAI.routes";
import { changeClothesRoutes } from "./changeClothes.routes";

const router = (app: Express): void => {
  app.use("/ai", openAIRoutes);
  app.use("/change-clothes", changeClothesRoutes);
};

export default router;
