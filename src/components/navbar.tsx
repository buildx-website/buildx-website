"use client"

import { Loader, User } from "lucide-react";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AuthCard } from "./AuthCard";

export function Navbar() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("User");
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    async function checkAuth() {
        setLoading(true);
        const token = localStorage.getItem("token");
        const name = localStorage.getItem("name");
        if (token && name) {
            setIsLoggedIn(true);
            setName(name);
        } else {
            setIsLoggedIn(false);
        }
        setLoading(false);
    }

    useEffect(() => {
        checkAuth();
    }, []);

    function handleClick() {
        setIsDialogOpen(true);
    }

    return (
        <nav className="w-full row-start-1 flex justify-end items-center px-4 sm:px-0">
            <Button
                variant="outline"
                className="flex items-center gap-2 border border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] text-slate-400 hover:text-slate-200 hover:bg-[length:220%_100%] transition-colors"
                onClick={handleClick}
            >
                {loading && <Loader size={16} />}

                {isLoggedIn && !loading && (
                    <>
                        <User size={16} />
                        <span>{name}</span>
                    </>
                )}

                {!isLoggedIn && !loading && (
                    <>
                        <User size={16} />
                        <span>Login</span>
                    </>
                )}
            </Button>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <AuthCard setIsDialogOpen={setIsDialogOpen} />
                </DialogContent>
            </Dialog>
        </nav>
    );
}
