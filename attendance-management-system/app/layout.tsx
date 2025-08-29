import type { Metadata } from "next";
import { Poppins, Roboto_Mono } from "next/font/google";
import "./globals.css";

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
    template: "%s | Attendance MS", // Allows child pages to set their own title
    default: "Dashboard | Attendance MS", // Default title for the app
  },
  description: "A modern and efficient system to manage employee attendance.",
  icons: {
    icon: "/favicon.ico", // Make sure to add a favicon to your public folder
  },
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
      <body
        className={`${poppins.variable} ${robotoMono.variable} bg-slate-50 text-slate-800 antialiased min-h-screen flex flex-col`}
      >
        {/* You can add a Header, Sidebar, or Footer here */}
        <main className="flex-grow">{children}</main>
      </body>
    </html>
  );
}
