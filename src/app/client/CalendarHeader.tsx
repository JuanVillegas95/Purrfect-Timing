import React from "react";
import { Icon } from "@ui/Icon"
import Image from "next/image";
import logo from "@img/logo.png"
import { LOGO_SIZE } from "@utils/constants";
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
        <React.Fragment>
            <div className="relative ml-4">
                <Image
                    src={logo.src}
                    height={LOGO_SIZE}
                    width={LOGO_SIZE}
                    alt="logo"
                    priority
                />
            </div>
            <p>Calendar Name</p>
        </React.Fragment>
        <React.Fragment>
            <p>{timeToTwoDigits(monday.getHours())} : {timeToTwoDigits(monday.getMinutes())}</p>
            <p>{ianaToReadable(timeZone)}</p>
            <p onClick={today}>Today</p>
            <p>{formatMonthRange(monday)}</p>
            <Icon icon={FaChevronLeft} onClick={prevWeek} />
            <Icon icon={FaChevronRight} onClick={nextWeek} />
        </React.Fragment>
    </div>
};
