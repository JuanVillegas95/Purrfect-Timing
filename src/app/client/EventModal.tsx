import React, { useActionState, useRef, useState } from "react";
import { TextInput } from "../../ui/TextInput";
import { setEventServer } from "@server/events/eventActions";
import { DatePicker } from "@ui/DatePicker";
import { TimePicker } from "@ui/TimePicker";
import { TextArea } from "@ui/TextArea";
import { Checkbox } from "@ui/Checkbox";
import { SelectedDays } from "@ui/SelectedDays";
import { SubmitButton } from "@ui/SubmitButton";
import { DAYS, EVENT_DESCRIPTION_MAX_LENGTH, EVENT_TITLE_MAX_LENGTH } from "@utils/constants";
import { formatTime, timeToMinutes } from "@utils/functions";
import { Event } from "@utils/interfaces";


interface EventModalProps {
    setEvent: (event: Event) => void;
    clickedEvent?: Event;
    closeActiveModal: () => void;
}

export const EventModal: React.FC<EventModalProps> = ({ setEvent, clickedEvent, closeActiveModal }) => {
    const [state, formAction, isPending] = useActionState(handleSubmit, null);

    const formRef = useRef<HTMLFormElement>(null);
    const [isRepeating, setIsRepeating] = useState<boolean>(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const validateForm = (formData: FormData) => {
        const newErrors: { [key: string]: string } = {};

        const title = formData.get("title") as string;
        if (title.length > EVENT_TITLE_MAX_LENGTH) {
            newErrors.TITLE = `Title must not exceed ${EVENT_TITLE_MAX_LENGTH} characters.`;
        }

        const description = formData.get("description") as string;
        if (description.length > EVENT_DESCRIPTION_MAX_LENGTH) {
            newErrors.TITLE = `Description must not exceed ${EVENT_TITLE_MAX_LENGTH} characters.`;
        }

        const date = formData.get("date") as string;
        if (!date) newErrors.DATE = "Date is required.";

        const startTime = formData.get("startTime") as string;
        const endTime = formData.get("endTime") as string;
        if (!startTime || !endTime) {
            newErrors.TIME = "Start and end times are required.";
        }
        else if (timeToMinutes(startTime) >= timeToMinutes(endTime)) {
            newErrors.TIME = "End time must be after start time.";
        }

        if (isRepeating) {
            const startDate = formData.get("start") as string;
            const endDate = formData.get("END_DATE") as string;
            if (!startDate || !endDate) {
                newErrors.REPEATING_DATES = "Start and end dates are required for repeating events.";
            }
            else if (startDate >= endDate) {
                newErrors.REPEATING_DATES = "End date must be after start date.";
            }
            let flag: boolean = false;
            for (const day of DAYS) {
                const boolean = formData.get(day) as string;
                if (boolean === "true") flag = true;
            }
            if (!flag) newErrors.SELECTED_DAYS = "At least one day must be selected.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    async function handleSubmit(formData: FormData) {
        if (validateForm(formData)) {
            try {
                formRef.current?.reset();
                const eventToSet: Event = await setEventServer(formData, clickedEvent?.eventId);
                setEvent(eventToSet);
            } catch (error) {

            }
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <form className="flex flex-col gap-4" ref={formRef} action={handleSubmit}>
                <TextInput
                    name="title"
                    placeholder="Add Title"
                    error={errors.TITLE}
                    defaultValue={clickedEvent?.title}
                />
                <div className="flex gap-4">
                    <DatePicker
                        name="date"
                        error={errors.DATE}
                        value={clickedEvent ? new Date(clickedEvent!.date) : undefined}
                    />
                    <TimePicker
                        name="startTime"
                        placeholder="Start Time"
                        error={errors.TIME}
                        value={clickedEvent ? formatTime(clickedEvent!.startHours, clickedEvent!.startMinutes) : undefined}
                    />
                    <TimePicker
                        name="endTime"
                        placeholder="End Time"
                        error={errors.TIME}
                        value={clickedEvent ? formatTime(clickedEvent!.endHours, clickedEvent!.endMinutes) : undefined}
                    />
                </div>
                <div className="flex gap-4 ml-4">
                    <Checkbox checked={isRepeating} onChange={() => setIsRepeating(!isRepeating)} />
                    <p>Repeating</p>
                </div>
                {isRepeating && <div className="flex flex-col gap-4">
                    <DatePicker
                        placeholder="Start Date"
                        name="startDate"
                        error={errors.REPEATING_DATES}
                    />
                    <DatePicker
                        placeholder="End Date"
                        name="endDate"
                        error={errors.REPEATING_DATES}
                    />
                    <SelectedDays
                        names={DAYS}
                        error={errors.SELECTED_DAYS}
                    />
                </div>
                }
                <TextArea
                    name="description"
                    defaultValue={clickedEvent?.description}
                    error={errors.DESCRIPTION}
                />
                <SubmitButton label="Save" onClick={closeActiveModal} pending={isPending} />
            </form>
        </div>
    );
};
