"use client";

import React from "react";

interface ModalProps {
    children: React.ReactNode;
    closeActiveModal: () => void;
}

const Modal: React.FC<ModalProps> = ({ children, closeActiveModal }) => <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-8 flex items-center justify-center rounded-lg relative shadow-md max-h-[50vh] max-w-[50vw] overflow-auto">
        <button
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            onClick={closeActiveModal}
        >
            ✖
        </button>
        {children}
    </div>
</div>

export default Modal;
