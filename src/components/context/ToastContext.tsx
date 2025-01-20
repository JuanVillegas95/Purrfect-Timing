"use client"
import React, { useState, createContext, useContext, useEffect, ReactNode } from "react";
import { signInWithPopup, GoogleAuthProvider, signOut, GithubAuthProvider, onAuthStateChanged, UserCredential, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { UserServer } from "@utils/interfaces";
import { auth } from "@db/firebaseClient";
import { createSessionServer } from "@db/serverActions";



const ToastContext = createContext<{
    showToast: (message: string) => void;
} | null>(null)

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error("useToast must be used within a ToastContext.Provider");
    return context;
};

interface Toast {
    id: number;
    message: string;
}

const ToastProvider = ({ children }: { children: ReactNode }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    useEffect(() => {
        const toastCleanup = setTimeout(() => {
            if (toasts.length > 0) {
                setToasts([]);
            }
        }, 10000); // REMOVE ALL TOAST AFTER 10 SECS

        return () => clearTimeout(toastCleanup);
    }, [toasts]);

    const showToast = (message: string) => {
        const newToast: Toast = { id: Date.now(), message };
        setToasts((prevToasts) => [...prevToasts, newToast]);


        setTimeout(() => {
            setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== newToast.id));
        }, 3000);
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 space-y-4 z-50">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className="bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg flex items-center transition transform opacity-100 animate-slide-up"
                    >
                        <p>{toast.message}</p>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export default ToastProvider;
