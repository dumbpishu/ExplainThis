import { Router } from "express";
import { deleteSession } from "../controllers/session.controller";

const router = Router();

router.delete("/sessions/:sessionId", deleteSession);

export default router;
