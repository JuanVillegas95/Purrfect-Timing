import React from "react";
import { DAYS } from "../../utils/constants";
import { addDateBy, areDatesTheSame } from "@utils/functions";


interface DaysOfTheWeekProps {
  monday: Date
}

export const DaysOfTheWeek: React.FC<DaysOfTheWeekProps> = ({ monday }) => (

  <div className="flex w-full h-full p-2">
    {DAYS.map((day: string, index: number) => {
      const newDay: Date = addDateBy(monday, index)
      const dayOfTheMonth: number = newDay.getDate();

      return <div
        key={index + day}
        className="text-center flex-1 flex items-center justify-center gap-2 "
      >
        <div>
          {day[0] + day.slice(1, 3).toLowerCase()}
        </div>
        <div
          className={`rounded-full  w-6 ${areDatesTheSame(newDay, monday) ? 'text-white bg-blue-500' : 'text-black'}`}
        >
          {dayOfTheMonth}
        </div>
      </div>
    })}
  </div>
);

