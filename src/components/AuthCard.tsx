"use client"

import { useState } from "react"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Github, Loader2, Mail } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { signInWithGithub } from "@/lib/sign-in"

export function AuthCard({ setIsDialogOpen }: { setIsDialogOpen: (value: boolean) => void }) {
    const [isLoading, setIsLoading] = useState<{
        github: boolean
        google: boolean
    }>({
        github: false,
        google: false,
    })

    async function handleGithubSignIn() {
        try {
            setIsLoading((prev) => ({ ...prev, github: true }))
            await signInWithGithub()
            setIsDialogOpen(false)
        } catch (error) {
            console.error("Something went wrong with GitHub login: ", error)
            toast.error("Something went wrong with GitHub login")
        } finally {
            setIsLoading((prev) => ({ ...prev, github: false }))
        }
    }

    async function handleGoogleSignIn() {
        try {
            setIsLoading((prev) => ({ ...prev, google: true }))
            // await signIn("google", { callbackUrl: "/" })
            setIsDialogOpen(false)
        } catch (error) {
            console.error("Something went wrong with Google login: ", error)
            toast.error("Something went wrong with Google login")
        } finally {
            setIsLoading((prev) => ({ ...prev, google: false }))
        }
    }

    return (
        <>
            <CardHeader>
                <CardTitle className="text-center text-2xl font-semibold text-gray-800 dark:text-white">Sign in</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex flex-col space-y-3">
                    <Button
                        variant="outline"
                        onClick={handleGithubSignIn}
                        disabled={isLoading.github}
                        className="w-full py-6 font-medium rounded-lg transition-all"
                    >
                        {isLoading.github ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Github className="mr-2 h-4 w-4" />}
                        Continue with GitHub
                    </Button>

                    <Button
                        variant="outline"
                        onClick={handleGoogleSignIn}
                        disabled={isLoading.google}
                        className="w-full py-6 font-medium rounded-lg transition-all"
                    >
                        {isLoading.google ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                        Continue with Google
                    </Button>
                </div>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Secure Authentication</span>
                    </div>
                </div>

                <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                    By signing in, you agree to our Terms of Service and Privacy Policy
                </p>
            </CardContent>
        </>
    )
}
