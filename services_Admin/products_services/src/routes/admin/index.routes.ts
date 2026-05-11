import { Express } from "express";
import systemConfig from '../../configs/system';
import { productRoutes } from "./product.routes";
import { categoryRoutes } from "./category.routes";
import { collectionRoutes } from "./collection.routes";

const router = (app : Express) : void => {
  const PATH_ADMIN = systemConfig.prefixAdmin;
  const PATH_CLIENT = systemConfig.prefixClient;

  app.use( PATH_ADMIN + `/product`, productRoutes);
  app.use( PATH_ADMIN + `/category`, categoryRoutes);
  app.use( PATH_ADMIN + `/collection`, collectionRoutes);
}

export default router;
