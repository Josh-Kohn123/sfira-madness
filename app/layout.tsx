import type { Metadata } from "next";
import { Rubik, Secular_One } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const rubik = Rubik({
  subsets: ["latin", "hebrew"],
  variable: "--font-rubik",
});

const secularOne = Secular_One({
  weight: "400",
  subsets: ["latin", "hebrew"],
  variable: "--font-secular-one",
});

export const metadata: Metadata = {
  title: "Sfira Madness",
  description:
    "Guess how far your friends will count the Omer. Track together. Bragging rights for 49 days.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${rubik.variable} ${secularOne.variable}`}>
      <body className="min-h-screen bg-cosmos-gradient font-sans text-white antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
