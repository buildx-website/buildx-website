"use client"

import { useState } from "react";
import { UserRound } from "lucide-react";
import { SettingsIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Shield, Monitor, Calendar, LogOut, Loader2 } from "lucide-react";
import { SessionType } from "@/types/types";
import HomeSidebar from "../HomeSidebar";

export default function SettingsComponent({ allSessions, currentSessionId, revokeSession, revokeOtherSessions, user }: {
    allSessions: SessionType[];
    currentSessionId: string;
    revokeSession: (token: string) => void;
    revokeOtherSessions: () => void;
    user: { email: string, emailVerified: boolean, image: string, name: string };
}) {
    const [loadingSessionId, setLoadingSessionId] = useState<string | null>(null);
    const [isRevokingAllOtherSessions, setIsRevokingAllOtherSessions] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleRevokeSession = async (token: string, sessionId: string) => {
        setLoadingSessionId(sessionId);
        try {
            await revokeSession(token);
            // reload the page
            window.location.reload();
        } catch (error) {
            console.error("Failed to revoke session:", error);
        } finally {
            setLoadingSessionId(null);
        }
    };

    const handleRevokeAllOtherSessions = async () => {
        setIsRevokingAllOtherSessions(true);
        try {
            await revokeOtherSessions();
        } catch (error) {
            console.error("Failed to revoke all sessions:", error);
        } finally {
            setIsRevokingAllOtherSessions(false);
        }
    };

    return (
        <div className="flex">
            <HomeSidebar onSidebarChange={setSidebarOpen} />
            <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-[230px]' : 'ml-[64px]'}`}>
                <div className="container mx-auto px-4 py-8 max-w-5xl">
                    <div className="flex items-center mb-8 space-x-3">
                        <SettingsIcon className="w-5 h-5 text-primary/50" />
                        <h1 className="text-xl font-bold text-primary/50 font-heading">Settings</h1>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="col-span-1 bg-zinc-900 border-zinc-800 text-zinc-100">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2 text-primary/50">
                                    <UserRound size={18} />
                                    <span>Profile</span>
                                </CardTitle>
                                <CardDescription className="text-primary/30 text-sm">
                                    Your personal information goes here
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center space-y-4">
                                <Avatar className="w-24 h-24">
                                    <AvatarImage src={user.image || ""} alt={user.name} />
                                    <AvatarFallback className="bg-zinc-800 text-zinc-200 text-xl">
                                        {user.name?.charAt(0) || "U"}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="text-center">
                                    <h3 className="text-xl font-semibold">{user.name}</h3>
                                    <p className="text-zinc-400">{user.email}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="col-span-1 md:col-span-2 bg-zinc-900 border-zinc-800 text-zinc-100">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2 text-primary/50">
                                    <Shield size={18} />
                                    <span>Active Sessions</span>
                                </CardTitle>
                                <CardDescription className="text-primary/30 text-sm">
                                    Manage your active login sessions
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {allSessions.length > 0 ? (
                                        allSessions.map((session: SessionType) => (
                                            <div key={session.id} className="p-4 rounded-lg border border-zinc-800 bg-zinc-950/50">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        <Monitor size={18} className="text-zinc-400" />
                                                        <div>
                                                            <p className="font-medium flex items-center space-x-2">
                                                                <span>{session.userAgent?.split(' ')[0] || "Unknown Device"}</span>
                                                                {session.id === currentSessionId && (
                                                                    <span className="text-xs bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full">
                                                                        Current
                                                                    </span>
                                                                )}
                                                            </p>
                                                            <div className="flex text-sm text-zinc-400 space-x-4 mt-1">
                                                                <div className="flex items-center space-x-1">
                                                                    <Calendar size={14} />
                                                                    <span>
                                                                        {new Date(session.createdAt).toLocaleDateString()} at {new Date(session.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {session.id !== currentSessionId && (
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => handleRevokeSession(session.token, session.id)}
                                                            disabled={loadingSessionId === session.id}
                                                        >
                                                            {loadingSessionId === session.id ? (
                                                                <Loader2 size={16} className="mr-1 animate-spin" />
                                                            ) : (
                                                                <LogOut size={16} className="mr-1" />
                                                            )}
                                                            {loadingSessionId === session.id ? 'Revoking...' : 'Revoke'}
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-4 text-zinc-400">
                                            No active sessions found
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end border-t border-zinc-800 p-4 space-x-2">
                                <Button
                                    variant="outline"
                                    className="border-zinc-700 hover:bg-zinc-800 hover:text-zinc-200"
                                    onClick={handleRevokeAllOtherSessions}
                                    disabled={isRevokingAllOtherSessions}
                                >
                                    {isRevokingAllOtherSessions ? (
                                        <Loader2 size={16} className="mr-2 animate-spin" />
                                    ) : (
                                        <LogOut size={16} className="mr-2" />
                                    )}
                                    {isRevokingAllOtherSessions ? 'Revoking...' : 'Revoke All Other Sessions'}
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}