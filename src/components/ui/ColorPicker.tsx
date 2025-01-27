// Simple color picker
import React, { useState } from "react";
import { COLORS } from "@utils/constants";

interface ColorPickerProps {
    isActive: boolean;
    open: () => void;
    close: () => void;
    value?: string
    name?: string;

}

export const ColorPicker: React.FC<ColorPickerProps> = ({ isActive, open, close, value = COLORS[0], name }) => {
    const [selectedColor, setSelectedColor] = useState<string>(value);

    return <div
        className="py-2 px-2 relative hover:cursor-pointer flex justify-center items-center"
        onClick={() => isActive ? close() : open()}
    >
        <input
            type="text"
            name={name}
            value={selectedColor}
            readOnly
            className="w-6 h-6 rounded-full border cursor-pointer border-black text-transparent focus:invisible"
            style={{
                backgroundColor: selectedColor,
            }}
        />
        {isActive && <div className="grid grid-cols-3 gap-2 absolute z-20 top-12 w-32 p-4 bg-white border rounded-lg shadow-lg">
            {COLORS.map((color: string, index: number) =>
                <div
                    key={`${index}+${color}`}
                    className="w-6 h-6 rounded-full border-2 hover:cursor-pointer"
                    style={{ backgroundColor: color, }}
                    onClick={() => {
                        setSelectedColor(color);
                        close();
                    }}
                ></div>
            )}
        </div>
        }



    </div>

};


