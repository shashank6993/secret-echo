import mongoose from "mongoose";
import { IAICompanion } from "../../entities/ai_companion";
import { SecretEchoContext } from "../../middleware/context";
import { ChatMessage } from "../../models/ai_companion";
import { getErrorMessage } from "../../oplog/error";
import oplog from "../../oplog/oplog";

export async function findByUserAndCompanion(
	secretEchoCtx: SecretEchoContext,
	userId: string,
	companionCode: string
): Promise<IAICompanion | null | Error> {
	try {
		const aiCompanion = await secretEchoCtx.entities.AICompanions.findOne({
			userId: new mongoose.Types.ObjectId(userId),
			companionCode,
		}).exec();
		return aiCompanion;
	} catch (error) {
		oplog.error(getErrorMessage(error));
		return error as Error;
	}
}

export async function create(
	secretEchoCtx: SecretEchoContext,
	userId: string,
	companionCode: string
): Promise<IAICompanion | Error> {
	try {
		const aiCompanion = new secretEchoCtx.entities.AICompanions({
			userId: new mongoose.Types.ObjectId(userId),
			companionCode,
			chat: [],
		});
		const savedAICompanion = await aiCompanion.save();
		return savedAICompanion;
	} catch (error) {
		oplog.error(getErrorMessage(error));
		return error as Error;
	}
}

export async function pushMessage(
	secretEchoCtx: SecretEchoContext,
	userId: string,
	companionCode: string,
	message: ChatMessage
): Promise<void | Error> {
	try {
		const aiCompanion = await secretEchoCtx.entities.AICompanions.findOneAndUpdate(
			{
				userId: new mongoose.Types.ObjectId(userId),
				companionCode,
			},
			{
				$push: {
					chat: message,
				},
			},
			{ upsert: true }
		).exec();
		if (!aiCompanion) {
			return new Error("AICompanion not found");
		}
		return;
	} catch (error) {
		oplog.error(getErrorMessage(error));
		return error as Error;
	}
}

export const AICompanionRepository = {
	findByUserAndCompanion,
	create,
	pushMessage,
};
