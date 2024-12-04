import React from "react";
import { createNewEvent } from "@/server/newEventModal";
import Input from "./Input";

interface FriendsModalProp {
    Friends: React.ReactNode;
}

export const FriendsModal: React.FC<FriendsModalProp> = ({ Friends }) => {
    return (
        <div className="flex flex-col">
            {Friends}
        </div>
    );
};

