import { useState, useEffect } from 'react';
import { WebContainer } from '@webcontainer/api';

let globalWebContainer: WebContainer | null = null;
let bootPromise: Promise<WebContainer> | null = null;
let isBooting = false;

export function useWebContainer() {
    const [webcontainer, setWebcontainer] = useState<WebContainer | null>(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (globalWebContainer) {
            setWebcontainer(globalWebContainer);
            return;
        }
        if (bootPromise) {
            bootPromise.then(instance => {
                setWebcontainer(instance);
            }).catch(err => {
                console.error("WebContainer boot error:", err);
            });
            return;
        }

        if (!isBooting) {
            isBooting = true;
            bootPromise = (async () => {
                try {
                    console.log('Booting WebContainer...');
                    const instance = await WebContainer.boot();
                    globalWebContainer = instance;
                    return instance;
                } catch (error) {
                    console.error('Failed to boot WebContainer:', error);
                    isBooting = false;
                    bootPromise = null;
                    throw error;
                }
            })();

            bootPromise.then(instance => {
                setWebcontainer(instance);
            }).catch(err => {
                console.error("WebContainer boot error:", err);
            });
        }
    }, []);

    return webcontainer;
}