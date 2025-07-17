import { AICompanionService } from "../services/ai_companion/ai_companion_serv_interface";
import { TokensService } from "../services/tokens/tokens_serv_interface";
import { UserService } from "../services/users/users_serv_interface";

export const providersInterface = {
	tokens: TokensService,
	users: UserService,
	AICompanions: AICompanionService,
};
