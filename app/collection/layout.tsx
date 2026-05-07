import React from "react";
import Footer from "@/components/blog/Footer";
import { ScrollToTop } from "@/components/blog/ScrollToTop";

export default function CollectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div id="collection">
      {children}
      <Footer />
      <ScrollToTop />
    </div>
  );
}
