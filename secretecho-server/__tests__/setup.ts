// Mock oplog globally since it's used in many services
jest.mock("../oplog/oplog", () => ({
	error: jest.fn(),
	info: jest.fn(),
}));
