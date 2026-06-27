"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { logoutAction } from "@/components/services/auth.services";
import { useAlert } from "../providers/AlertProvider";
import Image from "next/image";

const navigationLinks = [
  { href: "/products", label: "Sản phẩm" },
  { href: "/about", label: "Giới thiệu" },
  { href: "/news", label: "Tin tức" },
  { href: "/contact", label: "Liên hệ" },
];

function Header() {
  const { user, loading, clearAuth } = useAuth();
  const { showAlert } = useAlert();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const avatarMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 0);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        avatarMenuRef.current &&
        !avatarMenuRef.current.contains(e.target as Node)
      ) {
        setAvatarMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logoutAction();
      clearAuth();
      setAvatarMenuOpen(false);
      setMobileMenuOpen(false);
      showAlert("success", "Đăng xuất thành công");
    } catch {
      showAlert("error", "Đăng xuất thất bại");
    }
  };

  const initials = user?.fullName
    ? user.fullName.charAt(0).toUpperCase()
    : (user?.email?.charAt(0).toUpperCase() ?? "?");

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
        scrolled
          ? "border-gray-200 bg-white/80 shadow-sm backdrop-blur-xl"
          : "border-transparent bg-white"
      }`}
    >
      <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center">
              <Image
                src="/images/logo.png"
                alt="Áo Dài Believe"
                width={160}
                height={48}
                className="h-10 w-auto object-contain sm:h-12"
                priority
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:block">
              <ul className="flex items-center gap-6 text-sm">
                {navigationLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-gray-500 transition hover:text-gray-700"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Cart */}
            <Link
              href="/cart"
              className="rounded-md p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
            </Link>

            {loading ? (
              <div className="h-9 w-20 rounded-md bg-gray-200 animate-pulse" />
            ) : user ? (
              /* Avatar Dropdown */
              <div className="relative" ref={avatarMenuRef}>
                <button
                  onClick={() => setAvatarMenuOpen((prev) => !prev)}
                  className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-teal-600 text-sm font-semibold text-white ring-2 ring-white transition hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                >
                  {user?.avatarUrl ? (
                    <Image
                    src={`${user.avatarUrl}?t=${Date.now()}`}
                      alt="avatar"
                      width={36}
                      height={36}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <span className="text-sm font-semibold text-white">
                      {initials}
                    </span>
                  )}
                </button>

                {avatarMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-lg border border-gray-100 bg-white py-1 shadow-lg">
                    <div className="border-b border-gray-100 px-4 py-3">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.fullName ?? "Người dùng"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>

                    <Link
                      href="/profile"
                      onClick={() => setAvatarMenuOpen(false)}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      Thông tin cá nhân
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 transition hover:bg-red-50"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Login / Register */
              <div className="hidden sm:flex sm:gap-3">
                <Link
                  href="/auth"
                  className="rounded-md bg-teal-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-teal-700"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/auth"
                  className="rounded-md bg-gray-100 px-5 py-2 text-sm font-medium text-teal-600 transition hover:bg-gray-200"
                >
                  Đăng ký
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className="rounded-md bg-gray-100 p-2 text-gray-600 transition hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="size-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  {mobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-gray-100 bg-white md:hidden">
          <nav className="px-4 py-3">
            <ul className="flex flex-col gap-1">
              {navigationLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded-md px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="my-2 h-px bg-gray-100" />

            {user ? (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3 px-3 py-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-600 text-xs font-semibold text-white">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {user.fullName ?? "Người dùng"}
                    </p>
                    <p className="truncate text-xs text-gray-500">
                      {user.email}
                    </p>
                  </div>
                </div>
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
                >
                  Thông tin cá nhân
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full rounded-md px-3 py-2 text-left text-sm text-red-600 transition hover:bg-red-50"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 px-3 py-2">
                <Link
                  href="/auth"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-md bg-teal-600 px-4 py-2 text-center text-sm font-medium text-white transition hover:bg-teal-700"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/auth"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-md bg-gray-100 px-4 py-2 text-center text-sm font-medium text-teal-600 transition hover:bg-gray-200"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

export default Header;
