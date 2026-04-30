import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Student Risk Management System",
  description: "Institutional risk analytics and student health metrics.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#f5f7fb] text-slate-900">{children}</body>
    </html>
  );
}
