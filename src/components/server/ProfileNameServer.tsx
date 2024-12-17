import React from "react";
import { Avatar } from "@ui/Avatar";
import imgae from "@public/beautiful-latin-woman-avatar-character-icon-free-vector.jpg"

export const ProfileNameServer = async () => {
    // Here the await
    return <Avatar
        src={imgae.src}
        alt="Picture of the author"
        width={60}
        height={60}
        showPlus
    />
}
