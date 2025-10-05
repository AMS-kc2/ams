import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { Poppins, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/providers";

// Primary font for the UI
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"], // Added more weights for flexibility
  display: "swap", // Improves font loading performance
  variable: "--font-poppins", // CSS variable for Poppins
});

// Monospace font for code blocks, IDs, or tabular data
const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-roboto-mono", // CSS variable for Roboto Mono
});

// Improved metadata for the application
export const metadata: Metadata = {
  title: {
    template: "%s | Attendance MS",
    default: "Dashboard | Attendance MS",
  },
  description: "A modern and efficient system to manage employee attendance.",
  icons: {
    icon: [
      { url: "/icon/favicon.ico", sizes: "any" },
      { url: "/icon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/icon/apple-touch-icon.png", sizes: "180x180" }],
    other: [
      {
        rel: "mask-icon",
        url: "/icon/safari-pinned-tab.svg",
        color: "#5bbad5",
      },
    ],
  },
  manifest: "/icon/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/*
        The className combines the font variables with base styling for a better look.
        - `bg-slate-50`: A very light gray background, easier on the eyes than pure white.
        - `text-slate-800`: A dark gray for text, which is softer than pure black.
        - `antialiased`: Smooths out the font for better readability.
        - `min-h-screen flex flex-col`: Ensures the layout takes up the full screen height.
      */}
      <body className={`${poppins.variable} ${robotoMono.variable}`}>
        {/* You can add a Header, Sidebar, or Footer here */}
        <Providers>
          <main className="max-w-4xl mx-auto">{children}</main>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
