import { Express } from "express";
import { authRoutes } from "./auth.routes";
import systemConfig from '../../configs/system';

const router = (app : Express) : void => {
  const PATH_ADMIN = systemConfig.prefixAdmin;

  app.use( PATH_ADMIN + `/auth`, authRoutes);
}

export default router;
