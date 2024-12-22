import { FriendCards } from "../components/server/FriendCards"
import { CalendarModalServer } from "../components/server/CalendarModalServer"
import { ProfileModal } from "../components/server/ProfileModal"
import { Dashboard } from "../components/client/Dashbaord"
import { getCalendarData } from "../components/server/actions"
import { mostRecentMonday, localTimeZone, addDateBy, formatDateToISO } from "@utils/functions"

const INTIAL_RANGE: number = 14

export default async function PageLayout() {
    const monday: Date = mostRecentMonday(localTimeZone());

    const range: { start: string; end: string } = {
        start: formatDateToISO(addDateBy(monday, -INTIAL_RANGE)),
        end: formatDateToISO(addDateBy(monday, INTIAL_RANGE + 6))
    };

    const calendarData = await getCalendarData(range.start, range.end);

    return (
        <Dashboard
            FriendCards={<FriendCards />}
            CalendarModalServer={<CalendarModalServer />}
            ProfileModal={<ProfileModal />}
            initCalendarData={calendarData}
            initRange={range}
        />
    );
}
