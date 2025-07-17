import bcrypt from "bcrypt";
import { SecretEchoContext } from "../../../middleware/context";
import oplog from "../../../oplog/oplog";
import { getUserDetails, login, logout, signup } from "../../../services/users/users_serv";

// Mock dependencies
jest.mock("bcrypt");
jest.mock("../../../oplog/oplog", () => ({
	error: jest.fn(),
	info: jest.fn(),
}));

// Mock SecretEchoContext
const mockDbProviders = {
	user: {
		findByEmail: jest.fn(),
		create: jest.fn(),
		findByPid: jest.fn(),
	},
	Session: {
		deleteByPid: jest.fn(),
	},
};

const mockContext: SecretEchoContext = {
	dbProviders: mockDbProviders,
	SessionPID: "session-123",
	Authorization: "",
	UserPID: "",
	entities: {} as any,
} as any;

describe("UserService", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("signup", () => {
		const signupData = {
			email: "test@example.com",
			password: "password123",
			first_name: "John",
			last_name: "Doe",
		};

		it("should create a new user successfully", async () => {
			const hashedPassword = "hashedPassword";
			const savedUser = {
				email: signupData.email,
				password: hashedPassword,
				first_name: signupData.first_name,
				last_name: signupData.last_name,
				pid: "user-123",
			};

			mockDbProviders.user.findByEmail.mockResolvedValue(null);
			(bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
			mockDbProviders.user.create.mockResolvedValue(savedUser);

			const result = await signup(mockContext, signupData);

			expect(mockDbProviders.user.findByEmail).toHaveBeenCalledWith(mockContext, signupData.email);
			expect(bcrypt.hash).toHaveBeenCalledWith(signupData.password, 10);
			expect(mockDbProviders.user.create).toHaveBeenCalledWith(mockContext, {
				...signupData,
				password: hashedPassword,
			});
			expect(oplog.info).toHaveBeenCalledWith(`User created successfully: ${savedUser.email}`);
			expect(result).toEqual(savedUser);
		});

		it("should return error if user already exists", async () => {
			const existingUser = {
				email: signupData.email,
				first_name: signupData.first_name,
				last_name: signupData.last_name,
				pid: "user-123",
			};

			mockDbProviders.user.findByEmail.mockResolvedValue(existingUser);

			const result = await signup(mockContext, signupData);

			expect(mockDbProviders.user.findByEmail).toHaveBeenCalledWith(mockContext, signupData.email);
			expect(oplog.error).toHaveBeenCalledWith(`User with email ${signupData.email} already exists`);
			expect(result).toEqual(new Error("User with this email already exists"));
		});

		it("should return error if findByEmail fails", async () => {
			const error = new Error("Database error");
			mockDbProviders.user.findByEmail.mockResolvedValue(error);

			const result = await signup(mockContext, signupData);

			expect(mockDbProviders.user.findByEmail).toHaveBeenCalledWith(mockContext, signupData.email);
			expect(oplog.error).toHaveBeenCalledWith(`Error checking existing user: ${error.message}`);
			expect(result).toEqual(error);
		});

		it("should return error if user creation fails", async () => {
			const hashedPassword = "hashedPassword";
			const error = new Error("Creation failed");

			mockDbProviders.user.findByEmail.mockResolvedValue(null);
			(bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
			mockDbProviders.user.create.mockResolvedValue(error);

			const result = await signup(mockContext, signupData);

			expect(mockDbProviders.user.create).toHaveBeenCalledWith(mockContext, {
				...signupData,
				password: hashedPassword,
			});
			expect(oplog.error).toHaveBeenCalledWith(`Error creating user: ${error.message}`);
			expect(result).toEqual(error);
		});
	});

	describe("login", () => {
		const loginData = { email: "test@example.com", password: "password123" };

		it("should login user successfully", async () => {
			const user = { email: loginData.email, password: "hashedPassword", pid: "user-123" };

			mockDbProviders.user.findByEmail.mockResolvedValue(user);
			(bcrypt.compare as jest.Mock).mockResolvedValue(true);

			const result = await login(mockContext, loginData);

			expect(mockDbProviders.user.findByEmail).toHaveBeenCalledWith(mockContext, loginData.email);
			expect(bcrypt.compare).toHaveBeenCalledWith(loginData.password, user.password);
			expect(oplog.info).toHaveBeenCalledWith(`User logged in successfully: ${user.email}`);
			expect(result).toEqual(user);
		});

		it("should return error if user not found", async () => {
			mockDbProviders.user.findByEmail.mockResolvedValue(null);

			const result = await login(mockContext, loginData);

			expect(mockDbProviders.user.findByEmail).toHaveBeenCalledWith(mockContext, loginData.email);
			expect(oplog.error).toHaveBeenCalledWith(`Invalid credentials for email: ${loginData.email}`);
			expect(result).toEqual(new Error("Invalid credentials"));
		});

		it("should return error if password is invalid", async () => {
			const user = { email: loginData.email, password: "hashedPassword", pid: "user-123" };

			mockDbProviders.user.findByEmail.mockResolvedValue(user);
			(bcrypt.compare as jest.Mock).mockResolvedValue(false);

			const result = await login(mockContext, loginData);

			expect(bcrypt.compare).toHaveBeenCalledWith(loginData.password, user.password);
			expect(oplog.error).toHaveBeenCalledWith(`Invalid password for email: ${loginData.email}`);
			expect(result).toEqual(new Error("Invalid credentials"));
		});

		it("should return error if findByEmail fails", async () => {
			const error = new Error("Database error");
			mockDbProviders.user.findByEmail.mockResolvedValue(error);

			const result = await login(mockContext, loginData);

			expect(mockDbProviders.user.findByEmail).toHaveBeenCalledWith(mockContext, loginData.email);
			expect(oplog.error).toHaveBeenCalledWith(`Error finding user: ${error.message}`);
			expect(result).toEqual(error);
		});
	});

	describe("getUserDetails", () => {
		const userPid = "user-123";

		it("should return user details successfully", async () => {
			const user = { email: "test@example.com", pid: userPid };

			mockDbProviders.user.findByPid.mockResolvedValue(user);

			const result = await getUserDetails(mockContext, userPid);

			expect(mockDbProviders.user.findByPid).toHaveBeenCalledWith(mockContext, userPid);
			expect(result).toEqual(user);
		});

		it("should return error if user not found", async () => {
			mockDbProviders.user.findByPid.mockResolvedValue(null);

			const result = await getUserDetails(mockContext, userPid);

			expect(mockDbProviders.user.findByPid).toHaveBeenCalledWith(mockContext, userPid);
			expect(oplog.error).toHaveBeenCalledWith(`User not found for PID: ${userPid}`);
			expect(result).toEqual(new Error("User not found"));
		});

		it("should return error if findByPid fails", async () => {
			const error = new Error("Database error");
			mockDbProviders.user.findByPid.mockResolvedValue(error);

			const result = await getUserDetails(mockContext, userPid);

			expect(mockDbProviders.user.findByPid).toHaveBeenCalledWith(mockContext, userPid);
			expect(oplog.error).toHaveBeenCalledWith(`Error fetching user details: ${error.message}`);
			expect(result).toEqual(error);
		});
	});

	describe("logout", () => {
		it("should logout user successfully", async () => {
			mockDbProviders.Session.deleteByPid.mockResolvedValue(true);

			const result = await logout(mockContext);

			expect(mockDbProviders.Session.deleteByPid).toHaveBeenCalledWith(mockContext, mockContext.SessionPID);
			expect(result).toBeUndefined();
		});

		it("should return error if no session PID exists", async () => {
			const contextWithoutSession = { ...mockContext, SessionPID: "" };

			const result = await logout(contextWithoutSession);

			expect(oplog.error).toHaveBeenCalledWith("No session PID found in context for logout");
			expect(result).toEqual(new Error("No active session found"));
		});

		it("should return error if session deletion fails", async () => {
			const error = new Error("Session deletion failed");
			mockDbProviders.Session.deleteByPid.mockResolvedValue(error);

			const result = await logout(mockContext);

			expect(mockDbProviders.Session.deleteByPid).toHaveBeenCalledWith(mockContext, mockContext.SessionPID);
			expect(oplog.error).toHaveBeenCalledWith(`Could not logout user: ${error.message}`);
			expect(result).toEqual(error);
		});
	});
});
