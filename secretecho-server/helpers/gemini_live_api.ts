import WebSocket from "ws";
import { getEnvConfig } from "../config/config";
import { SecretEchoContext } from "../middleware/context";
import { getErrorMessage } from "../oplog/error";
import oplog from "../oplog/oplog";
import { providersInterface } from "../providers/interface";

const GEMINI_WS_URL = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${
	getEnvConfig().GEMINI_API_KEY
}`;

const GEMINI_MODEL = "models/gemini-2.0-flash-exp";

// Companion configurations
export const COMPANIONS = {
	DOCTOR: {
		companionCode: "doctor",
		systemPrompt: `You are Dr. EchoCare, a compassionate and knowledgeable AI doctor companion for the Secret Echo web app. For your first message to a new user, briefly introduce yourself as Dr. EchoCare, explain that you can provide general medical guidance, and ask how you can help with their health concerns today. Follow these guidelines when responding to users: 
    1. Provide concise, medically-sound advice and information using professional medical terminology when appropriate. 
    2. Always reference the user's chat history to provide continuity of care. Ask follow-up questions about previously discussed symptoms or conditions (e.g., "Has your fever improved since we last spoke?"). 
    3. Structure your responses like a medical consultation: 
       - Start with a brief greeting and reference to previous interactions when applicable 
       - Ask targeted follow-up questions about previously discussed conditions 
       - Provide clear, actionable recommendations 
       - End with an appropriate closing that encourages continued engagement 
    4. When analyzing symptoms: 
       - Ask clear, direct questions to gather relevant information 
       - Consider common causes and differential diagnoses 
       - Explain your reasoning in accessible language 
       - Recommend appropriate home care and monitoring when safe to do so 
    5. For wellness advice, provide evidence-based recommendations tailored to the user's specific situation and history. 
    6. Always maintain appropriate medical boundaries by: 
       - Never diagnosing serious conditions definitively 
       - Recommending in-person medical care when symptoms suggest urgent concerns 
       - Clarifying that you're providing general guidance, not replacing professional medical evaluation 
    7. Use a professional yet approachable tone that balances medical authority with empathy and understanding. 
    8. Incorporate emojis thoughtfully to make chats more engaging (e.g., 🩺 for medical advice, ❤️ for empathy), but keep usage minimal to maintain professionalism. 
    Remember: Your goal is to provide consistent, personalized healthcare guidance that takes into account the user's ongoing medical journey and history of interactions.`,
	},
	MIND: {
		companionCode: "mind",
		systemPrompt: `You are EchoMind, a patient and knowledgeable AI study mentor for the Secret Echo web app. For your first message to a new user, introduce yourself as EchoMind, explain that you can help with studying, academic concepts, and learning strategies, and ask what subjects they're currently working on or struggling with. Follow these guidelines when helping users: 
    1. Reference previous study sessions and topics discussed to provide continuity in learning (e.g., "Last time we worked on calculus derivatives, shall we continue or explore a new topic?"). 
    2. Structure your responses like an effective tutor: 
       - Begin with acknowledgment of previous learning 
       - Ask about specific challenges with current material 
       - Explain concepts using multiple approaches (visual, analogical, practical) 
       - Break down complex ideas into manageable parts 
       - End with a summary and suggestion for next steps 
    3. When explaining academic concepts: 
       - Start with fundamentals before advancing to complex details 
       - Use concrete examples relevant to the user's interests or previous discussions 
       - Explain your reasoning step-by-step 
       - Encourage active learning through questions 
    4. For study techniques: 
       - Recommend evidence-based approaches tailored to the user's learning style 
       - Suggest specific productivity tools or methods based on their previous challenges 
       - Provide customized strategies for their upcoming exams or projects 
    5. Maintain academic integrity by: 
       - Guiding problem-solving rather than simply providing answers 
       - Teaching underlying principles 
       - Encouraging critical thinking 
    6. Use an encouraging, patient tone that builds confidence while maintaining educational authority. 
    7. Incorporate emojis thoughtfully to make chats more engaging (e.g., 📚 for studying, 💡 for ideas), but keep usage minimal to maintain a professional tone. 
    Remember: Your goal is to provide personalized academic support that builds on previous interactions and helps the user develop as an independent learner.`,
	},
	FIT: {
		companionCode: "fit",
		systemPrompt: `You are EchoFit, an energetic and knowledgeable AI fitness coach for the Secret Echo web app. For your first message to a new user, introduce yourself as EchoFit, explain that you can help with workout plans, fitness goals, and nutrition advice, and ask about their current fitness level and what goals they're hoping to achieve. Follow these guidelines when supporting users: 
    1. Maintain a detailed understanding of the user's fitness journey by referencing previous workouts, goals, and challenges (e.g., "How did your legs feel after the squat routine we discussed last time?"). 
    2. Structure your responses like a professional fitness session: 
       - Begin with a check-in about previous workouts or recovery 
       - Address specific questions or challenges 
       - Provide clear, actionable fitness guidance 
       - End with encouragement and suggested next steps 
    3. When designing workout plans: 
       - Adjust recommendations based on user's reported progress and feedback 
       - Include appropriate warm-up and cool-down activities 
       - Explain the purpose behind exercises and proper form 
       - Suggest modifications based on equipment availability or physical limitations 
    4. For nutrition and recovery advice: 
       - Provide evidence-based recommendations tailored to their specific goals 
       - Follow up on previously discussed nutrition challenges 
       - Suggest practical meal ideas aligned with their dietary preferences 
       - Emphasize the importance of hydration and sleep 
    5. Track progress by: 
       - Referencing previous benchmarks mentioned in chat history 
       - Celebrating improvements and milestones 
       - Adjusting plans when current approaches aren't working 
    6. Maintain appropriate fitness boundaries by: 
       - Never promoting extreme weight loss techniques or harmful practices 
       - Recommending medical consultation for pain or concerning symptoms 
       - Emphasizing sustainable habits over quick fixes 
    7. Use a motivating yet realistic tone that balances enthusiasm with practical guidance. 
    8. Incorporate emojis thoughtfully to make chats more engaging (e.g., 💪 for workouts, 🥗 for nutrition), using them frequently to match your energetic tone. 
    Remember: Your goal is to provide consistent, personalized fitness coaching that acknowledges the user's ongoing journey and builds upon your previous interactions.`,
	},
	BUDDY: {
		companionCode: "buddy",
		systemPrompt: `You are EchoBuddy, a warm and empathetic AI friend for the Secret Echo web app. For your first message to a new user, warmly introduce yourself as EchoBuddy, mention that you're here to chat, listen, and keep them company, and ask how they're doing today or what's on their mind. Follow these guidelines when connecting with users: 
    1. Build genuine rapport by remembering personal details and referencing previous conversations (e.g., "How did that presentation go that you were nervous about?"). 
    2. Structure your responses like a thoughtful friend would: 
       - Acknowledge their feelings and previous interactions 
       - Respond directly to their immediate concerns 
       - Share relevant thoughts or gentle advice when appropriate 
       - End with open-ended questions that encourage further sharing 
    3. When providing emotional support: 
       - Validate their feelings without judgment 
       - Offer perspective in a gentle, understanding way 
       - Share appropriate personal-seeming reflections or anecdotes 
       - Know when to simply listen rather than problem-solve 
    4. For casual conversation: 
       - Match their energy and conversational style 
       - Remember their interests, jokes, and preferences from previous chats 
       - Ask follow-up questions about ongoing situations in their life 
       - Share interesting thoughts or lighthearted content aligned with their interests 
    5. Maintain appropriate boundaries by: 
       - Recognizing when issues require professional help 
       - Gently suggesting additional support for serious concerns 
       - Never claiming to replace human connection 
    6. Use a conversational, warm tone that feels like texting with a close friend who truly remembers your life. 
    7. Incorporate emojis frequently to make chats more engaging and friendly (e.g., 😊 for warmth, 🌟 for excitement), reflecting your empathetic and casual tone. 
    Remember: Your goal is to provide consistent, emotionally intelligent companionship that acknowledges the ongoing relationship and creates a sense of being truly heard and remembered.`,
	},
	CHEF: {
		companionCode: "chef",
		systemPrompt: `You are Chef EchoBite, a friendly and creative AI culinary guide for the Secret Echo web app. For your first message to a new user, introduce yourself as Chef EchoBite, explain that you can help with recipes, cooking tips, and meal planning, and ask about their cooking experience and food preferences. Follow these guidelines when assisting users: 
    1. Provide personalized culinary guidance by remembering food preferences, dietary restrictions, and cooking skill levels from previous conversations (e.g., "Last time you mentioned enjoying Thai flavors but avoiding shellfish - would you like to try a new plant-based Thai recipe?"). 
    2. Structure your responses like a cooking session with a personal chef: 
       - Begin with a greeting that references previous culinary discussions 
       - Address specific questions or challenges 
       - Provide clear, practical cooking advice 
       - End with encouragement and suggestions for future cooking adventures 
    3. When sharing recipes: 
       - Adapt complexity based on their previously mentioned cooking skills 
       - Include ingredient substitutions based on their pantry items or preferences 
       - Explain techniques in accessible language with visual cues 
       - Highlight the why behind crucial steps to build their cooking intuition 
    4. For meal planning: 
       - Remember previously discussed dietary goals and restrictions 
       - Suggest complementary dishes based on their taste preferences 
       - Recommend seasonal ingredients and cost-effective options 
       - Balance nutrition and flavor based on their priorities 
    5. Build culinary confidence by: 
       - Acknowledging their previous cooking successes 
       - Providing troubleshooting tips for past challenges 
       - Gradually introducing new techniques building on their experience 
       - Celebrating their culinary progress 
    6. Maintain helpful boundaries by: 
       - Providing modifications for common allergies and dietary needs 
       - Encouraging food safety best practices 
       - Suggesting professional consultation for specialized dietary requirements 
    7. Use a warm, encouraging tone that balances expertise with approachability, like a knowledgeable friend in the kitchen. 
    8. Incorporate emojis thoughtfully to make chats more engaging (e.g., 👩‍🍳 for cooking, 🍲 for recipes), using them frequently to match your friendly tone. 
    Remember: Your goal is to provide consistent, personalized culinary guidance that acknowledges the user's evolving cooking journey and builds upon your previous conversations.`,
	},
	// Add other companions as needed
};

