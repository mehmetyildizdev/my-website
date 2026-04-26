import React from "react";
import {
  FaXTwitter,
  FaLinkedinIn,
  FaFacebookF,
  FaReddit,
} from "react-icons/fa6";

interface Props {
  shareLinks: ShareLink[];
  categoryTextColor: string;
}

export const ShareBar: React.FC<Props> = ({ shareLinks, categoryTextColor }) => {
  const getIcon = (label: string) => {
    switch (label.toLowerCase()) {
      case "x":
        return <FaXTwitter />;
      case "linkedin":
        return <FaLinkedinIn />;
      case "facebook":
        return <FaFacebookF />;
      case "reddit":
        return <FaReddit />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <span className="text-xs font-bold uppercase tracking-[0.3em] text-metadata/75 [writing-mode:vertical-lr] rotate-360">
        Share
      </span>
      <div className="flex flex-col gap-4">
        {shareLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-xl transition-all ${categoryTextColor} text-shadow-lg text-shadow-foreground duration-300 hover:scale-125 hover:grayscale-0 opacity-50 hover:opacity-100`}
            title={`Share on ${link.label}`}
          >
            {getIcon(link.label)}
          </a>
        ))}
      </div>
    </div>
  );
};
