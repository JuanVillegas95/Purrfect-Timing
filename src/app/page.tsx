import { FriendCards } from "../components/server/FriendCards"
import { CalendarModalServer } from "../components/server/CalendarModalServer"
import { ProfileModal } from "../components/server/ProfileModal"
import { Dashboard } from "../components/client/Dashbaord"
import { mostRecentMonday, localTimeZone, addDateBy, formatDateToISO } from "@utils/functions"
import { initalFetch } from "@db/serverActions"
import { BLANK_CALENDAR_ACTIONS_STATE } from "@utils/constants"
import { InitialFetch } from "@utils/interfaces"

export default async function PageLayout() {
    const initCalendarData: InitialFetch | null = await initalFetch()
    if (!initCalendarData) {
        return <div>Something went wrong</div>
    }
    return <Dashboard initCalendarData={initCalendarData} />
}
