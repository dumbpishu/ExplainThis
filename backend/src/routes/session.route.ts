import { Router } from "express";
import { deleteSession } from "../controllers/session.controller.js";

const router = Router();

router.delete("/sessions/:sessionId", deleteSession);

export default router;
