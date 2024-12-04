import React from "react";
import { MODALS } from "../utils/constants";
import { Button } from "@/client/Button";
import { IoMdAdd } from "react-icons/io";
import { FaRegCalendarAlt } from "react-icons/fa";
import { GoPersonAdd } from "react-icons/go";
import { CgProfile } from "react-icons/cg";

interface AsideButtonsProps {
    setActiveModal: (modal: MODALS) => void
}

const AsideButtons: React.FC<AsideButtonsProps> = ({ setActiveModal }) => {
    return <div className="flex flex-col items-center justify-center gap-4 mt-5">
        <Button
            icon={IoMdAdd}
            divSize="2.5rem"
            iconSize="1.5rem"
            borderType="squared"
            onClick={() => setActiveModal(MODALS.ADD_EVENT)}
        />
        <Button
            icon={FaRegCalendarAlt}
            divSize="2.5rem"
            iconSize="2rem"
            onClick={() => setActiveModal(MODALS.CALENDARS)}
        />
        <Button
            icon={GoPersonAdd}
            divSize="2.5rem"
            iconSize="2rem"
            onClick={() => setActiveModal(MODALS.FRIENDS)}
        />
        <Button
            icon={CgProfile}
            divSize="2.5rem"
            iconSize="2rem"
            onClick={() => setActiveModal(MODALS.PROFILE)}
        />
    </div>

};

export default AsideButtons;
