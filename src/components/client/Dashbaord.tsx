
"use client"
import React, { useRef, useState, useEffect, useActionState } from "react";
import { HoursOfTheDay } from "./HoursOfTheDay";
import { MainGrid } from "./MainGrid";
import { AsideButtons } from "./AsideButtons";
import { ActiveModal } from "./ActiveModal";
import { DaysOfTheWeek } from "./DaysOfTheWeek";
import { CalendarHeader } from "./CalendarHeader";
import { addDateBy, syncScroll, mostRecentMonday, updateTime, handleKeyboard, formatDateToISO, calculateRangeDays, adjustFetchRange, mapEventIdToEvent, mapDateToEventIds, localTimeZone } from "@utils/functions";
import { HEADER_HEIGTH_ASIDE_WIDTH, DAYS_HEIGTH_HOURS_WIDTH, MODALS, PICKERS, BLANK_CALENDAR_ACTIONS_STATE } from "@utils/constants";
import { CalendarActionsState, Event, Range } from "@utils/interfaces";
import { getCalendarData } from "@server/actions"

interface DashboardProps {
    FriendCards: React.ReactNode
    CalendarCards: React.ReactNode
    ProfileModal: React.ReactNode
    initCalendarData: CalendarActionsState
    initRange: { start: string, end: string }
}

