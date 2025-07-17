import { AICompanionRepository } from "../repositories/ai_companion/ai_companion_repo";
import { SessionRepository } from "../repositories/sessions/sessions_repo_interface";
import { UserRepository } from "../repositories/users/users_repo_interface";

export const dbProvidersInterface = {
	Session: SessionRepository,
	user: UserRepository,
	AICompanion: AICompanionRepository	
};
