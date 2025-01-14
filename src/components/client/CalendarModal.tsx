"use client"
import React, { useState } from "react";
import { Button } from "@ui/Button";
import { TextInput } from "@ui/TextInput";
import { MdEdit } from "react-icons/md";
import { Icon } from "@ui/Icon";
import { FaTrashAlt } from "react-icons/fa";

interface Calendar {
  id: string;
  name: string;
}

interface CalendarsModal {
  currentCalendarId: string;
  switchCalendar: (calendarId: string) => Promise<void>;
}

export const CalendarModal: React.FC<CalendarsModal> = ({ currentCalendarId, switchCalendar }) => {
  const [calendarId, setCalendarId] = useState("");
  const [calendars, setCalendars] = useState<Calendar[]>([
    { id: "abc123", name: "Work Calendar" },
    { id: "xyz456", name: "Personal Calendar" },
  ]);
  const [editingCalendar, setEditingCalendar] = useState<Calendar | null>(null);
  const [editedName, setEditedName] = useState("");

  const handleAddCalendar = () => {
    if (calendarId.trim()) {
      console.log(`Importing calendar with ID: ${calendarId}`);
      switchCalendar(calendarId);
    } else {
      console.log("Creating a new blank calendar...");
      const newCalendarId = "new-generated-id";
      switchCalendar(newCalendarId);
    }
    setCalendarId("");
  };

  const handleSelectCalendar = (id: string) => {
    switchCalendar(id);
  };

  const handleEditClick = (calendar: Calendar) => {
    setEditingCalendar(calendar);
    setEditedName(calendar.name);
  };

  const handleSaveEdit = () => {
    if (editingCalendar && editedName.trim()) {
      setCalendars((prevCalendars) =>
        prevCalendars.map((cal) =>
          cal.id === editingCalendar.id ? { ...cal, name: editedName } : cal
        )
      );
      setEditingCalendar(null);
      setEditedName("");
    }
  };

  const handleCancelEdit = () => {
    setEditingCalendar(null);
    setEditedName("");
  };

  return (
    <div>
      <div className="flex mb-4 flex-col">
        <TextInput
          placeholder="Enter calendar ID (optional)"
          value={calendarId}
          onChange={(e) => setCalendarId(e.target.value)}
          classNameTextInput="flex-grow mr-2 text-sm"
          buttonText={calendarId ? "Add" : "New"}
          onButtonClick={handleAddCalendar}
        />
        <span className="text-sm mt-1 text-gray-500">
          Leave blank to create a new calendar, or enter an ID to add an existing one
        </span>
      </div>

      <div className="space-y-3">
        {calendars.map((calendar) => (
          <div
            key={calendar.id}
            className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${currentCalendarId === calendar.id
              ? "bg-blue-100 border-l-4 border-blue-500"
              : "hover:bg-gray-100"
              }`}
            onClick={() => handleSelectCalendar(calendar.id)}
          >
            {editingCalendar?.id === calendar.id ? (
              <div className="flex flex-col flex-grow">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="border rounded p-1 text-sm"
                />
                <div className="flex gap-2 mt-2">
                  <Button onClick={handleSaveEdit} label="Save" />
                  <Button onClick={handleCancelEdit} label="Cancel" variant="secondary" />
                </div>
              </div>
            ) : (
              <div className="flex flex-col">
                <span className="text-gray-800 font-medium">{calendar.name}</span>
                <span className="text-sm text-gray-500">ID: {calendar.id}</span>
              </div>
            )}
            {!editingCalendar && (
              <div className="flex gap-2">
                <Icon
                  icon={MdEdit}
                  divHeight="1.5rem"
                  divWidth="1.5rem"
                  iconSize="1.5rem"
                  onClick={() => (e: any) => {
                    {
                      e.stopPropagation();
                      handleEditClick(calendar);
                    }
                  }}
                />
                <Icon
                  icon={FaTrashAlt}
                  divHeight="1.5rem"
                  divWidth="1.5rem"
                  iconSize="1.25rem"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
