import React, { forwardRef } from "react";
import { generate24HourIntervals, hoursToMinutes, timeToTwoDigits, vhToTime } from "../../utils/functions";
import { DAYS_HEIGTH_HOURS_WIDTH, HEADER_HEIGTH_ASIDE_WIDTH, HOURS_HEIGHT_VH } from "../../utils/constants";
import { HoursAndMinutes } from "@utils/interfaces";


interface HoursOfTheDayProps {
    currentMousePosVh: number | undefined;
}
export const HoursOfTheDay = forwardRef<HTMLDivElement, HoursOfTheDayProps>(({ currentMousePosVh }, ref) => {

    // const currentTimeStr: string | undefined = currentMousePosVh ? `${timeToTwoDigits(vhToTime(currentMousePosVh).hours)}${timeToTwoDigits(vhToTime(currentMousePosVh).minutes)}` : undefined;

    return (
        <div
            // ref={ref}
            className="flex flex-col overflow-scroll h-full"
            style={{
                // paddingTop: `calc(${DAYS_HEIGTH_HOURS_WIDTH}px)`
            }}
        >
            {generate24HourIntervals().map((hour: string, index: number) => {
                return <div
                    key={index + hour}
                    className="text-gray-500 text-right text-xs pr-1 border border-gray-700"

                    style={{
                        height: `${HOURS_HEIGHT_VH}vh`,
                    }}
                >
                    {hour}
                </div>
            }
            )}
            {/* <div className="absolute "
                style={{
                    top: `${currentMousePosVh}vh`
                }}
            >{currentTimeStr && currentTimeStr}</div> */}
        </div>
    );
});

