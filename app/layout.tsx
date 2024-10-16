import type { Metadata } from "next";
import { Work_Sans } from "next/font/google";
import "./globals.css";
import { Room } from "./Room";

const geistSans = Work_Sans({
  subsets:["latin"],
  variable: "--font-work-sans",
  weight: ["400", "600", "700"],
});
const geistMono = Work_Sans({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Figma Clone",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-primary-grey-200 antialiased`}
      >
        <Room>
          {children}
        </Room>
      </body>
    </html>
  );
}
