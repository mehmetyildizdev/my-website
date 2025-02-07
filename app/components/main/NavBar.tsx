"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useTheme } from "next-themes";
import {
  FaLinkedinIn,
  FaTwitter,
  FaFacebookSquare,
  FaTelegram,
  FaEnvelope,
  FaWindowClose,
} from "react-icons/fa";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme } = useTheme();
  const onClose = () => setIsOpen(false);

  const [shadow, setShadow] = useState(false);
  useEffect(() => {
    const handleShadow = () => {
      if (window.scrollY >= 90) {
        setShadow(true);
      } else {
        setShadow(false);
      }
    };
    window.addEventListener("scroll", handleShadow);
  });
  const socialLinks = [
    {
      href: "https://www.linkedin.com/in/yildizmehmet/",
      icon: <FaLinkedinIn className="text-gold text-lg" />,
    },
    {
      href: "https://twitter.com/albursavi",
      icon: <FaTwitter className="text-gold text-lg" />,
    },
    {
      href: "https://www.facebook.com/mehmetydev/",
      icon: <FaFacebookSquare className="text-gold text-lg" />,
    },
    {
      href: "https://t.me/memostar91",
      icon: <FaTelegram className="text-gold text-lg" />,
    },
    {
      href: "mailto:contact@mehmetyildiz.dev",
      icon: <FaEnvelope className="text-gold text-lg" />,
    },
  ];

  return (
    <header>
      <h1 className="hidden">
        Welcome to website of Mehmet Yildiz, a front-end web developer.
      </h1>

      <nav
        className={
          shadow
            ? "fixed w-full h-16 z-999 bg-diamond shadow-[0_15px_10px_-15px_rgba(220,177,24,0.7)] transition-shadow duration-500"
            : "fixed w-full h-16 z-999 bg-diamond"
        }
      >
        <div className="lg:px-16 flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/">
              <Image
                className="p-4 lg:p-2"
                src={theme === "dark" ? "/logo_l.svg" : "/logo_d.svg"}
                alt="Logo"
                width={200}
                height={60}
              />
            </Link>
          </div>
          <div>
            <div className="hidden md:flex items-center">
              <Link href="/" className="mr-8">
                Home
              </Link>
              <Link href="#aboutme" className="mr-8">
                About
              </Link>
              <ThemeToggle />
            </div>
            <div className="md:hidden mr-4 flex items-center">
              <ThemeToggle />
              <button onClick={() => setIsOpen(true)} className="p-2">
                <Menu role="button" className="ml-2 h-5 w-5" />
              </button>
            </div>
          </div>
          {isOpen && (
            <div className="fixed inset-0 z-999 flex">
              <div className="bg-pearl px-4 py-2 w-4/5 h-full shadow-lg transform transition-transform duration-1500 ease-in-out translate-x-0">
                <div className="h-14 pb-2 border-gold border-b-2">
                  <Link href="/">
                    <Image
                      className="pr-8"
                      src={theme === "dark" ? "/logo_l.svg" : "/logo_d.svg"}
                      alt="Logo"
                      width={160}
                      height={48}
                    />
                  </Link>
                  <button className="absolute top-4 right-4" onClick={onClose}>
                    <FaWindowClose className="text-3xl text-gold" />
                  </button>
                </div>
                <div className="flex flex-col items-start mt-8">
                  <Link href="/" className="mb-4" onClick={onClose}>
                    Home
                  </Link>
                  <Link href="#aboutme" className="mb-4" onClick={onClose}>
                    About
                  </Link>
                </div>
                <div className="pt-64 text-gold">
                  <p>Let&apos;s Connect!</p>
                </div>
                <div className="flex items-center justify-between py-6">
                  {socialLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.href}
                      rel="noopener noreferrer"
                      target="_blank"
                      title={
                        link.href.replace(/^https?:\/\//, "").split("/")[0]
                      } // Extracts domain name
                    >
                      <div className="rounded-full shadow-lg shadow-gold cursor-pointer p-3">
                        {link.icon}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
              <div className="grow bg-sapphire/90" onClick={onClose} />
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
