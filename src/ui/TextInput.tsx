import React from "react";

interface TextInputProps {
    defaultValue?: string;
    disabled?: boolean;
    placeholder?: string;
    className?: string;
    name?: string;
    error?: string;
}

export const TextInput: React.FC<TextInputProps> = ({
    defaultValue,
    disabled = false,
    placeholder = "",
    className = "",
    name = "textInput",
    error,
}) => {
    return (
        <div className="flex flex-col w-full">
            <input
                type="text"
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${error ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-blue-400"
                    } ${className}`}
                defaultValue={defaultValue}
                disabled={disabled}
                placeholder={placeholder}
                name={name}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
    );
};
