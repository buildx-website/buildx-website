import { Message, MessagesState } from "@/types/types";
import { create } from "zustand";

export const useMessagesStore = create<MessagesState>((set) => ({
    messages: [],
    setMessages: (messages: Message[]) => set({ messages }),
    addMessage: (message: Message) => set(state => ({ messages: [...state.messages, message] })),
    clearMessages: () => set({ messages: [] }),
}))