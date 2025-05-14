import { Session, User } from "better-auth";
import { z } from "zod";

export const userSignUp = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(2),
})

export const userSignIn = z.object({
    email: z.string().email(),
    password: z.string().min(6),
})

export const getTempleteTypes = z.object({
    prompt: z.string()
})

export const apiKeyTypes = z.object({
    apiKey: z.string()
})

export interface Message {
    role: 'user' | 'assistant' | 'system';
    content: Content[];
    ignoreInUI?: boolean;
    loading?: boolean;
}

export interface Content {
    type: 'text' | 'image_url';
    text?: string;
    image_url?: {
        url: string;
    };
}

export const chatBodyTypes = z.object({
    messages: z.array(z.object({
        role: z.enum(['user', 'assistant', 'system']),
        content: z.array(z.object({
            type: z.enum(['text', 'image_url']),
            text: z.string().optional(),
            image_url: z.object({
                url: z.string().url(),
            }).optional()
        })),
    })),
    prompt: z.string(),
    framework: z.string()
})

export interface FileType {
    name: string
    type: "file" | "directory"
    isOpen?: boolean
    children?: FileType[]
    path: string
}

export enum StepType {
    CreateFile,
    CreateFolder,
    EditFile,
    DeleteFile,
    DeleteFolder,
    RenameFile,
    RenameFolder,
    RunScript,
}

export interface Step {
    id: number;
    title: string;
    description: string;
    type: StepType
    status: "pending" | "completed" | "in-progress" | "failed";
    code?: string;
    path?: string;
    _executed?: boolean;
    error?: string;
}

export interface DiffContent {
    type: 'context' | 'add' | 'remove'
    line: string;
}


export interface MessagesState {
    messages: Message[];
    setMessages: (messages: Message[]) => void;
    addMessage: (message: Message) => void;
    clearMessages: () => void;
}

export const refinePromptTypes = z.object({
    prompt: z.string().min(5)
})

export const setModelTypes = z.object({
    modelId: z.string(),
})

export const createProjectTypes = z.object({
    prompt: z.string().min(5),
    framework: z.string(),
})

export interface getChatsTypes {
    id: string;
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    ownerId: string;
    frameWork: string;
}

export type SessionDataType = {
    session: Session | null;
    user: User | null;
} | null


export interface ContainerPort {
    [port: number]: string;
}


export interface SessionType {
    id: string;
    createdAt: string | Date;
    updatedAt: string | Date;
    userId: string;
    expiresAt: string | Date;
    token: string;
    ipAddress?: string | null;
    userAgent?: string | null;
}