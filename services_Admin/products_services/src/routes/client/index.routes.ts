import { Express } from "express";
import systemConfig from '../../configs/system';
import { productClientRoutes } from "./productClient.routes";
import { productInternalRoutes } from "./productInternal.routes";
import { categoryClientRoutes } from "./category.routes";

const router = (app : Express) : void => {
  const PATH_CLIENT = systemConfig.prefixClient;

  app.use( PATH_CLIENT + `/product`, productClientRoutes);
  app.use( PATH_CLIENT + `/product/internal`, productInternalRoutes);
  app.use( PATH_CLIENT + `/category`, categoryClientRoutes);

}

export default router;
