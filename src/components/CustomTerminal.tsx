"use client";

import {  WebContainer } from "@webcontainer/api";
import { Terminal } from "@xterm/xterm";
import { useEffect, useRef } from "react";

export const CustomTerminal = ({ webcontainer }: { webcontainer: WebContainer | null }) => {
    const terminalRef = useRef<HTMLDivElement>(null);
    const terminalInstance = useRef<Terminal | null>(null);

    useEffect(() => {
        if (terminalRef.current) {
            terminalInstance.current = new Terminal({
                convertEol: true,
                cursorBlink: true,
                fontSize: 14,
                fontFamily: 'Fira Code, Consolas, monospace',
            });
            terminalInstance.current.open(terminalRef.current);
            terminalInstance.current.resize(120, 20);

            terminalInstance.current.write('Welcome to Terminal!\r\n');

            return () => {
                terminalInstance.current?.dispose();
            };
        }
    }, []);


    async function talkToWebContainer() {
        if (!webcontainer || !terminalInstance.current) {
            return;
        }
    
        let commandBuffer = '';
        let lastProcess: ReturnType<WebContainer['spawn']> | null = null;
    
        terminalInstance.current.onData(async (data) => {
            if (data === '\x7f') { // backspace
                if (commandBuffer.length > 0) {
                    commandBuffer = commandBuffer.slice(0, -1);
                    terminalInstance.current?.write('\b \b');
                }
                return;
            }
    
            if (data === '\x03') { // Ctrl+C
                terminalInstance.current?.write('^C\r\n');
                commandBuffer = '';
    
                if (lastProcess) {
                    const process = await lastProcess;
                    process.kill();
                    lastProcess = null;
                }
    
                return;
            }
    
            if (data === '\r') {
                const trimmedCommand = commandBuffer.trim();
                terminalInstance.current?.write('\r\n');
    
                if (trimmedCommand) {
                    const cmd = trimmedCommand.split(' ')[0];
    
                    if (cmd === 'clear') {
                        terminalInstance.current?.clear();
                        commandBuffer = '';
                        return;
                    }
    
                    lastProcess = webcontainer.spawn(cmd, trimmedCommand.split(' ').slice(1));
                    (await lastProcess)?.output.pipeTo(new WritableStream({
                        write(data) {
                            terminalInstance.current?.write(data);
                        }
                    }));
                }
    
                commandBuffer = ''; 
                return;
            }
    
            commandBuffer += data; 
            terminalInstance.current?.write(data);
        });
    }
    


    useEffect(() => {
        talkToWebContainer();

    }, [webcontainer]);

    return (
        <div className="w-full h-full flex items-center justify-center">
            <div ref={terminalRef} className="w-96 h-96 bg-black/40 rounded-lg" />
        </div>
    );
}