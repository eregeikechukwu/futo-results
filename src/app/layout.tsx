import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./styles/globals.scss";
import { Providers } from "./providers";
import "@aejkatappaja/phantom-ui/ssr.css";
import { Analytics } from "@vercel/analytics/next";

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
        <Providers>
          {children}
          <Analytics />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: "#dbeafe",
                color: "#1e40af",
                borderRadius: "8px",
                border: "2px solid #3b82f6",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
