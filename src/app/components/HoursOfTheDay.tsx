import React, { forwardRef } from "react";
import { generate24HourIntervals } from "../utils/functions";
import { DAYS_HEIGTH_HOURS_WIDTH, HOURS_HEIGHT_VH } from "../utils/constants";

const HoursOfTheDay = forwardRef<HTMLDivElement>((props, ref) => {
    return (
        <div
            ref={ref}
            className="flex flex-col overflow-y-scroll "
            style={{
                maxHeight: `calc(100% - ${DAYS_HEIGTH_HOURS_WIDTH}px)`,
                marginTop: `${DAYS_HEIGTH_HOURS_WIDTH}px`,
            }}
        >
            {generate24HourIntervals().map((hour: string, index: number) => (
                <div
                    key={index + hour}
                    className="text-center"
                    style={{
                        height: `${HOURS_HEIGHT_VH}vh`,
                        flexShrink: 0,
                    }}

                >
                    {hour}
                </div>
            ))}
        </div>
    );
});

export default HoursOfTheDay;
