import express from "express";

import { createAICompanion, getAICompanionChatHistory } from "../controllers/ai_companion/ai_companion_controller";
import { getUserDetails, login, logout, signup } from "../controllers/users/users_controller";

export function mapUrls(app: express.Express) {
	const msV1APIRouter = express.Router();

	app.use("/api/v1", msV1APIRouter);

	msV1APIRouter.post("/auth/signup", signup);
	msV1APIRouter.post("/auth/login", login);
	msV1APIRouter.post("/auth/logout", logout);
	msV1APIRouter.get("/users/me", getUserDetails);
	msV1APIRouter.post("/create/chat", createAICompanion);
	msV1APIRouter.get("/chat_history", getAICompanionChatHistory);
}
