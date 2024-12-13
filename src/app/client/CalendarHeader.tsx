import React from "react";
import { Icon } from "@ui/Icon"
import Image from "next/image";
import logo from "@img/logo.png"
import { HEADER_HEIGTH_ASIDE_WIDTH } from "@utils/constants";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { formatMonthRange, ianaToReadable, timeToTwoDigits } from "@utils/functions";

interface CalendarHeaderProps {
    monday: Date
    nextWeek: () => void
    prevWeek: () => void
    today: () => void
    timeZone: string
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({ monday, nextWeek, prevWeek, today, timeZone }) => {

    return <div className="flex items-center justify-start gap-4">
        <>
            <Image
                src={logo.src}
                width={HEADER_HEIGTH_ASIDE_WIDTH - 10}
                height={HEADER_HEIGTH_ASIDE_WIDTH - 10}
                alt="logo"
                className="ml-4"
            />
            <p>Calendar Name</p>
        </>
        <>
            <p>{timeToTwoDigits(monday.getHours())} : {timeToTwoDigits(monday.getMinutes())}</p>
            <p>{ianaToReadable(timeZone)}</p>
            <p onClick={today}>Today</p>
            <p>{formatMonthRange(monday)}</p>
            <Icon icon={FaChevronLeft} onClick={prevWeek} />
            <Icon icon={FaChevronRight} onClick={nextWeek} />
        </>
    </div>
};
