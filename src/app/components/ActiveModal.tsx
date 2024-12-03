import React from "react";
import { MODALS } from "../utils/constants";
import NewEventtModal from "./NewEventtModal";
interface ActiveModalProps {
    activeModal: MODALS; // Type to determine which component to render
}

const ActiveModal: React.FC<ActiveModalProps> = ({ activeModal = MODALS.FRIENDS }) => {
    const renderContent = () => {
        switch (activeModal) {
            case MODALS.FRIENDS:
                return <NewEventtModal />;
            default:
                return <div>No matching modal found.</div>;
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-5 flex items-center justify-center rounded-lg relative z-60">
                {renderContent()}
            </div>
        </div>
    );


};

export default ActiveModal;
