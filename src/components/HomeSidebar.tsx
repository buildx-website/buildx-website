"use client";

import { useEffect, useState } from "react";
import { SiNextdotjs, SiPython, SiReact } from "react-icons/si";
import { FaHome, FaFolder, FaUserCircle, FaUserCheck, FaSpinner } from "react-icons/fa";
import { FiSettings } from "react-icons/fi";
import { MdDashboard } from "react-icons/md";
import { getChatsTypes } from "@/types/types";
import Link from "next/link";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { AuthCard } from "./AuthCard";
import { UserCard } from "./UserCard";
import { useUser } from "@/hooks/useUser";

interface HomeSidebarProps {
    onSidebarChange?: (isOpen: boolean) => void;
}

export default function HomeSidebar({ onSidebarChange }: HomeSidebarProps) {
    const { user, isLoggedIn } = useUser();
    const [chats, setChats] = useState<getChatsTypes[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        onSidebarChange?.(isOpen);
    }, [isOpen, onSidebarChange]);

    useEffect(() => {
        async function getChats() {
            if (!isLoggedIn) {
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const res = await fetch("/api/main/chats");
                if (!res.ok) {
                    throw new Error(`Failed to fetch chats: ${res.status}`);
                }
                const chatsData = await res.json();
                setChats(chatsData);
                setError(null);
            } catch (err) {
                console.error("Error fetching chats:", err);
                setError(err instanceof Error ? err.message : "Failed to load chats");
            } finally {
                setLoading(false);
            }
        }
        getChats();
        console.log(chats);
    }, [isLoggedIn]);

    const handleAuthRequired = (e: React.MouseEvent) => {
        if (!isLoggedIn) {
            e.preventDefault();
            setIsDialogOpen(true);
        }
    };

    return (
        <>
            <div
                className={`fixed top-0 left-0 h-screen z-40 flex flex-col transition-all duration-300 border-r border-zinc-900 ${
                    isOpen ? 'w-[230px] bg-black' : 'w-[64px] bg-black'
                }`}
                onMouseEnter={() => setIsOpen(true)}
                onMouseLeave={() => setIsOpen(false)}
            >
                <div className="flex flex-col h-full">
                    <div className={`flex items-center justify-${isOpen ? 'between' : 'center'} px-4 pt-6 pb-8`}>
                        <span
                            className="flex items-center gap-2 text-slate-200 cursor-pointer select-none"
                            onClick={() => window.location.href = '/'}
                        >
                            <MdDashboard size={24} />
                            {isOpen && (
                                <span className="text-lg font-bold text-slate-200 my-auto font-heading">
                                    BuildX
                                </span>
                            )}
                        </span>
                    </div>
                    <nav className="flex flex-col flex-1 min-h-0 bg-black">
                        <div className="flex flex-col gap-2">
                            <Link href="/" className={`flex items-center ${isOpen ? 'px-4 py-2 gap-3' : 'justify-center py-3'} text-zinc-100 hover:bg-zinc-800/ rounded-lg transition-colors`}>
                                <FaHome size={20} />
                                {isOpen && <span>Home</span>}
                            </Link>

                            <Link href="/new/react" onClick={handleAuthRequired} className={`flex items-center ${isOpen ? 'px-4 py-2 gap-3' : 'justify-center py-3'} text-zinc-100 hover:bg-zinc-800/50 rounded-lg transition-colors`}>
                                <SiReact size={20} />
                                {isOpen && <span>
                                    New React Project
                                </span>}
                            </Link>

                            <Link href="/new/nextjs" onClick={handleAuthRequired} className={`flex items-center ${isOpen ? 'px-4 py-2 gap-3' : 'justify-center py-3'} text-zinc-100 hover:bg-zinc-800/50 rounded-lg transition-colors`}>
                                <SiNextdotjs size={20} />
                                {isOpen && <span>
                                    New Next Project
                                </span>}
                            </Link>

                            <Link href="/new/manim" onClick={handleAuthRequired} className={`flex items-center ${isOpen ? 'px-4 py-2 gap-3' : 'justify-center py-3'} text-zinc-100 hover:bg-zinc-800/50 rounded-lg transition-colors`}>
                                <SiPython size={20} />
                                {isOpen && <span>
                                    New Manim Project
                                </span>}
                            </Link>

                            <div className={`my-2 ${isOpen ? 'mx-4' : 'mx-auto w-8'} h-px bg-zinc-800/50`} />
                            {isOpen && (
                                <div className="px-4 py-2">
                                    <h2 className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Recent Projects</h2>
                                </div>
                            )}
                            {!isOpen && (
                                <div className="flex flex-col gap-1 items-center">
                                    <FaFolder size={20} className="text-zinc-500" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {isOpen && (!isLoggedIn ? (
                                <div className="text-zinc-400 text-sm px-4 py-3 rounded-lg bg-zinc-800/20">
                                    Please log in to view projects
                                </div>
                            ) : loading ? (
                                <div className="flex flex-col items-center justify-center py-8 text-zinc-400">
                                    <FaSpinner size={20} className="animate-spin mb-2" />
                                    <span className="text-sm">Loading projects...</span>
                                </div>
                            ) : error ? (
                                <div className="text-red-400 text-sm p-4">{error}</div>
                            ) : chats.length === 0 ? (
                                <div className="text-zinc-400 text-sm px-4 py-3 rounded-lg bg-zinc-800/20">
                                    No projects found
                                </div>
                            ) : (
                                chats.map((chat) => (
                                    <Link
                                        key={chat.id}
                                        href={chat.framework == "NEXT" ? `/editor/${chat.id}` : chat.framework == "REACT" ? `/editor/${chat.id}` : chat.framework == "MANIM" ? `/video-editor/${chat.id}` : "/"}
                                        onClick={handleAuthRequired}
                                        className="flex items-center px-4 py-2 gap-3 text-zinc-100 hover:bg-zinc-800/50 rounded-lg transition-colors"
                                    >
                                        {chat.framework == "NEXT" ? <SiNextdotjs size={20} /> : chat.framework == "REACT" ? <SiReact size={20} /> : chat.framework == "MANIM" ? <SiPython size={20} /> : <FaFolder size={20} />}
                                        <span>
                                            {chat.name}
                                        </span>
                                    </Link>
                                ))
                            ))}
                        </div>
                    </nav>
                    <div className={`flex flex-col items-center gap-2 pb-6 ${isOpen ? 'px-4' : ''} border-t border-zinc-800/50 pt-4`}>
                        <button
                            onClick={() => setIsDialogOpen(true)}
                            className={`flex items-center ${isOpen ? 'w-full gap-2 px-3 py-2' : 'justify-center p-2'} bg-zinc-900/50 border border-zinc-700 hover:bg-zinc-800 hover:border-zinc-600 text-zinc-300 hover:text-white transition-all duration-200 rounded-lg`}
                        >
                            {isLoggedIn ? <FaUserCheck size={20} /> : <FaUserCircle size={20} />}
                            {isOpen && <span>{isLoggedIn ? (user?.name || "User") : "Login"}</span>}
                        </button>
                        <Link
                            href="/settings"
                            onClick={handleAuthRequired}
                            className={`flex items-center ${isOpen ? 'w-full gap-2 px-3 py-2' : 'justify-center p-2'} text-zinc-100 hover:bg-zinc-800/50 rounded-lg transition-colors`}
                        >
                            <FiSettings size={20} />
                            {isOpen && <span>Settings</span>}
                        </Link>
                    </div>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTitle />
                    <DialogContent>
                        {isLoggedIn ? (
                            <UserCard setIsDialogOpen={setIsDialogOpen} />
                        ) : (
                            <AuthCard setIsDialogOpen={setIsDialogOpen} />
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
} 