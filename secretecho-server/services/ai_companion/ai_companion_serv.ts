import { SecretEchoContext } from "../../middleware/context";
import { ChatMessage } from "../../models/ai_companion";
import { getErrorMessage } from "../../oplog/error";
import oplog from "../../oplog/oplog";

export async function createAICompanion(
	secretEchoCtx: SecretEchoContext,
	userPid: string,
	companionCode: string
): Promise<void | Error> {
	try {
		const user = await secretEchoCtx.dbProviders.user.findByPid(secretEchoCtx, userPid);
		if (user instanceof Error) {
			oplog.error("user not found: " + getErrorMessage(user));
			return user as Error;
		}
		if (!user) {
			oplog.error(`User not found for user_pid: ${userPid}`);
			return new Error("User not found");
		}

		// Convert secretEchoUser._id (ObjectId) to a string
		const userId = user._id.toString(); // Converts ObjectId to a 24-character hex string

		const aiCompanion = await secretEchoCtx.dbProviders.AICompanion.findByUserAndCompanion(
			secretEchoCtx,
			userId,
			companionCode
		);
		if (aiCompanion instanceof Error) {
			oplog.error(getErrorMessage(aiCompanion));
			return aiCompanion;
		}
		if (!aiCompanion) {
			const result = await secretEchoCtx.dbProviders.AICompanion.create(secretEchoCtx, userId, companionCode);
			if (result instanceof Error) {
				oplog.error(getErrorMessage(result));
				return result;
			}
		}
		return;
	} catch (error) {
		oplog.error(getErrorMessage(error));
		return error as Error;
	}
}

export async function saveAICompanionMessage(
	secretEchoCtx: SecretEchoContext,
	userPid: string,
	companionCode: string,
	content: string,
	sender: "user" | "companion"
): Promise<void | Error> {
	try {
		const message: ChatMessage = {
			content,
			sender,
			timestamp: new Date(),
		};
		const secretEchoUser = await secretEchoCtx.dbProviders.user.findByPid(secretEchoCtx, userPid);
		if (secretEchoUser instanceof Error) {
			oplog.error("user not found: " + getErrorMessage(secretEchoUser));
			return secretEchoUser as Error;
		}
		if (!secretEchoUser) {
			oplog.error(`User not found for user_pid: ${userPid}`);
			return new Error("User not found");
		}

		const userId = secretEchoUser._id.toString();
		const result = await secretEchoCtx.dbProviders.AICompanion.pushMessage(
			secretEchoCtx,
			userId,
			companionCode,
			message
		);
		if (result instanceof Error) {
			oplog.error(getErrorMessage(result));
			return result;
		}
		return;
	} catch (error) {
		oplog.error(getErrorMessage(error));
		return error as Error;
	}
}

export async function getAICompanionChatHistory(
	secretEchoCtx: SecretEchoContext,
	userPid: string,
	companionCode: string
): Promise<ChatMessage[] | Error> {
	try {
		const secretEchoUser = await secretEchoCtx.dbProviders.user.findByPid(secretEchoCtx, userPid);
		if (secretEchoUser instanceof Error) {
			oplog.error("user not found: " + getErrorMessage(secretEchoUser));
			return secretEchoUser as Error;
		}
		if (!secretEchoUser) {
			oplog.error(`User not found for user_pid: ${userPid}`);
			return new Error("User not found");
		}

		const userId = secretEchoUser._id.toString();
		const aiCompanion = await secretEchoCtx.dbProviders.AICompanion.findByUserAndCompanion(
			secretEchoCtx,
			userId,
			companionCode
		);
		if (aiCompanion instanceof Error) {
			oplog.error(getErrorMessage(aiCompanion));
			return aiCompanion;
		}
		return aiCompanion ? aiCompanion.chat : [];
	} catch (error) {
		oplog.error(getErrorMessage(error));
		return error as Error;
	}
}
