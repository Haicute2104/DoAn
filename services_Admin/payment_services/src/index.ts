import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import router from "./routes/index.routes";

dotenv.config();

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// Health check endpoint
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", service: "payment-service" });
});

router(app);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Payment service is running on http://localhost:${PORT}`);
});
