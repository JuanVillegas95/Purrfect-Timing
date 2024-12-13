import React, { useState, useEffect } from "react";

interface SelectedDaysProps {
    names?: string[];
    error?: string;
}

export const SelectedDays: React.FC<SelectedDaysProps> = ({
    names = [],
    error,
}) => {
    const daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"];
    const [selected, setSelected] = useState<boolean[]>(Array(7).fill(false));

    const handleCheckboxChange = (index: number, isChecked: boolean) => {
        const updatedSelected = [...selected];
        updatedSelected[index] = isChecked;
        setSelected(updatedSelected);

    };

    return (
        <div className="flex flex-col">
            <div
                className={`flex space-x-4 px-4 py-2 border rounded-md ${error ? "border-red-500" : "border-gray-300"
                    }`}
            >
                {daysOfWeek.map((day, index) => (
                    <label
                        key={index}
                        className="flex flex-col items-center cursor-pointer space-y-1"
                    >
                        <input
                            type="checkbox"
                            name={names[index]}
                            checked={selected[index]}
                            value={selected[index] ? "true" : "false"}
                            onChange={(e) => handleCheckboxChange(index, e.target.checked)}
                            className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-gray-700 font-semibold">{day}</span>
                    </label>
                ))}
            </div>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
    );
};
