import { getSessionFromProvider } from "@/app/providers";

export function useUser() {
    const session = getSessionFromProvider();
    const currentSession = session?.session ?? null;
    const user = session?.user ?? null;
    const isLoggedIn = !!user;

    return { currentSession, user, isLoggedIn };
}
