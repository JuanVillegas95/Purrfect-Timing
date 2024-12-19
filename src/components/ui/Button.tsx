import React from "react";

type ButtonVariants = "primary" | "secondary" | "danger";

interface ButtonProps {
    label?: string;
    isPending?: boolean;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    formAction?: (formData: FormData) => void;
    className?: string;
    variant?: ButtonVariants;
}

export const Button: React.FC<ButtonProps> = ({
    label = "Button",
    isPending = false,
    onClick,
    formAction,
    className = "",
    variant = "primary",
}) => {
    const variantStyles = {
        primary: "bg-blue-600 hover:bg-blue-700 focus:ring focus:ring-blue-300 text-white",
        secondary: "bg-gray-200 hover:bg-gray-300 focus:ring focus:ring-gray-400 text-black",
        danger: "bg-red-600 hover:bg-red-700 focus:ring focus:ring-red-300 text-white",
    };

    return <button
        onClick={onClick}
        formAction={formAction}
        disabled={isPending}
        className={`w-full px-6 py-2 font-semibold rounded-md shadow-sm focus:outline-none ${isPending ? "bg-gray-400 cursor-not-allowed" : variantStyles[variant]
            } ${className}`}
    >
        {isPending ? "Loading..." : label}
    </button>
};
