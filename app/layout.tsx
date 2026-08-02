import type { Metadata, Viewport } from 'next';
import { Rubik, Poppins } from 'next/font/google';
import './global.css';
import NavBar from 'tools/NavBar';
import { ThemeProvider } from 'tools/ThemeProvider';
import GoogleAnalytics from 'tools/GoogleAnalytics';

const rubik = Rubik({
  variable: '--font-rubik',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '900'],
  display: 'swap',
});

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700'],
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'Mehmet Yildiz | Full-Stack Developer | IT Specialist',
  description:
    'Welcome to the personal website and blog of Mehmet Yildiz, a passionate Full-Stack Developer and IT Specialist based in Turkey. Explore my portfolio, read my latest tech articles, and connect with me for innovative solutions.',
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
      {
        url: '/favicon-96x96.png',
        sizes: '96x96',
        type: 'image/png',
      },
      { url: '/favicon.ico', sizes: 'any', rel: 'shortcut icon' },
    ],
    apple: [
      {
        url: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
      {
        url: '/apple-icon.png',
        sizes: '144x144',
        type: 'image/png',
      },
    ],
  },
  applicationName: 'Mehmet Yildiz Portfolio',
  authors: [{ name: 'Mehmet Yildiz' }],
  generator: 'Next.js',
  publisher: 'Mehmet Yildiz',
  metadataBase: new URL('https://mehmetyildiz.dev'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Mehmet Yildiz | Full-Stack Developer | IT Specialist',
    description: 'Full-stack development and systemic critiques of issues in the world.',
    url: 'https://mehmetyildiz.dev',
    siteName: 'Mehmet Yildiz',
    locale: 'en_US',
    type: 'website',
    images: ['/og-image.webp'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mehmet Yildiz | Full-Stack Developer | IT Specialist',
    description: 'Full-stack development and systemic critiques of issues in the world.',
    images: ['/og-image.webp'],
  },
};

const trackingID = process.env.GOOGLE_TRACKING_ID;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="overflow-y-scroll">
      <body className={` ${rubik.variable} ${poppins.variable} antialiased`}>
        <GoogleAnalytics trackingID={trackingID || ''} />
        <ThemeProvider>
          <NavBar />
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
