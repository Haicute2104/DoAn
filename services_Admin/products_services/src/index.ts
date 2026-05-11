import express from "express";
import {connect} from './configs/database';
import dotenv from "dotenv";
import routerAdmin from "./routes/admin/index.routes";
import routerClient from "./routes/client/index.routes";
import bodyParser from "body-parser";
import cookieParser from 'cookie-parser';
import cron from "node-cron";

import "./models";
import { connectRedis } from "./configs/redis";
import { cleanupExpiredReservations } from "./services/stockRevervation.service";

dotenv.config();

connect();

const app = express();
connectRedis();
app.use(bodyParser.urlencoded())
app.use(bodyParser.json());
app.use(cookieParser());
routerAdmin(app);
routerClient(app);
const PORT = process.env.PORT ;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);

  cron.schedule("*/2 * * * *", async () => {
    try {
      await cleanupExpiredReservations();
    } catch (err) {
      console.error("[CronJob] Cleanup reservations failed:", err);
    }
  });
  console.log("[CronJob] Đã khởi động job dọn reservation hết hạn (mỗi 2 phút)");
});