import type { Metadata } from "next";
import { Rubik, Poppins } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./components/main/ThemeProvider";
import Navbar from "./components/main/NavBar";
import GoogleAnalytics from "./components/main/GoogleAnalytics";

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
  title: "Mehmet Yildiz Website",
  description: "Front-end Web Developer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <GoogleAnalytics />
        <ThemeProvider>
          <body
            className={` ${rubik.variable} ${poppins.variable} antialiased`}
          >
            <Navbar />
            <main className="pt-16">{children}</main>
          </body>
        </ThemeProvider>
      </head>
    </html>
  );
}
