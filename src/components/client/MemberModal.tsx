import { Icon } from "@ui/Icon";
import { CalendarServer } from "@utils/interfaces";
import React from "react";
import { RxCrossCircled } from "react-icons/rx";

interface MemberModalProp {
    focusedCalendar: CalendarServer
}

export const MemberModal: React.FC<MemberModalProp> = ({ focusedCalendar }) => {
    return <>
        {focusedCalendar.members.length > 0 ? (
            focusedCalendar.members.map((member: string, index: number) => (
                <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 p-5 rounded-md shadow-sm mb-3"
                >
                    <div className="flex items-center gap-4 pr-4">
                        <div>
                            <p className="text-gray-800 font-medium">{member}</p>
                        </div>
                    </div>

                    {/* Accept/Deny Buttons */}
                    <div className="flex gap-2">
                        <Icon icon={RxCrossCircled}
                            divHeight="2.5rem"
                            divWidth="2.5rem"
                            iconSize="2rem"
                            className="text-red-500 hover:text-red-400"

                        />
                    </div>
                </div>
            ))
        ) : (
            <p className="text-sm text-gray-500 text-center">This calendar has no memebers</p>
        )}
    </>
};

