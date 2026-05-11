import express from "express";
import {connect} from './configs/database';
import dotenv from "dotenv";
import routerClient from "./routes/client/index.routes";
import routerAdmin from "./routes/admin/index.routes";
import bodyParser from "body-parser";
import cookieParser from 'cookie-parser';

dotenv.config();

connect();

const app = express();
app.use(bodyParser.urlencoded())
app.use(bodyParser.json());
app.use(cookieParser());
routerClient(app);
routerAdmin(app);
const PORT = process.env.PORT ;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});