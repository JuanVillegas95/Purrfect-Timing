"use client"
import { useAuth } from "@context/AuthContext";
import { FaGithub, FaUserSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { MdOfflineBolt } from "react-icons/md";
import Image from "next/image";
import icon from "../../app/icon.png"
import React, { useState } from "react";
import { LoadingSpinner } from "@ui/LoadingSpinner";
import { Modal } from "@client/Modal";
import { Icon } from "@ui/Icon";
import { RxQuestionMarkCircled } from "react-icons/rx";
import { useToast } from "@context/ToastContext";

export const Login = () => {
    const { isSigningIn, signIn, error } = useAuth();
    const [isInfo, setIsInfo] = useState<boolean>(false);
    const { showToast } = useToast()
    if (isSigningIn) return <LoadingSpinner text="Loading User..." />

    return (
        <div className="min-h-screen bg-gray-100 text-gray-900 flex justify-center items-center">
            {isInfo && (
                <Modal closeActiveModal={() => setIsInfo(false)}>
                    {isInfo && (
                        <Modal closeActiveModal={() => setIsInfo(false)}>
                            <div className="space-y-6 p-6">
                                {/* Title */}
                                <h2 className="text-2xl font-extrabold text-gray-800">Welcome to Purrfect Timing!</h2>

                                {/* About Section */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-blue-500">About Purrfect Timing</h3>
                                    <p className="text-gray-700 leading-relaxed">
                                        Purrfect Timing is a cross-timezone scheduling application designed to help you create, manage, and share events and calendars seamlessly across different time zones. Whether you're collaborating with a team or organizing your personal schedule, Purrfect Timing ensures everything stays in sync.
                                    </p>
                                    <p className="font-semibold">Key Features:</p>
                                    <ul className="list-disc list-inside text-gray-700 space-y-2 pl-4">
                                        <li>Create and manage events with intuitive drag-and-drop functionality.</li>
                                        <li>Support for recurring events and events that span across midnight.</li>
                                        <li>Real-time updates for shared calendars, localized to each user's time zone.</li>
                                        <li>Secure calendar-sharing functionality for seamless collaboration.</li>
                                        <li>Optimized performance with dynamic event-fetching ranges.</li>
                                    </ul>
                                </div>

                                {/* Getting Started */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-blue-500">Getting Started</h3>
                                    <p className="text-gray-700 leading-relaxed">
                                        To start using Purrfect Timing, you have two options:
                                    </p>

                                    {/* Path 1: With a Google Account */}
                                    <div className="space-y-2">
                                        <h4 className="text-md font-semibold text-gray-800">1. Sign In with Google</h4>
                                        <ul className="list-disc list-inside text-gray-700 space-y-2 pl-4">
                                            <li>Sign in with your Google account to access all features.</li>
                                            <li>Your data will be saved and synced across devices.</li>
                                            <li>Create, modify, and share events with ease.</li>
                                            <li>Share your calendar with others and manage shared events independently.</li>
                                            <li>Enjoy real-time updates and collaboration with others.</li>
                                        </ul>
                                    </div>

                                    {/* Path 2: Without an Account */}
                                    <div className="space-y-2">
                                        <h4 className="text-md font-semibold text-gray-800">2. Continue Without an Account</h4>
                                        <ul className="list-disc list-inside text-gray-700 space-y-2 pl-4">
                                            <li>Use the app without signing in, but with limited access to features.</li>
                                            <li>Your data will not be saved or synced across devices.</li>
                                            <li>You cannot share calendars or manage shared events without an account.</li>
                                            <li>Ideal for quick, one-time use or testing the app.</li>
                                            <li>To unlock full functionality, sign in with Google later.</li>
                                        </ul>
                                    </div>

                                    {/* Additional Instructions */}
                                    <p className="text-gray-700 leading-relaxed">
                                        Once you're signed in, you can:
                                    </p>
                                    <ul className="list-disc list-inside text-gray-700 space-y-2 pl-4">
                                        <li>Create events directly on the grid or modify them using drag-and-drop.</li>
                                        <li>Share your calendar with others and manage shared events independently.</li>
                                    </ul>
                                </div>

                                {/* Contact Us Section */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-blue-500">Contact Us</h3>
                                    <p className="text-gray-700 leading-relaxed">
                                        If you have any questions or encounter issues, feel free to reach out to me:
                                    </p>
                                    <ul className="list-disc list-inside text-gray-700 space-y-2 pl-4">
                                        <li>
                                            Email:{" "}
                                            <a
                                                href="mailto:juanemail2001@gmail.com"
                                                className="text-blue-500 hover:underline"
                                            >
                                                juanemail2001@gmail.com
                                            </a>
                                        </li>
                                        <li>
                                            Github:{" "}
                                            <a
                                                href="https://github.com/JuanVillegas95"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-500 hover:underline"
                                            >
                                                JuanVillegas95
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </Modal>
                    )}
                </Modal>
            )}


            <div className="bg-white p-8 inline-flex flex-col w-5/12 relative">

                <div className="absolute top-4 right-4">
                    <Icon
                        icon={RxQuestionMarkCircled}
                        divHeight="2.5rem"
                        divWidth="2.5rem"
                        iconSize="2rem"
                        border={false}
                        onClick={() => setIsInfo(true)}
                    />
                </div>

                <div className="flex justify-center items-center flex-col">
                    <h1 className="text-2xl xl:text-3xl font-extrabold mb-4">Purrfect Timing</h1>
                    <Image src={icon} alt="App Icon" width={100} height={100} />
                </div>
                <div className="w-full mt-8">
                    <div className="flex flex-col items-center gap-5">
                        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                        <button
                            className="w-full font-bold shadow-sm rounded-lg p-3 bg-indigo-100 text-gray-800 flex items-center justify-center"
                            onClick={async () => {
                                const message = await signIn("google")
                                showToast(message)
                            }}
                        >
                            {React.createElement(FcGoogle)}
                            <span className="ml-4">Sign Up with Google</span>
                        </button>
                        <button
                            className="w-full font-bold shadow-sm rounded-lg py-3 bg-indigo-100 text-gray-800 flex items-center justify-center"
                            onClick={async () => {
                                const message = await signIn("without")
                                showToast(message)
                            }}
                        >
                            {React.createElement(FaUserSlash)}
                            <span className="ml-4">Continue Without Account</span>
                        </button>
                    </div>
                </div>
            </div>
        </div >
    );
};
