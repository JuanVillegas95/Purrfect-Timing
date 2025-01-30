import { initialFetch } from "@db/serverActions";
import { Dashboard } from "@client/Dashbaord";
import { redirect } from "next/navigation";
import { API_STATUS } from "@utils/constants";

export default async function PageLayout() {
    const response = await initialFetch();

    // Redirect to login if no session token is found
    if (response.status === API_STATUS.FAILED && response.error?.includes("No session token")) {
        redirect("/login");
        return null;
    }

    // Handle other errors
    if (response.status === API_STATUS.FAILED || !response.data) {
        console.error(response.error);
        redirect("/error?message=" + encodeURIComponent(response.error || "An unexpected error occurred."));
        return null;
    }

    const firstCalendarId = response.data;

    return <Dashboard firstCalendarId={firstCalendarId} />;
}