import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Worker Hours Tracker",
  description: "Calendar, work entries and API documentation for the Worker Hours Tracker project.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
