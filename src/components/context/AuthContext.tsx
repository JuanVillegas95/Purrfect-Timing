"use client"
import React, { useState, createContext, useContext, useEffect, useRef } from "react";
import { signInWithPopup, GoogleAuthProvider, signOut, GithubAuthProvider, onAuthStateChanged, User, signInWithCustomToken } from "firebase/auth";
import { ApiResponse, ClientUser } from "@utils/interfaces";
import { auth } from "@db/firebaseClient";
import { createSession, deleteSession, generateCustomToken } from "@db/serverActions";
import { API_STATUS } from "@utils/constants";
import { useRouter } from 'next/navigation'
import { useToast } from "./ToastContext";

const AuthContext = createContext<{
    user: ClientUser | null;
    error: string | null,
    isSigningIn: boolean,
    signIn: (providerName: "google" | "without") => Promise<string>
    signOut: () => Promise<string>;
} | null>(null)

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthContext.Provider");
    return context;
};

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter()
    const [user, setUser] = useState<ClientUser | null>(null);
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [error, setError] = useState<string | null>("");
    const sessionCheckedRef = useRef(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (authUser: User | null) => {
            console.log("hi")
            if (sessionCheckedRef.current || !authUser || !authUser.uid) return;
            console.log("hi2")

            try {
                setIsSigningIn(true);
                const idTokenResult = await authUser.getIdTokenResult(true);
                const customClaims = idTokenResult.claims;

                const email = authUser.email || (customClaims.email as string | undefined);
                const displayName = authUser.displayName || (customClaims.displayName as string | undefined);

                if (!email || !displayName) {
                    console.error("Missing email or displayName");
                    setError("Missing email or displayName");
                    setUser(null);
                    return;
                }

                const jwtToken = await authUser.getIdToken(true);

                const res: ApiResponse<ClientUser> = await createSession(
                    authUser.uid,
                    email,
                    displayName,
                    jwtToken
                );

                if (res.status !== API_STATUS.SUCCESS) {
                    console.error("Failed to create session:", res.error);
                    setError(res.error);
                    setUser(null);
                } else if (res.status === API_STATUS.SUCCESS) {
                    setUser(res.data);
                    sessionCheckedRef.current = true;
                    router.push("/");
                }
            } catch (err) {
                console.error("Session creation failed:", err);
                setError("Failed to create session.");
                setUser(null);
            } finally {
                setIsSigningIn(false);
            }
        });

        return () => {
            unsubscribe();
        };
    }, []);

    const signIn = async (providerName: "google" | "without"): Promise<string> => {
        setIsSigningIn(true);

        try {
            if (providerName === "google") {
                const provider = new GoogleAuthProvider();
                await signInWithPopup(auth, provider);
                router.push("/");
                return "Welcome! Redirecting you to the main page..."

            }

            if (providerName === "without") {
                const response = await generateCustomToken();
                if (response.status === API_STATUS.FAILED || !response.data) {
                    console.error(response.error)
                    throw new Error("Failed to generate custom token.");
                }
                await signInWithCustomToken(auth, response.data);
                router.push("/");
                return "Welcome! Redirecting you to the main page..."
            }

            throw new Error(`Unsupported provider: ${providerName}`);
        } catch (err) {
            console.error("Sign-in failed:", err);
            return "Sign-in failed: " + (err instanceof Error ? err.message : "Unknown error");
        } finally {
            setIsSigningIn(false);
        }
    };

    const signOutUser = async (): Promise<string> => {
        router.push("/login")
        try {
            await signOut(auth);
            const response = await deleteSession();
            if (response.status === API_STATUS.SUCCESS) {
                setUser(null);
                sessionCheckedRef.current = false;
            } else {
                setError(response.error)
            }
            return response.message
        } catch (error) {
            console.error("Session creation failed:", error);//!THROW ERROR!
            setError("Failed to create session.");
            return "Failed to create session."
        }
    };

    return <AuthContext.Provider value={{ user, signIn, signOut: signOutUser, isSigningIn, error }}>
        {children}
    </AuthContext.Provider>
};

export default AuthProvider;


