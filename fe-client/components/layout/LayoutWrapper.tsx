"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import LoginModal from "@/components/UI/LoginModal";
import ChatWidget from "@/components/UI/ChatWidget";

const STANDALONE_ROUTES = ["/try-on"];

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isStandalone = STANDALONE_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (isStandalone) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      {children}
      <Footer />
      <LoginModal />
      <ChatWidget />
    </>
  );
}
