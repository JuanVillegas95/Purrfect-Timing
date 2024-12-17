import { FriendCards } from "../components/server/FriendCards"
import { CalendarCards } from "../components/server/CalendarCards"
import { ProfileModal } from "../components/server/ProfileModal"
import { Dashboard } from "../components/client/Dashbaord"
import { getEventsAndTimeZone } from "../components/server/actions"

export default async function PageLayout() {
    const info = await getEventsAndTimeZone();
    return <Dashboard
        FriendCards={<FriendCards />}
        CalendarCards={<CalendarCards />}
        ProfileModal={<ProfileModal />}
        info={info}
    />
}
