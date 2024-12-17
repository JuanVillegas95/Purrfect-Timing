import React from "react";

interface CalendarsModals {
  CalendarCards: React.ReactNode;
}


export const CalendarsModals: React.FC<CalendarsModals> = ({ CalendarCards }) => (
  <div >
    {CalendarCards}
  </div>
);

