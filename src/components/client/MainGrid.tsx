import React, { forwardRef, useRef, useState } from "react";
import { HOURS_HEIGHT_VH } from "../../utils/constants";
import { Event } from "../../utils/interfaces";
import { addDateBy, formatDateToISO } from "../../utils/functions";
import { EventCard } from "./EventCard"

interface MainGridProps {
    monday: Date;
    Events?: React.ReactNode
    eventIdToEvent: Map<string, Event>;
    dateToEventIds: Map<string, Set<string>>
    editEvent: (event: Event) => void;
    isLoadingEvents: boolean;
}

export const MainGrid = forwardRef<HTMLDivElement, MainGridProps>(({ monday, eventIdToEvent, dateToEventIds, editEvent, isLoadingEvents }, ref) => {
    const columnDivRefs: React.RefObject<HTMLDivElement>[] = new Array(7)
        .fill(null)
        .map(() => useRef<HTMLDivElement>(null));

    return !isLoadingEvents && <div
        ref={ref}
        className="grid grid-cols-7 border border-black overflow-scroll h-full relative"
        style={{ maxHeight: "calc(100vh - 10vh)" }}
    >
        {columnDivRefs.map((_: unknown, i: number) => {
            const columnDate: Date = addDateBy(monday, i);
            const formattedDate: string = formatDateToISO(columnDate);
            const eventIds: string[] = Array.from(dateToEventIds.get(formattedDate) || []);
            const events: Event[] = eventIds.flatMap((eventId: string) => {
                const event = eventIdToEvent.get(eventId);
                return event ? [event] : [];
            });

            return <div
                key={i}
                data-key={i}
                className="relative"
            >
                {Array.from({ length: 48 }, (_: unknown, j: number) => <div
                    key={`${i}-${j}`}
                    className="border border-black w-full"
                    style={{
                        height: `calc(${HOURS_HEIGHT_VH}vh / 2)`,
                        flexShrink: 0,
                    }}
                />
                )}
                {events.map((event: Event, k: number) => {
                    return <EventCard
                        event={event}
                        key={`${i}-${k}`}
                        editEvent={editEvent}
                    />
                }

                )}
            </div>
        })}
    </div>
});

