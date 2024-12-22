import React, { useState } from "react";
import { MODALS, PICKERS } from "@utils/constants";
import { FriendsModal } from "./FriendsModal";
import { EventModal } from "./EventModal";
import { AboutUsModal } from "./AboutUsModal";
import { Event } from "@utils/interfaces";
import { CalendarModal } from "./CalendarModal";

interface ActiveModalProps {
    activeModal: MODALS;
    FriendCards: React.ReactNode;
    ProfileModal: React.ReactNode;
    closeActiveModal: () => void;
    setEvent: (event: Event, isRepeating: boolean) => void;
    deleteEvent: (event: Event) => void;
    clickedEvent?: Event;
    activePicker: PICKERS
    setActivePicker: (picker: PICKERS) => void;
    timeZone: string;
    switchCalendar: (calendarId: string) => Promise<void>
    calendarId: string;
}

export const ActiveModal: React.FC<ActiveModalProps> = ({ deleteEvent, timeZone, setActivePicker, activePicker, activeModal, FriendCards, ProfileModal, closeActiveModal, setEvent, clickedEvent, switchCalendar, calendarId }) => {
    const renderContent = () => {
        switch (activeModal) {
            case MODALS.EVENT:
                return <EventModal
                    setEvent={setEvent}
                    clickedEvent={clickedEvent}
                    closeActiveModal={closeActiveModal}
                    setActivePicker={setActivePicker}
                    activePicker={activePicker}
                    timeZone={timeZone}
                    deleteEvent={deleteEvent}
                />;
            case MODALS.FRIENDS:
                return <FriendsModal FriendCards={FriendCards} />
            case MODALS.CALENDARS:
                return <CalendarModal calendarId={calendarId} switchCalendar={switchCalendar} />
            case MODALS.PROFILE:
                return <div>{ProfileModal}</div>
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