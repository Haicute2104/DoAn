import { Express } from "express";
import systemConfig from "../../configs/system";
import { orderClientRoutes } from "./orderClient.routes";

const routerClient = (app: Express): void => {
  const PATH_CLIENT = systemConfig.prefixClient;

  app.use(PATH_CLIENT + `/order`, orderClientRoutes);
};

export default routerClient;
