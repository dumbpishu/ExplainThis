import express from "express";
import cors, { CorsOptions } from "cors";

import ingestRoutes from "./routes/ingest.route.js";
import chatRoutes from "./routes/chat.route.js";
import sessionRoutes from "./routes/session.route.js";
import { ENV } from "./config/env.js";

const app = express();

const corsOptions: CorsOptions = {
  origin: [ENV.CORS_ORIGIN, ENV.CORS_ORIGIN_NEW],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

app.use("/api", ingestRoutes);
app.use("/api", chatRoutes);
app.use("/api", sessionRoutes);

export default app;
