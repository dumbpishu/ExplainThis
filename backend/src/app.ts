import express from "express";
import cors, { CorsOptions } from "cors";

import ingestRoutes from "./routes/ingest.route";
import chatRoutes from "./routes/chat.route";
import sessionRoutes from "./routes/session.route";
import { ENV } from "./config/env";

const app = express();

const corsOptions: CorsOptions = {
  origin: ENV.CORS_ORIGIN,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

app.use("/api", ingestRoutes);
app.use("/api", chatRoutes);
app.use("/api", sessionRoutes);

export default app;
