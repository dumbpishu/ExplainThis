import { Router } from "express";
import { ingestText } from "../controllers/ingest.controller";

const router = Router();

router.post("/ingest-text", ingestText);

export default router;
