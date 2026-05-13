export interface CategoryTheme {
  from: string;
  to: string;
  via: string;
  border: string;
  text: string;
  bg: string;
  hoverBg: string;
  backgroundImage: string;
  groupHoverText: string;
}

export function getCategoryTheme(category?: string | null): CategoryTheme {
  const c = category ? category.toLowerCase() : "";

  switch (c) {
    case "insight":
      return {
        from: "from-amethyst",
        to: "to-amethyst",
        via: "via-amethyst",
        border: "border-amethyst",
        text: "text-amethyst",
        bg: "bg-amethyst",
        hoverBg: "hover:bg-amethyst",
        backgroundImage: "bg-[url(/blog/circuit_earth.svg)]",
        groupHoverText: "group-hover:text-amethyst",
      };
    case "entertainment":
      return {
        from: "from-ruby",
        to: "to-ruby",
        via: "via-ruby",
        border: "border-ruby",
        text: "text-ruby",
        bg: "bg-ruby",
        hoverBg: "hover:bg-ruby",
        backgroundImage: "bg-[url(/blog/entertainment_room.svg)]",
        groupHoverText: "group-hover:text-ruby",
      };
    case "technology":
      return {
        from: "from-sapphire",
        to: "to-sapphire",
        via: "via-sapphire",
        border: "border-sapphire",
        text: "text-sapphire",
        bg: "bg-sapphire",
        hoverBg: "hover:bg-sapphire",
        backgroundImage: "bg-[url(/blog/tech_circuit.svg)]",
        groupHoverText: "group-hover:text-sapphire",
      };
    case "science":
      return {
        from: "from-emerald",
        to: "to-emerald",
        via: "via-emerald",
        border: "border-emerald",
        text: "text-emerald",
        bg: "bg-emerald",
        hoverBg: "hover:bg-emerald",
        backgroundImage: "bg-[url(/blog/science_trace.svg)]",
        groupHoverText: "group-hover:text-emerald",
      };
    case "development":
      return {
        from: "from-topaz",
        to: "to-topaz",
        via: "via-topaz",
        border: "border-topaz",
        text: "text-topaz",
        bg: "bg-topaz",
        hoverBg: "hover:bg-topaz",
        backgroundImage: "bg-[url(/blog/pattern_dev.svg)]",
        groupHoverText: "group-hover:text-topaz",
      };
    default:
      return {
        from: "from-muted",
        to: "to-muted",
        via: "via-muted",
        border: "border-white",
        text: "text-muted-foreground",
        bg: "bg-muted",
        hoverBg: "hover:bg-muted",
        backgroundImage: "bg-black",
        groupHoverText: "group-hover:text-muted-foreground",
      };
  }
}
