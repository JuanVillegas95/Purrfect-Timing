import React from "react";
import { MODALS } from "../utils/constants";
import NewEventtModal from "./NewEventtModal";
import { FriendsModal } from "./FriendsModal";
import { Profile } from "@/server/profile/Profile";


interface ActiveModalProps {
    activeModal: MODALS;
    Friends: React.ReactNode;
    Profile: React.ReactNode;
}

export const ActiveModal: React.FC<ActiveModalProps> = ({ activeModal, Friends, Profile }) => {
    const renderContent = () => {
        switch (activeModal) {
            case MODALS.ADD_EVENT:
                return <NewEventtModal />;
            case MODALS.FRIENDS:
                return <FriendsModal Friends={Friends} />
            case MODALS.CALENDARS:
                return <></>
            case MODALS.PROFILE:
                return <>{Profile}</>
            default:
                return <div>No matching modal found.</div>;
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-5 flex items-center justify-center rounded-lg relative z-60">
                {renderContent()}
            </div>
        </div>
    );


};


