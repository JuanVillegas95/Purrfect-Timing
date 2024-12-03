import React, { forwardRef, useRef, useState } from "react";
import { HOURS_HEIGHT_VH } from "../utils/constants";
import { Event } from "../utils/interfaces";
import { addDateBy } from "../utils/functions";
import { formatDate } from "../utils/functions";
interface MainGridProps {
    monday: Date;
}

const MainGrid = forwardRef<HTMLDivElement, MainGridProps>(({ monday }, ref) => {
    const [eventIdToEvent, setEventIdToEvent] = useState<Map<string, Event>>(new Map());
    const [dateToEventId, setDateToEventId] = useState<Map<string, Set<string>>>(new Map());

    const columnDivRefs: React.RefObject<HTMLDivElement>[] = new Array(7)
        .fill(null)
        .map(() => useRef<HTMLDivElement>(null));

    return (
        <div
            ref={ref}
            className="grid grid-cols-7 border border-black overflow-scroll h-full relative"
            style={{ maxHeight: "calc(100vh - 10vh)" }}
        >
            {columnDivRefs.map((_, i: number) => {
                const columnDate: Date = addDateBy(monday, i);
                const formattedDate: string = formatDate(columnDate);
                const eventIds: string[] = Array.from(dateToEventId.get(formattedDate) || []);

                return (
                    <React.Fragment key={i}>
                        {Array.from({ length: 48 }, (_, j) => (
                            <div
                                key={`${i}-${j}`}
                                className="border border-black w-full"
                                style={{
                                    height: `calc(${HOURS_HEIGHT_VH}vh)`,
                                    flexShrink: 0,
                                }}
                            >
                                {eventIds.map((eventId: string, k: number) => (
                                    <div key={`${i}-${j}-${k}`}></div>
                                ))}
                            </div>
                        ))}
                    </React.Fragment>
                );
            })}
        </div>
    );
});

export default MainGrid;
