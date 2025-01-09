import React from "react";
import { DAYS } from "../../utils/constants";
import { addDateBy } from "@utils/functions";


interface DaysOfTheWeekProps {
  monday: Date
}

export const DaysOfTheWeek: React.FC<DaysOfTheWeekProps> = ({ monday }) => (

  <div className="flex w-full h-full gap-0">
    {DAYS.map((day: string, index: number) => {
      const dayOfTheMonth: number = addDateBy(monday, index).getDate();
      return <div
        key={index + day}
        className="border border-black text-center flex-1"
      >
        {dayOfTheMonth}
        <br />
        {day}
      </div>
    })}
  </div>
);

