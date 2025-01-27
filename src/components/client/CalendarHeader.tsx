import React from "react";
import { Icon } from "@ui/Icon"
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { formatMonthRange } from "@utils/functions";
import { Range } from "@utils/interfaces";
import { TimeZonePicker } from "@ui/TimeZonePicker"

interface CalendarHeaderProps {
    monday: Date
    calendarNavigation: (direction: "next" | "prev" | "today") => void
    timeZone: string
    isLoadingEvents: boolean
    range: Range
    switchTimeZone: (timeZone: string) => void;
}
export const CalendarHeader: React.FC<CalendarHeaderProps> = ({ monday, calendarNavigation, timeZone, isLoadingEvents, switchTimeZone }) => {
    return <div className="flex justify-between items-center h-full w-full text-blue-500 pr-2">
        <div className="flex items-center h-full gap-2 ml-4">
            {/* <div className="relative ">
                <Image
                    src={logo.src}
                    height={LOGO_SIZE}
                    width={LOGO_SIZE}
                    alt="logo"
                    priority
                />
            </div> */}
            <div className="text-xl flex gap-2 font-semibold">
                <p >
                    {formatMonthRange(monday)}
                </p>
                <p>
                    {monday.getFullYear()}
                </p>
            </div>
        </div>
        <div className="flex gap-1 items-center h-full ">
            <Icon
                icon={FaChevronLeft}
                onClick={isLoadingEvents ? undefined : () => calendarNavigation("prev")}
                iconSize="16px"
                divWidth="16px"
                divHeight="16px"
                className="hover:text-blue-400 "
            />
            <p
                onClick={isLoadingEvents ? undefined : () => calendarNavigation("today")}
                className="text-base hover:text-blue-400 hover:cursor-pointer "
            >
                Today
            </p>
            <Icon
                icon={FaChevronRight}
                onClick={isLoadingEvents ? undefined : () => calendarNavigation("next")}
                iconSize="16px"
                divWidth="16px"
                divHeight="16px"
                className="hover:text-blue-400 mr-2"


            />
            <TimeZonePicker timeZone={timeZone} switchTimeZone={switchTimeZone} />
        </div>
    </div >
};
