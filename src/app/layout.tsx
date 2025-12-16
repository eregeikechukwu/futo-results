import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./styles/globals.scss";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const Mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Results portal",
  description: "See your results anytime, anywhere.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${Mono.variable} antialiased `}>
        {children}
      </body>
    </html>
  );
}
