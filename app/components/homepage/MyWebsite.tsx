"use client";
import React, { useState } from "react";
import {
  SiVercel,
  SiShadcnui,
  SiTailwindcss,
  SiSanity,
  SiTrakt,
} from "react-icons/si";
import { TbBrandNextjs } from "react-icons/tb";

const colors = [
  { name: "platinum", className: "bg-platinum" },
  { name: "titanium", className: "bg-titanium" },
  { name: "ruby", className: "bg-ruby" },
  { name: "emerald", className: "bg-emerald" },
  { name: "sapphire", className: "bg-sapphire" },
  { name: "amethyst", className: "bg-amethyst" },
  { name: "diamond", className: "bg-diamond" },
  { name: "pearl", className: "bg-pearl" },
  { name: "gold", className: "bg-gold" },
  { name: "silver", className: "bg-silver" },
];

function MyWebsite() {
  const [tooltip, setTooltip] = useState({
    visible: false,
    text: "",
  });

  const handleMouseEnter = (text: string) => {
    setTooltip({ visible: true, text });
  };

  const handleMouseLeave = () => {
    setTooltip({ visible: false, text: "" });
  };

  return (
    <section className="xl:h-full flex flex-col xl:flex-row justify-center relative">
      <div className="xl:w-5/8 3xl:w-3/4 flex flex-col justify-center p-4 xl:px-6 pt-4 text-md sm:text-xl xl:text-sm 2xl:text-base">
        <h4 className="hidden pb-2">About mehmetyildiz.dev</h4>
        <span className="flex justify-left items-center pb-2">
          <SiVercel className="text-4xl text-black hover:scale-105" />
          <TbBrandNextjs className="text-4xl text-black hover:scale-105" />
          <SiTailwindcss className="text-4xl text-teal-600 hover:scale-105" />
          <SiShadcnui className="text-4xl text-black hover:scale-105" />
          <SiSanity className="text-4xl text-ruby hover:scale-105" />
          <SiTrakt className="text-4xl text-ruby hover:scale-105" />
        </span>
        <p className="pb-2">
          I&apos;ve always liked the uses of dazzling gemstones and precious
          metals in my favorite video games. This interest sparked the idea to
          design my website capturing their elegance. Shades of platinum,
          titanium, gold, silver, emerald, sapphire, ruby, diamond, amethyst,
          and pearl...
        </p>
        <p className="pb-2">
          With the touch of Next.js, Tailwind CSS, and shadcn/ui magic, this
          site doesn&apos;t just look good; it&apos;s also offering a space as
          vibrant and dynamic as the materials that inspired it.
        </p>
        <p className="pb-2">
          Powered by Sanity.io, my blog is a playground for both brainiacs and
          thrill-seekers. It&apos;s a colorful mix, like a gemstone collection
          of knowledge and fun.
        </p>
        <p className="pb-2">
          Here, you&apos;ll find my project showcase, fun interactive samples,
          and soon a dedicated movies & TV section. Thanks to Trakt.tv
          integration, I&apos;ll be sharing my top-notch recommendations and
          ratings.
        </p>
      </div>
      <div className="xl:w-3/8 3xl:w-1/4 flex flex-col justify-center p-4 xl:pr-6 pt-4 xl:text-sm 2xl:text-base">
        <h5 className="pb-2 text-center">Theme Palette</h5>
        <div className="flex flex-wrap justify-center bg-diamond p-2 rounded-2xl">
          {colors.map((color, index) => (
            <div
              key={index}
              className={`w-2/5 h-16 ${color.className} rounded-2xl m-1 relative group hover:cursor-help hover:animate-pulse`}
              onMouseEnter={() => handleMouseEnter(color.name)}
              onMouseLeave={handleMouseLeave}
            >
              {tooltip.visible && tooltip.text === color.name && (
                <div className="absolute w-full top-0 left-1/2 transform -translate-y-0 -translate-x-1/2 py-1 text-center text-xs bg-pearl rounded-t-2xl transition-opacity duration-300">
                  {tooltip.text}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default MyWebsite;
