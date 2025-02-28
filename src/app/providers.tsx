"use client"

import { RecoilRoot } from "recoil";

export function Providers({ children }: Readonly<{ children: React.ReactNode }>) {
    return <RecoilRoot>
        {children}
    </RecoilRoot>
}