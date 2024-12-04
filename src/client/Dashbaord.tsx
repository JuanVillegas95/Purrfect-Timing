
"use client"
import React, { useRef, useState, useEffect } from "react";
import { syncScroll } from "@/utils/functions";
import { HEADER_HEIGTH_ASIDE_WIDTH, DAYS_HEIGTH_HOURS_WIDTH, MODALS } from "@/utils/constants";
import HoursOfTheDay from "@/client/HoursOfTheDay";
import MainGrid from "@/client/MainGrid";
import AsideButtons from "@/client/AsideButtons";
import { ActiveModal } from "@/client/ActiveModal";
import DaysOfTheWeek from "@/client/DaysOfTheWeek";
interface DashboardProps {
    Events: React.ReactNode
    Friends: React.ReactNode
    Profile: React.ReactNode
}

export const Dashboard: React.FC<DashboardProps> = ({ Friends, Events, Profile }) => {
    const hoursOfTheDayRef = useRef<HTMLDivElement>(null);
    const mainGridRef = useRef<HTMLDivElement>(null);
    const [monday, setMonday] = useState<Date>(new Date());
    const [activeModal, setActiveModal] = useState<MODALS>(MODALS.NONE)

    useEffect(() => {
        const cleanup = syncScroll(hoursOfTheDayRef, mainGridRef);
        return cleanup;
    }, []);
    return (
        <>
            <div
                className="grid h-screen"
                style={{
                    gridTemplateRows: `${HEADER_HEIGTH_ASIDE_WIDTH}px ${DAYS_HEIGTH_HOURS_WIDTH}px repeat(8, 1fr)`,
                    gridTemplateColumns: `${HEADER_HEIGTH_ASIDE_WIDTH}px ${DAYS_HEIGTH_HOURS_WIDTH}px repeat(14, 1fr)`,
                }}
            >
                <div className="col-span-full row-start-1 bg-red">1</div>

                <div className="row-start-2 row-end-[-1] col-start-1 w-full">
                    <AsideButtons setActiveModal={setActiveModal} />
                </div>
                <div className="row-start-2 col-start-3 col-end-[-1]">
                    <DaysOfTheWeek />
                </div>

                <div className="row-start-2 row-end-[-1] col-start-2 col-end-3 h-full">
                    <HoursOfTheDay ref={hoursOfTheDayRef} />
                </div>

                <div className="row-start-3 col-start-3 col-end-[-1]">
                    <MainGrid ref={mainGridRef} monday={monday} Events={Events} />
                </div>
                {activeModal !== MODALS.NONE && < ActiveModal activeModal={activeModal} Friends={Friends} />}
            </div >
        </>
    )
}


