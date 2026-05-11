import { Express } from "express";
import { authClientRoutes } from "./authClient.routes";
import systemConfig from '../../configs/system';

const router = (app : Express) : void => {
  const PATH_CLIENT = systemConfig.prefixClien;

  app.use( PATH_CLIENT + `/auth`, authClientRoutes);
}

export default router;
