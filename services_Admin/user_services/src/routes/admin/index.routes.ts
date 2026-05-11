import { Express } from "express";
import systemConfig from '../../configs/system';
import { userAdminRoutes } from "./user.route";


const router = (app : Express) : void => {
  const PATH_ADMIN = systemConfig.prefixAdmin;

  app.use( PATH_ADMIN + `/user` ,userAdminRoutes);

}

export default router;
