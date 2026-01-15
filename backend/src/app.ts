import express from "express";
import sessionRoutes from "./routes/session.route";
import ingestRoutes from "./routes/ingest.route";
import chatRoutes from "./routes/chat.route";

const app = express();

app.use(express.json());

app.use("/api", sessionRoutes);
app.use("/api", ingestRoutes);
app.use("/api", chatRoutes);

export default app;
