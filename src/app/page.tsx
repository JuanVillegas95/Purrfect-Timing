import { FriendCards } from "@server/friend/cards/FriendCards"
import { CalendarCards } from "@server/calendar/cards/CalendarCards"
import { ProfileModal } from "@server/profile/ProfileModal"
import { Dashboard } from "@client/Dashbaord"
import { getEventsAndTimeZone } from "@server/calendar/calendarActions"

export default async function PageLayout() {
    const info = await getEventsAndTimeZone();
    return <Dashboard
        FriendCards={<FriendCards />}
        CalendarCards={<CalendarCards />}
        ProfileModal={<ProfileModal />}
        info={info}
    />
}
