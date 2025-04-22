"use client";

import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { AuthCard } from "./AuthCard";
import { UserCard } from "./UserCard";
import { BlocksIcon, UserRound, UserRoundCheck } from "lucide-react";
import { useState } from "react";
import { User } from "better-auth";

export function Navbar({ user, isLoggedIn }: { user: User | null, isLoggedIn: boolean }) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    function handleClick() {
        setIsDialogOpen(true);
    }

    return (
        <>
            <nav className="w-full row-start-1 flex items-center px-4 sm:px-0 py-4 justify-between">
                <span
                    className="flex items-center gap-2 text-slate-200 cursor-pointer my-auto"
                    onClick={() => window.location.href = '/'}
                >
                    <BlocksIcon size={32} className="my-auto" />
                    <span className="text-xl font-bold text-slate-200 my-auto font-heading">
                        Builder
                    </span>
                </span>

                <Button
                    variant="outline"
                    className="bg-zinc-900/50 border border-zinc-700 hover:bg-zinc-800 hover:border-zinc-600 text-zinc-300 hover:text-white transition-all duration-200 gap-2 px-4 py-2 rounded-lg font-heading"
                    onClick={handleClick}
                >
                    {isLoggedIn ? (
                        <>
                            <UserRoundCheck size={16} />
                            <span>{user?.name || "User"}</span>
                        </>
                    ) : (
                        <>
                            <UserRound size={16} />
                            <span>Login</span>
                        </>
                    )}
                </Button>
            </nav>

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
        </>
    );
}
