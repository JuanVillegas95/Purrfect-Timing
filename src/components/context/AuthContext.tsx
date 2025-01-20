"use client"
import React, { useState, createContext, useContext, useEffect, useRef } from "react";
import { signInWithPopup, GoogleAuthProvider, signOut, GithubAuthProvider, onAuthStateChanged, UserCredential, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { ApiResponse, DBUser, DBCalendar, ClientUser } from "@utils/interfaces";
import { auth } from "@db/firebaseClient";
import { createSession } from "@db/serverActions";
import { API_STATUS } from "@utils/constants";

const AuthContext = createContext<{
    user: ClientUser | null;
    error: string,
    isSigningIn: boolean,
    signIn: (providerName: "google" | "github") => Promise<void>
    signOut: () => Promise<void>;
} | null>(null)

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthContext.Provider");
    return context;
};

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<ClientUser | null>(null);
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [error, setError] = useState<string>("");
    const router = useRouter()
    const sessionCheckedRef = useRef(false);
    useEffect(() => {

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
            if (!firebaseUser || !firebaseUser.email || !firebaseUser.displayName) {
                setUser(null); // Clear session if user is logged out
                sessionCheckedRef.current = false; // Reset for future logins
                return;
            }

            const { uid, email, displayName } = firebaseUser;

            // Avoid calling createSession if session has already been established
            if (sessionCheckedRef.current) {
                console.log("Session already checked, skipping createSession.");
                return;
            }

            try {
                // Attempt to create/retrieve a session
                const res: ApiResponse<ClientUser> = await createSession(uid, email, displayName);

                if (res.status !== API_STATUS.SUCCESS) {
                    console.error("Failed to create session:", res.error);
                    setError("Failed to create session.");
                    setUser(null); // Clear user if session creation fails
                    return;
                }

                setUser(res.data); // Update user state
                sessionCheckedRef.current = true; // Mark session as handled
            } catch (err) {
                console.error("Session creation failed:", err);
                setError("Failed to create session.");
                setUser(null); // Clear user on error
            }
        });

        return () => unsubscribe();
    }, []); // No dependency on user, avoiding infinite loops


    const signIn = async (providerName: "google" | "github"): Promise<void> => {
        setIsSigningIn(true);
        try {
            let provider;
            switch (providerName) {
                case "google":
                    provider = new GoogleAuthProvider();
                    break;
                case "github":
                    provider = new GithubAuthProvider();
                    break;
                default:
                    throw new Error(`Unsupported provider: ${providerName}`);
            }
            await signInWithPopup(auth, provider);
        } catch (err) {
            console.error("Sign-in failed:", err);
        } finally {
            setIsSigningIn(false);
        }
    }

    const signOutUser = async (): Promise<void> => {
        try {
            await signOut(auth);
        }
        catch (error) {
            console.error("Error during sign-out:", error);
        }
    };

    return <AuthContext.Provider value={{ user, signIn, signOut: signOutUser, isSigningIn, error }}>
        {children}
    </AuthContext.Provider>
};

export default AuthProvider;


