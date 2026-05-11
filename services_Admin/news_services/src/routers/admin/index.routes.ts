import { Express } from "express";
import systemConfig from '../../configs/system';
import { newsAdminRoutes } from "./news.routes";

const routerAdmin = (app : Express) : void => {
  const PATH_ADMIN = systemConfig.prefixAdmin;

  app.use( PATH_ADMIN + `/news`, newsAdminRoutes);


}

export default routerAdmin;
