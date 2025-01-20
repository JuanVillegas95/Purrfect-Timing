import React, { useActionState, useEffect, useState } from "react";
import { Button } from "@ui/Button";
import { TextInput } from "@ui/TextInput";
import { MdEdit } from "react-icons/md";
import { Icon } from "@ui/Icon";
import { FaTrashAlt } from "react-icons/fa";
import { ClientCalendar, DBCalendar } from "@utils/interfaces";
import { MdGroup } from "react-icons/md";
import { useToast } from "@context/ToastContext";
import Modal from "./Modal";
import { MemberModal } from "./MemberModal";
import { API_STATUS, CALENDAR_MODAL_ACTION, CALENDAR_NAMES, PLAN_LIMITATIONS } from "@utils/constants";
import { useAuth } from "@context/AuthContext";
import { deleteCalendar, insertCalendar } from "@db/clientActions";
import { getCalendarsSizeByTag } from "@utils/functions";
// import { newCalendar } from "@db/clientActions";

interface CalendarsModal {
  currentCalendarId: string;
  switchCalendar: (calendarId: string) => Promise<void>;
  initalMemberCalendars: ClientCalendar[];
  initalOwnedCalendar: ClientCalendar[];
}
export const CalendarModal: React.FC<CalendarsModal> = ({
  currentCalendarId,
  switchCalendar,
  initalMemberCalendars,
  initalOwnedCalendar,
}) => {
  const { showToast } = useToast();
  const { user } = useAuth();
  if (!user) return <div>No user</div>
  const [calendars, setCalendars] = useState<ClientCalendar[]>([...initalMemberCalendars, ...initalOwnedCalendar])
  const [editedName, setEditedName] = useState("");
  const [textInputId, setTextInputId] = useState<string>()
  const [calendarIdToDelete, setCalendarIdToDelete] = useState<string>("")

  const [insertCalendarStatus, insertCalendarAction, isInsertCalendar] = useActionState(
    insertCalendar.bind(null, {
      user: user,
      ownedCalendarSize: getCalendarsSizeByTag(calendars, "OWNED"),
      memberCalendarSize: getCalendarsSizeByTag(calendars, "MEMEBER"),
    }),
    null
  );

  const [deleteCalendarStatus, deleteCalendarAction, isDeleteCalendar] = useActionState(
    deleteCalendar.bind(null, {
      calendars,
      calendarIdToDelete,
      ownedCalendarSize: getCalendarsSizeByTag(calendars, "OWNED")
    }), null
  );


  useEffect(() => {
    if (insertCalendarStatus?.status === API_STATUS.SUCCESS) {
      const { data, message } = insertCalendarStatus;
      if (message === "New calendar created successfully" && data) {
        showToast(message);
        setCalendars((prev: ClientCalendar[]) => [...prev, data]);
      } else if (message === "A notification has been sent to join the calendar") {
        showToast(message);
      }
    }
    if (deleteCalendarStatus?.status === API_STATUS.SUCCESS) {
      const { message, data } = deleteCalendarStatus;
      if (message === "Calendar deleted successfully" && data) {
        setCalendars(data);
        showToast(message);
      }
    }
  }, [insertCalendarStatus?.status, deleteCalendarStatus?.message]);

  return <div >
    <form>
      <div className="flex mb-4 flex-col">
        <TextInput
          textPlaceholder="Enter calendar ID (optional)"
          textClassNameTextInput="flex-grow mr-2 text-sm"
          textName={CALENDAR_NAMES.CALENDAR_ID}
          textOnChange={(e) => { setTextInputId(e.target.value.trim()) }}
          isWithTextInput
          textError={(insertCalendarStatus?.error || deleteCalendarStatus?.error) ?? undefined}
          label={textInputId ? "Add" : "New"}
          formAction={insertCalendarAction}
          disbaled={isInsertCalendar}
          textDisabled={isInsertCalendar}
        />
        <span className="text-sm mt-1 text-gray-500">
          Leave this field blank to create a new calendar, or enter an ID to request access to an existing one
        </span>
      </div>
      <div className="space-y-3">
        {calendars.map((calendar: ClientCalendar, index: number) => {
          return <div
            key={calendar.id}
            className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${currentCalendarId === calendar.id
              ? "bg-blue-100 border-l-4 border-blue-500"
              : "hover:bg-gray-100"
              }`}
          // onClick={focusedCalendar ? undefined : () => handleSelectCalendar(calendar.id)}
          >
            {currentCalendarId === calendar.id ? (
              <div className="flex flex-col flex-grow">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="border rounded p-1 text-sm"
                />
                <div className="flex gap-2 mt-2">
                  <Button
                    // onClick={handleSaveEdit}
                    label="Save"
                  />
                  <Button
                    // onClick={handleCancelEdit} 
                    label="Cancel" variant="secondary"
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col">
                <span className="text-gray-800 font-medium">{calendar.name}</span>
                <span className="text-sm text-gray-500">ID: {calendar.id}</span>
              </div>
            )}
            <div className="flex gap-2">
              <div
              // onClick={(e) => handleEditClick(e, calendar)}
              >
                <Icon
                  icon={MdEdit}
                  divHeight="1.5rem"
                  divWidth="1.5rem"
                  iconSize="1.5rem"
                  className="hover:-translate-y-1"
                />
              </div>
              <div
              //  onClick={(e) => handleMembersButton(e, calendar)}
              >
                <Icon
                  icon={MdGroup}
                  divHeight="1.5rem"
                  divWidth="1.5rem"
                  iconSize="1.5rem"
                  className="hover:-translate-y-1"
                />
              </div>
              <button
                formAction={isDeleteCalendar ? undefined : deleteCalendarAction}
                onClick={isDeleteCalendar ? undefined : () => {
                  setCalendarIdToDelete(calendar.id)
                }}
              >
                <Icon
                  icon={FaTrashAlt}
                  divHeight="1.5rem"
                  divWidth="1.5rem"
                  iconSize="1.25rem"
                  className="hover:-translate-y-1"

                />
              </button>
            </div>
          </div>
        })}
      </div>
    </form >
  </div >
};
