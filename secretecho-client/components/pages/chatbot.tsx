"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { companions } from "@/config/companions";
import { useUserContext } from "@/context/userContext";
import { useWebSocketContext } from "@/context/webSocketContext";
import { useChatHistory } from "@/hooks/useChatHistory";
import useChatStore from "@/hooks/useChatStore";
import { useDelay } from "@/hooks/useDelay";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, SendHorizontal, Smile } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChatInput } from "../atoms/chat-input";
import { ChatMessageList } from "../atoms/chat-message-list";
import { ChatBubble, ChatBubbleMessage } from "../molecules/chat-bubble";

const CompanionChatbot = () => {
	const input = useChatStore((state) => state.input);
	const setInput = useChatStore((state) => state.setInput);
	const handleInputChange = useChatStore((state) => state.handleInputChange);
	const searchParams = useSearchParams();
	const initialCompanionCode = searchParams?.get("companion_code");
	const { client, connected, connect, disconnect } = useWebSocketContext();
	const { userData } = useUserContext();
	const [selectedCompanionCode, setSelectedCompanionCode] = useState<string | null>(initialCompanionCode || null);
	const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
	const { messages, setMessages, loadingChats } = useChatHistory(selectedCompanionCode);
	const [isLoading, setIsLoading] = useState(false);
	const delay = useDelay();
	const delayRef = useRef<typeof delay>(delay);
	const setMessageRef = useRef<typeof setMessages>(setMessages);
	const messagesContainerRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLTextAreaElement>(null);
	const formRef = useRef<HTMLFormElement>(null);

	const getMessageVariant = (role: string) => (role === "assistant" ? "received" : "sent");

	const router = useRouter();

	useEffect(() => {
		setMessageRef.current = setMessages;
		delayRef.current = delay;
	}, [setMessages, delay]);

	useEffect(() => {
		if (!selectedCompanionCode || !client || loadingChats) return;

		connect();
		return () => {
			disconnect();
		};
	}, [client, connect, disconnect, selectedCompanionCode, loadingChats]);

	useEffect(() => {
		if (!selectedCompanionCode && !setMessageRef.current && !delayRef.current) return;

		const handleMessage = async (data: { response: string }) => {
			setIsLoading(true);
			await delayRef.current(1000);

			const aiMessage = {
				role: "assistant" as const,
				content: data.response,
				timestamp: new Date().toISOString(),
				isLoading: false,
			};

			setMessageRef.current((prev) => prev.filter((msg) => !msg.isLoading).concat(aiMessage));
			setIsLoading(false);
		};

		client.on("message", handleMessage);

		return () => {
			client.off("message", handleMessage);
		};
	}, [client, selectedCompanionCode]);

	useEffect(() => {
		if (messagesContainerRef.current) {
			messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
		}
	}, [messages]);

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			handleSendMessage(e as unknown as React.FormEvent<HTMLFormElement>);
		}
	};

	const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!input.trim() || !connected || !selectedCompanionCode) return;

		const message = {
			role: "user" as const,
			content: input,
			timestamp: new Date().toISOString(),
		};

		setMessages((prev) => [...prev, message]);

		const loadingMessage = {
			role: "assistant" as const,
			content: "",
			timestamp: new Date().toISOString(),
			isLoading: true,
		};

		setMessages((prev) => [...prev, loadingMessage]);
		setIsLoading(true);

		client.send({ message: input });

		setInput("");
		formRef.current?.reset();
	};

	const handleEmojiClick = (emojiData: EmojiClickData) => {
		setInput(input + emojiData.emoji);
		setIsEmojiPickerOpen(false);
	};

	const handleCompanionSelect = (companionCode: string) => {
		setSelectedCompanionCode(companionCode);
		router.push(`/chat?companion_code=${companionCode}`);

		setMessages([]); // Clear messages when switching companions
	};

	const companion = selectedCompanionCode ? companions.find((c) => c.companion_code === selectedCompanionCode) : null;

	return (
		<div className=" ">
			<div className="container mx-auto px-4 py-3 flex flex-col lg:flex-row gap-6">
				{/* Sidebar: Companion List */}
				<div className="lg:w-1/4 w-full">
					<Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl border border-purple-700/90 dark:border-purple-300/90 rounded-xl">
						<CardHeader>
							<CardTitle className="text-2xl text-indigo-900 dark:text-indigo-200">Your Companions</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{companions.map((companion) => (
								<motion.div
									key={companion.id}
									whileHover={{ scale: 1.02 }}
									whileTap={{ scale: 0.98 }}
									className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-colors duration-200 ${
										selectedCompanionCode === companion.companion_code
											? "bg-indigo-100 dark:bg-indigo-900/50"
											: "hover:bg-indigo-50 dark:hover:bg-gray-700/50"
									}`}
									onClick={() => handleCompanionSelect(companion.companion_code)}
								>
									<div className="relative flex-shrink-0 w-12 h-12 rounded-full overflow-hidden ring-2 ring-indigo-600 dark:ring-indigo-400">
										<Image
											src={companion.avatarUrl}
											alt={`${companion.name} avatar`}
											height={48}
											width={48}
											className="object-cover w-full h-full rounded-full"
										/>
									</div>
									<div className="flex-1 min-w-0">
										<p className="text-indigo-900 dark:text-indigo-200 font-semibold truncate">{companion.name}</p>
										<p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-1">{companion.description}</p>
									</div>
								</motion.div>
							))}
						</CardContent>
					</Card>
				</div>

				{/* Main Chat Area */}
				<div className="lg:w-3/4 w-full">
					{loadingChats ? (
						<div className="flex items-center justify-center h-[65vh]">
							<Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
						</div>
					) : !companion ? (
						<Card className="p-6 bg-white/80 dark:bg-gray-800/80 h-[65vh] flex items-center justify-center">
							<CardTitle className="text-red-500 dark:text-red-400 text-center">
								Select a companion to start chatting
							</CardTitle>
						</Card>
					) : (
						<Card className="bg-white/80 rounded-2xl dark:bg-gray-800/80 backdrop-blur-sm shadow-xl border border-purple-700/90 dark:border-purple-300/90">
							<CardHeader>
								<div className="flex items-center gap-4">
									<div className="relative w-16 h-16 rounded-full overflow-hidden ring-2 ring-indigo-600 dark:ring-indigo-400">
										<Image src={companion.avatarUrl} alt={`${companion.name} avatar`} fill className="object-cover" />
									</div>
									<div>
										<CardTitle className="text-2xl text-indigo-900 dark:text-indigo-200">{companion.name}</CardTitle>
										<p className="text-gray-600 dark:text-gray-300">{companion.description}</p>
									</div>
								</div>
							</CardHeader>
							<CardContent>
								<div className="h-[65vh] w-full bg-gray-50 dark:bg-gray-700 rounded-lg">
									<div className="flex h-full w-full flex-col">
										<div className="flex-1 w-full overflow-y-auto bg-muted/40 dark:bg-muted/80">
											<ChatMessageList ref={messagesContainerRef}>
												<AnimatePresence>
													{messages.map((message, index) => {
														const variant = getMessageVariant(message.role!);
														const firstLetter =
															message.role === "assistant"
																? companion.name[0].toUpperCase() || "C"
																: userData?.first_name[0].toUpperCase() || "G";
														return (
															<motion.div
																key={index}
																layout
																initial={{ opacity: 0, scale: 1, y: 50, x: 0 }}
																animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
																exit={{ opacity: 0, scale: 1, y: 1, x: 0 }}
																transition={{
																	opacity: { duration: 0.1 },
																	layout: {
																		type: "spring",
																		bounce: 0.3,
																		duration: index * 0.05 + 0.2,
																	},
																}}
																style={{ originX: 0.5, originY: 0.5 }}
																className="flex flex-col gap-2 p-4"
															>
																<ChatBubble key={index} variant={variant}>
																	<Avatar>
																		<AvatarImage
																			src={message.role === "assistant" ? "" : message?.avatar}
																			alt={`${message.role === "assistant" ? companion.name : "User"} avatar`}
																			className={message.role === "assistant" ? "dark:invert" : ""}
																		/>
																		<AvatarFallback
																			className={
																				message.role === "assistant"
																					? "bg-indigo-500 dark:bg-indigo-600 text-white"
																					: "bg-purple-500 dark:bg-purple-600 text-white"
																			}
																		>
																			{firstLetter}
																		</AvatarFallback>
																	</Avatar>
																	<ChatBubbleMessage isLoading={message.isLoading}>{message.content}</ChatBubbleMessage>
																</ChatBubble>
															</motion.div>
														);
													})}
												</AnimatePresence>
											</ChatMessageList>
										</div>
										<div className="px-4 pb-4 bg-muted/40 dark:bg-muted/80">
											<form
												ref={formRef}
												onSubmit={handleSendMessage}
												className="relative rounded-lg border bg-background dark:bg-gray-800 dark:border-gray-600 focus-within:ring-1 focus-within:ring-indigo-600 dark:focus-within:ring-indigo-400"
											>
												<div className="flex items-center">
													<ChatInput
														ref={inputRef}
														onKeyDown={handleKeyDown}
														onChange={handleInputChange}
														value={input} // Bind input state
														placeholder="Type your message here..."
														className="min-h-12 resize-none rounded-lg bg-background dark:bg-gray-800 dark:text-white border-0 p-3 pr-20 shadow-none focus-visible:ring-0 flex-1"
													/>
													<Popover open={isEmojiPickerOpen} onOpenChange={setIsEmojiPickerOpen}>
														<PopoverTrigger asChild>
															<Button
																type="button"
																size="icon"
																className="absolute cursor-pointer right-12 top-1/2 -translate-y-1/2 bg-transparent hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400"
															>
																<Smile className="w-5 h-5" />
															</Button>
														</PopoverTrigger>
														<PopoverContent className="p-0 border-none bg-transparent">
															<EmojiPicker onEmojiClick={handleEmojiClick} />
														</PopoverContent>
													</Popover>
													<Button
														disabled={!input || isLoading}
														type="submit"
														size="sm"
														className="absolute cursor-pointer right-2 top-1/2 -translate-y-1/2 gap-1.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white"
													>
														<SendHorizontal className="size-3.5" />
													</Button>
												</div>
											</form>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					)}
				</div>
			</div>
		</div>
	);
};

export default CompanionChatbot;
