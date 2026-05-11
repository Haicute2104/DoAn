import express from "express";
import { connect } from "./configs/database";
import dotenv from "dotenv";
import routerAdmin from "./routes/admin/index.route";
import routerClient from "./routes/client/index.route";
import routerInternal from "./routes/internal/index.routes";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { startCancelExpiredOrdersJob } from "./jobs/cancelExpiredOrders";

dotenv.config();

connect();

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

routerAdmin(app);
routerClient(app);
routerInternal(app);

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", service: "order-service" });
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  startCancelExpiredOrdersJob();
});
