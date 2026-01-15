import { Router } from "express";
import { ingestText, ingestPDF } from "../controllers/ingest.controller";
import upload from "../config/multer";

const router = Router();

router.post("/ingest-text", ingestText);
router.post("/ingest-pdf", upload.single("file"), ingestPDF);

export default router;
