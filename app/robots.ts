import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/studio/", // Standard practice for Sanity studio or admin areas
    },
    sitemap: "https://mehmetyildiz.dev/sitemap.xml",
  };
}
