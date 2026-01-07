import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hollywood AI Studio - Newsletter Dashboard",
  description: "Professional newsletter dashboard for Hollywood AI content",
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
