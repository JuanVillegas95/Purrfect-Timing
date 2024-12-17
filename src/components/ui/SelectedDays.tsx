import React, { useState, useEffect } from "react";

interface SelectedDaysProps {
    names?: string[];
    error?: string;
}

export const SelectedDays: React.FC<SelectedDaysProps> = ({
    names = [],
    error,
}) => {
    const [selected, setSelected] = useState<boolean[]>(Array(7).fill(false));

    const handleCheckboxChange = (index: number) => {
        console.log(selected)
        setSelected((prevSelected) => {
            const updatedSelected = [...prevSelected];
            updatedSelected[index] = !updatedSelected[index];
            return updatedSelected;
        });
    };


    return <div className="flex flex-col w-full items-center">
        <div
            className={`flex justify-center space-x-4 px-4 py-2 border rounded-md w-full ${error ? "border-red-500" : "border-gray-300"
                }`}
        >
            {names.map((day: string, index: number) => <label
                key={`${day + index}`}
                className="relative flex w-6 h-6 items-center justify-center"
            >
                <span
                    className={`z-10 text-xs cursor-pointer ${selected[index] ? "text-white" : "text-blue-500"
                        }`}
                >
                    {day[0]}
                </span>
                <input
                    type="button"
                    name={day}
                    value={selected[index] ? "true" : "false"}
                    onClick={() => handleCheckboxChange(index)}
                    className={`absolute w-full h-full border-2 rounded-full cursor-pointer text-transparent ${selected[index] ? "bg-blue-500" : "bg-gray-100"
                        }`}
                />
            </label>
            )}
        </div>
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
};
