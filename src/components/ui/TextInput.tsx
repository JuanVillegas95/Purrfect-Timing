interface TextInputProps {
    value?: string; // Add this for controlled input
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; // Add this for event handling
    defaultValue?: string;
    disabled?: boolean;
    placeholder?: string;
    classNameTextInput?: string;
    name?: string;
    error?: string;
    buttonText?: string;
    onButtonClick?: () => void;
}

export const TextInput: React.FC<TextInputProps> = ({
    value,
    onChange,
    defaultValue,
    disabled = false,
    placeholder = "",
    classNameTextInput = "",
    name = "textInput",
    error,
    buttonText,
    onButtonClick,
}) => {
    return (
        <div className="flex flex-col w-full">
            <div className="flex border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-blue-400 focus-within:border-blue-400 overflow-hidden">
                <input
                    type="text"
                    className={`w-full px-4 py-2 focus:outline-none ${classNameTextInput} ${error ? "border-red-500 focus:ring-red-400" : ""
                        }`}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    placeholder={placeholder}
                    name={name}
                />
                {buttonText && onButtonClick && (
                    <button
                        onClick={onButtonClick}
                        className="bg-blue-500 text-white px-4 py-2 flex-shrink-0 hover:bg-blue-600 disabled:bg-blue-300"
                        disabled={disabled}
                    >
                        {buttonText}
                    </button>
                )}
            </div>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
    );
};
