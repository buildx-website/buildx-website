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