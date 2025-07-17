
import { EventEmitter } from "eventemitter3";



interface GeminiWebSocketClientEvents {
  open: () => void;
  message: (data: { response: string }) => void;
  error: (error: Event) => void;
  close: (event: CloseEvent) => void;
}

export class GeminiWebSocketClient extends EventEmitter<GeminiWebSocketClientEvents> {
  private ws: WebSocket | null = null;
  private url: string;


  constructor(url: string) {
    super();
    this.url = url;
  }

  connect(): Promise<boolean> {
    this.ws = new WebSocket(this.url);

    return new Promise((resolve, reject) => {
      const onError = (ev: Event) => {
        this.disconnect();
        this.emit("error", ev);
        reject(new Error(`Could not connect to ${this.url}`));
      };

      this.ws!.addEventListener("error", onError);

      this.ws!.addEventListener("open", () => {
        this.emit("open");
        this.ws!.removeEventListener("error", onError);
        resolve(true);
      });

      this.ws!.addEventListener("message", (evt: MessageEvent) => {
        try {
          const data = JSON.parse(evt.data);
          if (data.response) {
            this.emit("message", data);
          } else if (data.status === "connected") {
            // Ignore connection status
          }  else if (data.setupComplete) {
            // Ignore setup complete
          } else {
            console.warn("Invalid message format", data);
          }
        } catch {
          this.emit("error", new Event("Invalid message format"));
        }
      });

      this.ws!.addEventListener("close", (ev: CloseEvent) => {
        this.disconnect();
        this.emit("close", ev);
      });
    });
  }

  send(data: { message: string }) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket is not connected");
    }
    this.ws.send(JSON.stringify(data));
  }


  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}