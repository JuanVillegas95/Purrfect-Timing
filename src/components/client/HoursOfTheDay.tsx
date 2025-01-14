import React, { forwardRef } from "react";
import { generate24HourIntervals, hoursToMinutes, timeToTwoDigits, vhToTime } from "../../utils/functions";
import { DAYS_HEIGTH_HOURS_WIDTH, HEADER_HEIGTH_ASIDE_WIDTH, HOURS_HEIGHT_VH } from "../../utils/constants";
import { HoursAndMinutes } from "@utils/interfaces";


interface HoursOfTheDayProps {
    currentMousePosVh: number | undefined;
}
export const HoursOfTheDay = forwardRef<HTMLDivElement, HoursOfTheDayProps>(({ currentMousePosVh }, ref) => {
    return (
        <div
            className="flex flex-col"
        >
            {generate24HourIntervals().map((hour: string, index: number) => {
                return <div
                    key={index + hour}
                    className="text-gray-500 text-right text-xs pr-1 "
                    style={{
                        height: `${HOURS_HEIGHT_VH}vh`
                    }}
                >
                    {hour}
                </div>
            }
            )}
        </div>
    );
});

