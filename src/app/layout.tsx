import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Footer } from "@/components/Footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://lakeregionpropertyresource.com"),
  title: {
    default: "Lake Region Property Resource",
    template: "%s | Lake Region Property Resource",
  },
  description:
    "A local hub for Lake Region listings, rentals, resources, and trusted real-estate service providers.",
  openGraph: {
    title: "Lake Region Property Resource",
    description:
      "Find Lake Region homes, rentals, resources, service providers, city hubs, and county property information.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      signUpFallbackRedirectUrl="/onboarding"
      signInFallbackRedirectUrl="/"
    >
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">
          {children}
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
