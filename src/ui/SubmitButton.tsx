import React from "react";
import { useFormStatus } from 'react-dom'

interface SubmitButtonProps {
    label?: string;
    onClick?: () => void;
    pending: boolean;
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({
    label = "Submit",
    onClick,
    pending,
}) => {

    return (
        <button
            type="submit"
            onClick={onClick}
            disabled={pending}
            className={`px-6 py-2 font-semibold text-white rounded-md shadow-sm focus:outline-none ${pending
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 focus:ring focus:ring-blue-300"
                }`}
        >
            {label}
        </button>
    );
};

