"use client"
import React, { useRef, useState, useEffect } from "react";
import { HoursOfTheDay } from "./HoursOfTheDay";
import { MainGrid } from "./MainGrid";
import { AsideButtons } from "./AsideButtons";
import { ActiveModal } from "./ActiveModal";
import { DaysOfTheWeek } from "./DaysOfTheWeek";
import { CalendarHeader } from "./CalendarHeader";
import { addDateBy, syncScroll, mostRecentMonday, updateTime, handleKeyboard, getWeekBuckets, formatDateToISO, adjustFetchRange, mapEventIdToEvent, mapWeekStartToBuckets, localTimeZone, deleteEventIdFromBucket, addEventIdToBucket, getISORange, getPaddingFromRange, fromUTCEventToZonedEvent } from "@utils/functions";
import { HEADER_HEIGTH_ASIDE_WIDTH, MODALS, PICKERS, INTIAL_RANGE } from "@utils/constants";
import { Event, InitialFetch, Range, FetchedEvents } from "@utils/interfaces";
import { WeekdaySets } from "@utils/types";
import { db } from "@db/firebaseClient";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { getEvents } from "@db/clientActions";
import { useAuth } from "@context/AuthContext";
import { LoadingSpinner } from "@ui/LoadingSpinner";

interface DashboardProps {
    initCalendarData: InitialFetch
}

