import express from "express";
import ingestRoutes from "./routes/ingest.route";
import chatRoutes from "./routes/chat.route";

const app = express();

app.use(express.json());

app.use("/api", ingestRoutes);
app.use("/api", chatRoutes);

export default app;
