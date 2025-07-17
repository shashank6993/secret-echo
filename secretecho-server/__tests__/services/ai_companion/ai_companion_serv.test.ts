import { SecretEchoContext } from "../../../middleware/context";
import oplog from "../../../oplog/oplog";
import {
	createAICompanion,
	getAICompanionChatHistory,
	saveAICompanionMessage,
} from "../../../services/ai_companion/ai_companion_serv";

// Mock dependencies
jest.mock("../../../oplog/oplog", () => ({
	error: jest.fn(),
	info: jest.fn(),
}));

// Mock SecretEchoContext
const mockDbProviders = {
	user: {
		findByPid: jest.fn(),
	},
	AICompanion: {
		findByUserAndCompanion: jest.fn(),
		create: jest.fn(),
		pushMessage: jest.fn(),
	},
};

const mockContext: SecretEchoContext = {
	dbProviders: mockDbProviders,
	SessionPID: "session-123",
	Authorization: "",
	UserPID: "",
	entities: {} as any,
} as any;

describe("AICompanionService", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("createAICompanion", () => {
		const userPid = "user-123";
		const companionCode = "companion-456";

		it("should create an AI companion successfully", async () => {
			const user = { _id: "mongo-user-123", pid: userPid };
			mockDbProviders.user.findByPid.mockResolvedValue(user);
			mockDbProviders.AICompanion.findByUserAndCompanion.mockResolvedValue(null);
			mockDbProviders.AICompanion.create.mockResolvedValue({});

			const result = await createAICompanion(mockContext, userPid, companionCode);

			expect(mockDbProviders.user.findByPid).toHaveBeenCalledWith(mockContext, userPid);
			expect(mockDbProviders.AICompanion.findByUserAndCompanion).toHaveBeenCalledWith(
				mockContext,
				user._id,
				companionCode
			);
			expect(mockDbProviders.AICompanion.create).toHaveBeenCalledWith(mockContext, user._id, companionCode);
			expect(result).toBeUndefined();
		});

		it("should return error if user not found", async () => {
			mockDbProviders.user.findByPid.mockResolvedValue(null);

			const result = await createAICompanion(mockContext, userPid, companionCode);

			expect(mockDbProviders.user.findByPid).toHaveBeenCalledWith(mockContext, userPid);
			expect(oplog.error).toHaveBeenCalledWith(`User not found for user_pid: ${userPid}`);
			expect(result).toEqual(new Error("User not found"));
		});

		it("should return error if findByPid fails", async () => {
			const error = new Error("Database error");
			mockDbProviders.user.findByPid.mockResolvedValue(error);

			const result = await createAICompanion(mockContext, userPid, companionCode);

			expect(mockDbProviders.user.findByPid).toHaveBeenCalledWith(mockContext, userPid);
			expect(oplog.error).toHaveBeenCalledWith(`user not found: ${error.message}`);
			expect(result).toEqual(error);
		});

		it("should return error if findByUserAndCompanion fails", async () => {
			const user = { _id: "mongo-user-123", pid: userPid };
			const error = new Error("Database error");
			mockDbProviders.user.findByPid.mockResolvedValue(user);
			mockDbProviders.AICompanion.findByUserAndCompanion.mockResolvedValue(error);

			const result = await createAICompanion(mockContext, userPid, companionCode);

			expect(mockDbProviders.AICompanion.findByUserAndCompanion).toHaveBeenCalledWith(
				mockContext,
				user._id,
				companionCode
			);
			expect(oplog.error).toHaveBeenCalledWith(error.message);
			expect(result).toEqual(error);
		});

		it("should return error if create fails", async () => {
			const user = { _id: "mongo-user-123", pid: userPid };
			const error = new Error("Creation failed");
			mockDbProviders.user.findByPid.mockResolvedValue(user);
			mockDbProviders.AICompanion.findByUserAndCompanion.mockResolvedValue(null);
			mockDbProviders.AICompanion.create.mockResolvedValue(error);

			const result = await createAICompanion(mockContext, userPid, companionCode);

			expect(mockDbProviders.AICompanion.create).toHaveBeenCalledWith(mockContext, user._id, companionCode);
			expect(oplog.error).toHaveBeenCalledWith(error.message);
			expect(result).toEqual(error);
		});

		it("should not create if companion already exists", async () => {
			const user = { _id: "mongo-user-123", pid: userPid };
			const existingCompanion = { userId: user._id, companionCode };
			mockDbProviders.user.findByPid.mockResolvedValue(user);
			mockDbProviders.AICompanion.findByUserAndCompanion.mockResolvedValue(existingCompanion);

			const result = await createAICompanion(mockContext, userPid, companionCode);

			expect(mockDbProviders.AICompanion.findByUserAndCompanion).toHaveBeenCalledWith(
				mockContext,
				user._id,
				companionCode
			);
			expect(mockDbProviders.AICompanion.create).not.toHaveBeenCalled();
			expect(result).toBeUndefined();
		});
	});

	describe("saveAICompanionMessage", () => {
		const userPid = "user-123";
		const companionCode = "companion-456";
		const content = "Hello!";
		const sender = "user";

		it("should save a message successfully", async () => {
			const user = { _id: "mongo-user-123", pid: userPid };
			mockDbProviders.user.findByPid.mockResolvedValue(user);
			mockDbProviders.AICompanion.pushMessage.mockResolvedValue({});

			const result = await saveAICompanionMessage(mockContext, userPid, companionCode, content, sender);

			expect(mockDbProviders.user.findByPid).toHaveBeenCalledWith(mockContext, userPid);
			expect(mockDbProviders.AICompanion.pushMessage).toHaveBeenCalledWith(mockContext, user._id, companionCode, {
				content,
				sender,
				timestamp: expect.any(Date),
			});
			expect(result).toBeUndefined();
		});

		it("should return error if user not found", async () => {
			mockDbProviders.user.findByPid.mockResolvedValue(null);

			const result = await saveAICompanionMessage(mockContext, userPid, companionCode, content, sender);

			expect(mockDbProviders.user.findByPid).toHaveBeenCalledWith(mockContext, userPid);
			expect(oplog.error).toHaveBeenCalledWith(`User not found for user_pid: ${userPid}`);
			expect(result).toEqual(new Error("User not found"));
		});

		it("should return error if findByPid fails", async () => {
			const error = new Error("Database error");
			mockDbProviders.user.findByPid.mockResolvedValue(error);

			const result = await saveAICompanionMessage(mockContext, userPid, companionCode, content, sender);

			expect(mockDbProviders.user.findByPid).toHaveBeenCalledWith(mockContext, userPid);
			expect(oplog.error).toHaveBeenCalledWith(`user not found: ${error.message}`);
			expect(result).toEqual(error);
		});

		it("should return error if pushMessage fails", async () => {
			const user = { _id: "mongo-user-123", pid: userPid };
			const error = new Error("Push message failed");
			mockDbProviders.user.findByPid.mockResolvedValue(user);
			mockDbProviders.AICompanion.pushMessage.mockResolvedValue(error);

			const result = await saveAICompanionMessage(mockContext, userPid, companionCode, content, sender);

			expect(mockDbProviders.AICompanion.pushMessage).toHaveBeenCalledWith(
				mockContext,
				user._id,
				companionCode,
				expect.any(Object)
			);
			expect(oplog.error).toHaveBeenCalledWith(error.message);
			expect(result).toEqual(error);
		});
	});

	describe("getAICompanionChatHistory", () => {
		const userPid = "user-123";
		const companionCode = "companion-456";

		it("should return chat history successfully", async () => {
			const user = { _id: "mongo-user-123", pid: userPid };
			const chatHistory = [{ content: "Hello", sender: "user", timestamp: new Date() }];
			const aiCompanion = { chat: chatHistory };
			mockDbProviders.user.findByPid.mockResolvedValue(user);
			mockDbProviders.AICompanion.findByUserAndCompanion.mockResolvedValue(aiCompanion);

			const result = await getAICompanionChatHistory(mockContext, userPid, companionCode);

			expect(mockDbProviders.user.findByPid).toHaveBeenCalledWith(mockContext, userPid);
			expect(mockDbProviders.AICompanion.findByUserAndCompanion).toHaveBeenCalledWith(
				mockContext,
				user._id,
				companionCode
			);
			expect(result).toEqual(chatHistory);
		});

		it("should return empty array if no companion exists", async () => {
			const user = { _id: "mongo-user-123", pid: userPid };
			mockDbProviders.user.findByPid.mockResolvedValue(user);
			mockDbProviders.AICompanion.findByUserAndCompanion.mockResolvedValue(null);

			const result = await getAICompanionChatHistory(mockContext, userPid, companionCode);

			expect(mockDbProviders.AICompanion.findByUserAndCompanion).toHaveBeenCalledWith(
				mockContext,
				user._id,
				companionCode
			);
			expect(result).toEqual([]);
		});

		it("should return error if user not found", async () => {
			mockDbProviders.user.findByPid.mockResolvedValue(null);

			const result = await getAICompanionChatHistory(mockContext, userPid, companionCode);

			expect(mockDbProviders.user.findByPid).toHaveBeenCalledWith(mockContext, userPid);
			expect(oplog.error).toHaveBeenCalledWith(`User not found for user_pid: ${userPid}`);
			expect(result).toEqual(new Error("User not found"));
		});

		it("should return error if findByPid fails", async () => {
			const error = new Error("Database error");
			mockDbProviders.user.findByPid.mockResolvedValue(error);

			const result = await getAICompanionChatHistory(mockContext, userPid, companionCode);

			expect(mockDbProviders.user.findByPid).toHaveBeenCalledWith(mockContext, userPid);
			expect(oplog.error).toHaveBeenCalledWith(`user not found: ${error.message}`);
			expect(result).toEqual(error);
		});

		it("should return error if findByUserAndCompanion fails", async () => {
			const user = { _id: "mongo-user-123", pid: userPid };
			const error = new Error("Database error");
			mockDbProviders.user.findByPid.mockResolvedValue(user);
			mockDbProviders.AICompanion.findByUserAndCompanion.mockResolvedValue(error);

			const result = await getAICompanionChatHistory(mockContext, userPid, companionCode);

			expect(mockDbProviders.AICompanion.findByUserAndCompanion).toHaveBeenCalledWith(
				mockContext,
				user._id,
				companionCode
			);
			expect(oplog.error).toHaveBeenCalledWith(error.message);
			expect(result).toEqual(error);
		});
	});
});
