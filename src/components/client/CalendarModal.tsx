import React, { useEffect, useState } from "react";
import { Button } from "@ui/Button";
import { TextInput } from "@ui/TextInput";
import { MdEdit } from "react-icons/md";
import { Icon } from "@ui/Icon";
import { FaTrashAlt } from "react-icons/fa";
import { ClientCalendar, MemberDetails } from "@utils/interfaces";
import { MdGroup } from "react-icons/md";
import { useToast } from "@context/ToastContext";
import Modal from "./Modal";
import { API_STATUS } from "@utils/constants";
import { useAuth } from "@context/AuthContext";
import { deleteCalendar, editCalendarName, insertCalendar, removeMember } from "@db/clientActions";
import { getCalendarsSizeByTag } from "@utils/functions";
import { collection, doc, getDoc, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@db/firebaseClient";
import { RxCrossCircled } from "react-icons/rx";

interface CalendarsModal {
  currentCalendarId: string;
  switchCalendar: (calendarId: string) => Promise<void>;
}
export const CalendarModal: React.FC<CalendarsModal> = ({
  currentCalendarId,
  switchCalendar,
}) => {
  const { showToast } = useToast();
  const { user } = useAuth();

  // Ensure hooks are always called
  const [calendars, setCalendars] = useState<ClientCalendar[]>([]);
  const [editedName, setEditedName] = useState("");
  const [textCalendarId, setTextCalendarId] = useState<string>();
  const [editCalendarId, setEditCalendarId] = useState<string>();
  const [currentError, setCurrentError] = useState<string>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentMemberDetails, setCurrentMemberDetails] = useState<ClientCalendar | null>(null);

  // Conditional rendering can remain, but hooks should always be executed
  useEffect(() => {
    if (!user) return; // Avoid running effect if no user

    const ownedCalendarsQuery = query(
      collection(db, "calendars"),
      where("owner", "==", user.userId)
    );

    const unsubOwner = onSnapshot(ownedCalendarsQuery, async (snapshot) => {
      const updatedCalendars = await Promise.all(
        snapshot.docChanges().map(async (change) => {
          const membersIds: string[] = change.doc.data().members;

          const newMemberDetails: MemberDetails[] = await Promise.all(
            membersIds.map(async (memberId) => {
              const userDocRef = doc(db, `users`, memberId);
              const userDoc = await getDoc(userDocRef);

              if (!userDoc.exists()) {
                throw new Error(`User document for ID ${memberId} does not exist`);
              }

              return { name: userDoc.data().name, id: memberId };
            })
          );

          const changedCalendar: ClientCalendar = {
            id: change.doc.id,
            tag: "OWNED",
            memberDetails: newMemberDetails,
            ...change.doc.data(),
          } as ClientCalendar;

          return { changeType: change.type, changedCalendar };
        })
      );

      setCalendars((prev) => {
        let updated = [...prev];
        updatedCalendars.forEach(({ changeType, changedCalendar }) => {
          switch (changeType) {
            case "added":
              updated.push(changedCalendar);
              break;
            case "modified": {
              const idx = updated.findIndex((c) => c.id === changedCalendar.id);
              if (idx !== -1) updated[idx] = changedCalendar;
              break;
            }
            case "removed":
              updated = updated.filter((c) => c.id !== changedCalendar.id);
              break;
          }
        });
        return updated;
      });
    });

    const memberCalendarsQuery = query(
      collection(db, "calendars"),
      where("members", "array-contains", user.userId)
    );

    const unsubMember = onSnapshot(memberCalendarsQuery, (snapshot) => {
      setCalendars((prev) => {
        let updated = [...prev];
        snapshot.docChanges().forEach((change) => {
          const changedCalendar: ClientCalendar = {
            id: change.doc.id,
            tag: "MEMEBER",
            ...change.doc.data(),
          } as ClientCalendar;

          switch (change.type) {
            case "added":
              updated.push(changedCalendar);
              break;
            case "modified": {
              const idx = updated.findIndex((c) => c.id === changedCalendar.id);
              if (idx !== -1) updated[idx] = changedCalendar;
              break;
            }
            case "removed":
              updated = updated.filter((c) => c.id !== changedCalendar.id);
              break;
          }
        });
        return updated;
      });
    });

    return () => {
      unsubOwner();
      unsubMember();
    };
  }, [user]);

  // Render component conditionally
  if (!user) return <div>No user</div>;
  return <div >
    {currentMemberDetails && <Modal closeActiveModal={() => setCurrentMemberDetails(null)}>
      <div>
        {currentMemberDetails.memberDetails.length > 0 ? (
          currentMemberDetails.memberDetails.map((member, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 p-5 rounded-md shadow-sm mb-3"
            >
              <div className="flex items-center gap-4 pr-4">
                <p className="text-gray-800 font-medium">{member.name}</p>
              </div>

              <div className="flex gap-2">
                <Icon icon={RxCrossCircled}
                  divHeight="2.5rem"
                  divWidth="2.5rem"
                  iconSize="2rem"
                  className="text-red-500 hover:text-red-400"
                  onClick={async () => {
                    const response = await removeMember(member.id, currentMemberDetails.id);
                    showToast(response.message ?? response.error ?? "");
                    if (response.status === API_STATUS.SUCCESS) {
                      setCurrentMemberDetails((prev) => {
                        if (!prev) return prev;
                        return {
                          ...prev,
                          memberDetails: prev.memberDetails.filter((m) => m.id !== member.id),
                        };
                      });
                    }
                  }}

                />
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500 text-center">No new users</p>
        )}
      </div>
    </Modal>}
    <div className="flex mb-4 flex-col">
      <TextInput
        textPlaceholder="Enter calendar ID (optional)"
        textClassNameTextInput="flex-grow mr-2 text-sm"
        textOnChange={(e) => { setTextCalendarId(e.target.value.trim()) }}
        isWithTextInput
        textError={currentError ?? undefined}
        label={textCalendarId ? "Add" : "New"}
        disbaled={isLoading}
        textDisabled={isLoading}
        onClick={isLoading ? undefined : async (e) => {
          e.preventDefault()
          e.stopPropagation()
          try {
            setIsLoading(true)
            const response = await insertCalendar({
              ownedCalendarSize: getCalendarsSizeByTag(calendars, "OWNED"),
              memberCalendarSize: getCalendarsSizeByTag(calendars, "MEMEBER"),
              calendarId: textCalendarId || "",
              user,
              calendarsIds: calendars.filter((calendar) => calendar.tag === "OWNED").map((calendar) => calendar.id)
            })
            if (response?.message) showToast(response.message)
            setCurrentError(response?.error ?? undefined)
          } finally {
            setIsLoading(false)
          }
        }}
      />
      <span className="text-sm mt-1 text-gray-500">
        Leave this field blank to create a new calendar, or enter an ID to request access to an existing one
      </span>
    </div>
    <div className="space-y-3">
      {calendars.map((calendar: ClientCalendar) => {
        return <div
          key={`${calendar.id}-${calendar.name}`}
          className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${currentCalendarId === calendar.id
            ? "bg-blue-100 border-l-4 border-blue-500"
            : "hover:bg-gray-100"
            }`}
          onClick={isLoading ? undefined : async () => {
            try {
              setIsLoading(true)
              await switchCalendar(calendar.id)
            } finally {
              setIsLoading(false)
            }
          }}
        >
          {editCalendarId === calendar.id ? (
            <div className="flex flex-col flex-grow">
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                className="border rounded p-1 text-sm"

              />
              <div className="flex gap-2 mt-2">
                <Button
                  disbaled={isLoading}
                  onClick={isLoading ? undefined : async () => {
                    try {
                      setIsLoading(true)
                      const response = await editCalendarName({
                        calendarIdToEdit: editCalendarId,
                        newName: editedName
                      })
                      setCurrentError(response?.error ?? undefined)
                    } finally {
                      setEditCalendarId(undefined)
                      setIsLoading(false)
                    }
                  }}
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
              {calendar.tag === "OWNED" && <span
                className="text-sm text-gray-500 hover:text-blue-400"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigator.clipboard.writeText(calendar.id)
                  showToast("Calendar ID copied to the clipboard")
                }}
              >
                ID: {calendar.id}
              </span>}

            </div>
          )}
          {calendar.tag === "OWNED" && <div className="flex gap-2">
            <Icon
              icon={MdEdit}
              divHeight="1.5rem"
              divWidth="1.5rem"
              iconSize="1.5rem"
              className="hover:-translate-y-1"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setEditCalendarId(prev => prev === calendar.id ? undefined : calendar.id)
              }}
            />
            <Icon
              icon={MdGroup}
              divHeight="1.5rem"
              divWidth="1.5rem"
              iconSize="1.5rem"
              className="hover:-translate-y-1"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCurrentMemberDetails(calendar)
              }}
            />
            <Icon
              icon={FaTrashAlt}
              divHeight="1.5rem"
              divWidth="1.5rem"
              iconSize="1.25rem"
              className="hover:-translate-y-1"
              onClick={isLoading ? undefined : async (e) => {
                e.preventDefault()
                e.stopPropagation()
                try {
                  setIsLoading(true)
                  const response = await deleteCalendar({
                    ownedCalendarSize: getCalendarsSizeByTag(calendars, "OWNED"),
                    calendars,
                    calendarIdToDelete: calendar.id
                  })
                  setCurrentError(response?.error ?? undefined)
                }
                finally {
                  setIsLoading(false)
                }
              }}
            />
          </div>}

        </div>
      })}
    </div>
  </ div>
};
