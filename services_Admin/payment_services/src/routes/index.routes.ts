import { Express } from "express";
import { momoRoutes } from "./momo.routes";

const router = (app: Express): void => {
  app.use(`/api/v1/client/payment/momo`, momoRoutes);
};

export default router;
