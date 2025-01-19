"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu } from "lucide-react";
import { ModeToggle } from "@/components/theme-toggle";
import { useTheme } from "next-themes";

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

  return (
    <div
      className={
        shadow
          ? "fixed w-full h-16 shadow-[0_15px_10px_-15px_rgba(255,255,255,0.3)] z-100 bg-diamond"
          : "fixed w-full h-16 z-100"
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
            <Link href="/about" className="mr-8">
              About
            </Link>
            <ModeToggle />
          </div>
          <div className="flex items-center">
            <button onClick={() => setIsOpen(true)} className="md:hidden p-2">
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div className="bg-white dark:bg-gray-800 p-4 w-64 h-full shadow-lg transform transition-transform duration-300 ease-in-out translate-x-0">
              <button className="absolute top-4 right-4" onClick={onClose}>
                Close
              </button>
              <div className="flex flex-col items-start mt-8">
                <Link href="/" className="mb-4" onClick={onClose}>
                  Home
                </Link>
                <Link href="/about" className="mb-4" onClick={onClose}>
                  About
                </Link>
              </div>
            </div>
            <div className="grow bg-black bg-opacity-50" onClick={onClose} />
          </div>
        )}
      </div>
    </div>
  );
}
