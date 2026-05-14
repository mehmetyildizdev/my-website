import React from "react";
import Footer from "@/components/blog/Footer";

export default function CollectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div id="collection">
      {children}
      <Footer />
    </div>
  );
}
