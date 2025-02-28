import { Message } from "@/types/types";
import { atom } from "recoil";

export const messagesAtom = atom<Message[]>({
    key: "messagesAtom",
    default: [],
})