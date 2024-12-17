import React from "react";

interface ProfilePictureProps {
    children: React.ReactNode;
}

export const ProfilePicture: React.FC<ProfilePictureProps> = ({ children }) => {
    return <div onClick={undefined}>

        {children}
    </div>
}




