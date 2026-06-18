import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Mehmet Yildiz | Digital Product Architect",
  description:
    "Learn more about Mehmet Yildiz, a Full-Stack Software Engineer and Digital Product Architect based in Turkey. Explore my journey, technical skills, and how I bridge robust IT systems with modern application development to create performant digital solutions.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About Mehmet Yildiz | Digital Product Architect",
    description: "Learn more about Mehmet Yildiz, a Full-Stack Software Engineer and Digital Product Architect based in Turkey. Explore my journey and technical skills.",
    url: "https://mehmetyildiz.dev/about",
    siteName: "Mehmet Yildiz",
    locale: "en_US",
    type: "profile",
    images: ["/og-image.webp"],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Mehmet Yildiz | Digital Product Architect",
    description: "Learn more about Mehmet Yildiz, a Full-Stack Software Engineer and Digital Product Architect based in Turkey. Explore my journey and technical skills.",
    images: ["/og-image.webp"],
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
