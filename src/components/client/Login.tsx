"use client";
import { useAuth } from "@client/AuthContext"
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import React from "react";
export const Login = () => {
    const { isSigningIn, signIn, error } = useAuth()


    if (isSigningIn) return <p>Login...</p>

    return <div className="min-h-screen bg-gray-100 text-gray-900 flex justify-center items-center">
        <div className="bg-white p-8 inline-flex flex-col w-5/12">
            <h1 className="text-2xl xl:text-3xl font-extrabold">Sign up</h1>
            <div className="w-full mt-8">
                <div className="flex flex-col items-center gap-5">
                    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                    <button
                        className="w-full font-bold shadow-sm rounded-lg p-3 bg-indigo-100 text-gray-800 flex items-center justify-center"
                        onClick={() => signIn("google")}
                    >
                        {React.createElement(FcGoogle)}
                        <span className="ml-4">Sign Up with Google</span>
                    </button>
                    <button
                        className="w-full font-bold shadow-sm rounded-lg py-3 bg-indigo-100 text-gray-800 flex items-center justify-center"
                        onClick={() => signIn("github")}
                    >
                        {React.createElement(FaGithub)}
                        <span className="ml-4">Sign Up with GitHub</span>
                    </button>
                </div>
            </div>
        </div>
    </div>

}

