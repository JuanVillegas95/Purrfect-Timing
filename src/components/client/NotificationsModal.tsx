import React, { useEffect, useState } from "react";
import { ClientNotification } from "@utils/interfaces";
import { IoCheckmarkCircleOutline } from "react-icons/io5";
import { RxCrossCircled } from "react-icons/rx";
import { Icon } from "@ui/Icon";
import { useAuth } from "@context/AuthContext";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "@db/firebaseClient";
import { acceptCalendarRequest, denyCalendarRequest } from "@db/clientActions";
import { useToast } from "@context/ToastContext";


export const NotificationsModal: React.FC = () => {
    const [notifications, setNotifications] = useState<ClientNotification[]>([]);
    const { user } = useAuth();
    const { showToast } = useToast();

    useEffect(() => {
        if (!user?.userId) return;

        const notificationsQuery = query(collection(db, `users/${user.userId}/notifications`));

        const unsubNotifications = onSnapshot(notificationsQuery, (snapshot) => {
            setNotifications((prev) => {
                let updated = [...prev];
                snapshot.docChanges().forEach((change) => {
                    const changedNotifications: ClientNotification = {
                        id: change.doc.id,
                        ...change.doc.data(),
                    } as ClientNotification;

                    switch (change.type) {
                        case "added":
                            updated.push(changedNotifications);
                            break;
                        case "modified": {
                            const idx = updated.findIndex((c) => c.id === changedNotifications.id);
                            if (idx !== -1) updated[idx] = changedNotifications;
                            break;
                        }
                        case "removed":
                            updated = updated.filter((c) => c.id !== changedNotifications.id);
                            break;
                    }
                });
                return updated;
            });
        });
        return unsubNotifications;
    }, [user?.userId]);



    if (!user?.userId) return <div>No user</div>
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

                        <div className="flex gap-2">
                            <Icon
                                icon={IoCheckmarkCircleOutline}
                                divHeight="2.5rem"
                                divWidth="2.5rem"
                                iconSize="2rem"
                                className="text-blue-500 hover:text-blue-400"
                                onClick={async () => {
                                    const response = await acceptCalendarRequest(
                                        user.userId,
                                        notification.id,
                                        notification,
                                    )
                                    showToast(response.message)
                                }}
                            />

                            <Icon icon={RxCrossCircled}
                                divHeight="2.5rem"
                                divWidth="2.5rem"
                                iconSize="2rem"
                                className="text-red-500 hover:text-red-400"
                                onClick={async () => {
                                    const response = await denyCalendarRequest({ userId: user.userId, notificationId: notification.id })
                                    showToast(response.message)
                                }}
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
