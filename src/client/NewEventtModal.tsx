import React from "react";
import { createNewEvent } from "@/server/newEventModal";
import Input from "./Input";

const NewEventModal: React.FC = () => {
    return (
        <div className="flex flex-col">
            <p className="text-2xl">New Event</p>
            <form action={createNewEvent} className="flex flex-col gap-4">
                <div>
                    <Input
                        placeholder="Add Title"
                        width="w-12"
                    />
                </div>
                <div>
                    <input type="date" name="date" required />
                </div>
                <div className="flex items-center">
                    <label>Start</label>
                    <Input
                        width="w-12"
                        type="number"
                        min={0}
                        max={23}
                    />
                </div>
                <div className="flex items-center">
                    <label>End</label>
                    <Input
                        width="w-12"
                        type="number"
                        min={0}
                        max={23}
                    />
                </div>
                <div>
                    <textarea
                        name="description"
                        className="mt-2 w-full rounded-lg border-gray-200 align-top shadow-sm sm:text-sm"
                        rows={4}
                        placeholder="Description"
                        maxLength={500}
                    ></textarea>
                </div>
                <button
                    type="submit"
                    className="rounded bg-blue-500 px-4 py-2 text-white"
                >
                    Create Event
                </button>
            </form>
        </div>
    );
};

export default NewEventModal;
