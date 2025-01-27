import React from "react";
import { MODALS, PICKERS } from "@utils/constants";
import { EventModal } from "./EventModal";
import { AboutUsModal } from "./AboutUsModal";
import { Event } from "@utils/interfaces";
import { CalendarModal } from "./CalendarModal";
import { ProfileModal } from "@server/ProfileModal";
import { NotificationsModal } from "./NotificationsModal";
import Modal from "./Modal";

interface ActiveModalProps {
    activeModal: MODALS;
    closeActiveModal: () => void;
    currentEvent: Event | undefined;
    activePicker: PICKERS
    setActivePicker: (picker: PICKERS) => void;
    timeZone: string;
    currentCalendarId: string;
    switchCalendar: (calendarId: string) => Promise<void>;
}

export const ActiveModal: React.FC<ActiveModalProps> = ({ currentCalendarId, timeZone, setActivePicker, activePicker, activeModal, closeActiveModal, currentEvent, switchCalendar }) => {
    const renderContent = (): React.JSX.Element => {
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
            case MODALS.CALENDARS:
                return <CalendarModal
                    currentCalendarId={currentCalendarId}
                    switchCalendar={switchCalendar}
                />
            case MODALS.NOTIFICATIONS:
                return <NotificationsModal
                />
            case MODALS.PROFILE:
                return <ProfileModal />
            case MODALS.ABOUT_US:
                return <AboutUsModal />
            default:
                return <div>No matching modal found.</div>;
        }
    };

    return <Modal closeActiveModal={closeActiveModal}>
        {renderContent()}
    </Modal>
};