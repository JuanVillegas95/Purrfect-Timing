import React, { useState } from "react";
import { Avatar } from "@ui/Avatar";
import { FaCheck, FaTimes } from "react-icons/fa"; // Icons for accept/deny
import image from "@public/beautiful-latin-woman-avatar-character-icon-free-vector.jpg";
import { DBNotification } from "@utils/interfaces";
import { IoCheckmarkCircleOutline } from "react-icons/io5";
import { RxCrossCircled } from "react-icons/rx";
import { Icon } from "@ui/Icon";

interface NotificationsModalProps {
    initialNotifications: DBNotification[];
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ initialNotifications }) => {
    const [notifications, setNotifications] = useState<DBNotification[]>(initialNotifications);

    const handleAccept = (notification: DBNotification) => {
        console.log(`Accepted request from ${notification.requestingUserName} for ${notification.targetCalendarName}`);
        setNotifications((prev) => prev.filter((n) => n !== notification)); // Remove accepted notification
    };

    const handleDeny = (notification: DBNotification) => {
        console.log(`Denied request from ${notification.requestingUserName} for ${notification.targetCalendarName}`);
        setNotifications((prev) => prev.filter((n) => n !== notification)); // Remove denied notification
    };

    return (
        <div className="max-h-[50vh] max-w-[50vw] overflow-auto">
            {notifications.length > 0 ? (
                notifications.map((notification, index) => (
                    <div
                        key={index}
                        className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 p-5 rounded-md shadow-sm mb-3"
                    >
                        <div className="flex items-center gap-4 pr-4">
                            <div>
                                <p className="text-gray-800 font-medium">{notification.requestingUserName}</p>
                                <p className="text-sm text-gray-500">
                                    Requested access to <span className="font-semibold">{notification.targetCalendarName}</span>
                                </p>
                            </div>
                        </div>

                        {/* Accept/Deny Buttons */}
                        <div className="flex gap-2">
                            <Icon
                                icon={IoCheckmarkCircleOutline}
                                divHeight="2.5rem"
                                divWidth="2.5rem"
                                iconSize="2rem"
                                className="text-blue-500 hover:text-blue-400"
                            />

                            <Icon icon={RxCrossCircled}
                                divHeight="2.5rem"
                                divWidth="2.5rem"
                                iconSize="2rem"
                                className="text-red-500 hover:text-red-400"

                            />

                        </div>
                    </div>
                ))
            ) : (
                <p className="text-sm text-gray-500 text-center">No new notifications</p>
            )}
        </div>
    );
};
