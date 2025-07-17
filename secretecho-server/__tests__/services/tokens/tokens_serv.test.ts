import { TokenTypes } from "../../../constants/tokens";
import { SecretEchoContext } from "../../../middleware/context";
import { generateJWT, GenerateSessionTokenDataSchema } from "../../../models/token";
import oplog from "../../../oplog/oplog";
import { create } from "../../../services/tokens/tokens_serv";
import { validateDataUsingJOI } from "../../../utils/validator";

// Mock dependencies
jest.mock("../../../oplog/oplog", () => ({
	error: jest.fn(),
	info: jest.fn(),
}));
jest.mock("../../../utils/validator", () => ({
	validateDataUsingJOI: jest.fn(),
}));
jest.mock("../../../models/token", () => ({
	generateJWT: jest.fn(),
	GenerateSessionTokenDataSchema: {}, // Mock the schema as an empty object for testing
}));

// Mock SecretEchoContext
const mockDbProviders = {
	user: {
		findByPid: jest.fn(),
	},
	Session: {
		create: jest.fn(),
	},
};

const mockContext: SecretEchoContext = {
	dbProviders: mockDbProviders,
	SessionPID: "session-123",
	Authorization: "",
	UserPID: "",
	entities: {} as any,
} as any;

describe("TokensService", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("create", () => {
		const tokenData = {
			user_pid: "user-123",
			expiry_at: new Date(Date.now() + 1000 * 60 * 60), // 1 hour from now
		};

		it("should create a session token successfully", async () => {
			const user = { _id: "mongo-user-123", user_pid: tokenData.user_pid };
			const session = { session_pid: "session-123" };
			const token = "jwt-token";

			(validateDataUsingJOI as jest.Mock).mockReturnValue(tokenData);
			mockDbProviders.user.findByPid.mockResolvedValue(user);
			mockDbProviders.Session.create.mockResolvedValue(session);
			(generateJWT as jest.Mock).mockReturnValue(token);

			const result = await create(mockContext, TokenTypes.SESSION_TOKEN, tokenData);

			expect(validateDataUsingJOI).toHaveBeenCalledWith(tokenData, GenerateSessionTokenDataSchema);
			expect(mockDbProviders.user.findByPid).toHaveBeenCalledWith(mockContext, tokenData.user_pid);
			expect(mockDbProviders.Session.create).toHaveBeenCalledWith(mockContext, {
				user_id: user._id,
				expiry_at: tokenData.expiry_at,
			});
			expect(generateJWT).toHaveBeenCalledWith({
				session_id: session.session_pid,
				user_id: user.user_pid,
				exp: tokenData.expiry_at.getTime(),
			});
			expect(result).toEqual({
				type: TokenTypes.SESSION_TOKEN,
				data: tokenData,
				token,
			});
		});

		it("should return error for invalid token type", async () => {
			const result = await create(mockContext, "INVALID_TYPE", tokenData);

			expect(oplog.error).toHaveBeenCalledWith("invalid token type: INVALID_TYPE");
			expect(result).toEqual(new Error("invalid token type: INVALID_TYPE"));
		});

		it("should return error if validation fails", async () => {
			const error = new Error("Validation failed");
			(validateDataUsingJOI as jest.Mock).mockReturnValue(error);

			const result = await create(mockContext, TokenTypes.SESSION_TOKEN, tokenData);

			expect(validateDataUsingJOI).toHaveBeenCalledWith(tokenData, GenerateSessionTokenDataSchema);
			expect(oplog.error).toHaveBeenCalledWith(`invalid token data: ${error.message}`);
			expect(result).toEqual(error);
		});

		it("should return error if user not found", async () => {
			(validateDataUsingJOI as jest.Mock).mockReturnValue(tokenData);
			mockDbProviders.user.findByPid.mockResolvedValue(null);

			const result = await create(mockContext, TokenTypes.SESSION_TOKEN, tokenData);

			expect(mockDbProviders.user.findByPid).toHaveBeenCalledWith(mockContext, tokenData.user_pid);
			expect(oplog.error).toHaveBeenCalledWith(`User not found for user_pid: ${tokenData.user_pid}`);
			expect(result).toEqual(new Error("User not found"));
		});

		it("should return error if findByPid fails", async () => {
			const error = new Error("Database error");
			(validateDataUsingJOI as jest.Mock).mockReturnValue(tokenData);
			mockDbProviders.user.findByPid.mockResolvedValue(error);

			const result = await create(mockContext, TokenTypes.SESSION_TOKEN, tokenData);

			expect(mockDbProviders.user.findByPid).toHaveBeenCalledWith(mockContext, tokenData.user_pid);
			expect(oplog.error).toHaveBeenCalledWith(`user not found: ${error.message}`);
			expect(result).toEqual(error);
		});

		it("should return error if session creation fails", async () => {
			const user = { _id: "mongo-user-123", user_pid: tokenData.user_pid };
			const error = new Error("Session creation failed");
			(validateDataUsingJOI as jest.Mock).mockReturnValue(tokenData);
			mockDbProviders.user.findByPid.mockResolvedValue(user);
			mockDbProviders.Session.create.mockResolvedValue(error);

			const result = await create(mockContext, TokenTypes.SESSION_TOKEN, tokenData);

			expect(mockDbProviders.Session.create).toHaveBeenCalledWith(mockContext, expect.any(Object));
			expect(oplog.error).toHaveBeenCalledWith(`could not create session: ${error.message}`);
			expect(result).toEqual(error);
		});

		it("should return error if JWT generation fails", async () => {
			const user = { _id: "mongo-user-123", user_pid: tokenData.user_pid };
			const session = { session_pid: "session-123" };
			const error = new Error("JWT generation failed");
			(validateDataUsingJOI as jest.Mock).mockReturnValue(tokenData);
			mockDbProviders.user.findByPid.mockResolvedValue(user);
			mockDbProviders.Session.create.mockResolvedValue(session);
			(generateJWT as jest.Mock).mockReturnValue(error);

			const result = await create(mockContext, TokenTypes.SESSION_TOKEN, tokenData);

			expect(generateJWT).toHaveBeenCalledWith(expect.any(Object));
			expect(oplog.error).toHaveBeenCalledWith(`could not generate jwt: ${error.message}`);
			expect(result).toEqual(error);
		});
	});
});
