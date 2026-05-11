import { Express } from "express";
import systemConfig from '../../configs/system';
import { internalRoutes } from "./internal.route";

const router = (app : Express) : void => {

  app.use( '/internal' + `/user` ,internalRoutes);

}

export default router;
