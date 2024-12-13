import React from "react";
import { Event } from "@utils/interfaces";
import { timeInVh } from "@utils/functions";

interface EventCardProps {
    event: Event
    editEvent: (event: Event) => void;
}


export const EventCard: React.FC<EventCardProps> = ({ event, editEvent }) => {
    const top: number = timeInVh(event.startHours, event.startMinutes);
    const height: number = timeInVh(event.endHours, event.endMinutes) - top;

    return <div
        className="absolute border-8 border-sky-500 w-full z-10 hover:cursor-pointer"
        style={{
            top: `${top}vh`,
            height: `${height}vh`,
        }}
        onClick={() => editEvent(event)}
    />
}

