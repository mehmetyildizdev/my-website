import React from "react";
import {
  FaLinkedinIn,
  FaTwitter,
  FaFacebookSquare,
  FaTelegram,
  FaEnvelope,
} from "react-icons/fa";

function Opening() {
  return (
    <div id="hero" className="w-full h-[90vh] pt-24 text-center">
      <div className="max-w-[1280px] w-full h-[105%] mx-auto p-2 flex justify-center items-center font-[family-name:var(--font-rubik)]">
        <div>
          <div>
            <div className="capitalize pt-10">
              <h1 className="py-4 text-light-1 text-4xl leading-3">
                Hello, I&apos;m
                <span className="text-gold hover:animate-pulse"> Mehmet</span>
              </h1>
              <h2 className=" text-2xl">A front-end web developer</h2>
            </div>
            <div className="m-auto py-4 max-w-2xl">
              <p className="px-4 pt-2">
                I am a developer with diploma in Web Design and Coding. I am
                constantly learning in order to improve and increase my skills
                in front-end technologies, as well as how things happen on the
                back side of the picture.
              </p>
              <p className="pt-2">
                I am here to provide you all the necessary tools for enhancing
                your web identity. Whether you have a technical background or
                not we will find the best solution for your needs.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between max-w-[480px] m-auto px-6 lg:px-0 py-6 motion-safe:animate-pulse">
            <a
              href="https://www.linkedin.com/in/yildizmehmet/"
              rel="noopener noreferrer"
              target="_blank"
            >
              <div className="rounded-full shadow-md shadow-gold cursor-pointer p-5 hover:scale-105 ease-in duration-300">
                <FaLinkedinIn className="text-gold text-3xl" />
              </div>
            </a>
            <a
              href="https://twitter.com/albursavi"
              rel="noopener noreferrer"
              target="_blank"
            >
              <div className="rounded-full shadow-md shadow-gold cursor-pointer p-5 hover:scale-105 ease-in duration-300">
                <FaTwitter className="text-gold text-3xl" />
              </div>
            </a>
            <a
              href="https://www.facebook.com/mehmetydev/"
              rel="noopener noreferrer"
              target="_blank"
            >
              <div className="rounded-full shadow-md shadow-gold cursor-pointer p-5 hover:scale-105 ease-in duration-300">
                <FaFacebookSquare className="text-gold text-3xl" />
              </div>
            </a>
            <a
              href="https://t.me/memostar91"
              rel="noopener noreferrer"
              target="_blank"
            >
              <div className="rounded-full shadow-md shadow-gold cursor-pointer p-5 hover:scale-105 ease-in duration-300">
                <FaTelegram className="text-gold text-3xl" />
              </div>
            </a>
            <a
              href="mailto:contact@mehmetyildiz.dev"
              rel="noopener noreferrer"
              target="_blank"
            >
              <div className="rounded-full shadow-md shadow-gold cursor-pointer p-5 hover:scale-105 ease-in duration-300">
                <FaEnvelope className="text-gold text-3xl" />
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Opening;
