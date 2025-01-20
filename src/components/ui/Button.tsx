import { ButtonProps } from "@utils/interfaces";
import React from "react";


export const Button: React.FC<ButtonProps> = ({
    label = "Button",
    disbaled = false,
    onClick,
    formAction,
    className = "",
    variant = "primary",
    isWithTextInput = false,
}) => {
    const variantStyles = {
        primary: "bg-blue-600 hover:bg-blue-700 focus:ring focus:ring-blue-300 text-white  disabled:bg-blue-300",
        secondary: "bg-gray-200 hover:bg-gray-300 focus:ring focus:ring-gray-400 text-black disabled:bg-gray-300",
        danger: "bg-red-600 hover:bg-red-700 focus:ring focus:ring-red-300 text-white disabled:bg-red-300",
    };

    // className="bg-blue-500 text-white px-4 py-2 flex-shrink-0 hover:bg-blue-600"
    return <button
        onClick={onClick}
        formAction={formAction}
        disabled={disbaled}
        className={`${isWithTextInput ? "flex-shrink" : "w-full rounded-md"}  px-6 py-2 font-semibold shadow-sm focus:outline-none ${disbaled ? "bg-gray-400 cursor-not-allowed" : variantStyles[variant]
            } ${className}`}
    >
        {disbaled ? "Loading..." : label}
    </button>
};
