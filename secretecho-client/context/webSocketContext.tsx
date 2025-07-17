"use client";

import { GeminiWebSocketClient } from "@/utils/gemini-webSocket-client";
import { createContext, FC, ReactNode, useContext, useMemo, useState, useCallback, useEffect } from "react";


export type WebSocketContextType = {
  client: GeminiWebSocketClient;
  connected: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export type WebSocketProviderProps = {
  children: ReactNode;
  url: string;
};

export const WebSocketProvider: FC<WebSocketProviderProps> = ({ children, url }) => {
  const client = useMemo(() => new GeminiWebSocketClient(url), [url]);
  const [connected, setConnected] = useState(false);


  useEffect(() => {
    const onClose = () => {
      setConnected(false);
    };

    client
      .on("close", onClose)


    return () => {
      client
        .off("close", onClose)

    };
  }, [client]);

  const connect = useCallback(async () => {
    client.disconnect();
    await client.connect();
    setConnected(true);
  }, [client, setConnected]);

  const disconnect = useCallback(async () => {
    client.disconnect();
    setConnected(false);
  }, [setConnected, client]);

  return (
    <WebSocketContext.Provider value={{ client, connected, connect, disconnect }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocketContext must be used within a WebSocketProvider");
  }
  return context;
};