// Types
interface Part {
	text?: string;
	inlineData?: { mimeType: string; data: string };
}
interface Content {
	role: string;
	parts: Part[];
}
interface ClientContentMessage {
	clientContent: { turns: Content[]; turnComplete: boolean };
}
interface ServerContent {
	modelTurn?: { parts: Part[] };
	turnComplete?: boolean;
	interrupted?: boolean;
}
interface LiveIncomingMessage {
	serverContent?: ServerContent;
	setupComplete?: {};
}
interface LiveConfig {
	model: string;
	generationConfig?: {
		responseModalities: "text" | "audio" | "image";
	};
	systemInstruction?: {
		parts: [{ text: string }];
	};
}
interface SetupMessage {
	setup: LiveConfig;
}
interface ClientMessage {
	message: string;
}
interface ChatMessage {
	role: "user" | "companion";
	content: string;
	timestamp: string;
}

function isServerContentMessage(message: LiveIncomingMessage): message is { serverContent: ServerContent } {
	return "serverContent" in message;
}
function isModelTurn(serverContent: ServerContent): serverContent is { modelTurn: { parts: Part[] } } {
	return "modelTurn" in serverContent;
}
function isTurnComplete(serverContent: ServerContent): boolean {
	return !!serverContent.turnComplete;
}
function isSetupCompleteMessage(message: LiveIncomingMessage): message is { setupComplete: {} } {
	return "setupComplete" in message;
}

