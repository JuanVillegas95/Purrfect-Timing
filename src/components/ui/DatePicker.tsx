import { formatDateToISO, fromUTCToZoned } from "@utils/functions";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import React, { useState, useEffect } from "react";

interface DatePickerProps {
    placeholder?: string;
    name?: string;
    error?: string;
    value?: Date;
    isActive: boolean;
    open: () => void;
    close: () => void;
    timeZone: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
    placeholder = "Select a date",
    name,
    error,
    value = new Date(),
    open,
    close,
    isActive,
    timeZone
}) => {
    const [date, setDate] = useState<Date>(toZonedTime(new Date(), timeZone));
    const [selectedDate, setSelectedDate] = useState<Date>(value);
    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    const daysInPrevMonth = new Date(date.getFullYear(), date.getMonth(), 0).getDate();
    const getDays = () => {
        const days = [];
        for (let i = firstDayOfMonth; i > 0; i--) {
            days.push({ day: daysInPrevMonth - i + 1, isOtherMonth: true });
        }
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({ day: i, isOtherMonth: false });
        }
        const remaining = 42 - days.length;
        for (let i = 1; i <= remaining; i++) {
            days.push({ day: i, isOtherMonth: true });
        }
        return days;
    };

    const prevMonth = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1));
    };

    const nextMonth = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();

        setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1));
    };

    const selectDate = (day: number) => {
        setSelectedDate(new Date(date.getFullYear(), date.getMonth(), day));
        close()
    };

    const formattedDate = selectedDate
        ? formatDateToISO(selectedDate).split('T')[0]
        : "";

    const monthYear = date.toLocaleDateString("en-US", { month: "long", year: "numeric" });


    return <div className="flex flex-col relative w-full" >
        <input
            type="text"
            value={formattedDate}
            name={name}
            onClick={() => isActive ? close() : open()}
            readOnly
            placeholder={placeholder}
            className={`w-full px-4 py-2 border rounded-md shadow-sm focus:ring hover:cursor-pointer ${error
                ? "border-red-500 focus:ring-red-400"
                : "border-gray-300 focus:ring-blue-300"
                }`}
        />
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        {isActive && <div className="absolute top-12 bg-white border rounded-lg shadow-lg p-6 w-64 z-10">
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={(e) => prevMonth(e)}
                    className="text-gray-500 hover:text-blue-500"
                >
                    &lt;
                </button>
                <div className="text-lg font-semibold">{monthYear}</div>
                <button
                    onClick={e => nextMonth(e)}
                    className="text-gray-500 hover:text-blue-500"
                >
                    &gt;
                </button>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center text-gray-500 font-semibold">
                <div>S</div>
                <div>M</div>
                <div>T</div>
                <div>W</div>
                <div>T</div>
                <div>F</div>
                <div>S</div>
            </div>

            <div className="grid grid-cols-7 gap-0 text-center mt-2">
                {getDays().map(({ day, isOtherMonth }, index) => (
                    <div
                        key={index}
                        onClick={() => !isOtherMonth && selectDate(day)}
                        className={`py-1 rounded-md cursor-pointer ${isOtherMonth
                            ? "text-gray-400"
                            : "hover:bg-blue-100"
                            } ${selectedDate &&
                                day === selectedDate.getDate() &&
                                !isOtherMonth &&
                                date.getMonth() === selectedDate.getMonth()
                                ? "bg-blue-500 text-white"
                                : ""
                            }`}
                    >
                        {day}
                    </div>
                ))}
            </div>
        </div>}
    </div >
};
