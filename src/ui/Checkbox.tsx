import React, { useState } from "react";

interface CheckboxProps {
    label?: string;
    name?: string;
    checked?: boolean;
    onChange?: (checked: boolean) => void;
}

export const Checkbox: React.FC<CheckboxProps> = ({ label = "", name, checked = false, onChange }) => {
    const [isChecked, setIsChecked] = useState<boolean>(checked);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newChecked = e.target.checked;
        setIsChecked(newChecked);
        if (onChange) {
            onChange(newChecked);
        }
    };

    return (
        <label className="flex items-center space-x-2 cursor-pointer">
            <input
                type="checkbox"
                name={name}
                checked={isChecked}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            {label && <span className="text-gray-700">{label}</span>}
        </label>
    );
};

