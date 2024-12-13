import React, { useState } from "react";

interface TimePickerProps {
    placeholder?: string;
    name?: string;
    error?: string;
    value?: string;
}

export const TimePicker: React.FC<TimePickerProps> = ({
    placeholder = "Select a time",
    name,
    error,
    value = "",
}) => {
    const [showPicker, setShowPicker] = useState<boolean>(false);
    const [selectedTime, setSelectedTime] = useState<string>(value);

    const generateTimes = (): string[] => {
        const times: string[] = [];
        for (let hour = 0; hour < 24; hour++) {
            for (let minute = 0; minute < 60; minute += 15) {
                const timeString = `${hour.toString().padStart(2, "0")}:${minute
                    .toString()
                    .padStart(2, "0")}`;
                times.push(timeString);
            }
        }
        return times;
    };

    const times = generateTimes();

    const selectTime = (time: string): void => {
        setSelectedTime(time);
        setShowPicker(false);
    };

    return (
        <div className="flex flex-col w-full relative">
            <input
                type="text"
                value={selectedTime}
                onClick={() => setShowPicker(!showPicker)}
                readOnly
                name={name}
                placeholder={placeholder}
                className={`w-64 px-4 py-2 border rounded-md shadow-sm focus:ring hover:cursor-pointer ${error
                    ? "border-red-500 focus:ring-red-400"
                    : "border-gray-300 focus:ring-blue-300"
                    }`}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

            {showPicker && (
                <div className="absolute top-12 bg-white border rounded-lg shadow-lg p-4 max-h-64 w-64 overflow-y-auto z-10">
                    {times.map((time) => (
                        <div
                            key={time}
                            onClick={() => selectTime(time)}
                            className="py-2 px-4 hover:bg-blue-100 cursor-pointer text-center rounded-md"
                        >
                            {time}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
