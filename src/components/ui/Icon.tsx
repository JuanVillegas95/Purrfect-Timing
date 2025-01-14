import React from "react";
import { IconType } from "react-icons";

interface IconProps {
    icon: IconType;
    border?: boolean;
    iconSize?: string;
    divWidth?: string;
    divHeight?: string
    onClick?: () => void
    className?: string;
}

export const Icon: React.FC<IconProps> = ({
    icon,
    iconSize = "32px",
    divWidth = "64px",
    divHeight = "64px",
    onClick,
    className = ""
}) => {

    return (
        <div
            className={`flex items-center justify-center hover:cursor-pointer ${className}`}
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
