import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "D-HOIP | Hospital overview",
    template: "%s | D-HOIP",
  },
  description:
    "Dare2Care Hospital Operating & Intelligence Platform foundation preview.",
  applicationName: "D-HOIP",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1f4e4e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