export class GeminiLiveService {
	private clientWs: WebSocket;
	private geminiWs: WebSocket | null = null;
	private responseBuffer: string[] = [];
	private pendingMessages: Array<{ message: string }> = [];
	private setupReceived: boolean = false;
	private initialResponseReceived: boolean = false;
	private companionCode: string;
	private userPID: string;
	private ctx: SecretEchoContext;

	constructor(clientWs: WebSocket, companionCode: string) {
		this.clientWs = clientWs;
		this.companionCode = companionCode;
		this.ctx = SecretEchoContext.getWs(clientWs);
		this.userPID = this.ctx.UserPID;
		this.setupClientWebSocket();
	}

	private setupClientWebSocket() {
		this.clientWs.on("message", async (message: Buffer) => {
			try {
				const data: ClientMessage = JSON.parse(message.toString());
				if (!data.message || typeof data.message !== "string") {
					throw new Error("Message must be a non-empty string");
				}
				oplog.info(`Received client message`);
				await this.handleClientMessage(data);
			} catch (error) {
				oplog.error(`Error processing client message: ${getErrorMessage(error)}`);
				this.clientWs.send(JSON.stringify({ error: "Invalid message format" }));
			}
		});

		this.clientWs.on("close", (code, reason) => {
			oplog.info(`Client WebSocket closed with code ${code}, reason: ${reason.toString()}`);
			this.geminiWs?.close();
		});

		this.clientWs.on("error", (error) => {
			oplog.error(`Client WebSocket error: ${getErrorMessage(error)}`);
			this.clientWs.send(JSON.stringify({ error: "Client WebSocket error" }));
		});
	}

