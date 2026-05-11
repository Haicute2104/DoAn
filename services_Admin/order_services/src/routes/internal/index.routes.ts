import { Express } from "express";
import { orderInternalRoutes } from "./orderInternal.routes";
import { reportInternalRoutes } from "./reportInternal.routes";

const routerInternal = (app: Express): void => {
  app.use("/internal/order", orderInternalRoutes);
  app.use("/internal/report", reportInternalRoutes);
};

export default routerInternal;
