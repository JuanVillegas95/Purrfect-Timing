
"use client"
import React, { useRef, useState, useEffect } from "react";
import { HoursOfTheDay } from "./HoursOfTheDay";
import { MainGrid } from "./MainGrid";
import { AsideButtons } from "./AsideButtons";
import { ActiveModal } from "./ActiveModal";
import { DaysOfTheWeek } from "./DaysOfTheWeek";
import { CalendarHeader } from "./CalendarHeader";
import { addDateBy, syncScroll, mostRecentMonday, updateTime, handleKeyboard } from "@utils/functions";
import { HEADER_HEIGTH_ASIDE_WIDTH, DAYS_HEIGTH_HOURS_WIDTH, MODALS, PICKERS } from "@utils/constants";
import { Event } from "@utils/interfaces";

interface DashboardProps {
    FriendCards: React.ReactNode
    CalendarCards: React.ReactNode
    ProfileModal: React.ReactNode
    info: any
}

export const Dashboard: React.FC<DashboardProps> = ({ FriendCards, CalendarCards, ProfileModal, info }) => {
    const hoursOfTheDayRef = useRef<HTMLDivElement>(null);
    const mainGridRef = useRef<HTMLDivElement>(null);
    const [monday, setMonday] = useState<Date>(mostRecentMonday(info.timeZone));
    const [activeModal, setActiveModal] = useState<MODALS>(MODALS.NONE)
    const [activePicker, setActivePicker] = useState<PICKERS>(PICKERS.NONE);
    const [clickedEvent, setClickedEvent] = useState<Event>()
    const [eventIdToEvent, setEventIdToEvent] = useState<Map<string, Event>>(
        new Map(info.events.map((event: Event) => [event.eventId, event]))
    );
    const [dateToEventIds, setDateToEventIds] = useState<Map<string, Set<string>>>(() => {
        const map = new Map<string, Set<string>>();
        info.events.forEach((event: Event) => {
            if (!map.has(event.startDate)) {
                map.set(event.startDate, new Set());
            }
            map.get(event.startDate)!.add(event.eventId);
        });

        return map;
    });

    useEffect(() => {
        const cleanupScroll = syncScroll(hoursOfTheDayRef, mainGridRef);
        const cleanupTime = updateTime(() => setMonday(mostRecentMonday(info.timeZone)));
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

    const setEvent = (event: Event): void => {
        const { eventId, startDate } = event;
        setDateToEventIds((prev: Map<string, Set<string>>) => {
            const updatedMap: Map<string, Set<string>> = new Map(prev);
            if (eventIdToEvent.has(eventId)) {
                const oldDay: string = eventIdToEvent.get(eventId)!.startDate;
                const newDay: string = startDate;
                if (oldDay !== newDay) {
                    const eventSet = updatedMap.get(oldDay)!;
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

    const calendarNavigation = (direction: "next" | "prev" | "today"): void => {
        switch (direction) {
            case "next":
                setMonday(addDateBy(monday, 7))
                break;
            case "prev":
                setMonday(addDateBy(monday, -7))
                break;
            case "today":
                setMonday(mostRecentMonday(info.timeZone))
                break;
            default:
                break;
        }
    }

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
                    nextWeek={() => }
                    prevWeek={() => setMonday(addDateBy(monday, -7))}
                    today={() => setMonday(mostRecentMonday(info.timeZone))}
                    timeZone={info.timeZone}
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
                    clickedEvent={clickedEvent}
                    activePicker={activePicker}
                    setActivePicker={(picker: PICKERS) => setActivePicker(picker)}
                    closeActiveModal={closeModal}
                />
            }
        </div >
    </React.Fragment>
}


