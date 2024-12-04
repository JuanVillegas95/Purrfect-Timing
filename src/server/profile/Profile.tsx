import React from "react";
import { createNewEvent } from "@/server/newEventModal";
import Input from "../../client/Input";


export const Profile = async () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white shadow-md rounded-lg p-6 w-96">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Hi!</h1>
                <p className="text-gray-600 mb-6">Profile Info</p>

                {/* Profile Icon */}
                <div className="flex items-center justify-center mb-6">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center relative">
                        {/* Placeholder for Profile Icon */}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-8 w-8 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5.121 17.804A5.001 5.001 0 0112 15c1.657 0 3.156.804 4.121 2.062M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                        </svg>
                        {/* Add Icon */}
                        <div className="absolute bottom-0 right-0 bg-blue-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-sm">
                            +
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2" htmlFor="name">
                            Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="Enter your name"
                        />
                    </div>
                    <div className="mb-4">
                        <label
                            className="block text-gray-700 font-medium mb-2"
                            htmlFor="surname"
                        >
                            Surname
                        </label>
                        <input
                            type="text"
                            id="surname"
                            name="surname"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="Enter your surname"
                        />
                    </div>
                    <div className="mb-4">
                        <label
                            className="block text-gray-700 font-medium mb-2"
                            htmlFor="timezone"
                        >
                            Your Timezone
                        </label>
                        <input
                            type="text"
                            id="timezone"
                            name="timezone"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="Enter your timezone"
                        />
                    </div>
                </form>
            </div>
        </div>
    );
};

