"use client";

import { WebSocketProvider } from "@/context/webSocketContext";
import CompanionChatbot from "@/components/pages/chatbot";

interface ClientChatWrapperProps {
  url: string;
}

export default function ClientChatWrapper({ url }: ClientChatWrapperProps) {
  return (
    <WebSocketProvider url={url}>
      <CompanionChatbot />
    </WebSocketProvider>
  );
}