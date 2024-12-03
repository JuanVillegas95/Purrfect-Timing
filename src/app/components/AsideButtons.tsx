import React from "react";
import { MODALS } from "../utils/constants";

interface AsideButtonsProps {
    setActiveModal: (modal: MODALS) => void
}

const AsideButtons: React.FC<AsideButtonsProps> = ({ setActiveModal }) => {
    return (
        <div className="flex flex-col max-w-full overflow-x-auto">
            <input
                value="Add Event"
                type="button"
                onClick={() => setActiveModal(MODALS.FRIENDS)}
                className="block w-full text-sm
          py-2 px-4
          rounded-full border-0
          font-semibold
          bg-violet-50 text-violet-700
          hover:bg-violet-100
        "
            />
        </div>
    );
};

export default AsideButtons;
