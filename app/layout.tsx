import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, IBM_Plex_Serif, Sora } from "next/font/google";
import { headers } from "next/headers";
import { ServiceWorkerRegistration } from "./service-worker-registration";
import "./globals.css";

const sora = Sora({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["700", "800"],
});

const plexSerif = IBM_Plex_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "localhost:3000";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  const metadataBase = new URL(`${protocol}://${host}`);
  const description =
    "A weights-first personal recipe book with exact scaling for whole-egg batches.";

  return {
    metadataBase,
    title: "Misu’s Recipe Book",
    description,
    applicationName: "Misu’s Recipes",
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: "Misu’s",
    },
    formatDetection: {
      telephone: false,
    },
    icons: {
      icon: [
        { url: "/favicon.ico", type: "image/x-icon" },
        { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
        { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      ],
      apple: [
        {
          url: "/apple-touch-icon.png",
          sizes: "180x180",
          type: "image/png",
        },
      ],
    },
    openGraph: {
      type: "website",
      title: "Misu’s Recipe Book",
      description,
      images: [
        {
          url: new URL("/og.png", metadataBase).toString(),
          width: 1200,
          height: 630,
          alt: "Misu’s Recipe Book — Cook by weight.",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Misu’s Recipe Book",
      description,
      images: [new URL("/og.png", metadataBase).toString()],
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#1E1814",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${sora.variable} ${plexSerif.variable} ${plexMono.variable}`}
      >
        {children}
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
