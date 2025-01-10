import React, { act, forwardRef, useRef, useState } from "react";
import {
    BLANK_EVENT,
    CLICK_THRESHOLD,
    HOURS_HEIGHT_VH,
    LEFT_MOUSE_CLICK,
    MAX_END_MINS,
    MIN_DURATION_MINS,
    MAX_END_HOURS,
    MAX_END_MINUTES,
    MIN_START_HOURS,
    MIN_START_MINUTES,
    MODALS,
    MOUSE_ACTION
} from "../../utils/constants";
import {
    Event,
    EventActionsState,
    HoursAndMinutes
} from "../../utils/interfaces";
import {
    addDateBy,
    formatDateToISO,
    roundTime,
    createColumnsForDay,
    timeInVh,
    vhToTime,
    getRandomColor,
    timeInMinutes,
    getEventTotalMinutes,
    clamp,
    addMinutesToTime
} from "../../utils/functions";
import { EventCard } from "./EventCard";
import { WeekdaySets } from "@utils/types";
import { generateEventId } from "@db/clientActions";

interface MainGridProps {
    setCurrentEvent: (event: Event | undefined) => void;
    setActiveModal: (modal: MODALS) => void;
    currentEvent: Event | undefined;
    Events?: React.ReactNode;
    isLoadingEvents: boolean;
    calendarId: string;
    setSingleEvent: (eventToSet: Event) => void;
    getEventById: (eventId: string) => Event | undefined;
    weekBuckets: Event[][];
    monday: Date;
    deleteSingleEvent: (eventToDelete: Event) => void;
}

