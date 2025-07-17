export type ChatMessage = {
  content: string;
  sender: "user" | "companion";
  timestamp: string;
}

export type CreateAICompanionRequest = {
  companionCode: string;
}

export type CreateAICompanionResponse = {
  message: string;
}

export type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  isLoading?: boolean;
  avatar?: string;
};
