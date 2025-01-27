import React from "react";
import Image from "next/image";
import icon from "../../app/icon.png"
interface UnderMaintenanceProps {
  message?: string;
}

export const UnderMaintenance: React.FC<UnderMaintenanceProps> = ({
  message = "We are currently under maintenance. Please check back later!",
}) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center p-6 rounded-lg bg-white shadow-md">

        <div className="flex justify-center m-4">
          <Image src={icon} alt="App Icon" width={100} height={100} />
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4">🚧 Under Maintenance 🚧</h1>
        <p className="text-gray-600 text-lg">{message}</p>
        <p className="text-sm text-gray-500 mt-4">
          Thank you for your patience!
        </p>
      </div>
    </div>
  );
};