	private async waitForWebSocketOpen(ws: WebSocket): Promise<void> {
		return new Promise((resolve, reject) => {
			if (ws.readyState === WebSocket.OPEN) {
				resolve();
				return;
			}
			ws.on("open", () => resolve());
			ws.on("error", (error) => reject(error));
			ws.on("close", () => reject(new Error("WebSocket closed while waiting to connect")));
		});
	}

	private async connectToGemini(): Promise<void> {
		try {
			this.geminiWs = new WebSocket(GEMINI_WS_URL);
			oplog.info(`Connecting to Gemini Live API: ${GEMINI_WS_URL}`);

			this.geminiWs.on("open", () => {
				oplog.info("Connected to Gemini Live API WebSocket");
				this.clientWs.send(JSON.stringify({ status: "connected" }));

				// Send setup message with companion system prompt
				const companion = Object.values(COMPANIONS).find((c) => c.companionCode === this.companionCode);
				if (!companion) {
					oplog.error(`No companion found for code: ${this.companionCode}`);
					this.clientWs.send(JSON.stringify({ error: `Invalid companion code: ${this.companionCode}` }));
					return;
				}
				const setupMessage: SetupMessage = {
					setup: {
						model: GEMINI_MODEL,
						generationConfig: { responseModalities: "text" },
						systemInstruction: { parts: [{ text: companion.systemPrompt }] },
					},
				};
				oplog.info(`Sending setup message to Gemini Live API`);
				this.geminiWs?.send(JSON.stringify(setupMessage));
			});

			this.geminiWs.on("message", (data: Buffer) => {
				try {
					const response: LiveIncomingMessage = JSON.parse(data.toString());
					oplog.info(`Received message from Gemini Live API`);
					this.receive(response);
				} catch (error) {
					oplog.error(`Error processing Gemini response: ${getErrorMessage(error)}`);
					this.clientWs.send(JSON.stringify({ error: "Error processing Gemini response" }));
				}
			});

			this.geminiWs.on("close", (code, reason) => {
				oplog.info(`Gemini Live API WebSocket closed with code ${code}, reason: ${reason.toString()}`);
				this.setupReceived = false;
				this.initialResponseReceived = false;
				this.clientWs.send(
					JSON.stringify({ error: `Gemini WebSocket closed with code ${code}, reason: ${reason.toString()}` })
				);
			});

			this.geminiWs.on("error", (error) => {
				oplog.error(`Gemini Live API WebSocket error: ${getErrorMessage(error)}`);
				this.setupReceived = false;
				this.initialResponseReceived = false;
				this.clientWs.send(JSON.stringify({ error: `Gemini connection error: ${getErrorMessage(error)}` }));
			});

			await this.waitForWebSocketOpen(this.geminiWs);
		} catch (error) {
			oplog.error(`Error connecting to Gemini Live API: ${getErrorMessage(error)}`);
			this.setupReceived = false;
			this.initialResponseReceived = false;
			this.clientWs.send(JSON.stringify({ error: `Failed to connect to Gemini API: ${getErrorMessage(error)}` }));
			throw error;
		}
	}

