"use server"

import { UserCalendarActionsState } from "@utils/interfaces";
import { getUserCalendars } from "./actions";
import { CalendarModal } from "@client/CalendarModal";

export const CalendarModalServer = async () => {
    const calendarInfo = await getUserCalendars();

    return <CalendarModal calendarsData={calendarInfo} />
};

