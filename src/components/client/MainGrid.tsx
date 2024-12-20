import React, { forwardRef } from "react";
import { HOURS_HEIGHT_VH } from "../../utils/constants";
import { Event } from "../../utils/interfaces";
import { addDateBy, formatDateToISO } from "../../utils/functions";
import { EventCard } from "./EventCard";
import { WeekdaySets } from "@utils/types";

interface MainGridProps {
    monday: Date;
    Events?: React.ReactNode;
    weekBuckets: WeekdaySets;
    editEvent: (event: Event) => void;
    eventIdToEvent: Map<string, Event>;
    isLoadingEvents: boolean;
}

export const MainGrid = forwardRef<HTMLDivElement, MainGridProps>(
    ({ monday, weekBuckets, editEvent, isLoadingEvents, eventIdToEvent }, ref) => {
        if (isLoadingEvents) {
            return <div>...isLoadingEvents</div>;
        }
        return <div
            ref={ref}
            className="grid grid-cols-7 border border-black overflow-scroll h-full relative"
            style={{ maxHeight: "calc(100vh - 10vh)" }}
        >
            {weekBuckets.map((daySet: Set<string>, i: number) => {
                const events: Event[] = Array.from(daySet).map((eventId) => eventIdToEvent.get(eventId)!)

                return <div key={i} data-key={i} className="relative">
                    {Array.from({ length: 48 }, (_: unknown, j: number) => (
                        <div
                            key={`${i}-${j}`}
                            className="border border-black w-full"
                            style={{
                                height: `calc(${HOURS_HEIGHT_VH}vh / 2)`,
                                flexShrink: 0,
                            }}
                        />
                    ))}
                    {events.map((event: Event, k: number) => (
                        <EventCard
                            event={event}
                            key={`${i}-${k}`}
                            editEvent={editEvent}
                        />
                    ))}
                </div>
            })}
        </div>

    }
);