export const Dashboard: React.FC<DashboardProps> = ({ FriendCards, CalendarCards, ProfileModal, initCalendarData, initRange }) => {
    const [eventIdToEvent, setEventIdToEvent] = useState<Map<string, Event>>(mapEventIdToEvent(initCalendarData));
    const [dateToEventIds, setDateToEventIds] = useState<Map<string, Set<string>>>(mapDateToEventIds(initCalendarData, initRange));
    const [range, setRange] = useState<{ start: string; end: string }>(initRange)
    const [timeZone, setTimeZone] = useState<string>(initCalendarData.timeZone);
    const [monday, setMonday] = useState<Date>(mostRecentMonday(initCalendarData.timeZone));
    const [activePicker, setActivePicker] = useState<PICKERS>(PICKERS.NONE);
    const [activeModal, setActiveModal] = useState<MODALS>(MODALS.NONE)
    const [clickedEvent, setClickedEvent] = useState<Event>()
    const [isLoadingEvents, setIsLoadingEvents] = useState<boolean>(false);
    const hoursOfTheDayRef = useRef<HTMLDivElement>(null);
    const mainGridRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (monday >= new Date(range.start) && monday <= new Date(range.end)) {
            console.log("No need of refetching")
            return;
        }
        const fetchCalendarData = async () => {
            setIsLoadingEvents(true);
            try {
                const calendarData: CalendarActionsState = await getCalendarData(
                    range.start,
                    range.end
                );

                setEventIdToEvent(mapEventIdToEvent(calendarData));
                setDateToEventIds(mapDateToEventIds(calendarData, range));
            }
            catch (error) {
                console.error("Error fetching calendar data:", error);
            }
            finally {
                setIsLoadingEvents(false);
            }
        };
        fetchCalendarData();
    }, [range]);



    useEffect(() => {
        const cleanupScroll = syncScroll(hoursOfTheDayRef, mainGridRef);
        const cleanupTime = updateTime(() => setMonday(mostRecentMonday(timeZone)));
        const cleanupKeyboard = handleKeyboard(closeModal)

        return () => {
            cleanupScroll();
            cleanupTime();
            cleanupKeyboard();
        };
    }, []);

    function closeModal(): void {
        setActiveModal(MODALS.NONE)
        setActivePicker(PICKERS.NONE)
        setClickedEvent(undefined)
    }

    const calendarNavigation = (direction: "next" | "prev" | "today"): void => {
        let newMonday: Date;
        switch (direction) {
            case "next":
                newMonday = addDateBy(monday, 7);
                break;
            case "prev":
                newMonday = addDateBy(monday, -7);
                break;
            case "today":
                newMonday = mostRecentMonday(timeZone);
                break;
        }
        setMonday(newMonday);
        if (newMonday <= new Date(range.start) || newMonday >= new Date(range.end)) return;
        const newRange: Range = adjustFetchRange(
            eventIdToEvent.size,
            range,
            monday,
            localTimeZone()
        );
        setRange(newRange);
    };

    const setEvent = (event: Event): void => {
        const { eventId, startDate } = event;
        setDateToEventIds((prev: Map<string, Set<string>>) => {
            const updatedMap: Map<string, Set<string>> = new Map(prev);
            if (eventIdToEvent.has(eventId)) {
                const oldDay: string = eventIdToEvent.get(eventId)!.startDate;
                const newDay: string = startDate;
                if (oldDay !== newDay) {
                    const eventSet: Set<string> = updatedMap.get(oldDay)!;
                    eventSet.delete(eventId)
                    if (eventSet.size === 0) updatedMap.delete(oldDay);
                }
            }
            if (!updatedMap.has(startDate)) updatedMap.set(startDate, new Set([eventId]));
            else updatedMap.get(startDate)!.add(eventId);
            return updatedMap;
        });

        setEventIdToEvent((prev: Map<string, Event>) => {
            const updatedMap = new Map(prev);
            updatedMap.set(eventId, event);
            return updatedMap;
        });
    };

    const deleteEvent = (event: Event): void => {
        const { eventId, startDate } = event;
        setDateToEventIds((prev: Map<string, Set<string>>) => {
            const updatedMap: Map<string, Set<string>> = new Map(prev);
            const eventSet: Set<string> = updatedMap.get(startDate)!;
            eventSet.delete(eventId);
            if (eventSet.size === 0) updatedMap.delete(startDate);
            return updatedMap;
        });

        setEventIdToEvent((prev: Map<string, Event>) => {
            const updatedMap = new Map(prev);
            updatedMap.delete(eventId);
            return updatedMap;
        });
    };


    return <React.Fragment>
        <div
            className="grid h-screen"
            style={{
                gridTemplateRows: `${HEADER_HEIGTH_ASIDE_WIDTH}px ${DAYS_HEIGTH_HOURS_WIDTH}px repeat(8, 1fr)`,
                gridTemplateColumns: `${HEADER_HEIGTH_ASIDE_WIDTH}px ${DAYS_HEIGTH_HOURS_WIDTH}px repeat(14, 1fr)`,
            }}
        >
            <div className="col-span-full row-start-1 bg-red">
                <CalendarHeader
                    monday={monday}
                    calendarNavigation={(direction: "next" | "prev" | "today") => calendarNavigation(direction)}
                    timeZone={timeZone}
                    isLoadingEvents={isLoadingEvents}
                    range={range}
                />
            </div>
            <div className="row-start-2 row-end-[-1] col-start-1 w-full">
                <AsideButtons
                    setActiveModal={setActiveModal}
                />
            </div>
            <div className="row-start-2 col-start-3 col-end-[-1]">
                <DaysOfTheWeek
                    monday={monday}
                />
            </div>
            <div className="row-start-2 row-end-[-1] col-start-2 col-end-3 h-full">
                <HoursOfTheDay
                    ref={hoursOfTheDayRef}
                />
            </div>
            <div className="row-start-3 col-start-3 col-end-[-1]">
                <MainGrid
                    ref={mainGridRef}
                    isLoadingEvents={isLoadingEvents}
                    monday={monday}
                    eventIdToEvent={eventIdToEvent}
                    dateToEventIds={dateToEventIds}
                    editEvent={(event: Event) => {
                        setActiveModal(MODALS.EVENT);
                        setClickedEvent(event);
                    }}
                />
            </div>
            {
                activeModal !== MODALS.NONE && <ActiveModal
                    activeModal={activeModal}
                    FriendCards={FriendCards}
                    CalendarCards={CalendarCards}
                    ProfileModal={ProfileModal}
                    setEvent={setEvent}
                    deleteEvent={deleteEvent}
                    clickedEvent={clickedEvent}
                    activePicker={activePicker}
                    timeZone={timeZone}
                    setActivePicker={(picker: PICKERS) => setActivePicker(picker)}
                    closeActiveModal={closeModal}
                />
            }
        </div >
    </React.Fragment>
}


