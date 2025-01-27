import { Dashboard } from "../components/client/Dashbaord"
import { initalFetch } from "@db/serverActions"
import { InitialFetch } from "@utils/interfaces"

export default async function PageLayout() {
    const initCalendarData: InitialFetch | null = await initalFetch()
    if (!initCalendarData) {
        return <div>Something went wrong</div>
    }
    return <Dashboard initCalendarData={initCalendarData} />
}
