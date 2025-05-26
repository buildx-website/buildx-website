"use client"

import { useState } from "react"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { FaGithub, FaGoogle } from "react-icons/fa";
import { ImSpinner2 } from "react-icons/im";
import { Separator } from "@/components/ui/separator"
import { signInWithGithub, signInWithGoogle } from "@/lib/sign-in"

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
            await signInWithGoogle()
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
                <CardTitle className="text-center text-2xl font-semibold text-gray-800 dark:text-white font-heading">Start Creating with us</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 font-heading">
                <div className="flex flex-col space-y-3">
                    <Button
                        onClick={handleGithubSignIn}
                        disabled={isLoading.github}
                        className="w-full py-6 font-medium rounded-lg transition-all hover:underline"
                    >
                        {isLoading.github ? <ImSpinner2 className="mr-2 h-4 w-4 animate-spin" /> : <FaGithub className="mr-2 h-4 w-4" />}
                        Continue with GitHub
                    </Button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <Separator className="w-full" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">OR</span>
                        </div>
                    </div>



                    <Button
                        onClick={handleGoogleSignIn}
                        disabled={isLoading.google}
                        className="w-full py-6 font-medium rounded-lg transition-all hover:underline"
                    >
                        {isLoading.google ? <ImSpinner2 className="mr-2 h-4 w-4 animate-spin" /> :
                            <FaGoogle className="mr-2 h-4 w-4" />
                        }
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
                    Accounts with same email will be merged irrespective of the provider. <br />
                </p>
            </CardContent>
        </>
    )
}