import express from "express";
import {connect} from './configs/database';
import dotenv from "dotenv";
import router from "./routes/admin/index.routes";
import routerClient from "./routes/client/index.routes";
import bodyParser from "body-parser";
import cookieParser from 'cookie-parser';
import { connectKafka } from "./producer";
import { redisClient } from "./configs/redis";

dotenv.config();
try {
  redisClient.connect();
  console.log("Redis connected");
} catch (error) {
  console.log("Redis connection error");
}

connect();
connectKafka();
const app = express();
app.use(bodyParser.urlencoded())
app.use(bodyParser.json());
app.use(cookieParser());
router(app);
routerClient(app);
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});