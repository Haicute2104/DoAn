import { Express } from "express";
import systemConfig from '../../configs/system';
import { cartClientRoutes } from "./cartClient.route";
import { cartInternalRoutes } from "./cartInternal.routes";

const router = (app : Express) : void => {
  const PATH_CLIENT = systemConfig.prefixClient;

  app.use( PATH_CLIENT + `/cart/internal`, cartInternalRoutes);

  app.use( PATH_CLIENT + `/cart`, cartClientRoutes);

}

export default router;
