import React from "react";
import { DAYS } from "../utils/constants";

const DaysOfTheWeek = () => (
  <div className="flex w-full h-full gap-0">
    {DAYS.map((day: string, index: number) => (
      <div
        key={index + day}
        className="border border-black text-center flex-1"
      >
        {day}
      </div>
    ))}
  </div>
);

export default DaysOfTheWeek;
