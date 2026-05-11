import express from "express";
import dotenv from "dotenv";
import router from "./routers/index.routes";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

router(app);

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", service: "report-service" });
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Report service is running on http://localhost:${PORT}`);
});