import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import SettingsComponent from "@/components/settings/SettingsComponent";
import { SessionType } from "@/types/types";

export default async function SettingsPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    const user = session?.user;

    if (!session) {
        redirect("/");
    }
    
    const sessionsData = await auth.api.listSessions({
        headers: await headers()
    });
    
    const allSessions = sessionsData as SessionType[];
    const currentSessionId = session.session?.id || "";

    async function revokeSession(token: string) {
        "use server";
        await auth.api.revokeSession({
            headers: await headers(),
            body: { token }
        });
    }

    async function revokeOtherSessions() {
        "use server";
        await auth.api.revokeOtherSessions({
            headers: await headers(),
        });
    }

    const safeUser = {
        email: user?.email || "",
        emailVerified: user?.emailVerified || false,
        image: user?.image || "",
        name: user?.name || ""
    };

    return (
        <SettingsComponent 
            allSessions={allSessions}
            currentSessionId={currentSessionId}
            revokeSession={revokeSession}
            revokeOtherSessions={revokeOtherSessions}
            user={safeUser}
        />
    );
}