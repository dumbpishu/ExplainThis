import { Router } from "express";
import { ingestText, ingestPDF } from "../controllers/ingest.controller.js";
import upload from "../config/multer.js";

const router = Router();

router.post("/ingest-text", ingestText);
router.post("/ingest-pdf", upload.single("file"), ingestPDF);

export default router;
