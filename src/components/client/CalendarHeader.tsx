import React from "react";
import { Icon } from "@ui/Icon"
import Image from "next/image";
import logo from "@public/logo.png"
import { LOGO_SIZE } from "@utils/constants";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { calculateRangeDays, formatMonthRange, ianaToReadable, timeToTwoDigits } from "@utils/functions";
import { Range } from "@utils/interfaces";
interface CalendarHeaderProps {
    monday: Date
    calendarNavigation: (direction: "next" | "prev" | "today") => void
    timeZone: string
    isLoadingEvents: boolean
    range: Range
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({ monday, calendarNavigation, timeZone, isLoadingEvents, range }) => {

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
            <p onClick={isLoadingEvents ? undefined : () => calendarNavigation("today")}>Today</p>
            <p>{formatMonthRange(monday)}</p>
            <Icon icon={FaChevronLeft} onClick={isLoadingEvents ? undefined : () => calendarNavigation("next")} />
            <Icon icon={FaChevronRight} onClick={isLoadingEvents ? undefined : () => calendarNavigation("prev")} />
            <p>{range.start}__{calculateRangeDays(range.start, range.end)}__{range.end}</p>

        </React.Fragment>
    </div>
};
