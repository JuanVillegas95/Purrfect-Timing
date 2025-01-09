import React, { act, forwardRef, useRef, useState } from "react";
import { BLANK_EVENT, CLICK_THRESHOLD, HOURS_HEIGHT_VH, LEFT_MOUSE_CLICK, MODALS, MOUSE_ACTION } from "../../utils/constants";
import { Event, EventActionsState } from "../../utils/interfaces";
import { addDateBy, formatDateToISO, roundTime, createColumnsForDay, timeInVh, vhToTime, getRandomColor, timeToMinutes, hoursToMinutes, timeInMinutes, splitEventAcrossMidnight, getEventTotalMinutes } from "../../utils/functions";
import { EventCard } from "./EventCard";
import { WeekdaySets } from "@utils/types";
import { generateEventId } from "@db/clientActions";
interface MainGridProps {
    setCurrentEvent: (event: Event | undefined) => void
    setActiveModal: (modal: MODALS) => void
    currentEvent: Event | undefined;
    Events?: React.ReactNode;
    isLoadingEvents: boolean;
    calendarId: string;
    setSingleEvent: (eventToSet: Event) => void;
    getEventById: (eventId: string) => Event | undefined
    weekBuckets: Event[][];
    monday: Date;
    deleteSingleEvent: (eventToDelete: Event) => void;
}

