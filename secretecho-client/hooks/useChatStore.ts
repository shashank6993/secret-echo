
import { create } from "zustand";


interface State {
	input: string;
}

interface Actions {
	setInput: (input: string) => void;
	handleInputChange: (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const useChatStore = create<State & Actions>()((set) => ({
	input: "",
	setInput: (input) => set({ input }),
	handleInputChange: (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) =>
		set({ input: e.target.value }),

}));

export default useChatStore;
