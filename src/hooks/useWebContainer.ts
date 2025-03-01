import { WebContainer } from "@webcontainer/api";
import { useEffect, useState } from "react";

export function useWebContainer() {
    const [wc, setWc] = useState<WebContainer | null>(null);

    useEffect(() => {
        async function init() {
            console.log('booting webcontainer');
            const webcontainerInstance = await WebContainer.boot();
            setWc(webcontainerInstance)
        }
        init();
    }, []);

    return wc;
}