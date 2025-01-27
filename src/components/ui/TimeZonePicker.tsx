import { ianaToReadable } from "@utils/functions";
import React, { useState } from "react";

interface TimeZonePickerProps {
    placeholder?: string;
    name?: string;
    error?: string;
    switchTimeZone: (timeZone: string) => void;
    timeZone: string;
}

export const TimeZonePicker: React.FC<TimeZonePickerProps> = ({
    placeholder = "Select a timezone",
    error,
    switchTimeZone,
    timeZone,
}) => {
    const [isActive, setIsActive] = useState<boolean>(false);
    const [filterText, setFilterText] = useState<string>("");

    const timeZones: string[] = Intl.supportedValuesOf("timeZone");
    const filteredTimeZones = timeZones.filter((tz) =>
        ianaToReadable(tz).toLowerCase().includes(filterText.toLowerCase())
    );

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFilterText(value);
        setIsActive(true);
    };

    const handleSelectTimeZone = (tz: string) => {
        switchTimeZone(tz);
        setFilterText(""); // Clear the filter text once a selection is made
        setIsActive(false); // Close the dropdown after selection
    };

    return (
        <div className="flex flex-col w-full relative text-black">
            <div
                className={`flex items-center justify-between w-64 px-4 py-2 border rounded-md shadow-sm focus:ring hover:cursor-pointer ${error ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-blue-300"
                    } hover:bg-gray-50`}
            >
                <input
                    type="text"
                    placeholder={placeholder}
                    value={isActive ? filterText : ianaToReadable(timeZone)}
                    onChange={handleInputChange}
                    onFocus={() => setIsActive(true)}
                    className="w-full focus:outline-none bg-transparent"
                />
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    onClick={() => setIsActive(!isActive)}

                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

            {isActive && (
                <div className="absolute top-12 bg-white border rounded-lg shadow-lg p-4 max-h-64 w-64 overflow-y-auto z-10">
                    {filteredTimeZones.length > 0 ? (
                        filteredTimeZones.map((timeZone) => (
                            <div
                                key={timeZone}
                                onClick={() => handleSelectTimeZone(timeZone)}
                                className="py-2 px-4 hover:bg-blue-100 cursor-pointer text-center rounded-md"
                            >
                                {ianaToReadable(timeZone)}
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500">No matching timezones</p>
                    )}
                </div>
            )}
        </div>
    );
};
