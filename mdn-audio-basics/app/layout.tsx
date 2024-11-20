import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Link from "next/link";
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <nav>
              <Link href="/">Home</Link>
            </nav>
            <nav>
              <Link href="/mic-audio">Mic Audio</Link>
            </nav>
            <nav>
              <Link href="/mic-stored">Mic Stored</Link>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
