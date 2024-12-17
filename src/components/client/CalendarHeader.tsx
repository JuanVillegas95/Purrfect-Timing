import React from "react";
import { Icon } from "@ui/Icon"
import Image from "next/image";
import logo from "@public/logo.png"
import { LOGO_SIZE } from "@utils/constants";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { formatMonthRange, ianaToReadable, timeToTwoDigits } from "@utils/functions";

interface CalendarHeaderProps {
    monday: Date
    calendarNavigation: (direction: "next" | "prev" | "today") => void
    timeZone: string
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({ monday, calendarNavigation, timeZone }) => {

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
            <p onClick={() => calendarNavigation("today")}>Today</p>
            <p>{formatMonthRange(monday)}</p>
            <Icon icon={FaChevronLeft} onClick={() => calendarNavigation("next")} />
            <Icon icon={FaChevronRight} onClick={() => calendarNavigation("prev")} />
        </React.Fragment>
    </div>
};
