"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          // default
          "--normal-bg": "hsl(var(--background))",
          "--normal-text": "hsl(var(--foreground))",
          "--normal-border": "hsl(var(--border))",

          // success
          "--success-bg": "hsl(142, 76%, 36%)", // green
          "--success-border": "hsl(142, 71%, 29%)",
          "--success-text": "white",

          // error
          "--error-bg": "hsl(0, 72%, 51%)", // red
          "--error-border": "hsl(0, 70%, 40%)",
          "--error-text": "white",

          // warning
          "--warning-bg": "hsl(38, 92%, 50%)", // amber
          "--warning-border": "hsl(35, 90%, 40%)",
          "--warning-text": "black",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
