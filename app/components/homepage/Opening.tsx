import React from "react";
import {
  FaLinkedinIn,
  FaTwitter,
  FaFacebookSquare,
  FaTelegram,
  FaEnvelope,
} from "react-icons/fa";

function Opening({ id }: htmlProps) {
  const socialLinks = [
    { href: "https://www.linkedin.com/in/yildizmehmet/", icon: FaLinkedinIn },
    { href: "https://twitter.com/albursavi", icon: FaTwitter },
    { href: "https://www.facebook.com/mehmetydev/", icon: FaFacebookSquare },
    { href: "https://t.me/memostar91", icon: FaTelegram },
    { href: "mailto:contact@mehmetyildiz.dev", icon: FaEnvelope },
  ];
  return (
    <section id={id} className="h-screen text-center">
      <div className="max-w-2xl xl:max-w-[1280px] h-[90%] mx-auto p-2 flex justify-center items-center">
        <div>
          <header className="capitalize">
            <h1 className="py-4 text-4xl xl:text-6xl leading-4 xl:leading-12 drop-shadow-text-theme-lg">
              Hello, I&apos;m
              <span className="text-gold drop-shadow-text-theme-lg-accent hover:animate-pulse">
                {" "}
                Mehmet
              </span>
            </h1>
            <h2 className="text-2xl xl:text-4xl drop-shadow-text-theme-lg">
              front-end web developer
            </h2>
          </header>
          <div className="m-auto py-4 max-w-3xl text-lg">
            <p className="px-4 pt-2">
              Welcome to my corner of the web! I am an IT Support Specialist
              based in Turkey, I have a passion for web development and design.
              My journey in the tech world has been an exciting mix of
              problem-solving, creativity, and continuous learning. Whether it
              is providing IT support, crafting innovative solutions, or
              designing something visually stunning, I love what I do.
            </p>
          </div>

          <div className="flex items-center justify-between w-[95%] lg:max-w-[480px] m-auto p-1 lg:px-0 py-6 motion-safe:animate-pulse">
            {socialLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                rel="noopener noreferrer"
                target="_blank"
                title={link.href.replace(/^https?:\/\//, "").split("/")[0]}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="rounded-full shadow-md shadow-gold cursor-pointer p-4 lg:p-5 hover:scale-105 ease-in duration-300">
                  {React.createElement(link.icon, {
                    className:
                      "text-gold text-xl lg:text-3xl drop-shadow-text-theme-lg",
                  })}
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Opening;
