import { authClient } from "./auth-client";

export async function signInWithGithub() {
    await authClient.signIn.social({
        /**
         * The social provider id
         * @example "github", "google", "apple"
        */
        provider: "github",
        /**
         * A URL to redirect after the user authenticates with the provider
      * @default "/"
        */
        callbackURL: "/",
        /**
         * A URL to redirect if an error occurs during the sign in process
        */
        errorCallbackURL: "/error",
        /**
         * A URL to redirect if the user is newly registered
        */
        newUserCallbackURL: "/",
        /**
         * disable the automatic redirect to the provider. 
         * @default false
        */
        disableRedirect: false,
    });
}