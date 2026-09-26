import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Nav from "@/components/nav/nav";
import Footer from "@/components/footer/footer";
import AuthProvider from "@/components/authProvider/authProvider";
import StyledComponentsRegistry from "@/components/styledComponentsRegistry/styledComponentsRegistry";
import { defaultMetaData } from "@/constants";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = defaultMetaData();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <StyledComponentsRegistry>
          <AuthProvider />
          <main>
            <Nav />
            {children}
            <Footer />
          </main>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
