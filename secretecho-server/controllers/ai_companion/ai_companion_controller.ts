import { RequestHandler } from "express";
import { SecretEchoContext } from "../../middleware/context";
import {
	CreateAICompanionRequest,
	CreateAICompanionRequestSchema,
	CreateAICompanionResponse,
	GetAICompanionChatHistoryRequest,
	GetAICompanionChatHistoryRequestSchema,
} from "../../models/ai_companion";
import { ReturnError, ReturnSuccess } from "../../models/request_response";
import { providersInterface } from "../../providers/interface";
import { validateDataUsingJOI } from "../../utils/validator";

export const createAICompanion: RequestHandler = async (req, res) => {
	const data = validateDataUsingJOI<CreateAICompanionRequest>(req.body, CreateAICompanionRequestSchema);
	if (data instanceof Error) {
		return ReturnError(res, [data.message], 400);
	}

	const secretEchoCtx = SecretEchoContext.get(req);
	const userId = secretEchoCtx.UserPID;

	if (!userId) {
		return ReturnError(res, ["User ID is required"], 400);
	}

	const result = await providersInterface.AICompanions.createAICompanion(secretEchoCtx, userId, data.companionCode);
	if (result instanceof Error) {
		return ReturnError(res, [result.message], 500);
	}

	const response: CreateAICompanionResponse = {
		message: "AI Companion created successfully",
	};

	return ReturnSuccess(res, response);
};

export const getAICompanionChatHistory: RequestHandler = async (req, res) => {
	const data = validateDataUsingJOI<GetAICompanionChatHistoryRequest>(
		{ companionCode: req.query.companion_code },
		GetAICompanionChatHistoryRequestSchema
	);
	if (data instanceof Error) {
		return ReturnError(res, [data.message], 400);
	}

	const secretEchoCtx = SecretEchoContext.get(req);
	const userId = secretEchoCtx.UserPID;

	if (!userId) {
		return ReturnError(res, ["User ID is required"], 400);
	}

	const chatHistory = await providersInterface.AICompanions.getAICompanionChatHistory(
		secretEchoCtx,
		userId,
		data.companionCode
	);
	if (chatHistory instanceof Error) {
		return ReturnError(res, [chatHistory.message], 500);
	}

	return ReturnSuccess(res, chatHistory);
};
