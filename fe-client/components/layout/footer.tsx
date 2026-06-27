"use client";

import Link from "next/link";
import Image from "next/image";
import { policyLinks } from "@/content/policies";

const quickLinks = [
  { name: "Trang chủ", href: "/" },
  { name: "Sản phẩm", href: "/products" },
  { name: "Giới thiệu", href: "/about" },
  { name: "Tin tức", href: "/news" },
  { name: "Liên hệ", href: "/contact" },
];

function FooterColumnTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h4 className="font-serif text-base font-medium text-[#2C2C2C]">
        {children}
      </h4>
      <div className="mt-2 h-px w-8 bg-[#8B1E26]" />
    </div>
  );
}

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-[#E8E4DF] bg-[#FAF8F5]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block">
              <Image
                src="/images/logo.png"
                alt="Áo Dài Believe"
                width={180}
                height={54}
                className="h-12 w-auto object-contain"
              />
            </Link>
            <p className="mt-5 max-w-xs text-sm font-light leading-relaxed text-[#6B7280]">
              Tôn vinh vẻ đẹp truyền thống Việt Nam qua từng đường kim mũi chỉ.
              Áo dài cao cấp, thiết kế tinh tế, may đo tỉ mỉ.
            </p>
            <Link
              href="/contact"
              className="mt-6 inline-block rounded-full bg-[#8B1E26] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-[#6f1720]"
            >
              Liên hệ ngay
            </Link>
          </div>

          {/* Quick links */}
          <div>
            <FooterColumnTitle>Liên kết</FooterColumnTitle>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#6B7280] transition hover:text-[#8B1E26]"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div>
            <FooterColumnTitle>Chính sách</FooterColumnTitle>
            <ul className="space-y-3">
              {policyLinks.map((link) => (
                <li key={link.slug}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#6B7280] transition hover:text-[#8B1E26]"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <FooterColumnTitle>Hỗ trợ khách hàng</FooterColumnTitle>
            <ul className="space-y-3 text-sm text-[#6B7280]">
              <li>Thứ 2 – Chủ nhật: 8:00 – 21:00</li>
              <li>
                Email:{" "}
                <a
                  href="mailto:support@aodaibelieve.vn"
                  className="transition hover:text-[#8B1E26]"
                >
                  support@aodaibelieve.vn
                </a>
              </li>
              <li>
                Hotline:{" "}
                <a
                  href="tel:19001234"
                  className="transition hover:text-[#8B1E26]"
                >
                  1900 1234
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-[#E8E4DF] pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-[#9CA3AF]">
              © {currentYear}{" "}
              <Link
                href="/"
                className="text-[#2C2C2C] transition hover:text-[#8B1E26]"
              >
                Áo Dài Believe
              </Link>
              . Bảo lưu mọi quyền.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {policyLinks.slice(0, 3).map((link) => (
                <Link
                  key={link.slug}
                  href={link.href}
                  className="text-xs text-[#9CA3AF] transition hover:text-[#8B1E26]"
                >
                  {link.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