export const MainGrid = forwardRef<HTMLDivElement, MainGridProps>(
    ({ weekBuckets, setCurrentEvent, setActiveModal, isLoadingEvents, currentEvent, monday, calendarId, setSingleEvent, getEventById, deleteSingleEvent }, ref) => {
        const [mouseAction, setMouseAction] = useState<MOUSE_ACTION>(MOUSE_ACTION.NONE);
        const [hoveredEventId, setHoveredEventId] = useState<string>();
        const [eventState, setEventState] = useState<EventActionsState>()
        const [isPending, setIsPending] = useState<boolean>()
        const columnHeightRef = useRef<HTMLDivElement>(null);
        const selectStart = useRef<number>();
        const isHolding = useRef<boolean>(false);

        const onMouseDown = (e: React.MouseEvent<HTMLDivElement>, action: MOUSE_ACTION, date?: Date, event?: Event) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.button !== LEFT_MOUSE_CLICK || !columnHeightRef.current || currentEvent !== undefined) return;
            switch (action) {
                case MOUSE_ACTION.CREATE:
                    if (!date) break;
                    const distanceFromTop: number = (e.clientY - columnHeightRef.current.getBoundingClientRect().top) * (100 / window.innerHeight);
                    const time: { hours: number; minutes: number } = vhToTime(distanceFromTop);
                    const { hours: startHours, minutes: startMinutes } = roundTime(time.hours, time.minutes);
                    const eventId = generateEventId(calendarId);
                    const color = getRandomColor();
                    const startDate = formatDateToISO(date);
                    const title: string = "New event";
                    setCurrentEvent({ ...BLANK_EVENT, startHours, startMinutes, startDate, color, eventId, title })
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
                    setCurrentEvent(event)
                    setMouseAction(MOUSE_ACTION.RESIZE_TOP);
                    break;
                case MOUSE_ACTION.RESIZE_BOTTOM:
                    if (!event) break;
                    setCurrentEvent(event)
                    setMouseAction(MOUSE_ACTION.RESIZE_BOTTOM);
                    break;
            }
        }

        const onMouseMove = (e: React.MouseEvent<HTMLDivElement>, bucketIndex?: number) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.button !== LEFT_MOUSE_CLICK || !columnHeightRef.current || currentEvent === undefined) return;

            const currentEventPrevStarHours: number = currentEvent.startHours;
            const currentEventPrevStarMinutes: number = currentEvent.startMinutes;
            const currentEventPrevEndHours: number = currentEvent.endHours;
            const currentEventPrevEndMinutes: number = currentEvent.endMinutes;

            const distanceFromTop: number = (e.clientY - columnHeightRef.current.getBoundingClientRect().top) * (100 / window.innerHeight);
            const time: { hours: number; minutes: number } = vhToTime(distanceFromTop);
            const { hours, minutes } = roundTime(time.hours, time.minutes);
            let eventCopy: Event = { ...currentEvent }
            const totalStart: number = timeInMinutes(eventCopy.startHours, eventCopy.startMinutes);
            const totalEnd: number = timeInMinutes(eventCopy.endHours, eventCopy.endMinutes)
            if (mouseAction === MOUSE_ACTION.SELECT) {
                if (!selectStart.current) throw Error("Cannot set apart drag or click");
                const timeHeld = new Date().getTime() - selectStart.current;
                if (timeHeld >= CLICK_THRESHOLD) {
                    setMouseAction(MOUSE_ACTION.DRAG);
                }
            }
            else if (mouseAction === MOUSE_ACTION.DRAG) {
                let { startDate, startHours, startMinutes, endHours, endMinutes } = currentEvent;
                if (!currentEvent.endDate && bucketIndex) {
                    const startDateObj = new Date(currentEvent.startDate)
                    const numericalDay: number = startDateObj.getDay() === 0 ? 6 : startDateObj.getDay() - 1
                    const dayDifference: number = bucketIndex - numericalDay;
                    if (dayDifference !== 0) startDate = formatDateToISO(addDateBy(startDateObj, dayDifference));
                }
                const top: number = timeInVh(startHours, startMinutes);
                const height: number = timeInVh(endHours, endMinutes) - top;
                const padding: number = height / 2;

                const timeStart = vhToTime(distanceFromTop - padding);
                const timeEnd = vhToTime(distanceFromTop + padding);
                const { hours: newStartHours, minutes: newStartMinutes } = roundTime(timeStart.hours, timeStart.minutes);
                const { hours: newEndHours, minutes: newEndMinutes } = roundTime(timeEnd.hours, timeEnd.minutes);
                if (!eventCopy.spiltedReferenceId) {
                    eventCopy = {
                        ...eventCopy,
                        startDate,
                        startHours: newStartHours,
                        startMinutes: newStartMinutes,
                        endHours: newEndHours,
                        endMinutes: newEndMinutes
                    }
                } else {
                    console.log(totalEnd)
                    const otherHalf: Event | undefined = getEventById(eventCopy.spiltedReferenceId)
                    if (!otherHalf) throw Error("no other ha;f")

                    if (totalStart <= 0) {
                        const deltaEndHours = currentEventPrevEndHours - newEndHours;
                        const deltaEndMinuts = currentEventPrevEndMinutes - newEndMinutes;
                        eventCopy = {
                            ...eventCopy,
                            startHours: 0,
                            startMinutes: 0,
                            endHours: newEndHours,
                            endMinutes: newEndMinutes,
                        }
                        const otherHalfCopy: Event = {
                            ...otherHalf,
                            startHours: otherHalf.startHours - deltaEndHours,
                            startMinutes: otherHalf.startMinutes - deltaEndMinuts,
                            endHours: 23,
                            endMinutes: 59
                        }
                        setSingleEvent(otherHalfCopy)
                    } else if (totalEnd >= (24 * 60) - 1) {//!CHECK THIS ONE
                        console.log("hiiiii")
                        const deltaStartHours = currentEventPrevStarHours - newStartHours;
                        const deltaStartMinutes = currentEventPrevStarMinutes - newStartMinutes;
                        eventCopy = {
                            ...eventCopy,
                            startHours: newStartHours,
                            startMinutes: newStartMinutes,
                            endHours: 23,
                            endMinutes: 59,
                        }
                        const otherHalfCopy: Event = {
                            ...otherHalf,
                            startHours: 0,
                            startMinutes: 0,
                            endHours: otherHalf.endHours - deltaStartHours,
                            endMinutes: otherHalf.endMinutes - deltaStartMinutes
                        }
                        setSingleEvent(otherHalfCopy)
                    }
                }
                if (totalStart < 0 && !currentEvent.spiltedReferenceId) {
                    const otherHalfId: string = generateEventId(calendarId)
                    eventCopy = {
                        ...eventCopy,
                        startHours: 0,
                        startMinutes: 0,
                        endHours: newEndHours,
                        endMinutes: newEndMinutes,
                        spiltedReferenceId: otherHalfId,
                    }
                    const otherHalf: Event = {
                        ...eventCopy,
                        eventId: otherHalfId,
                        spiltedReferenceId: eventCopy.eventId,
                        startDate: formatDateToISO(addDateBy(new Date(eventCopy.startDate), -1)),
                        startHours: 23,
                        startMinutes: 45,
                        endHours: 23,
                        endMinutes: 59
                    }
                    setSingleEvent(otherHalf)
                }
                else if (totalEnd >= 24 * 60 && !currentEvent.spiltedReferenceId) {
                    const otherHalfId: string = generateEventId(calendarId)
                    eventCopy = {
                        ...eventCopy,
                        startHours: newStartHours,
                        startMinutes: newStartMinutes,
                        endHours: 23,
                        endMinutes: 59,
                        spiltedReferenceId: otherHalfId,
                    }
                    const otherHalf: Event = {
                        ...eventCopy,
                        eventId: otherHalfId,
                        spiltedReferenceId: eventCopy.eventId,
                        startDate: formatDateToISO(addDateBy(new Date(eventCopy.startDate), 1)),
                        startHours: 0,
                        startMinutes: 0,
                        endHours: 0,
                        endMinutes: 15
                    }
                    setSingleEvent(otherHalf)
                }
            }
            else if (mouseAction === MOUSE_ACTION.RESIZE_TOP) {
                eventCopy = { ...eventCopy, startHours: hours, startMinutes: minutes }
            }
            else if (mouseAction === MOUSE_ACTION.RESIZE_BOTTOM || mouseAction === MOUSE_ACTION.CREATE) {
                eventCopy = { ...eventCopy, endHours: hours, endMinutes: minutes }
            }

            setCurrentEvent(eventCopy)
            setSingleEvent(eventCopy)
        }

        const onMouseUp = (): void => {
            setMouseAction(MOUSE_ACTION.NONE)
            isHolding.current = false;
            if (mouseAction === MOUSE_ACTION.SELECT) {
                setActiveModal(MODALS.EVENT);
                return;
            }
            setCurrentEvent(undefined);
        }

        if (isLoadingEvents) {
            return <div>...isLoadingEvents</div>;
        }

        return <div
            ref={ref}
            className="grid grid-cols-7 border border-black overflow-scroll h-full relative"
            style={{ maxHeight: "calc(100vh - 10vh)" }}
            onMouseUp={() => onMouseUp()}
            onMouseLeave={() => onMouseUp()}
        >
            {weekBuckets.map((weekBucket: Event[], bucketIndex: number) => {
                const columns: Event[][] = createColumnsForDay(weekBucket);
                const columnDay: Date = addDateBy(monday, bucketIndex);
                return <div
                    className="relative"
                    key={bucketIndex}
                    ref={columnHeightRef}
                    onMouseDown={(e) => onMouseDown(e, MOUSE_ACTION.CREATE, columnDay)}
                    onMouseMove={(e) => onMouseMove(e, bucketIndex)}
                >
                    {columns.map((column: Event[], columnIndex: number) => {
                        const totalColumns: number = columns.length;

                        return column.map((event: Event, eventIndex: number) => {
                            const { startHours, startMinutes, endMinutes, endHours, color } = event
                            const top: number = timeInVh(startHours, startMinutes);
                            const height: number = timeInVh(endHours, endMinutes) - top;
                            const totalMinutes: number = timeInMinutes(endHours, endMinutes) - timeInMinutes(startHours, startMinutes);
                            // Event
                            return <div
                                className="absolute hover:cursor-pointer rounded-md z-1"
                                style={{
                                    top: `${top}vh`,
                                    height: `${height}vh`,
                                    backgroundColor: color,
                                    left: `${(columnIndex / totalColumns) * 95}%`,
                                    width: `${95 / totalColumns}%`
                                }}
                                key={`${bucketIndex}-${columnIndex}-${eventIndex}`}
                                onMouseDown={(e) => onMouseDown(e, MOUSE_ACTION.SELECT, columnDay, event)}
                                onMouseMove={(e) => onMouseMove(e)}
                                onMouseEnter={() => setHoveredEventId(event.eventId)}
                                onMouseLeave={() => setHoveredEventId(undefined)}
                            >
                                <div className="relative h-full" >
                                    {(hoveredEventId === event.eventId && mouseAction !== MOUSE_ACTION.CREATE) && <div
                                        className="absolute hover:cursor-ns-resize w-3 h-3 z-2 -top-1.5 right-1 bg-white rounded-lg border border-black"
                                        onMouseDown={(e) => onMouseDown(e, MOUSE_ACTION.RESIZE_TOP, columnDay, event)}
                                    />}
                                    <div>
                                        <p>{event.title}</p>
                                        {totalMinutes > 15 && <p>{event.startHours}-{event.startMinutes} {event.endHours}-{event.endMinutes}</p>}
                                        <p>{event.description}</p>

                                    </div>
                                    {(hoveredEventId === event.eventId && mouseAction !== MOUSE_ACTION.CREATE) && <div
                                        className="absolute hover:cursor-ns-resize w-3 h-3 z-2 -bottom-1.5 left-1 bg-white rounded-lg border border-black"
                                        onMouseDown={(e) => onMouseDown(e, MOUSE_ACTION.RESIZE_BOTTOM, columnDay, event)}

                                    />}
                                </div>
                            </div>
                        }
                        )
                    })}

                    {Array.from({ length: 57 }, (_: unknown, slotIndex: number) => <div
                        key={`${bucketIndex}-${slotIndex}`}
                        className="border border-black w-full"
                        style={{
                            height: `${HOURS_HEIGHT_VH}vh`,
                            flexShrink: 0,
                        }}
                    />)}
                </div>
            })}
        </div>

    }
);
