"use client";
import Image from "next/image";
import React, { useState } from "react";
import { FaUserTie, FaStar, FaSketch, FaUserFriends } from "react-icons/fa";
import AboutMe from "./AboutMe";
import WhatIDo from "./WhatIDo";
import MyWebsite from "./MyWebsite";
import ContactMe from "./ContactMe";

function Summary({ id }: htmlProps) {
  const [activeContent, setActiveContent] = useState(2);

  const renderContent = () => {
    switch (activeContent) {
      case 0:
        return <AboutMe />;
      case 1:
        return <WhatIDo />;
      case 2:
        return <MyWebsite />;
      case 3:
        return <ContactMe />;
      default:
        return <MyWebsite />;
    }
  };

  return (
    <section
      id={id}
      className="3xl:w-[80%] 4xl:w-[66%] px-4 pt-12 xl:mt-0 xl:px-16 h-screen mx-auto xl:flex justify-center items-center"
    >
      <div className="h-64 xl:w-2/5 xl:h-108 relative flex items-end xl:items-center">
        <div id="photo" className="z-30 flex justify-end">
          <div className="w-52 h-52 md:w-128 xl:w-96 xl:h-96 2xl:w-108 bg-[conic-gradient(from_var(--angle),var(--color-ruby),var(--color-sapphire),var(--color-emerald),var(--color-amethyst),var(--color-ruby))] after:opacity-25 flex justify-center items-center animate-bgAnimate rounded-tl-xl xl:rounded-3xl shadow-xl drop-shadow-2xl">
            <div className="bg-pearl w-48 h-48 xl:w-84 xl:h-84 rounded-full">
              <Image
                src="/images/my-pp-t.png"
                className="rounded-full"
                alt="me"
                width={480}
                height={480}
              />
            </div>
          </div>
        </div>
        <div
          id="buttons"
          className="z-60 h-52 w-full xl:h-128 xl:w-2/5 xl:ml-[60%] pr-2 xl:pl-1 py-1 xl:absolute flex justify-end items-center drop-shadow-2xl bg-[conic-gradient(from_var(--angle),var(--color-ruby),var(--color-sapphire),var(--color-emerald),var(--color-amethyst),var(--color-ruby))] rounded-tr-xl xl:rounded-none xl:rounded-s-2xl animate-bgAnimate-m"
        >
          <div className="flex flex-col w-[96%] h-[98%] rounded-s-2xl">
            {[0, 1, 2, 3].map((index) => (
              <button
                key={index}
                onClick={() => setActiveContent(index)}
                style={
                  {
                    "--color-changing": `var(--color-${["sapphire", "emerald", "amethyst", "ruby"][index]})`,
                  } as React.CSSProperties
                }
                className="group flex-1 relative flex justify-center items-center cursor-pointer bg-[conic-gradient(from_var(--angle),var(--color-pearl),var(--color-pearl),var(--color-pearl),var(--color-changing),var(--color-pearl),var(--color-pearl),var(--color-pearl))] animate-bgAnimate-rev rounded-l-2xl"
              >
                <div
                  style={{
                    backgroundImage: "url(/images/dots-piston.svg)",
                    backgroundColor: `var(--color-${["sapphire", "emerald", "amethyst", "ruby"][index]})`,
                    animationDelay: `${index * 1}s`,
                  }}
                  className="w-[95%] h-[85%] xl:ml-2 absolute flex justify-center items-center bg-no-repeat bg-cover rounded-l-2xl bg-blend-darken drop-shadow-lg wobble-animation"
                >
                  <p className="text-platinum light:text-pearl text-md xl:text-xl flex justify-center items-center drop-shadow-text">
                    {
                      [
                        <FaUserTie
                          key="user-tie"
                          className="text-lg xl:text-4xl"
                        />,
                        <FaStar key="star" className="text-lg xl:text-4xl" />,
                        <FaSketch
                          key="sketch"
                          className="text-lg xl:text-4xl"
                        />,
                        <FaUserFriends
                          key="user-friends"
                          className="text-lg xl:text-4xl"
                        />,
                      ][index]
                    }
                    &nbsp;
                    {
                      ["About Me", "What I Do", "My Website", "Contact Me"][
                        index
                      ]
                    }
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div
        id="content"
        className="z-55 border-t-2 xl:border-l-1 border-gold h-144 md:h-192 xl:h-128 w-full xl:w-3/5 justify-center items-center xl:rounded-e-2xl shadow-md shadow-pearl bg-[conic-gradient(from_var(--angle),var(--color-ruby),var(--color-amethyst),var(--color-emerald),var(--color-sapphire),var(--color-ruby))] animate-bgAnimate-r"
      >
        <div className="w-full h-full flex justify-center items-center drop-shadow-2xl">
          <div className="bg-pearl w-[92%] h-[96%] xl:w-[95%] xl:h-[94%] xl:rounded-2xl overflow-auto">
            {renderContent()}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Summary;

/* 
<div
          id="buttons"
          className="z-50 h-128 w-2/5 ml-[60%] pl-1 py-1 absolute flex justify-end items-center drop-shadow-2xl bg-[conic-gradient(from_var(--angle),var(--color-ruby),var(--color-sapphire),var(--color-emerald),var(--color-amethyst),var(--color-ruby))] rounded-s-2xl animate-bgAnimate-m"
        >
          <div className="flex flex-col w-[96%] h-[98%] rounded-s-2xl">
            <button
              onClick={() => setActiveContent(0)}
              className="flex-1 relative flex justify-center items-center cursor-pointer bg-[conic-gradient(from_var(--angle),var(--color-pearl),var(--color-pearl),var(--color-pearl),var(--color-sapphire),var(--color-pearl),var(--color-pearl),var(--color-pearl))] animate-bgAnimate-p rounded-l-2xl"
            >
              <div
                style={{ backgroundImage: "url(/images/dots-piston.svg)" }}
                className="w-[95%] h-[85%] ml-2 absolute flex justify-center items-center bg-no-repeat bg-cover bg-sapphire bg-blend-multiply rounded-l-2xl drop-shadow-lg wobble-animation wobble-delay-0"
              >
                <p className="text-platinum light:text-pearl text-xl flex justify-center items-center drop-shadow-text">
                  <FaUserTie className="text-4xl" />
                  &nbsp;About Me
                </p>
              </div>
            </button>
            <button
              onClick={() => setActiveContent(1)}
              className="flex-1 relative flex justify-center items-center cursor-pointer bg-[conic-gradient(from_var(--angle),var(--color-pearl),var(--color-pearl),var(--color-pearl),var(--color-emerald),var(--color-pearl),var(--color-pearl),var(--color-pearl))] animate-bgAnimate-p rounded-l-2xl"
            >
              <div
                style={{ backgroundImage: "url(/images/dots-piston.svg)" }}
                className="w-[95%] h-[85%] ml-2 absolute flex justify-center items-center bg-emerald bg-no-repeat bg-cover bg-blend-multiply rounded-l-2xl drop-shadow-lg wobble-animation wobble-delay-1"
              >
                <p className="text-platinum light:text-pearl text-xl flex justify-center items-center drop-shadow-text">
                  <FaStar className="text-4xl" />
                  &nbsp;What I Do
                </p>
              </div>
            </button>
            <button
              onClick={() => setActiveContent(2)}
              className="flex-1 relative flex justify-center items-center cursor-pointer bg-[conic-gradient(from_var(--angle),var(--color-pearl),var(--color-pearl),var(--color-pearl),var(--color-amethyst),var(--color-pearl),var(--color-pearl),var(--color-pearl))] animate-bgAnimate-p rounded-l-2xl"
            >
              <div
                style={{ backgroundImage: "url(/images/dots-piston.svg)" }}
                className="w-[95%] h-[85%] ml-2 absolute flex justify-center items-center bg-no-repeat bg-cover bg-amethyst bg-blend-multiply rounded-l-2xl drop-shadow-lg wobble-animation wobble-delay-2"
              >
                <p className="text-platinum light:text-pearl text-xl flex justify-center items-center drop-shadow-text">
                  <FaSketch className="text-4xl" />
                  &nbsp;My Website
                </p>
              </div>
            </button>
            <button
              onClick={() => setActiveContent(3)}
              className="flex-1 relative flex justify-center items-center cursor-pointer bg-[conic-gradient(from_var(--angle),var(--color-pearl),var(--color-pearl),var(--color-pearl),var(--color-ruby),var(--color-pearl),var(--color-pearl),var(--color-pearl))] animate-bgAnimate-p rounded-l-2xl"
            >
              <div
                style={{ backgroundImage: "url(/images/dots-piston.svg)" }}
                className="w-[95%] h-[85%] ml-2 absolute flex justify-center items-center bg-no-repeat bg-cover bg-ruby bg-blend-multiply rounded-l-2xl drop-shadow-lg wobble-animation wobble-delay-3"
              >
                <p className="text-platinum light:text-pearl text-xl flex justify-center items-center drop-shadow-text">
                  <FaUserFriends className="text-4xl" />
                  &nbsp;Contact Me
                </p>
              </div>
            </button>
          </div>
        </div>
*/
