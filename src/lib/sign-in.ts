import { authClient } from "./auth-client";

export async function signInWithGithub() {
    await authClient.signIn.social({
        provider: "github",
        callbackURL: "/",
        errorCallbackURL: "/error",
        newUserCallbackURL: "/",
        disableRedirect: false,
    });
}

export async function signInWithGoogle() {
    await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
        errorCallbackURL: "/error",
        newUserCallbackURL: "/",
        disableRedirect: false,
    });
}