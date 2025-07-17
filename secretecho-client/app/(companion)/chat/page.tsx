import { getUserSessionCookie } from "@/utils/session";
import { cookies } from "next/headers";
import ClientChatWrapper from "./ClientChatWrapper";

// Define the props type to match Next.js App Router expectations
interface ChatPageProps {
	searchParams?: Promise<{ [key: string]: string | string[] | undefined }> | undefined;
}

export default async function ChatPage({ searchParams }: ChatPageProps) {
	// Await the searchParams Promise to resolve the actual search parameters
	const resolvedSearchParams = await searchParams;
	const companionCode =
		typeof resolvedSearchParams?.companion_code === "string" ? resolvedSearchParams.companion_code : undefined;

	// Get session token
	const session = await getUserSessionCookie(await cookies());
	const token = session?.user?.token;

	// Base WebSocket URL from environment variable or fallback
	const baseWsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL!;

	// Construct WebSocket URL with companion_code and token
	const queryParams = [];
	if (companionCode) {
		queryParams.push(`companion_code=${companionCode}`);
	}
	if (token) {
		queryParams.push(`token=${encodeURIComponent(token)}`);
	}
	const wsUrl = queryParams.length > 0 ? `${baseWsUrl}?${queryParams.join("&")}` : baseWsUrl;

	return <ClientChatWrapper url={wsUrl} />;
}
