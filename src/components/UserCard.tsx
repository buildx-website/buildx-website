"use client"

import { useEffect, useState } from "react"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Eye, EyeOff, LogOut, UserCog, Settings } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { authClient } from "@/lib/auth-client"
import { useUser } from "@/hooks/useUser"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

export function UserCard({ setIsDialogOpen }: { setIsDialogOpen: (value: boolean) => void }) {
    const [apiKey, setApiKey] = useState<string | undefined>("")
    const [isApiKeyVisible, setIsApiKeyVisible] = useState(false)
    const [loading, setLoading] = useState(false)
    const [selectedModel, setSelectedModel] = useState("claude-3-opus")
    const { user, currentSession } = useUser();
    const router = useRouter();

    const userPlan = "Trial";
    
    // Format the last login time
    const lastLogin = currentSession?.updatedAt 
        ? new Date(currentSession.updatedAt).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
        : 'Never';

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
    }

    async function handleLogout() {
        await authClient.signOut();
        window.location.href = "/";
        setIsDialogOpen(false)
        toast.success("Logged out successfully");
    }

    return (
        <>
            <CardHeader className="pb-4">
                <div className="flex items-center justify-center mb-3">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                        {user?.image ? (
                            <img 
                                src={user.image} 
                                alt={user.name || "User"} 
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <UserCog size={32} className="text-muted-foreground" />
                        )}
                    </div>
                </div>
                <div className="flex flex-col items-center">
                    <CardTitle className="text-center text-2xl font-semibold mb-1">
                        {user?.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="font-normal">
                            {userPlan}
                        </Badge>
                        <span className="text-sm text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">{user?.email}</span>
                    </div>
                    <div className="text-xs text-muted-foreground/70">
                        Last login: {lastLogin}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="apiKey" className="text-sm font-medium flex items-center justify-between">
                        <span>API Key</span>
                        <span className="text-xs text-muted-foreground">(Coming Soon)</span>
                    </Label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Input
                                id="apiKey"
                                type={isApiKeyVisible ? "text" : "password"}
                                value={loading ? "Loading..." : apiKey || ""}
                                readOnly={loading}
                                autoComplete="off"
                                onChange={(e) => setApiKey(e.target.value)}
                                disabled={true}
                                className="w-full pr-10 transition-all opacity-50"
                                placeholder="API Key feature coming soon"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 top-1 h-8 w-8"
                                onClick={() => setIsApiKeyVisible(!isApiKeyVisible)}
                                aria-label={isApiKeyVisible ? "Hide API key" : "Show API key"}
                                disabled={true}
                            >
                                {isApiKeyVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                            </Button>
                        </div>
                        <Select value={selectedModel} onValueChange={setSelectedModel} disabled={true}>
                            <SelectTrigger className="w-[180px] opacity-50">
                                <SelectValue placeholder="Select model" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                                <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                                <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                                <SelectItem value="gpt-4">GPT-4</SelectItem>
                                <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button 
                            onClick={updateApiKey} 
                            disabled={true} 
                            variant="outline"
                            size="icon"
                            className="opacity-50 hover:bg-muted"
                            title="Configure API Settings"
                        >
                            <Settings size={16} />
                        </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        You can use your own API key to access various AI models. 
                    </p>
                </div>

                <Separator />

                <div className="flex gap-2">
                    <Button 
                        onClick={() => {
                            router.push('/settings');
                            setIsDialogOpen(false);
                        }} 
                        variant="outline" 
                        className="font-medium transition-all flex-1"
                    >
                        <Settings size={16} className="mr-2" /> Settings
                    </Button>
                    <Button onClick={handleLogout} variant="destructive" className="font-medium transition-all flex-1">
                        <LogOut size={16} className="mr-2" /> Logout
                    </Button>
                </div>
            </CardContent>
        </>
    )
}

