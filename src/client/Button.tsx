import React from "react";
import { IconType } from "react-icons";

interface ButtonProp {
    icon: IconType;
    borderType?: "rounded" | "squared";
    iconSize?: string;
    divSize?: string;
    onClick?: () => void
}

export const Button: React.FC<ButtonProp> = ({
    icon,
    borderType,
    iconSize = "32px",
    divSize = "64px",
    onClick
}) => {
    const borderClass =
        borderType === "rounded"
            ? "rounded-full border-2 border-black"
            : borderType === "squared"
                ? "rounded-md border-2 border-black"
                : "";

    return (
        <div
            className={`flex items-center justify-center ${borderClass} hover:cursor-pointer`}
            style={{
                width: divSize,
                height: divSize,
            }}
            onClick={onClick}
        >
            {React.createElement(icon, { size: iconSize })}
        </div>
    );
};
