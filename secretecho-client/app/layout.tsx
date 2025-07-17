import { ThemeProvider } from "@/components/theme-provider";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";

import Providers from "@/providers";
import { Suspense } from "react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
	title: "SecretEcho - AI Companion",
	description: "SecretEcho is an AI companion that provides a personal and intelligent conversational experience.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<Providers>
			<html lang="en" suppressHydrationWarning>
				<body className={inter.className}>
					<Suspense>
						<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
							{" "}
							<Toaster
								position="bottom-center"
								toastOptions={{
									style: {
										background: "white",
									},
									className: "bg-white dark:bg-black",
								}}
							/>
							{children}
						</ThemeProvider>
					</Suspense>
				</body>
			</html>
		</Providers>
	);
}
