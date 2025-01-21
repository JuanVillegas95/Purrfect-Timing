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
import { API_STATUS, CALENDAR_MODAL_ACTION, PLAN_LIMITATIONS } from "@utils/constants";
import { useAuth } from "@context/AuthContext";
import { deleteCalendar, editCalendarName, insertCalendar } from "@db/clientActions";
import { getCalendarsSizeByTag } from "@utils/functions";

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
  const [textCalendarId, setTextCalendarId] = useState<string>()
  const [editCalendarId, setEditCalendarId] = useState<string>();
  const [currentError, setCurrentError] = useState<string>();


  const [insertCalendarStatus, insertCalendarAction, isInsertCalendar] = useActionState(insertCalendar, null);
  const [deleteCalendarStatus, deleteCalendarAction, isDeleteCalendar] = useActionState(deleteCalendar, null);
  const [editCalendarNameStatus, editCalendarNameAction, isEditCalendarName] = useActionState(editCalendarName, null);

  useEffect(() => {
    if (insertCalendarStatus) {
      const { data, message, extra, error } = insertCalendarStatus;
      if (data && extra === "Update calendars") {
        showToast(message);
        setCalendars((prev: ClientCalendar[]) => [...prev, data]);
      } else if (extra === "New notification") {
        showToast(message);
      }
      if (error) setCurrentError(error);
    }
  }, [insertCalendarStatus?.message]);

  useEffect(() => {
    if (deleteCalendarStatus) {
      const { message, data, extra, error } = deleteCalendarStatus;
      if (data && extra === "Delete Calendar") {
        setCalendars(data);
        showToast(message);
      }
      if (error) setCurrentError(error);
    }
  }, [deleteCalendarStatus?.message]);

  useEffect(() => {
    if (editCalendarNameStatus) {
      const { message, data, extra, error } = editCalendarNameStatus;
      if (data && extra === "Delete Calendar") {
        showToast(message);
      }
      if (error) setCurrentError(error);
    }
  }, [editCalendarNameStatus?.message]);

  return <div >
    <form>
      <div className="flex mb-4 flex-col">
        <TextInput
          textPlaceholder="Enter calendar ID (optional)"
          textClassNameTextInput="flex-grow mr-2 text-sm"
          textOnChange={(e) => { setTextCalendarId(e.target.value.trim()) }}
          isWithTextInput
          textError={currentError ?? undefined}
          label={textCalendarId ? "Add" : "New"}
          disbaled={isInsertCalendar || isDeleteCalendar}
          textDisabled={isInsertCalendar}
          formAction={isInsertCalendar ? undefined : () => {
            insertCalendarAction({
              ownedCalendarSize: getCalendarsSizeByTag(calendars, "OWNED"),
              memberCalendarSize: getCalendarsSizeByTag(calendars, "MEMEBER"),
              calendarId: textCalendarId || "",
              user,
            })
          }}
        />
        <span className="text-sm mt-1 text-gray-500">
          Leave this field blank to create a new calendar, or enter an ID to request access to an existing one
        </span>
      </div>
      <div className="space-y-3">
        {calendars.map((calendar: ClientCalendar, index: number) => {
          return <div
            key={`${calendar.id}-${calendar.name}`}
            className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${currentCalendarId === calendar.id
              ? "bg-blue-100 border-l-4 border-blue-500"
              : "hover:bg-gray-100"
              }`}
          // onClick={focusedCalendar ? undefined : () => handleSelectCalendar(calendar.id)}
          >
            {editCalendarId === calendar.id ? (
              <div className="flex flex-col flex-grow">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="border rounded p-1 text-sm"
                />
                <div className="flex gap-2 mt-2">
                  <Button
                    disbaled={isEditCalendarName}
                    formAction={isEditCalendarName ? undefined : () => editCalendarNameAction({
                      calendarIdToEdit: editCalendarId,
                      newName: editedName
                    })}
                    label="Save"
                  />
                  <Button
                    onClick={() => setEditCalendarId(undefined)}
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
                  onClick={() => setEditCalendarId(prev => prev === calendar.id ? undefined : calendar.id)}
                />
              </div>
              <div
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
                formAction={isDeleteCalendar ? undefined : () => {
                  deleteCalendarAction({
                    ownedCalendarSize: getCalendarsSizeByTag(calendars, "OWNED"),
                    calendars,
                    calendarIdToDelete: calendar.id
                  })
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
