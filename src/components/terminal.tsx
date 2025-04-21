"use client"

import React, { useState } from "react"
import MainTerminalComponent from "./MainTerminal"
import CustomTerminalComponent from "./CustomTerminal"

type TerminalProps = {
    containerId: string
}

const TerminalComponent: React.FC<TerminalProps> = ({ containerId }) => {
    const [activeTab, setActiveTab] = useState<'main' | 'custom'>('main');

    return (
        <div className="flex flex-col w-full border border-zinc-800 rounded-md overflow-hidden">
            {/* Tabs header */}
            <div className="flex border-b border-zinc-800 bg-zinc-900">
                <button
                    className={`px-4 py-2 text-sm font-medium ${
                        activeTab === 'custom' 
                            ? 'bg-zinc-800 text-white border-b-2 border-blue-500' 
                            : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                    }`}
                    onClick={() => setActiveTab('custom')}
                >
                    Console
                </button>
                <button
                    className={`px-4 py-2 text-sm font-medium ${
                        activeTab === 'main' 
                            ? 'bg-zinc-800 text-white border-b-2 border-blue-500' 
                            : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                    }`}
                    onClick={() => setActiveTab('main')}
                >
                    Terminal
                </button>
            </div>

            {/* Terminal content - both terminals are mounted but only one is visible */}
            <div className="flex-grow">
                <div style={{ display: activeTab === 'main' ? 'block' : 'none', height: '100%' }}>
                    <MainTerminalComponent 
                        containerId={containerId}
                        autoFocus={activeTab === 'main'}
                    />
                </div>
                <div style={{ display: activeTab === 'custom' ? 'block' : 'none', height: '100%' }}>
                    <CustomTerminalComponent
                        containerId={containerId}
                        autoFocus={activeTab === 'custom'}
                    />
                </div>
            </div>
        </div>
    )
}

export default TerminalComponent