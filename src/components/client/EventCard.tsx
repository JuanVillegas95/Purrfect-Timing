import React from "react";
import { Event } from "@utils/interfaces";
import { timeInVh } from "@utils/functions";

interface EventCardProps {
    event: Event
    editEvent: (event: Event) => void;
}


export const EventCard: React.FC<EventCardProps> = ({ event, editEvent }) => {
    const { startHours, startMinutes, endMinutes, endHours, color } = event
    const top: number = timeInVh(startHours, startMinutes);
    const height: number = timeInVh(endHours, endMinutes) - top;

    return <div
        className="absolute w-full hover:cursor-pointer rounded-md"
        style={{
            top: `${top}vh`,
            height: `${height}vh`,
            backgroundColor: color,
        }}
        onClick={() => editEvent(event)}
    >
        <p>{event.title}</p>
        <p>{event.description}</p>
    </div>
}

