import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/index";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="h-[calc(100vh-56px)] w-screen flex flex-col	items-center justify-center">
          {children}
        </main>
        <Navbar></Navbar>
        <div id="portal"></div>
      </body>
    </html>
  );
}
