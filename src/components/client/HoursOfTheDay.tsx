import React from "react";
import { generate24HourIntervals } from "../../utils/functions";
import { HOURS_HEIGHT_VH } from "../../utils/constants";


interface HoursOfTheDayProps {
    currentMousePosVh: number | undefined;

}

export const HoursOfTheDay: React.FC<HoursOfTheDayProps> = ({ }) => {
    return (
        <div className="flex flex-col" >
            {generate24HourIntervals().map((hour: string, index: number) => (
                <div
                    key={index + hour}
                    className="text-gray-500 text-right text-xs pr-1"
                    style={{
                        height: `${HOURS_HEIGHT_VH}vh`,
                    }}
                >
                    {hour}
                </div>
            ))}
        </div>
    );
};

