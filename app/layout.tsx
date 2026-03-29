import type { Metadata } from "next";
import { Rubik, Secular_One } from "next/font/google";
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
    "Predict your friends. Count the Omer. Bragging rights for 49 days.",
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
      </body>
    </html>
  );
}
