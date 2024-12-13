
"use client"
import React, { useRef, useState, useEffect } from "react";
import { HoursOfTheDay } from "@client/HoursOfTheDay";
import { MainGrid } from "@client/MainGrid";
import { AsideButtons } from "@client/AsideButtons";
import { ActiveModal } from "@client/ActiveModal";
import { DaysOfTheWeek } from "@client/DaysOfTheWeek";
import { CalendarHeader } from "@client/CalendarHeader";
import { addDateBy, syncScroll, mostRecentMonday, updateTime, handleKeyboard } from "@utils/functions";
import { HEADER_HEIGTH_ASIDE_WIDTH, DAYS_HEIGTH_HOURS_WIDTH, MODALS } from "@utils/constants";
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
    const [clickedEvent, setClickedEvent] = useState<Event>()
    const [eventIdToEvent, setEventIdToEvent] = useState<Map<string, Event>>(
        new Map(info.events.map((event: Event) => [event.eventId, event]))
    );
    const [dateToEventIds, setDateToEventIds] = useState<Map<string, Set<string>>>(() => {
        const map = new Map<string, Set<string>>();
        info.events.forEach((event: Event) => {
            if (!map.has(event.date)) {
                map.set(event.date, new Set());
            }
            map.get(event.date)!.add(event.eventId);
        });

        return map;
    });


    useEffect(() => {
        const cleanupScroll = syncScroll(hoursOfTheDayRef, mainGridRef);
        const cleanupTime = updateTime(() => setMonday(mostRecentMonday(info.timeZone)));
        const cleanupKeyboard = handleKeyboard(() => {
            setActiveModal(MODALS.NONE)
            setClickedEvent(undefined)
        })

        return () => {
            cleanupScroll();
            cleanupTime();
            cleanupKeyboard();
        };
    }, []);




    const setEvent = (event: Event): void => {
        const { eventId, date } = event;
        setDateToEventIds((prev: Map<string, Set<string>>) => {
            const updatedMap: Map<string, Set<string>> = new Map(prev);
            if (eventIdToEvent.has(eventId)) {
                const oldDay: string = eventIdToEvent.get(eventId)!.date;
                const newDay: string = date;
                if (oldDay !== newDay) {
                    const eventSet = updatedMap.get(oldDay)!;
                    if (eventSet.size === 0) updatedMap.delete(oldDay);
                }
            }
            if (!updatedMap.has(date)) updatedMap.set(date, new Set([eventId]));
            else updatedMap.get(date)!.add(eventId);
            return updatedMap;
        });

        setEventIdToEvent((prev: Map<string, Event>) => {
            const updatedMap = new Map(prev);
            updatedMap.set(eventId, event);
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
                    nextWeek={() => setMonday(addDateBy(monday, 7))}
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
                    closeActiveModal={() => {
                        setActiveModal(MODALS.NONE);
                        setClickedEvent(undefined);
                    }}
                />
            }
        </div >
    </React.Fragment>
}


