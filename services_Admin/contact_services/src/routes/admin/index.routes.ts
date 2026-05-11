import { Express } from "express";
import systemConfig from '../../configs/system';
import { contactAdminRoutes } from "./contact.routes";

const router = (app : Express) : void => {
  const PATH_ADMIN = systemConfig.prefixAdmin;

  app.use( PATH_ADMIN + `/contact`, contactAdminRoutes);

}

export default router;
