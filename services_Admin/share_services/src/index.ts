import dotenv from "dotenv";
// QUAN TRỌNG: Load env TRƯỚC khi import các module khác sử dụng process.env
dotenv.config();

import express from "express";
import routes from "./routes/index.route";
import { startSendMailConsumer } from "./consumer";

startSendMailConsumer();
console.log("CLOUDINARY_CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME);


const app = express();
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));

app.use(routes);
app.listen(process.env.PORT, () => {
    console.log(`Share services is running on port ${process.env.PORT}`);
});