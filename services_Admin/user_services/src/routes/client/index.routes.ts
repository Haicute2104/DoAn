import { Express } from "express";
import systemConfig from '../../configs/system';
import { userClientRoutes } from "./userClient.routes";

const router = (app : Express) : void => {
  const PATH_CLIENT = systemConfig.prefixClient;

  app.use( PATH_CLIENT + `/user` ,userClientRoutes);

}

export default router;
