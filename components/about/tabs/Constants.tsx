import AboutMe from "./AboutMe";
import MyPhilosophy from "./MyPhilosophy";
import WhatIDo from "./WhatIDo";
import MyWebsite from "./MyWebsite";
import ContactMe from "./ContactMe";
import { FaUserTie, FaStar, FaSketch, FaUserFriends, FaLightbulb } from "react-icons/fa";

export const TABS: SummaryTab[] = [
  { name: "About Me", color: "amethyst", icon: FaUserTie, Component: AboutMe },
  { name: "My Philosophy", color: "sapphire", icon: FaLightbulb, Component: MyPhilosophy },
  { name: "What I Do", color: "emerald", icon: FaStar, Component: WhatIDo },
  { name: "My Website", color: "topaz", icon: FaSketch, Component: MyWebsite },
  { name: "Contact Me", color: "ruby", icon: FaUserFriends, Component: ContactMe, noScroll: true },
];
