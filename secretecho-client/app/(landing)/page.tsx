import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
	return (
		<div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 dark:from-indigo-900 dark:via-purple-900 dark:to-pink-900 transition-colors duration-300">
			{/* Navbar */}
			<nav className="p-4 border-b-1 border-purple-700/90 dark:border-purple-300/90 flex justify-between items-center">
				<Link
					href={"/"}
					className="text-3xl flex flex-row  font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400"
				>
					<Image src={"/logo.png"} className="mx-1" height={30} width={36} alt="logo" />
					AI Companion
				</Link>
				<Link href="/auth">
					<Button
						variant="default"
						className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white cursor-pointer"
					>
						Sign Up
					</Button>
				</Link>
			</nav>

			{/* Main Content */}
			<main className="flex-1 flex flex-col items-center justify-center text-center p-4">
				<h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-indigo-600/90 via-purple-600 to-pink-600 bg-clip-text text-transparent dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">
					Meet Your AI Companion
				</h2>
				<p className="text-lg text-gray-600 dark:text-gray-100 mb-4 max-w-2xl">
					Talk with AI like a Friend, Doctor, and Chef.
				</p>
				<p className="text-md text-gray-600 dark:text-gray-100 mb-8 max-w-2xl">
					Experience seamless conversations with an AI that understands your needs. Whether you need a friendly chat,
					medical advice, or cooking tips, your AI Companion is here to assist you in real-time.
				</p>

				{/* Get Started Button */}
				<Link href="/auth">
					<Button className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white px-6 py-6 text-2xl cursor-pointer">
						Get Started
					</Button>
				</Link>
			</main>

			{/* Footer */}
			<footer className="p-4 text-center text-gray-600 dark:text-gray-100">
				<p>© 2025 AI Companion. All rights reserved.</p>
				<p className="text-sm mt-1">Powered by Gemini</p>
			</footer>
		</div>
	);
}
