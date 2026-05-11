import "dotenv/config";
import express from "express";
import routes from "./routes/index.routes";
import { initVectorStore } from "./services/vectorStore.service";
import { connect } from "./configs/database";

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

routes(app);

const start = async () => {
  try {
    await connect();
    await initVectorStore();
  } catch (err) {
    console.error("[VectorStore] Init failed, chat may not work:", err);
  }

  app.listen(process.env.PORT, () => {
    console.log(`AI services is running on port ${process.env.PORT}`);
  });
};

start().catch((err) => {
  console.error("[AI_services] Failed to start:", err);
  process.exit(1);
});
