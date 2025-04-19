"use client"

import { useEffect, useState } from "react"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Eye, EyeOff, LogOut, UserCog } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { authClient } from "@/lib/auth-client"

export function UserCard({ setIsDialogOpen }: { setIsDialogOpen: (value: boolean) => void }) {
    const name = localStorage.getItem("name") || "User"
    const [apiKey, setApiKey] = useState<string | undefined>("")
    const [isApiKeyVisible, setIsApiKeyVisible] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)
    const [loading, setLoading] = useState(false)

    async function fetchApiKey() {
        setLoading(true)
        try {
            const res = await fetch("/api/main/api", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json",
                },
            })
            if (res.ok) {
                const data = await res.json()
                setApiKey(data.apiKey)
            } else {
                toast.error("Failed to fetch API Key")
            }
        } catch {
            toast.error("Something went wrong")
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchApiKey()
    }, [])

    async function updateApiKey() {
        setIsUpdating(true)
        try {
            const res = await fetch("/api/main/api", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ apiKey }),
            })
            if (res.ok) {
                toast.success("API Key updated successfully")
            } else {
                toast.error("Failed to update API Key")
            }
        } catch {
            toast.error("Something went wrong")
        }
        setIsUpdating(false)
    }

    async function handleLogout() {
        localStorage.removeItem("name")
        await authClient.signOut()
        window.location.href = "/";
        setIsDialogOpen(false)
        toast.success("Logged out successfully");
    }

    return (
        <>
            <CardHeader className="pb-4">
                <div className="flex items-center justify-center mb-2">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                        <UserCog size={32} className="text-muted-foreground" />
                    </div>
                </div>
                <CardTitle className="text-center text-2xl font-semibold">{name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="apiKey" className="text-sm font-medium">
                        API Key
                    </Label>
                    <div className="relative">
                        <Input
                            id="apiKey"
                            type={isApiKeyVisible ? "text" : "password"}
                            value={loading ? "Loading..." : apiKey || ""}
                            readOnly={loading}
                            autoComplete="off"
                            onChange={(e) => setApiKey(e.target.value)}
                            disabled={loading}
                            className="w-full pr-10 transition-all"
                            placeholder="Enter your API key"
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1 h-8 w-8"
                            onClick={() => setIsApiKeyVisible(!isApiKeyVisible)}
                            aria-label={isApiKeyVisible ? "Hide API key" : "Show API key"}
                        >
                            {isApiKeyVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                        </Button>
                    </div>
                </div>

                <Button onClick={updateApiKey} disabled={isUpdating} className="font-medium transition-all">
                    {isUpdating ? (
                        <>
                            <svg
                                className="animate-spin -ml-1 mr-2 h-4 w-4"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                            Updating...
                        </>
                    ) : (
                        "Update API Key"
                    )}
                </Button>

                <Separator />

                <Button onClick={handleLogout} variant="destructive" className="font-medium transition-all">
                    <LogOut size={16} className="mr-2" /> Logout
                </Button>
            </CardContent>
        </>
    )
}

