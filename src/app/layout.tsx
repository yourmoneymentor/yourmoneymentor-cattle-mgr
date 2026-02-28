import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cattle Manager",
  description: "Simple mobile-friendly cattle farm management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="mx-auto min-h-screen max-w-2xl px-4 pb-20 pt-6">
          {children}
        </div>
      </body>
    </html>
  );
}
