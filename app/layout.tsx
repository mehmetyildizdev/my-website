import type { Metadata } from "next";
import { Rubik, Poppins } from "next/font/google";
import "./globals.css";
import NavBar from "tools/NavBar";
import { ThemeProvider } from "tools/ThemeProvider";
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
  title: "Mehmet Yildiz | Developer & IT Support",
  description:
    "Welcome to the personal website and blog of Mehmet Yildiz, a passionate Front-End Web Developer and IT Support Specialist based in Turkey. Explore my portfolio, read my latest tech articles, and connect with me for innovative solutions.",
  icons: {
    icon: [
      { url: "/icon.png" },
      { url: "/favicon.ico" }
    ],
    apple: "/apple-icon.png"
  },
  applicationName: "Mehmet Yildiz Portfolio",
  authors: [{ name: "Mehmet Yildiz" }],
  generator: "Next.js",
  publisher: "Mehmet Yildiz",
  metadataBase: new URL("https://mehmetyildiz.dev"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Mehmet Yildiz | Developer & IT Support",
    description: "Full-stack development and systemic critiques of issues in the world.",
    url: "https://mehmetyildiz.dev",
    siteName: "Mehmet Yildiz",
    locale: "en_US",
    type: "website",
    images: ["/og-image.webp"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mehmet Yildiz | Developer & IT Support",
    description: "Full-stack development and systemic critiques of issues in the world.",
    images: ["/og-image.webp"],
  },
};

const trackingID = process.env.GOOGLE_TRACKING_ID;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <GoogleAnalytics trackingID={trackingID || ""} />
      <body className={` ${rubik.variable} ${poppins.variable} antialiased`}>
        <ThemeProvider>
          <NavBar />
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
