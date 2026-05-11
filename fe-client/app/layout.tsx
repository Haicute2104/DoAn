import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { AlertProvider } from "@/components/providers/AlertProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import LoginModal from "@/components/UI/LoginModal";
import ChatWidget from "@/components/UI/ChatWidget";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin", "vietnamese"],
  variable: "--font-serif",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "vietnamese"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Áo dài Hải cutee",
  description: "Áo dài Hải cutee",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${playfair.variable} ${jakarta.variable}`}
      >
        <AuthProvider >
          <AlertProvider>
            <Header />
            {children}
            <Footer />
            <LoginModal />
            <ChatWidget />
          </AlertProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
