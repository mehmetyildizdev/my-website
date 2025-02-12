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
const trackingID = process.env.GOOGLE_TRACKING_ID;

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
