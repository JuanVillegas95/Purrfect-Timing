import React from "react";
import { MODALS } from "../../utils/constants";
import { Icon } from "../ui/Icon"
import { FaRegCalendarAlt } from "react-icons/fa";

import { RxAvatar, RxQuestionMarkCircled, RxPlusCircled, RxCalendar } from "react-icons/rx";

interface AsideButtonsProps {
    setActiveModal: (modal: MODALS) => void
    currentMousePosVh: number;
}

export const AsideButtons: React.FC<AsideButtonsProps> = ({ setActiveModal, currentMousePosVh }) => {

    return <div className="flex flex-col items-center justify-between h-full gap-4">
        <div className="flex flex-col ">
            <Icon
                icon={RxPlusCircled}
                divHeight="2.5rem"
                divWidth="2.5rem"
                iconSize="2rem"
                onClick={() => setActiveModal(MODALS.EVENT)}
            />
            <Icon
                icon={RxCalendar}
                divHeight="2.5rem"
                divWidth="2.5rem"
                border={false}
                iconSize="2rem"
                onClick={() => setActiveModal(MODALS.CALENDARS)}

            />
        </div>
        <div className="flex flex-col gap-0">
            <Icon
                icon={RxAvatar}
                divHeight="2.5rem"
                divWidth="2.5rem"
                iconSize="2rem"
                border={false}
                onClick={() => setActiveModal(MODALS.PROFILE)}
            />
            <Icon
                icon={RxQuestionMarkCircled}
                divHeight="2.5rem"
                divWidth="2.5rem"
                iconSize="2rem"
                border={false}

                onClick={() => setActiveModal(MODALS.ABOUT_US)}
            />

        </div>
    </div>
};
