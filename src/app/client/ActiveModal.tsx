import React from "react";
import { MODALS } from "@utils/constants";
import { FriendsModal } from "@client/FriendsModal";
import { EventModal } from "@client/EventModal";
import { CalendarsModals } from "@client/CalendarsModals"
import { AboutUsModal } from "./AboutUsModal";
import { Event } from "@utils/interfaces";

interface ActiveModalProps {
    activeModal: MODALS;
    FriendCards: React.ReactNode;
    CalendarCards: React.ReactNode;
    ProfileModal: React.ReactNode;
    closeActiveModal: () => void;
    setEvent: (event: Event) => void;
    clickedEvent?: Event;
}

export const ActiveModal: React.FC<ActiveModalProps> = ({ activeModal, FriendCards, CalendarCards, ProfileModal, closeActiveModal, setEvent, clickedEvent }) => {
    const renderContent = () => {
        switch (activeModal) {
            case MODALS.EVENT:
                return <EventModal setEvent={setEvent} clickedEvent={clickedEvent} />;
            case MODALS.FRIENDS:
                return <FriendsModal FriendCards={FriendCards} />
            case MODALS.CALENDARS:
                return <CalendarsModals CalendarCards={CalendarCards} />
            case MODALS.PROFILE:
                return <div>{ProfileModal}</div>
            case MODALS.ABOUT_US:
                return <AboutUsModal />
            default:
                return <div>No matching modal found.</div>;
        }
    };

    return <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50 ">
        <div className="bg-white p-8 flex items-center justify-center rounded-lg relative z-60 shadow-md">
            <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                onClick={closeActiveModal}
            >
                ✖
            </button>
            {renderContent()}

        </div>
    </div>



};