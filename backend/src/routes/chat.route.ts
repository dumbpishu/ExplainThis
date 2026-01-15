import { Router } from "express";
import { chatWithAI } from "../controllers/chat.controller";

const router = Router();

router.post("/chat", chatWithAI);

export default router;
