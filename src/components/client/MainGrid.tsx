import React, { forwardRef } from "react";
import { HOURS_HEIGHT_VH } from "../../utils/constants";
import { Event } from "../../utils/interfaces";
import { addDateBy, formatDateToISO, deleteEventIdFromBucket, createColumnsForDay } from "../../utils/functions";
import { EventCard } from "./EventCard";
import { WeekdaySets } from "@utils/types";

interface MainGridProps {
    monday: Date;
    Events?: React.ReactNode;
    weekBuckets: Event[][];
    editEvent: (event: Event) => void;
    isLoadingEvents: boolean;
}

export const MainGrid = forwardRef<HTMLDivElement, MainGridProps>(
    ({ monday, weekBuckets, editEvent, isLoadingEvents }, ref) => {
        if (isLoadingEvents) {
            return <div>...isLoadingEvents</div>;
        }
        return <div
            ref={ref}
            className="grid grid-cols-7 border border-black overflow-scroll h-full relative"
            style={{ maxHeight: "calc(100vh - 10vh)" }}
        >
            {weekBuckets.map((weekBucket: Event[], i: number) => {
                const columns: Event[][] = createColumnsForDay(weekBucket);

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
                    {weekBucket.map((event: Event, k: number) => {

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

    }
);
