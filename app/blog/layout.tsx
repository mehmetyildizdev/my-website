import React from "react";
import Footer from "@/components/blog/Footer";

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div id="blog">
      {children}

      <Footer />
    </div>
  );
}
