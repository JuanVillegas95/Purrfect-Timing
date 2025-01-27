import { ButtonProps } from "@utils/interfaces";
import { Button } from "./Button";

interface TextInputProps extends ButtonProps {
    textValue?: string;
    textOnChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    textDisabled?: boolean;
    textPlaceholder?: string;
    textClassNameTextInput?: string;
    textName?: string;
    textError?: string;
}

export const TextInput: React.FC<TextInputProps> = ({
    textValue,
    textOnChange,
    textDisabled = false,
    textPlaceholder = "",
    textClassNameTextInput = "",
    textName = "textInput",
    textError,
    ...buttonProps
}) => {
    return (
        <div className="flex flex-col w-full">
            <div className="flex border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-blue-400 focus-within:border-blue-400 overflow-hidden">
                <input
                    type="text"
                    className={`w-full px-4 py-2 focus:outline-none ${textClassNameTextInput} ${textError ? "border-red-500 focus:ring-red-400" : ""
                        }`}
                    value={textValue}
                    onChange={textOnChange}
                    disabled={textDisabled}
                    placeholder={textPlaceholder}
                    name={textName}
                />
                {buttonProps.isWithTextInput && <Button  {...buttonProps} />}
            </div>
            {textError && <p className="text-red-500 text-sm mt-1">{textError}</p>}
        </div>
    );
};