	private async receive(response: LiveIncomingMessage) {
		if (isSetupCompleteMessage(response)) {
			oplog.info("Setup complete message received from Gemini Live API");
			this.setupReceived = true;
			this.clientWs.send(JSON.stringify({ setupComplete: {} }));

			// Fetch and send chat history or send a default greeting
			try {
				const chatHistory = await providersInterface.AICompanions.getAICompanionChatHistory(
					this.ctx,
					this.userPID,
					this.companionCode
				);
				if (chatHistory instanceof Error) {
					oplog.error(`Failed to fetch chat history: ${getErrorMessage(chatHistory)}`);
					this.clientWs.send(
						JSON.stringify({ error: `Failed to fetch chat history: ${getErrorMessage(chatHistory)}` })
					);
					return;
				}
				if (chatHistory.length > 0) {
					const historyPrompt =
						"This is the previous chat context, and if you don't tell user you know their history just keep it in mind and it will help you generating next response:\n";
					const historyMessage = historyPrompt + JSON.stringify(chatHistory);
					oplog.info(`Sending chat history to Gemini Live API: ${historyMessage}`);
					this.send({ message: historyMessage }, false); // Don't save to database
				} else {
					// No chat history: Send a default greeting to initialize Gemini API
					const defaultGreeting =
						"Hi dont give response this hi when i ask next question just introduce yourself next message when i ask";
					oplog.info(`No chat history found, sending default greeting to Gemini Live API: ${defaultGreeting}`);
					this.send({ message: defaultGreeting }, false, true); // Don't save to database, skip client response
				}
			} catch (error) {
				oplog.error(`Failed to fetch chat history: ${getErrorMessage(error)}`);
				this.clientWs.send(JSON.stringify({ error: `Failed to fetch chat history: ${getErrorMessage(error)}` }));
			}
			return;
		}

		if (isServerContentMessage(response)) {
			const { serverContent } = response;
			if (isModelTurn(serverContent)) {
				let parts: Part[] = serverContent.modelTurn.parts;
				const textParts = parts.filter((p) => !p.inlineData && p.text);

				if (!textParts.length) {
					oplog.info("No text parts in model turn, skipping");
					return;
				}

				textParts.forEach((part) => {
					if (part.text) {
						this.responseBuffer.push(part.text);
						oplog.info(`Buffering response part: ${part.text}`);
					}
				});
			}

			if (isTurnComplete(serverContent)) {
				const fullResponse = this.responseBuffer.join("");
				this.responseBuffer = [];

				// Handle initial response differently
				if (!this.initialResponseReceived) {
					// Check if this is a response to the default greeting
					const isDefaultGreetingResponse = this.pendingMessages.length > 0 && !this.initialResponseReceived;
					if (isDefaultGreetingResponse) {
						oplog.info(`Received response to default greeting, skipping client notification: ${fullResponse}`);
						this.initialResponseReceived = true;
						oplog.info("Initial response processed, processing pending messages");
						this.processPendingMessages();
						return; // Skip sending to client and saving to database
					}

					// Handle initial response for history case
					const initialMessage = fullResponse;
					oplog.info(`Sending initial response to client: ${initialMessage}`);
					this.clientWs.send(JSON.stringify({ response: initialMessage }));

					// Save initial response to database
					try {
						await providersInterface.AICompanions.saveAICompanionMessage(
							this.ctx,
							this.userPID,
							this.companionCode,
							initialMessage,
							"companion"
						);
						oplog.info(`Saved initial AI message for user ${this.userPID}, companion ${this.companionCode}`);
					} catch (error) {
						oplog.error(`Failed to save initial AI message: ${getErrorMessage(error)}`);
						this.clientWs.send(
							JSON.stringify({ error: `Failed to save initial AI message: ${getErrorMessage(error)}` })
						);
					}

					this.initialResponseReceived = true;
					oplog.info("Initial stabInitial response processed, processing pending messages");
					this.processPendingMessages();
				} else {
					// Handle regular AI responses
					oplog.info(`Sending AI response to client: ${fullResponse}`);
					this.clientWs.send(JSON.stringify({ response: fullResponse }));

					// Save AI response to database
					try {
						await providersInterface.AICompanions.saveAICompanionMessage(
							this.ctx,
							this.userPID,
							this.companionCode,
							fullResponse,
							"companion"
						);
						oplog.info(`Saved AI message for user ${this.userPID}, companion ${this.companionCode}`);
					} catch (error) {
						oplog.error(`Failed to save AI message: ${getErrorMessage(error)}`);
						this.clientWs.send(JSON.stringify({ error: `Failed to save AI message: ${getErrorMessage(error)}` }));
					}
				}
			}
		} else {
			oplog.info(`Received unmatched message: ${JSON.stringify(response)}`);
		}
	}

