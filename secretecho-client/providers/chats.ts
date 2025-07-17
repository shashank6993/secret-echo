import { frontendAxios } from "@/config/axios";
import { ChatMessage, CreateAICompanionRequest, CreateAICompanionResponse } from "@/types/chats.types";
import { T_SEResponse } from "@/types/request_response.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosInstance, AxiosResponse } from "axios";

/**
 * Creates a new chat for a given companion code.
 * @param chat The chat creation request containing the companion code.
 * @param axiosInstance The Axios instance to use for the request.
 * @returns A promise that resolves to the creation response or null.
 * @throws Error if the request fails or the response is invalid.
 */
export const createAIChatCompanion = async (
	chat: CreateAICompanionRequest,
	axiosInstance: AxiosInstance = frontendAxios
): Promise<CreateAICompanionResponse | null> => {
	const response = await axiosInstance.post<
		CreateAICompanionRequest,
		AxiosResponse<T_SEResponse<CreateAICompanionResponse>>
	>("/create/chat", chat);

	if (response.data.success !== true) {
		throw new Error(response.data.errors[0] || "Failed to create chat");
	}

	return response.data.data || null;
};

/**
 * Fetches chat history for a given companion code.
 * @param axiosInstance The Axios instance to use for the request.
 * @param companionCode The companion code to fetch chats for.
 * @returns A promise that resolves to an array of chat messages.
 * @throws Error if the request fails or the response is invalid.
 */

export const fetchChatByCompanionCode = async (
	axiosInstance: AxiosInstance,
	companionCode: string
): Promise<ChatMessage[]> => {
	try {
		const response = await axiosInstance.get<null, AxiosResponse<T_SEResponse<ChatMessage[]>>>(`/chat_history`, {
			params: {
				companion_code: companionCode,
			},
		});
		if (!response.data.success) {
			throw new Error(response.data.errors[0] || "Failed to fetch chat history");
		}
		return response.data.data || [];
	} catch (err) {
		throw new Error(`Error fetching chat history: ${err instanceof Error ? err.message : "Unknown error"}`);
	}
};

/**
 * Hook to fetch chat history for a companion code using React Query.
 * @param companionCode The companion code to fetch chats for.
 * @param initialData Optional initial data for the chats.
 * @returns A React Query instance to manage the chat history.
 */
export const useGetChatsByCompanionCode = (companionCode: string | null, initialData?: ChatMessage[]) => {
	return useQuery<ChatMessage[], Error>({
		queryKey: ["chats", companionCode],
		queryFn: () => {
			if (!companionCode) {
				throw new Error("Companion code is required");
			}
			return fetchChatByCompanionCode(frontendAxios, companionCode);
		},
		enabled: !!companionCode,
		initialData: companionCode ? initialData : [],
	});
};

/**
 * Hook to create a new AI chat companion using React Query.
 * @returns A React Query mutation instance to create a chat companion.
 */
export const useCreateAIChatCompanion = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (createAiChatCompanion: CreateAICompanionRequest) =>
			createAIChatCompanion(createAiChatCompanion, frontendAxios),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["createAIChatCompanion"] });
		},
	});
};
