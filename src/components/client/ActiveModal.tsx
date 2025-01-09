import React, { useState } from "react";
import { MODALS, PICKERS } from "@utils/constants";
import { FriendsModal } from "./FriendsModal";
import { EventModal } from "./EventModal";
import { AboutUsModal } from "./AboutUsModal";
import { Event } from "@utils/interfaces";
import { CalendarModal } from "./CalendarModal";
import { ProfileModal } from "@server/ProfileModal";

interface ActiveModalProps {
    activeModal: MODALS;
    closeActiveModal: () => void;
    currentEvent: Event | undefined;
    activePicker: PICKERS
    setActivePicker: (picker: PICKERS) => void;
    timeZone: string;
    calendarId: string;
    switchTimeZone: (timeZone: string) => void;
    currentCalendarId: string;

}

export const ActiveModal: React.FC<ActiveModalProps> = ({ currentCalendarId, switchTimeZone, timeZone, setActivePicker, activePicker, activeModal, closeActiveModal, currentEvent, calendarId }) => {
    const renderContent = () => {
        switch (activeModal) {
            case MODALS.EVENT:
                return <EventModal
                    clickedEvent={currentEvent}
                    closeActiveModal={closeActiveModal}
                    setActivePicker={setActivePicker}
                    activePicker={activePicker}
                    timeZone={timeZone}
                    currentCalendarId={currentCalendarId}
                />;
            case MODALS.FRIENDS:
                return <div></div>
            case MODALS.CALENDARS:
                return <CalendarModal calendarId={calendarId} closeActiveModal={closeActiveModal} />
            case MODALS.PROFILE:
                return <ProfileModal switchTimeZone={switchTimeZone} timeZone={timeZone} />
            case MODALS.ABOUT_US:
                return <AboutUsModal />
            default:
                return <div>No matching modal found.</div>;
        }
    };

    return <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-2147483646">
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