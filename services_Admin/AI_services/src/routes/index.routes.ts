import { Express } from "express";
import { openAIRoutes } from "./openAI.routes";

const router = (app : Express) : void => {

  app.use( `/ai`, openAIRoutes);


}

export default router;
