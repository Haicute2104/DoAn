import { Express } from "express";
import systemConfig from '../../configs/system';
import { newsClientRoutes } from "./news.routes";

const routerClient = (app : Express) : void => {
  const PATH_CLIENT = systemConfig.prefixClient;

  app.use( PATH_CLIENT + `/news`, newsClientRoutes);

}

export default routerClient;
