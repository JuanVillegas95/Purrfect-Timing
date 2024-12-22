"use client"
import React, { useState, useEffect } from "react";
import { UserCalendarActionsState } from "@utils/interfaces";
import { getCalendarActionsState } from "@server/actions";
import { Button } from "@ui/Button";
import { TbTimezone, TbTrash } from "react-icons/tb";

interface CalendarsModal {
  calendarId: string;
  switchCalendar: (calendarId: string) => Promise<void>;
  closeActiveModal: () => void;
}

export const CalendarModal: React.FC<CalendarsModal> = ({ calendarId, switchCalendar }) => {
  const [calendarState, setCalendarState] = useState<UserCalendarActionsState[] | null>(null);
  const [isPending, setIsPending] = useState<boolean>(false);

  useEffect(() => {
    const fetchCalendarState = async () => {
      setIsPending(true);
      try {
        const dataToRender = await getCalendarActionsState();
        setCalendarState(dataToRender);
      }
      catch (error) {
        console.error("Failed to fetch calendar state", error);
      }
      finally {
        setIsPending(false);
      }
    };

    fetchCalendarState();
  }, [calendarId]);



  if (isPending) return <div>Loading...</div>;

  return <div>{calendarState?.map(({ id, name, timeZone }: UserCalendarActionsState) => {
    return <React.Fragment>
      <div className="flex">
        <TbTimezone />
        <TbTrash />

      </div>
      <Button label="Add Calendar" />
    </React.Fragment>
  })}</div>;
};
