import React from "react";
import {
  FaLinkedinIn,
  FaTwitter,
  FaFacebookSquare,
  FaTelegram,
  FaEnvelope,
} from "react-icons/fa";

function Opening({ id }: htmlProps) {
  return (
    <section id={id} className="w-screen h-screen pt-24 text-center">
      <div className="max-w-[1280px] h-[90%] mx-auto p-2 flex justify-center items-center">
        <div>
          <div>
            <div className="capitalize pt-10">
              <h1 className="py-4 text-light-1 leading-3">
                Hello, I&apos;m
                <span className="text-gold hover:animate-pulse"> Mehmet</span>
              </h1>
              <h3>front-end web developer</h3>
            </div>
            <div className="m-auto py-4 max-w-2xl">
              <p className="px-4 pt-2">
                Welcome to my corner of the web! As an IT Support Specialist
                based Turkey, I have a passion for web development and design.
                My journey in the tech world has been an exciting mix of
                problem-solving, creativity, and continuous learning. Whether it
                is providing IT support, crafting innovative solutions, or
                designing something visually stunning, I love what I do.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between w-[95%] lg:max-w-[480px] m-auto p-1 lg:px-0 py-6 motion-safe:animate-pulse">
            <a
              href="https://www.linkedin.com/in/yildizmehmet/"
              rel="noopener noreferrer"
              target="_blank"
            >
              <div className="rounded-full shadow-md shadow-gold cursor-pointer p-4 lg:p-5 hover:scale-105 ease-in duration-300">
                <FaLinkedinIn className="text-gold text-xl lg:text-3xl" />
              </div>
            </a>
            <a
              href="https://twitter.com/albursavi"
              rel="noopener noreferrer"
              target="_blank"
            >
              <div className="rounded-full shadow-md shadow-gold cursor-pointer p-4 lg:p-5 hover:scale-105 ease-in duration-300">
                <FaTwitter className="text-gold text-xl lg:text-3xl" />
              </div>
            </a>
            <a
              href="https://www.facebook.com/mehmetydev/"
              rel="noopener noreferrer"
              target="_blank"
            >
              <div className="rounded-full shadow-md shadow-gold cursor-pointer p-4 lg:p-5 hover:scale-105 ease-in duration-300">
                <FaFacebookSquare className="text-gold text-xl lg:text-3xl" />
              </div>
            </a>
            <a
              href="https://t.me/memostar91"
              rel="noopener noreferrer"
              target="_blank"
            >
              <div className="rounded-full shadow-md shadow-gold cursor-pointer p-4 lg:p-5 hover:scale-105 ease-in duration-300">
                <FaTelegram className="text-gold text-xl lg:text-3xl" />
              </div>
            </a>
            <a
              href="mailto:contact@mehmetyildiz.dev"
              rel="noopener noreferrer"
              target="_blank"
            >
              <div className="rounded-full shadow-md shadow-gold cursor-pointer p-4 lg:p-5 hover:scale-105 ease-in duration-300">
                <FaEnvelope className="text-gold text-xl lg:text-3xl" />
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Opening;
