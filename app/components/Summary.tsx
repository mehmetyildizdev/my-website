import Image from "next/image";
import React from "react";
import { FaUserTie, FaStar, FaSketch, FaUserFriends } from "react-icons/fa";

/*
[border-image:conic-gradient(from_0deg,var(--color-ruby),var(--color-sapphire),var(--color-emerald),var(--color-amethyst),var(--color-ruby))_1]
*/
function Summary({ id }: htmlProps) {
  return (
    <section
      id={id}
      className="hidden xl:w-full 3xl:w-[80%] 4xl:w-[66%] px-16 h-screen mx-auto xl:flex justify-center items-center"
    >
      <div id="photo" className="w-2/5 h-108 relative flex items-center">
        <div className="z-49 w-full flex">
          <div className="w-96 h-96 2xl:w-108 bg-[conic-gradient(from_var(--angle),var(--color-ruby),var(--color-sapphire),var(--color-emerald),var(--color-amethyst),var(--color-ruby))] after:opacity-25 flex justify-center items-center animate-bgAnimate rounded-3xl shadow-xl drop-shadow-2xl">
            <div className="bg-pearl w-84 h-84 rounded-full">
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
          className="z-50 h-128 w-2/5 ml-[60%] pl-1 py-1 absolute flex justify-end items-center drop-shadow-2xl bg-[conic-gradient(from_var(--angle),var(--color-ruby),var(--color-sapphire),var(--color-emerald),var(--color-amethyst),var(--color-ruby))] rounded-s-2xl animate-bgAnimate-m"
        >
          <div className="flex flex-col w-[96%] h-[98%] rounded-s-2xl">
            <button className="flex-1 relative flex justify-center items-center cursor-pointer bg-[conic-gradient(from_var(--angle),var(--color-pearl),var(--color-pearl),var(--color-pearl),var(--color-sapphire),var(--color-pearl),var(--color-pearl),var(--color-pearl))] animate-bgAnimate-p rounded-l-2xl">
              <div
                style={{ backgroundImage: "url(/images/dots-piston.svg)" }}
                className="w-[95%] h-[85%] ml-2 absolute flex justify-center items-center bg-no-repeat bg-cover bg-sapphire bg-blend-multiply rounded-l-2xl drop-shadow-lg"
              >
                <p className="text-platinum light:text-pearl text-xl flex justify-center items-center drop-shadow-text">
                  <FaUserTie className="text-4xl" />
                  &nbsp;About Me
                </p>
              </div>
            </button>
            <button className="flex-1 relative flex justify-center items-center cursor-pointer bg-[conic-gradient(from_var(--angle),var(--color-pearl),var(--color-pearl),var(--color-pearl),var(--color-emerald),var(--color-pearl),var(--color-pearl),var(--color-pearl))] animate-bgAnimate-p rounded-l-2xl">
              <div
                style={{ backgroundImage: "url(/images/dots-piston.svg)" }}
                className="w-[95%] h-[85%] ml-2 absolute flex justify-center items-center bg-emerald bg-no-repeat bg-cover bg-blend-multiply rounded-l-2xl drop-shadow-lg"
              >
                <p className="text-platinum light:text-pearl text-xl flex justify-center items-center drop-shadow-text">
                  <FaStar className="text-4xl" />
                  &nbsp;What I Do
                </p>
              </div>
            </button>
            <button className="flex-1 relative flex justify-center items-center cursor-pointer bg-[conic-gradient(from_var(--angle),var(--color-pearl),var(--color-pearl),var(--color-pearl),var(--color-amethyst),var(--color-pearl),var(--color-pearl),var(--color-pearl))] animate-bgAnimate-p rounded-l-2xl">
              <div
                style={{ backgroundImage: "url(/images/dots-piston.svg)" }}
                className="w-[95%] h-[85%] ml-2 absolute flex justify-center items-center bg-no-repeat bg-cover bg-amethyst bg-blend-multiply rounded-l-2xl drop-shadow-lg"
              >
                <p className="text-platinum light:text-pearl text-xl flex justify-center items-center drop-shadow-text">
                  <FaSketch className="text-4xl" />
                  &nbsp;My Website
                </p>
              </div>
            </button>
            <button className="flex-1 relative flex justify-center items-center cursor-pointer bg-[conic-gradient(from_var(--angle),var(--color-pearl),var(--color-pearl),var(--color-pearl),var(--color-ruby),var(--color-pearl),var(--color-pearl),var(--color-pearl))] animate-bgAnimate-p rounded-l-2xl">
              <div
                style={{ backgroundImage: "url(/images/dots-piston.svg)" }}
                className="w-[95%] h-[85%] ml-2 absolute flex justify-center items-center bg-no-repeat bg-cover bg-ruby bg-blend-multiply rounded-l-2xl drop-shadow-lg"
              >
                <p className="text-platinum light:text-pearl text-xl flex justify-center items-center drop-shadow-text">
                  <FaUserFriends className="text-4xl" />
                  &nbsp;Contact Me
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div
        id="content"
        className="border-l-2 border-gold h-128 w-3/5 flex justify-center items-center rounded-e-2xl shadow-md shadow-pearl bg-[conic-gradient(from_var(--angle),var(--color-ruby),var(--color-amethyst),var(--color-emerald),var(--color-sapphire),var(--color-ruby))] animate-bgAnimate-r"
      >
        <div className="w-full h-full flex justify-center items-center drop-shadow-2xl">
          <div className="bg-pearl w-[95%] h-[95%] rounded-2xl p-4 inset-shadow-golden">
            Lorem ipsum odor amet, consectetuer adipiscing elit. Consequat lacus
            tincidunt orci ultricies nullam fringilla! Nisi suspendisse tempor
            consequat libero habitant lacinia sapien. Diam facilisi dis ligula
            bibendum eget viverra platea. Nisl aptent purus auctor cras metus
            neque dignissim. Sapien maximus viverra eros penatibus suspendisse?
            Hendrerit taciti maecenas augue etiam, id mattis dictum. Tincidunt
            pretium penatibus inceptos sit risus condimentum. Iaculis tortor
            dictumst suscipit dapibus egestas placerat vel tellus. Augue
            fringilla mattis mauris diam sodales accumsan urna. Ipsum massa arcu
            at viverra posuere porttitor congue sed. Ex penatibus auctor
            scelerisque ex neque dictumst praesent hac. Habitant lacus fringilla
            id orci tempor libero erat hendrerit hac. Iaculis nam nam sed tempor
            elementum augue. Ullamcorper tincidunt sapien nulla lacinia sociosqu
            at tortor egestas. Porttitor fermentum volutpat cras nunc suscipit
            laoreet semper. Nullam cras cubilia aenean magna torquent efficitur
            ante. Congue augue velit nam ad diam. Aenean lacus faucibus
            imperdiet lacus iaculis ultrices nostra sed duis. Egestas vehicula
            pulvinar nisi nunc elementum eget. Maximus habitant metus
            suspendisse ac tristique vehicula fusce suscipit. Etiam aptent purus
            nostra mattis luctus fames. Viverra sodales facilisis; pretium
            aenean taciti semper. Id nulla netus mus fames dolor luctus ornare
            primis integer.
          </div>
        </div>
      </div>
    </section>
  );
}

export default Summary;
