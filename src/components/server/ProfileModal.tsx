import React from "react";
import { ProfilePictureServer } from "@server/ProfilePictureServer";
import { ProfilePicture } from "@client/ProfilePicture";

export const ProfileModal = async () => {
    return <div className="w-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Hi!</h1>
        <p className="text-gray-600 mb-6">Profile Info</p>
        <div className="flex items-center justify-center m-2 gap-4">
            <ProfilePicture>
                <ProfilePictureServer />
            </ProfilePicture>
            <div className="flex flex-col gap-3">
                <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Enter your surname"
                />
            </div>
        </div>
        <p className="block text-gray-700 font-medium mb-2">
            Your Timezone
        </p>
    </div>
};

