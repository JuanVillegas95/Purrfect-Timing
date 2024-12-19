import React, { useActionState, useRef, useState } from "react";
import { TextInput } from "../ui/TextInput";
import { DatePicker } from "../ui/DatePicker";
import { TimePicker } from "../ui/TimePicker";
import { TextArea } from "../ui/TextArea";
import { SelectedDays } from "../ui/SelectedDays";
import { Button } from "../ui/Button";
import { setEventServer, deleteEventServer } from "../server/actions";
import { ColorPicker } from "../ui/ColorPicker";
import { Icon } from "../ui/Icon";
import { DAYS, PICKERS, EVENT_NAMES, BLANK_EVENT_ACTIONS_STATE } from "@utils/constants";
import { formatTime, validateEventForm } from "@utils/functions";
import { Event } from "@utils/interfaces";
import { MdOutlineEventRepeat } from "react-icons/md";
import { EventActionsState } from "@utils/interfaces"
import { toZonedTime } from "date-fns-tz";

interface EventModalProps {
    setEvent: (event: Event) => void;
    deleteEvent: (event: Event) => void;
    clickedEvent?: Event;
    closeActiveModal: () => void;
    activePicker: PICKERS;
    setActivePicker: (picker: PICKERS) => void;
    timeZone: string;
}

export const EventModal: React.FC<EventModalProps> = ({
    setActivePicker,
    setEvent,
    deleteEvent,
    clickedEvent,
    closeActiveModal,
    activePicker,
    timeZone
}) => {
    const formRef = useRef<HTMLFormElement>(null);
    const [isRepeating, setIsRepeating] = useState<boolean>(false);
    const [saveState, saveAction, savePending] = useActionState(
        async (previousState: EventActionsState, formData: FormData) => {
            const actionState: EventActionsState = validateEventForm(formData, isRepeating);
            const hasErrors = Object.values(actionState.error).some((error) => error !== "");
            if (hasErrors) {
                return { ...actionState, message: "Please check the highlighted fields and try again." };
            }
            try {
                const eventToSet: Event = await setEventServer(formData, clickedEvent?.eventId);
                setEvent(eventToSet);
                closeActiveModal();
                return { ...actionState, message: "Event saved successfully!", eventToSet };
            }
            catch (error) {
                return { ...actionState, message: "An error occurred while saving the event. Please try again later." };
            }
            finally {
                formRef.current?.reset();
            }
        },
        { ...BLANK_EVENT_ACTIONS_STATE }
    );

    const [deleteState, deleteAction, deletePending] = useActionState(
        async (previousState: unknown) => {
            try {
                const isDeleted: boolean = await deleteEventServer(clickedEvent!.eventId);
                deleteEvent(clickedEvent!)
                closeActiveModal();
                return { message: "Event deleted successfully!" };
            } catch (error) {
                console.log(error)
                return { error, message: "An error occurred while deleting the event. Please try again later." };
            }
        },
        null
    );



    return <div className="flex flex-col gap-4">
        <form className="flex flex-col gap-4" ref={formRef}>
            {saveState && <p className="text-blue-500 text-sm mt-1">{saveState.message}</p>}
            {deleteState && <p className="text-blue-500 text-sm mt-1">{deleteState.message}</p>}
            <div className="flex gap-4">
                <TextInput
                    name={EVENT_NAMES.TITLE}
                    placeholder="Add Title"
                    error={saveState.error.TITLE}
                    defaultValue={clickedEvent?.title}
                />
                <ColorPicker
                    value={clickedEvent ? clickedEvent.color : undefined}
                    isActive={activePicker === PICKERS.COLOR}
                    name={EVENT_NAMES.COLOR}
                    open={() => setActivePicker(PICKERS.COLOR)}
                    close={() => setActivePicker(PICKERS.NONE)}
                />
                <Icon
                    icon={MdOutlineEventRepeat}
                    divHeight="2.5rem"
                    divWidth="3rem"
                    iconSize="2.0rem"
                    border
                    onClick={() => setIsRepeating(!isRepeating)}
                />
            </div>
            <div className="flex gap-4">
                <DatePicker
                    name={EVENT_NAMES.START_DATE}
                    placeholder="Start Date"
                    error={saveState.error.START_DATE}
                    value={clickedEvent ? toZonedTime(clickedEvent!.startDate, timeZone) : undefined}
                    isActive={activePicker === PICKERS.DATE}
                    open={() => setActivePicker(PICKERS.DATE)}
                    close={() => setActivePicker(PICKERS.NONE)}
                />
                <TimePicker
                    name={EVENT_NAMES.START_TIME}
                    placeholder="Start Time"
                    error={saveState.error.START_TIME}
                    value={clickedEvent ? formatTime(clickedEvent!.startHours, clickedEvent!.startMinutes) : undefined}
                    isActive={activePicker === PICKERS.START_TIME}
                    open={() => setActivePicker(PICKERS.START_TIME)}
                    close={() => setActivePicker(PICKERS.NONE)}

                />
                <TimePicker
                    name={EVENT_NAMES.END_TIME}
                    placeholder="End Time"
                    error={saveState.error.END_TIME}
                    value={clickedEvent ? formatTime(clickedEvent!.endHours, clickedEvent!.endMinutes) : undefined}
                    isActive={activePicker === PICKERS.END_TIME}
                    open={() => setActivePicker(PICKERS.END_TIME)}
                    close={() => setActivePicker(PICKERS.NONE)}
                />
            </div>
            {isRepeating && <div className="flex gap-4">
                <DatePicker
                    placeholder="End Date"
                    name={EVENT_NAMES.END_DATE}
                    error={saveState.error.REPEATING}
                    value={toZonedTime(clickedEvent!.endDate, timeZone)}
                    isActive={activePicker === PICKERS.END_DATE}
                    open={() => setActivePicker(PICKERS.END_DATE)}
                    close={() => setActivePicker(PICKERS.NONE)}
                />
                <SelectedDays
                    names={DAYS}
                    error={saveState.error.SELECTED_DAYS}
                />
            </div>}
            <TextArea
                name={EVENT_NAMES.DESCRIPTION}
                defaultValue={clickedEvent?.description}
                error={saveState.error.DESCRIPTION}
            />
            <div className="flex w-full gap-4">
                <Button
                    label="Delete"
                    variant="secondary"
                    isPending={deletePending || savePending}
                    formAction={deleteAction}
                />
                <Button
                    label="Save"
                    variant="primary"
                    isPending={savePending || deletePending}
                    formAction={saveAction}
                />
            </div>
        </form>
    </div>
};
