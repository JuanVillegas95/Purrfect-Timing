import React from "react";

interface InputProps {
    placeholder?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    inputClassName?: string;
    padding?: string;
    width?: string;
    type?: string;
    min?: number;
    max?: number;
}

const Input: React.FC<InputProps> = ({
    placeholder = "title",
    value,
    onChange,
    inputClassName = "border-b-4",
    padding = "p-2",
    width = "w-full",
    type = "text",
    min = 0,
    max = 23,
}) => {
    return (
        <div className="flex flex-col">
            <input
                min={min}
                max={max}
                id="title"
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className={`${inputClassName} ${padding} ${width}`} // Dynamically add padding and width
            />
        </div>
    );
};

export default Input;
