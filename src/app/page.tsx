
import { Dashboard } from "@/client/Dashbaord";
import { Friends } from "@/server/friends/Friends";
import { Events } from "@/server/events/Events";
import { Profile } from "@/server/profile/Profile";
export default function PageLayout() {
    return <Dashboard Friends={<Friends />} Events={<Events />} Profile={<Profile />} />
}