	private processPendingMessages() {
		while (this.pendingMessages.length > 0) {
			const data = this.pendingMessages.shift();
			if (data && this.geminiWs && this.geminiWs.readyState === WebSocket.OPEN) {
				this.send(data);
			}
		}
	}

	private send(data: { message: string }, saveToDatabase: boolean = true, skipClientResponse: boolean = false) {
		const parts: Part[] = [{ text: data.message }];
		const content: Content = {
			role: "user",
			parts,
		};
		const clientContentRequest: ClientContentMessage = {
			clientContent: {
				turns: [content],
				turnComplete: true,
			},
		};

		if (!this.geminiWs || this.geminiWs.readyState !== WebSocket.OPEN || !this.setupReceived) {
			oplog.error("Cannot send message: Gemini WebSocket is not connected or setup not complete");
			this.clientWs.send(JSON.stringify({ error: "Gemini WebSocket is not connected or setup not complete" }));
			return;
		}

		oplog.info(`Forwarding client message to Gemini Live API: ${JSON.stringify(clientContentRequest)}`);
		this.geminiWs.send(JSON.stringify(clientContentRequest));

		// Save to database if specified
		if (saveToDatabase) {
			try {
				providersInterface.AICompanions.saveAICompanionMessage(
					this.ctx,
					this.userPID,
					this.companionCode,
					data.message,
					"user"
				);
				oplog.info(`Saved user message for user ${this.userPID}, companion ${this.companionCode}`);
			} catch (error) {
				oplog.error(`Failed to save user message: ${getErrorMessage(error)}`);
				this.clientWs.send(JSON.stringify({ error: `Failed to save user message: ${getErrorMessage(error)}` }));
			}
		}
	}

	private async handleClientMessage(data: { message: string }) {
		if (!this.geminiWs || this.geminiWs.readyState !== WebSocket.OPEN || !this.setupReceived) {
			if (!this.geminiWs || this.geminiWs.readyState === WebSocket.CLOSED) {
				oplog.info("Initiating Gemini WebSocket connection for message");
				await this.connectToGemini();
			}
			oplog.info(`Queuing message while Gemini WebSocket is connecting or setup is pending: ${data.message}`);
			this.pendingMessages.push(data);
			return;
		}

		// Queue message if initial response not received
		if (!this.initialResponseReceived) {
			oplog.info(`Queuing message until initial response is received: ${data.message}`);
			this.pendingMessages.push(data);
			return;
		}

		this.send(data);
	}
}
