import React from "react";
import { IconType } from "react-icons";

interface IconProps {
    icon: IconType;
    border?: boolean;
    iconSize?: string;
    divWidth?: string;
    divHeight?: string
    onClick?: () => void
}

export const Icon: React.FC<IconProps> = ({
    icon,
    border,
    iconSize = "32px",
    divWidth = "64px",
    divHeight = "64px",
    onClick
}) => {
    const borderClass = border ? " border-gray-300 border rounded-md " : "";

    return (
        <div
            className={`flex items-center justify-center hover:cursor-pointer ${borderClass}`}
            style={{
                width: divWidth,
                height: divHeight,
            }}
            onClick={onClick}
        >
            {React.createElement(icon, { size: iconSize })}
        </div>
    );


};
