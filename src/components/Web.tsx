"use client"
import { WebContainer } from '@webcontainer/api';
import { useEffect, useState } from 'react';

export function Web({ webcontainer }: { webcontainer: WebContainer | null }) {
    const [url, setUrl] = useState<string | null>(null);

    async function main() {
        if (!webcontainer) {
            return;
        }
        const installProcess = await webcontainer.spawn('npm', ['install']);
        installProcess.output.pipeTo(new WritableStream({
            write(data) {
                console.log(data);
            }
        }));
        await webcontainer.spawn('npm', ['run', 'dev']);
        webcontainer.on('server-ready', (port, url) => {
            console.log(`Server ready on port ${port}`);
            console.log(`Server ready at ${url}`);
            setUrl(url);
        });
    }

    useEffect(() => {
        if (webcontainer) {
            main();
        }
    }, []);


    return (
        <>
            {!url && <p>Starting server...</p>}
            {url && <iframe src={url} height={"100%"} width={"100%"} />}
        </>
    )
}