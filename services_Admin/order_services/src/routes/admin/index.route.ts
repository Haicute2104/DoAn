import { Express } from "express";
import systemConfig from "../../configs/system";
import { orderAdminRoutes } from "./orderAdmin.routes";

const routerAdmin = (app: Express): void => {
  const PATH_ADMIN = systemConfig.prefixAdmin;

  app.use(PATH_ADMIN + `/order`, orderAdminRoutes);
};

export default routerAdmin;
