import { Icon } from "@ui/Icon";
import React from "react";


import { RxGithubLogo } from "react-icons/rx";
import { ImMail4 } from "react-icons/im";

interface AboutUsModalProps {

}

export const AboutUsModal: React.FC<AboutUsModalProps> = ({ }) => {
    return <React.Fragment>
        <div className="flex items-center justify-center flex-col" >
            <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-500 font-bold text-xl">Logo</span>
            </div>

            <div className="text-center mt-4">
                <p className="text-gray-600 mt-2 max-w-60 mx-auto break-words">
                    Easily create and organize events
                    with our weekly calendar, adjust timezones seamlessly, and share
                    your calendars to work with others effortlessly.
                </p>
            </div>


            <div className="flex justify-center space-x-4 mt-6">
                <Icon
                    icon={RxGithubLogo}
                    divHeight="2.5rem"
                    divWidth="2.5rem"
                    iconSize="2rem"
                    onClick={() => {
                        window.open('https://github.com/JuanVillegas95/Purrfect-Timing');
                    }}
                />
                <Icon
                    icon={ImMail4}
                    divHeight="2.5rem"
                    divWidth="2.5rem"
                    iconSize="2rem"
                    onClick={() => {
                        window.location.href = "mailto:juanemail2001@gmail.com?subject=Hello&body=I am reaching out to...";
                    }}
                />
            </div>
        </div>
    </React.Fragment>

};

