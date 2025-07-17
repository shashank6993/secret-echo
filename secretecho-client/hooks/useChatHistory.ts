import { useGetChatsByCompanionCode } from "@/providers/chats";
import { Message } from "@/types/chats.types";
import { useEffect, useState } from "react";

export function useChatHistory(companionCode: string | null) {
	const [messages, setMessages] = useState<Message[]>([]);
	const [historyForTool, setHistoryForTool] = useState<Message[] | null>(null);

	const { data: chatData, isFetching: loadingChats } = useGetChatsByCompanionCode(companionCode);

	useEffect(() => {
		// Process chat data
		if (chatData && chatData.length > 0) {
			const mappedMessages: Message[] = chatData.map((msg) => ({
				role: msg.sender === "user" ? "user" : "assistant",
				content: msg.content,
				timestamp: msg.timestamp,
			}));
			setMessages(mappedMessages);
			setHistoryForTool(mappedMessages);
		} else {
			setMessages([]);
			setHistoryForTool(null);
		}
	}, [companionCode, chatData]);

	return {
		messages,
		setMessages,
		historyForTool,
		loadingChats,
	};
}