export const Dashboard: React.FC<DashboardProps> = ({ initCalendarData: { initialCalendarId, initalRecurring, initalSingle } }) => {
    const [currentCalendarId, setCurrentCalendarId] = useState<string>(initialCalendarId)
    const [currentTimeZone, setCurrentTimeZone] = useState<string>(localTimeZone());
    const [range, setRange] = useState<Range>(getISORange(INTIAL_RANGE, currentTimeZone))
    const [eventIdToEvent, setEventIdToEvent] = useState<Map<string, Event>>(mapEventIdToEvent(initalSingle, initalRecurring, localTimeZone()));
    const [weekStartToBuckets, setWeekStartToBuckets] = useState<Map<string, WeekdaySets>>(mapWeekStartToBuckets([...eventIdToEvent.values()], range, currentTimeZone));

    const [monday, setMonday] = useState<Date>(mostRecentMonday(localTimeZone()))
    const [activePicker, setActivePicker] = useState<PICKERS>(PICKERS.NONE);
    const [activeModal, setActiveModal] = useState<MODALS>(MODALS.NONE)
    const [currentEvent, setCurrentEvent] = useState<Event>();
    const [isLoadingEvents, setIsLoadingEvents] = useState<boolean>(false);
    const hoursOfTheDayRef = useRef<HTMLDivElement>(null);
    const mainGridRef = useRef<HTMLDivElement>(null);
    const [currentMousePosVh, setCurrentMousePosVh] = useState<number>();
    const { user } = useAuth();
    /* eslint-disable react-hooks/exhaustive-deps */
    useEffect(() => {
        const cleanupTime = updateTime(() => setMonday(mostRecentMonday(currentTimeZone)));
        const cleanupKeyboard = handleKeyboard(closeModal)
        setMonday(mostRecentMonday(localTimeZone()))
        return () => {
            cleanupTime();
            cleanupKeyboard();
        };
    }, []);
    /* eslint-enable react-hooks/exhaustive-deps */
    /* eslint-disable react-hooks/exhaustive-deps */
    useEffect(() => {
        if (!hoursOfTheDayRef.current || !mainGridRef.current) return;

        const cleanupScroll = syncScroll(hoursOfTheDayRef, mainGridRef);
        return cleanupScroll;
    }, [hoursOfTheDayRef.current, mainGridRef.current]);
    /* eslint-enable react-hooks/exhaustive-deps */

    /* eslint-disable react-hooks/exhaustive-deps */
    useEffect(() => {
        const singleEventsQuery = query(
            collection(db, `calendars/${currentCalendarId}/events`),
            where("startDate", ">=", range.start),
            where("startDate", "<=", range.end),
            where("endDate", "==", null)
        );

        const unsubSingle = onSnapshot(singleEventsQuery, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                const changedSingle: Event = fromUTCEventToZonedEvent(
                    { eventId: change.doc.id, ...change.doc.data() } as Event,
                    currentTimeZone
                );
                switch (change.type) {
                    case "added":
                    case "modified":
                        setSingleEvent(changedSingle);
                        break;
                    case "removed":
                        deleteSingleEvent(changedSingle);
                        break;
                }
            });
        });

        // const recurringQuery = query(
        //     collection(db, `calendars/${currentCalendarId}/events`),
        //     where("startDate", "<=", range.end),
        //     where("endDate", ">=", range.start)
        // );

        // const unsubRecurring = onSnapshot(recurringQuery, (snapshot) => {
        // snapshot.docChanges().forEach((change) => {
        // Uncomment and update logic for recurring events if needed
        // });
        // });

        return () => {
            unsubSingle();
            // unsubRecurring();
        };
    }, [currentCalendarId, range, currentTimeZone]);
    /* eslint-enable react-hooks/exhaustive-deps */



    const fetchCalendarEvents = async (calendarId: string, range: Range, timeZone: string): Promise<FetchedEvents | null> => {
        setIsLoadingEvents(true);
        try {
            return await getEvents(calendarId, range, timeZone);
        }
        catch (error) {
            console.error("Error fetching calendar data:", error);
            return null
        }
        finally {
            setIsLoadingEvents(false);
        }
    };


    const switchTimeZone = async (newTimeZone: string): Promise<void> => {
        const padding: number = getPaddingFromRange(range);
        const newRange: Range = getISORange(padding, newTimeZone)
        const newMonday: Date = mostRecentMonday(newTimeZone);
        try {
            setIsLoadingEvents(true)
            const fetchedEvents: FetchedEvents | null = await fetchCalendarEvents(currentCalendarId, newRange, newTimeZone);

            if (!fetchedEvents) {
                console.log("error")
                return
            }
            setEventIdToEvent(mapEventIdToEvent(fetchedEvents.single, fetchedEvents.recurring, newTimeZone))
            setWeekStartToBuckets(mapWeekStartToBuckets([...fetchedEvents.single, ...fetchedEvents.recurring], range, newTimeZone))
            setCurrentTimeZone(newTimeZone)
            setMonday(newMonday);
            setRange(newRange);
        } finally {
            setIsLoadingEvents(false)
        }
    }

    const switchCalendar = async (newCalendarId: string): Promise<void> => {
        const padding: number = getPaddingFromRange(range);
        const newRange: Range = getISORange(padding, currentTimeZone)
        const newMonday: Date = mostRecentMonday(currentTimeZone);
        try {
            setIsLoadingEvents(true)
            const fetchedEvents: FetchedEvents | null = await fetchCalendarEvents(newCalendarId, newRange, currentTimeZone);
            if (!fetchedEvents) {
                console.log("error")
                return
            }
            setEventIdToEvent(mapEventIdToEvent(fetchedEvents.single, fetchedEvents.recurring, currentTimeZone))
            setWeekStartToBuckets(mapWeekStartToBuckets([...eventIdToEvent.values()], range, currentTimeZone))
            setCurrentCalendarId(newCalendarId)
            setMonday(newMonday);
            setRange(newRange);
        }
        finally {
            setIsLoadingEvents(false)
        }
    }

    const calendarNavigation = async (direction: "next" | "prev" | "today"): Promise<void> => {
        let newMonday: Date;
        switch (direction) {
            case "next":
                newMonday = addDateBy(monday, 7);
                break;
            case "prev":
                newMonday = addDateBy(monday, -7);
                break;
            case "today":
                newMonday = mostRecentMonday(currentTimeZone);
                break;
        }
        setMonday(newMonday);

        const outOfRange: boolean = newMonday < new Date(range.start) || newMonday > new Date(range.end);
        if (!outOfRange) return;
        const newRange: Range = adjustFetchRange(
            eventIdToEvent.size,
            range,
            monday,
            currentTimeZone
        );
        const fetchedEvents: FetchedEvents | null = await fetchCalendarEvents(currentCalendarId, newRange, currentTimeZone);
        if (!fetchedEvents) {
            console.log("error")
            return
        }
        setEventIdToEvent(mapEventIdToEvent(fetchedEvents.single, fetchedEvents.recurring, currentTimeZone))
        setRange(newRange);
    }

    const closeModal = (): void => {
        setActiveModal(MODALS.NONE)
        setActivePicker(PICKERS.NONE)
        setCurrentEvent(undefined)
    }

    function setSingleEvent(eventToSet: Event): void {
        setWeekStartToBuckets((prev: Map<string, WeekdaySets>) => {
            const updatedMap = new Map(prev);
            const oldEvent: Event | undefined = eventIdToEvent?.get(eventToSet.eventId);

            if (!oldEvent) {
                addEventIdToBucket(
                    eventToSet.eventId,
                    new Date(eventToSet.startDate),
                    currentTimeZone,
                    updatedMap
                );
            }
            else {
                const oldDay = oldEvent.startDate;
                const newDay = eventToSet.startDate;
                if (oldDay !== newDay) {
                    deleteEventIdFromBucket(
                        oldEvent.eventId,
                        new Date(oldDay),
                        currentTimeZone,
                        updatedMap
                    );
                    addEventIdToBucket(
                        eventToSet.eventId,
                        new Date(newDay),
                        currentTimeZone,
                        updatedMap
                    );
                }
            }

            return updatedMap;
        });

        setEventIdToEvent((prev: Map<string, Event> | undefined) => {
            const updatedMap = new Map(prev);
            updatedMap.set(eventToSet.eventId, eventToSet);
            return updatedMap;
        });
    }

    function deleteSingleEvent(eventToDelete: Event): void {
        setWeekStartToBuckets((prev: Map<string, WeekdaySets>) => {
            const updatedMap: Map<string, WeekdaySets> = new Map(prev);
            deleteEventIdFromBucket(eventToDelete.eventId, new Date(eventToDelete.startDate), currentTimeZone, updatedMap);
            return updatedMap;
        });
        setEventIdToEvent((prev: Map<string, Event> | undefined) => {
            const updatedMap = new Map(prev);
            updatedMap.delete(eventToDelete.eventId);
            return updatedMap;
        });
    }

    // const updateRecurringEvent = (event: Event): void => {
    //     // const loopStart: Date = getLoopStart(range, eventToSet.startDate);
    //     // const loopEnd: Date = getLoopEnd(range, eventToSet.endDate!);
    //     // const i: Date = new Date(loopStart);
    //     // while (i <= loopEnd) {
    //     //     const dayOfWeek = i.getDay() === 0 ? 6 : i.getDay() - 1;
    //     //     if (eventToSet.selectedDays![dayOfWeek]) {
    //     //         addEventIdToBucket(
    //     //             eventToSet.eventId,
    //     //             new Date(formatDateToISO(i)),
    //     //             currentTimeZone,
    //     //             weekStartToBuckets,
    //     //         );
    //     //     }
    //     //     i.setDate(i.getDate() + 1);
    //     // }
    // }

    // const createRecurringEvent = (event: Event): void => {
    // }

    // const deleteRecurringEvent = (event: Event): void => {
    // }


    const getEventWeekBuckets = (): Event[][] =>
        getWeekBuckets(formatDateToISO(monday), weekStartToBuckets).map(
            (dayOfTheWeek) =>
                Array.from(dayOfTheWeek)
                    .map((eventId) => eventIdToEvent?.get(eventId))
                    .filter((event): event is Event => Boolean(event))
        );

    if (!user) return <LoadingSpinner text="Loading Calendar..." />

    return <React.Fragment>
        <div
            className="grid h-screen"
            style={{
                gridTemplateRows: `${HEADER_HEIGTH_ASIDE_WIDTH}px auto 1fr`,
                gridTemplateColumns: `${HEADER_HEIGTH_ASIDE_WIDTH}px auto 1fr`,
            }}
        >
            <div className="col-span-full row-start-1 row-end-2 bg-red">
                <CalendarHeader
                    monday={monday}
                    calendarNavigation={(direction: "next" | "prev" | "today") => calendarNavigation(direction)}
                    timeZone={currentTimeZone}
                    isLoadingEvents={isLoadingEvents}
                    range={range}
                    switchTimeZone={switchTimeZone}

                />
            </div>
            <div className="row-start-2 row-end-[-1] col-start-1 col-end-2 w-full">
                <AsideButtons
                    setActiveModal={setActiveModal}
                />
            </div>
            <div className="row-start-2 row-end-3 col-start-3 col-end-[-1]">
                <DaysOfTheWeek
                    monday={monday}
                />
            </div>
            <div
                ref={hoursOfTheDayRef}
                className="row-start-2  row-end-[-1] col-start-2 col-end-3  overflow-scroll mt-8"
            >
                <HoursOfTheDay
                    currentMousePosVh={currentMousePosVh}
                />
            </div>
            <div className="row-start-3 row-end-[-1] col-start-3 col-end-[-1]">
                <MainGrid
                    ref={mainGridRef}
                    monday={monday}
                    currentEvent={currentEvent}
                    isLoadingEvents={isLoadingEvents}
                    weekBuckets={getEventWeekBuckets()}
                    calendarId={currentCalendarId}
                    setCurrentEvent={(event: Event | undefined) => setCurrentEvent(event)}
                    setActiveModal={(modal: MODALS) => setActiveModal(modal)}
                    setSingleEvent={setSingleEvent}
                    getEventById={(eventId: string) => eventIdToEvent.get(eventId)}
                    deleteSingleEvent={deleteSingleEvent}
                    setCurrentMousePosVh={(currPos: number) => setCurrentMousePosVh(currPos)}
                />
            </div>
            {
                activeModal !== MODALS.NONE && <ActiveModal
                    currentCalendarId={currentCalendarId}
                    activeModal={activeModal}
                    currentEvent={currentEvent}
                    activePicker={activePicker}
                    setActivePicker={(picker: PICKERS) => setActivePicker(picker)}
                    closeActiveModal={closeModal}
                    timeZone={currentTimeZone}
                    switchCalendar={switchCalendar}
                />
            }
        </div >
    </React.Fragment>
}


