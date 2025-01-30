import { Icon } from "@ui/Icon";
import React from "react";
import Image from "next/image";
import icon from "../../app/icon.png"
import { RxGithubLogo } from "react-icons/rx";
import { ImMail4 } from "react-icons/im";


export const AboutUsModal: React.FC = () => {
    return <React.Fragment>
        <div className="flex items-center justify-center flex-col" >
            <div className="flex justify-center items-center flex-col">
                <h1 className="text-2xl xl:text-3xl font-extrabold mb-4">Purrfect Timing</h1>
                <Image src={icon} alt="App Icon" width={100} height={100} />
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