export const MainGrid = forwardRef<HTMLDivElement, MainGridProps>(
    (
        {
            weekBuckets,
            setCurrentEvent,
            setActiveModal,
            isLoadingEvents,
            currentEvent,
            monday,
            calendarId,
            setSingleEvent,
            getEventById,
            deleteSingleEvent
        },
        ref
    ) => {
        const [mouseAction, setMouseAction] = useState<MOUSE_ACTION>(
            MOUSE_ACTION.NONE
        );
        const [hoveredEventId, setHoveredEventId] = useState<string>();
        const [eventState, setEventState] = useState<EventActionsState>();
        const [isPending, setIsPending] = useState<boolean>();

        const columnHeightRef = useRef<HTMLDivElement>(null);
        const selectStart = useRef<number>();
        const isHolding = useRef<boolean>(false);

        // NEW: Stores info needed for vertical dragging
        const dragDataRef = useRef<{
            initialMouseMinutes: number;
            eventDuration: number;
        }>();

        const onMouseDown = (
            e: React.MouseEvent<HTMLDivElement>,
            action: MOUSE_ACTION,
            date?: Date,
            event?: Event
        ) => {
            e.preventDefault();
            e.stopPropagation();
            if (
                e.button !== LEFT_MOUSE_CLICK ||
                !columnHeightRef.current ||
                currentEvent !== undefined
            )
                return;

            switch (action) {
                case MOUSE_ACTION.CREATE:
                    if (!date) break;
                    const distanceFromTop =
                        (e.clientY -
                            columnHeightRef.current.getBoundingClientRect().top) *
                        (100 / window.innerHeight);
                    const time: HoursAndMinutes = vhToTime(distanceFromTop);
                    const { hours: startHours, minutes: startMinutes } = roundTime(
                        time.hours,
                        time.minutes
                    );
                    const eventId = generateEventId(calendarId);
                    const color = getRandomColor();
                    const startDate = formatDateToISO(date);
                    const title = "New event";

                    setCurrentEvent({
                        ...BLANK_EVENT,
                        startHours,
                        startMinutes,
                        startDate,
                        color,
                        eventId,
                        title
                    });
                    setMouseAction(MOUSE_ACTION.CREATE);
                    break;

                case MOUSE_ACTION.SELECT:
                    if (!event) break;
                    selectStart.current = new Date().getTime();
                    isHolding.current = true;
                    setCurrentEvent(event);
                    setMouseAction(MOUSE_ACTION.SELECT);
                    break;

                case MOUSE_ACTION.RESIZE_TOP:
                    if (!event) break;
                    setCurrentEvent(event);
                    setMouseAction(MOUSE_ACTION.RESIZE_TOP);
                    break;

                case MOUSE_ACTION.RESIZE_BOTTOM:
                    if (!event) break;
                    setCurrentEvent(event);
                    setMouseAction(MOUSE_ACTION.RESIZE_BOTTOM);
                    break;
            }
        };

        const onMouseMove = (
            e: React.MouseEvent<HTMLDivElement>,
            bucketIndex?: number
        ) => {
            e.preventDefault();
            e.stopPropagation();

            // If not left click or there's no currentEvent or no ref, do nothing
            if (
                e.button !== LEFT_MOUSE_CLICK ||
                !columnHeightRef.current ||
                currentEvent === undefined
            )
                return;

            // Copy the current event for safe modifications
            let eventCopy: Event = { ...currentEvent };

            // Distance from top in vh
            const mousePosVh =
                (e.clientY -
                    columnHeightRef.current.getBoundingClientRect().top) *
                (100 / window.innerHeight);

            // Convert that distance to raw time
            const time: HoursAndMinutes = vhToTime(mousePosVh);
            const roundedTime: HoursAndMinutes = roundTime(time.hours, time.minutes);

            if (mouseAction === MOUSE_ACTION.SELECT) {
                // Distinguish between a click vs. a drag
                if (!selectStart.current) throw Error("Cannot set apart drag or click");
                const timeHeld = new Date().getTime() - selectStart.current;
                if (timeHeld >= CLICK_THRESHOLD) {
                    // Record data for vertical dragging
                    const startMin = timeInMinutes(
                        eventCopy.startHours,
                        eventCopy.startMinutes
                    );
                    const endMin = timeInMinutes(eventCopy.endHours, eventCopy.endMinutes);
                    const mouseMin = timeInMinutes(roundedTime.hours, roundedTime.minutes);

                    dragDataRef.current = {
                        initialMouseMinutes: mouseMin - startMin,
                        eventDuration: endMin - startMin
                    };

                    setMouseAction(MOUSE_ACTION.DRAG);
                }
            } else if (mouseAction === MOUSE_ACTION.RESIZE_TOP) {
                // Adjust start time
                eventCopy.startHours = roundedTime.hours;
                eventCopy.startMinutes = roundedTime.minutes;
                setCurrentEvent(eventCopy);
                setSingleEvent(eventCopy);
                return;
            } else if (mouseAction === MOUSE_ACTION.RESIZE_BOTTOM) {
                // Adjust end time
                eventCopy.endHours = roundedTime.hours;
                eventCopy.endMinutes = roundedTime.minutes;
                setCurrentEvent(eventCopy);
                setSingleEvent(eventCopy);
                return;
            } else if (mouseAction === MOUSE_ACTION.CREATE) {
                // Creating a new event by dragging down
                const roundedEndMin = timeInMinutes(roundedTime.hours, roundedTime.minutes);
                const roundedStartMin = timeInMinutes(
                    eventCopy.startHours,
                    eventCopy.startMinutes
                );
                // Prevent event from being too short
                if (roundedEndMin - roundedStartMin < MIN_DURATION_MINS) return;

                eventCopy.endHours = roundedTime.hours;
                eventCopy.endMinutes = roundedTime.minutes;
                setCurrentEvent(eventCopy);
                setSingleEvent(eventCopy);
            } else if (mouseAction === MOUSE_ACTION.DRAG) {
                // DRAG action => move the entire event up/down (and possibly day shift)
                if (!dragDataRef.current) return;

                // If user has moved horizontally to another day
                if (!currentEvent.endDate && bucketIndex !== undefined) {
                    const startDateObj = new Date(eventCopy.startDate);
                    const numericalDay = startDateObj.getDay() === 0
                        ? 6
                        : startDateObj.getDay() - 1;
                    const dayDifference = bucketIndex - numericalDay;
                    if (dayDifference !== 0) {
                        eventCopy.startDate = formatDateToISO(
                            addDateBy(startDateObj, dayDifference)
                        );
                    }
                }

                // Calculate new start time based on mouse position minus initial offset
                const mouseMin = timeInMinutes(roundedTime.hours, roundedTime.minutes);
                let newStartMin = mouseMin - dragDataRef.current.initialMouseMinutes;
                const duration = dragDataRef.current.eventDuration;

                // Clamp so you don't go beyond 0:00 or past 24:00
                // (24*60 - duration ensures the event does not exceed midnight)
                newStartMin = clamp(newStartMin, 0, 24 * 60 - duration);

                const newEndMin = newStartMin + duration;

                // Convert back to hours/minutes
                eventCopy.startHours = Math.floor(newStartMin / 60);
                eventCopy.startMinutes = newStartMin % 60;
                eventCopy.endHours = Math.floor(newEndMin / 60);
                eventCopy.endMinutes = newEndMin % 60;

                setCurrentEvent(eventCopy);
                setSingleEvent(eventCopy);
            }
        };

        const onMouseUp = (): void => {
            setMouseAction(MOUSE_ACTION.NONE);
            isHolding.current = false;

            // If we never transitioned to drag, this means it was a click
            if (mouseAction === MOUSE_ACTION.SELECT) {
                setActiveModal(MODALS.EVENT);
                return;
            }
            setCurrentEvent(undefined);
        };

        if (isLoadingEvents) {
            return <div>...isLoadingEvents</div>;
        }

        return (
            <div
                ref={ref}
                className="grid grid-cols-7 border border-black overflow-scroll h-full relative"
                style={{ maxHeight: "calc(100vh - 10vh)" }}
                onMouseUp={() => onMouseUp()}
                onMouseLeave={() => onMouseUp()}
            >
                {weekBuckets.map((weekBucket: Event[], bucketIndex: number) => {
                    const columns: Event[][] = createColumnsForDay(weekBucket);
                    const columnDay: Date = addDateBy(monday, bucketIndex);

                    return (
                        <div
                            className="relative"
                            key={bucketIndex}
                            ref={columnHeightRef}
                            onMouseDown={(e) => onMouseDown(e, MOUSE_ACTION.CREATE, columnDay)}
                            onMouseMove={(e) => onMouseMove(e, bucketIndex)}
                        >
                            {columns.map((column: Event[], columnIndex: number) => {
                                const totalColumns: number = columns.length;

                                return column.map((event: Event, eventIndex: number) => {
                                    const {
                                        startHours,
                                        startMinutes,
                                        endMinutes,
                                        endHours,
                                        color
                                    } = event;
                                    const top: number = timeInVh(startHours, startMinutes);
                                    const height: number =
                                        timeInVh(endHours, endMinutes) - top;
                                    const totalMinutes: number =
                                        timeInMinutes(endHours, endMinutes) -
                                        timeInMinutes(startHours, startMinutes);

                                    return (
                                        <div
                                            className="absolute hover:cursor-pointer rounded-md z-1"
                                            style={{
                                                top: `${top}vh`,
                                                height: `${height}vh`,
                                                backgroundColor: color,
                                                left: `${(columnIndex / totalColumns) * 95}%`,
                                                width: `${95 / totalColumns}%`
                                            }}
                                            key={`${bucketIndex}-${columnIndex}-${eventIndex}`}
                                            onMouseDown={(e) =>
                                                onMouseDown(e, MOUSE_ACTION.SELECT, columnDay, event)
                                            }
                                            onMouseMove={(e) => onMouseMove(e)}
                                            onMouseEnter={() => setHoveredEventId(event.eventId)}
                                            onMouseLeave={() => setHoveredEventId(undefined)}
                                        >
                                            <div className="relative h-full">
                                                {hoveredEventId === event.eventId &&
                                                    mouseAction !== MOUSE_ACTION.CREATE && (
                                                        <div
                                                            className="absolute hover:cursor-ns-resize w-3 h-3 z-2 -top-1.5 right-1 bg-white rounded-lg border border-black"
                                                            onMouseDown={(e) =>
                                                                onMouseDown(
                                                                    e,
                                                                    MOUSE_ACTION.RESIZE_TOP,
                                                                    columnDay,
                                                                    event
                                                                )
                                                            }
                                                        />
                                                    )}
                                                <div>
                                                    <p>{event.title}</p>
                                                    {totalMinutes > 15 && (
                                                        <p>
                                                            {event.startHours}-{event.startMinutes}{" "}
                                                            {event.endHours}-{event.endMinutes}
                                                        </p>
                                                    )}
                                                    <p>{event.description}</p>
                                                </div>
                                                {hoveredEventId === event.eventId &&
                                                    mouseAction !== MOUSE_ACTION.CREATE && (
                                                        <div
                                                            className="absolute hover:cursor-ns-resize w-3 h-3 z-2 -bottom-1.5 left-1 bg-white rounded-lg border border-black"
                                                            onMouseDown={(e) =>
                                                                onMouseDown(
                                                                    e,
                                                                    MOUSE_ACTION.RESIZE_BOTTOM,
                                                                    columnDay,
                                                                    event
                                                                )
                                                            }
                                                        />
                                                    )}
                                            </div>
                                        </div>
                                    );
                                });
                            })}

                            {/* Render 24 hourly slots */}
                            {Array.from({ length: 24 }, (_: unknown, slotIndex: number) => (
                                <div
                                    key={`${bucketIndex}-${slotIndex}`}
                                    className="border border-black w-full"
                                    style={{
                                        height: `${HOURS_HEIGHT_VH}vh`,
                                        flexShrink: 0
                                    }}
                                />
                            ))}
                        </div>
                    );
                })}
            </div>
        );
    }
);
