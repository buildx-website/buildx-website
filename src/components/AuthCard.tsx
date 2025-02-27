"use client";

import { useState } from "react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function AuthCard({ setIsDialogOpen }: { setIsDialogOpen: (value: boolean) => void }) {
    const [isSignup, setIsSignup] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit() {
        setIsLoading(true);
        if (isSignup) {
            await signup();
        } else {
            await login();
        }
        setIsLoading(false);
    }

    async function login() {
        try {
            const res = await fetch("/api/signin", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();
            console.log(data)

            if (res.ok) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("name", data.name);
                setIsDialogOpen(false);
                toast.success("Logged in successfully");
            } else {
                toast.error(data.error);
            }
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong");
        }
    }

    async function signup() {
        try {
            const res = await fetch("/api/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await res.json();
            console.log("res", data);

            if (res.ok) {
                toast.success("Account created successfully. Please login");
            } else {
                toast.error(data.error);
            }
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong");
        }
    }

    return (
        <>
            <CardHeader>
                <CardTitle className="text-center text-2xl font-semibold text-gray-800 dark:text-white">
                    {isSignup ? "Sign Up" : "Login"}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {isSignup && (
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Name
                        </Label>
                        <Input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your name"
                            className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-400"
                        />
                    </div>
                )}
                <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-400"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Password
                    </Label>
                    <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-400"
                    />
                </div>
                <Button
                    className="w-full py-2 font-medium rounded-lg transition-all"
                    onClick={handleSubmit}
                    disabled={isLoading}
                >
                    {isLoading ? "Processing..." : isSignup ? "Sign Up" : "Login"}
                </Button>
                <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                    {isSignup ? "Already have an account? " : "Don't have an account? "}
                    <button className="text-indigo-300 hover:underline" onClick={() => setIsSignup(!isSignup)}>
                        {isSignup ? "Login" : "Sign Up"}
                    </button>
                </div>
            </CardContent>
        </>
    );
}
