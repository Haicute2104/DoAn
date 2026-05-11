import { Express } from "express";
import { reportRoutes } from "./report.routes";

const router = (app : Express) : void => {

  app.use(  `/api/v1/report` ,reportRoutes);

}

export default router;
