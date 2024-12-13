import Image from "next/image";
import React from "react";

interface AvatarProps {
    src: string;
    alt: string;
    width: number;
    height: number;
    showPlus?: boolean;
}


export const Avatar: React.FC<AvatarProps> = ({ src, alt, width, height, showPlus = false }) => <div className="relative inline-block">
    <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="rounded-md"
    />
    {showPlus && (
        <div className="absolute bottom-0 right-0 bg-blue-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-sm">
            +
        </div>
    )}
</div>

