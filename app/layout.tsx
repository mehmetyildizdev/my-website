import type { Metadata } from "next";
import { Rubik, Poppins } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "tools/ThemeProvider";
import Navbar from "tools/NavBar";
import GoogleAnalytics from "tools/GoogleAnalytics";

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "900"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Mehmet Yildiz | Front-End Web Developer",
  description:
    "This is a personal website and blog for Mehmet Yildiz, a front-end web developer.",
  keywords: [
    "web development",
    "design",
    "programming",
    "react",
    "next.js",
    "sanity",
    "tailwindcss",
  ],
  applicationName: "My Website",
  authors: [{ name: "www.mehmetyildiz.dev" }],
  generator: "Next.js",
  publisher: "Mehmet Yildiz",
};

const trackingID = process.env.GOOGLE_TRACKING_ID;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <GoogleAnalytics trackingID={trackingID || ""} />
      <body className={` ${rubik.variable} ${poppins.variable} antialiased`}>
        <ThemeProvider>
          <Navbar />
          <main className="pt-16">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
