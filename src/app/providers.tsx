"use client";

import { SessionDataType } from "@/types/types";


let internalSession: SessionDataType | null = null;

export function Providers({ children, session, }: { children: React.ReactNode; session: SessionDataType }) {
    internalSession = session;
    return <>{children}</>;
}

export function getSessionFromProvider() {
    return internalSession;
}
