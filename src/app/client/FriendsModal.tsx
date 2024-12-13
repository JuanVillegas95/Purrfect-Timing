import React from "react";

interface FriendsModalProp {
    FriendCards: React.ReactNode;
}

export const FriendsModal: React.FC<FriendsModalProp> = ({ FriendCards }) => {
    return (
        <div className="flex flex-col">
            {FriendCards}
        </div>
    );
};

