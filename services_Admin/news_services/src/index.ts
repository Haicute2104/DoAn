import express from "express";
import {connect} from './configs/database';
import dotenv from "dotenv";
import routerAdmin from "./routers/admin/index.routes";
import routerClient from "./routers/client/index.routes";
import bodyParser from "body-parser";
import cookieParser from 'cookie-parser';

dotenv.config();

connect();

const app = express();
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());
app.use(cookieParser());
routerAdmin(app);
routerClient(app);
const PORT = process.env.PORT ;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});