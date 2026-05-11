import { Express } from "express";
import systemConfig from '../../configs/system';
import { contactClientRoutes } from "./contact.routes";

const router = (app : Express) : void => {
  const PATH_CLIENT = systemConfig.prefixClient;

  app.use( PATH_CLIENT + `/contact`, contactClientRoutes);

}

export default router;
