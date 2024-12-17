import React, { useState } from "react";

interface TextAreaProps {
    placeholder?: string;
    name?: string;
    rows?: number;
    cols?: number;
    maxLength?: number;
    error?: string;
    defaultValue?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({
    placeholder = "Type here...",
    name,
    rows = 4,
    cols = 50,
    maxLength = 500,
    error,
    defaultValue
}) => {
    const [value, setValue] = useState<string>("");

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (e.target.value.length <= maxLength) {
            setValue(e.target.value);
        }
    };

    return (
        <div className="flex flex-col w-full">
            <textarea
                name={name}
                placeholder={placeholder}
                rows={rows}
                cols={cols}
                defaultValue={defaultValue}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md shadow-sm focus:ring ${error ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-blue-300"
                    }`}
            ></textarea>
            <div className="text-right text-sm text-gray-500 mt-1">
                {value?.length}/{maxLength}
            </div>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
    );
};
