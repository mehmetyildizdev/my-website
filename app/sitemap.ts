import { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/post";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://mehmetyildiz.dev";

  // 1. Static Routes
  const routes = ["", "/blog", "/blog/archive", "/collection", "/privacy"];
  const staticRoutes = routes.map(
    (route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: route === "" ? 1 : route === "/privacy" ? 0.3 : 0.8,
    }),
  );

  // 2. Blog Posts
  let postRoutes: MetadataRoute.Sitemap = [];
  try {
    const posts = await getAllPosts();
    postRoutes = posts
      .filter((post) => post.slug?.current)
      .map((post) => ({
        url: `${baseUrl}/blog/post/${post.slug.current}`,
        lastModified: new Date(post.publishedAt || new Date()),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }));
  } catch (error) {
    console.error("Error fetching posts for sitemap", error);
  }

  // 3. Categories
  const uniqueCategories = new Set<string>();
  try {
    const posts = await getAllPosts();
    posts.forEach((post) => {
      post.categories?.forEach((cat) => {
        if (cat.title) {
          const slug = cat.title.toLowerCase().replace(/\s+/g, "-");
          uniqueCategories.add(slug);
        }
      });
    });
  } catch (error) {
    console.error("Error fetching categories for sitemap", error);
  }

  const categoryRoutes = Array.from(uniqueCategories).map((slug) => ({
    url: `${baseUrl}/blog/category/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  return [...staticRoutes, ...postRoutes, ...categoryRoutes];
}
