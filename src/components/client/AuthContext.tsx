"use client"
import React, { useState, createContext, useContext, useEffect } from "react";
import { signInWithPopup, GoogleAuthProvider, signOut, GithubAuthProvider, onAuthStateChanged, UserCredential, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { UserServer } from "@utils/interfaces";
import { auth } from "@db/firebaseClient";
import { createSessionServer } from "@db/serverActions";

const AuthContext = createContext<{
    user: userClient | null;
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

interface userClient {
    uid: string,
    name: string,
    email: string
}

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<userClient | null>(null);
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [error, setError] = useState<string>("");
    const router = useRouter()

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
            if (firebaseUser) {
                const { uid, email, displayName: name } = firebaseUser;
                if (uid && email && name) {
                    try {
                        await createSessionServer(uid, email, name);
                        setUser({ email, name, uid });
                    } catch (err) {
                        console.error("Session creation failed:", err);
                        setError("Failed to create session.");
                    }
                } else {
                    setError("Incomplete user information.");
                }
            } else {
                setUser(null);
            }
        });

        return () => unsubscribe();
    }, []);

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


