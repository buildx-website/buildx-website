"use client";

import {  WebContainer } from "@webcontainer/api";
import { Terminal } from "@xterm/xterm";
import { useEffect, useRef } from "react";

interface SpawnProcess {
    kill: () => void;
    output: ReadableStream;
    exit: Promise<number>;
}

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
                theme: {
                    background: '#1a1a1a',
                }
            });
            terminalInstance.current.open(terminalRef.current);
            terminalInstance.current.resize(120, 20);

            terminalInstance.current.write('$ '); // Add prompt

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
        let currentProcess: { process: SpawnProcess | null; killed: boolean } | null = null;
    
        terminalInstance.current.onData(async (data) => {
            if (currentProcess?.killed) {
                currentProcess = null;
            }

            if (data === '\x7f') { // Backspace
                if (commandBuffer.length > 0) {
                    commandBuffer = commandBuffer.slice(0, -1);
                    terminalInstance.current?.write('\b \b');
                }
                return;
            }
    
            if (data === '\x03') { // Ctrl+C
                terminalInstance.current?.write('^C\r\n$ ');
                if (currentProcess?.process) {
                    try {
                        await currentProcess.process.kill();
                        currentProcess.killed = true;
                    } catch (error) {
                        console.error('Failed to kill process:', error);
                    }
                }
                commandBuffer = '';
                return;
            }
    
            if (data === '\r') { // Enter
                const trimmedCommand = commandBuffer.trim();
                terminalInstance.current?.write('\r\n');
    
                if (trimmedCommand) {
                    const parts = trimmedCommand.split(' ');
                    const cmd = parts[0];
                    const args = parts.slice(1);
    
                    if (cmd === 'clear' || cmd === 'cls') {
                        terminalInstance.current?.clear();
                        commandBuffer = '';
                        terminalInstance.current?.write('$ ');
                        return;
                    }
    
                    try {
                        const process = await webcontainer.spawn(cmd, args);
                        currentProcess = { process, killed: false };
                        
                        process.output.pipeTo(new WritableStream({
                            write(data) {
                                terminalInstance.current?.write(data);
                            }
                        }));

                        await process.exit;
                        if (!currentProcess.killed) {
                            terminalInstance.current?.write('\r\n$ ');
                        }
                    } catch (error) {
                        console.error('Command execution failed:', error);
                        terminalInstance.current?.write(`\r\nCommand not found: ${cmd}\r\n$ `);
                    }
                } else {
                    terminalInstance.current?.write('$ ');
                }
    
                commandBuffer = '';
                return;
            }
    
            // Handle normal input
            commandBuffer += data;
            terminalInstance.current?.write(data);
        });
    }
    


    useEffect(() => {
        talkToWebContainer();

    }, [webcontainer]);

    return (
        <div className="w-full h-full flex items-center justify-center">
            <div 
                ref={terminalRef} 
                className="w-full h-[300px] bg-[#1a1a1a] rounded-lg shadow-md overflow-hidden p-2"
            />
        </div>
    );
}