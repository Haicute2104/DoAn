import express from "express";
import {connect} from './configs/database';
import dotenv from "dotenv";
import clientRouter from "./routes/client/index.routes";
import adminRouter from "./routes/admin/index.routes";
import internalRouter from "./routes/internal/index.routes";
import bodyParser from "body-parser";
import cookieParser from 'cookie-parser';

dotenv.config();


connect();
const app = express();
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());
app.use(cookieParser());

// Register all route groups
clientRouter(app);
adminRouter(app);
internalRouter(app);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'user-service' });
});

const PORT = process.env.PORT ;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});