import { Router } from "express";
import { createSession } from "../controllers/session.controller";

const router = Router();

router.post("/session", createSession);

export default router;
