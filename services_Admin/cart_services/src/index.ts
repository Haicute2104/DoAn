import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import routerClient from "./routes/client/index.route";
import { connect } from "./configs/database";

dotenv.config();
connect();

const app = express();
const PORT = process.env.PORT || 5005;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());


routerClient(app);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Order Services running on port ${PORT}`);
});
