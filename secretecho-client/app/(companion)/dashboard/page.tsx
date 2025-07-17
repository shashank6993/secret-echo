"use client";

import CompanionCard from "@/components/molecules/CompanionCard";
import { Companion, companions } from "@/config/companions";
import { useCreateAIChatCompanion } from "@/providers/chats";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DashboardPage() {
	const router = useRouter();
	const { mutate: createAICompanion } = useCreateAIChatCompanion();
	const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});

	const handleCreateCompanion = (companion: Companion) => {
		setLoadingStates((prev) => ({ ...prev, [companion.id]: true }));

		createAICompanion(
			{ companionCode: companion.companion_code },
			{
				onSuccess: () => {
					router.push(`/chat?companion_code=${companion.companion_code}`);
					router.refresh();
				},
				onError: () => {
					setLoadingStates((prev) => ({ ...prev, [companion.id]: false }));
				},
				onSettled: () => {
					setLoadingStates((prev) => ({ ...prev, [companion.id]: false }));
				},
			}
		);
	};

	return (
		<div className="">
			<div className="container mx-auto px-4 py-4">
				<h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 mb-8 text-center">
					Your AI Companions
				</h1>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{companions.map((companion) => (
						<CompanionCard
							key={companion.id}
							companion={companion}
							onCreateCompanion={handleCreateCompanion}
							isLoading={loadingStates[companion.id] || false}
						/>
					))}
				</div>
			</div>
		</div>
	);
}
