import type { Metadata } from "next";
import { Lora } from "next/font/google";
import Footer from "./Footer";
import "./globals.css";
import Navbar from "./Navbar";
import { ReactQueryProvider } from "./ReactQueryProvider";
import { Toaster } from "@/components/ui/toaster";
import { env } from "@/env";
import { ThemeProvider } from "./ThemeProvider";

const lora = Lora({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_BASE_URL),
  title: {
    template: "%s | Hcoff store",
    default: "Hcoff Store",
  },
  description: "A full-stack e-commerce application built with Next.js 15",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={lora.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div>
            <ReactQueryProvider>
              <Navbar />
              {children}
              <Footer />
            </ReactQueryProvider>
            <Toaster />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
