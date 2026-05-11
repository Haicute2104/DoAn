"use client";

import Link from "next/link";
import { Upload } from "lucide-react";
import { useRef } from "react";
import {
  updateAddress,
  upDateAvatarUser,
} from "@/components/services/user.services";
import Image from "next/image";
import { useAlert } from "@/components/providers/AlertProvider";
import { useAuth } from "@/components/providers/AuthProvider";

function ProfileSidebar() {
  const { user, refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showAlert } = useAlert();

  const handleUploadAvatar = () => {
    fileInputRef.current?.click();
  };

  const handleChangeFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("files", file);
    const response = await upDateAvatarUser(formData);
    showAlert("success", response.message);
    await refreshUser();
  };

  const initial =
    user?.fullName && user.fullName.length > 0
      ? user.fullName.charAt(0).toUpperCase()
      : "";

  return (
    <div className="bg-white p-6 border border-gray-100 shadow-sm">
      <div className="flex items-center space-x-4 mb-8 pb-8 border-b border-gray-100">
        <div className="relative group">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full overflow-hidden bg-teal-600 border-2 border-[#D4AF37]/30 flex items-center justify-center">
            {user?.avatarUrl ? (
              <Image
                src={`${user.avatarUrl}?t=${Date.now()}`}
                alt="avatar"
                width={64}
                height={64}
                className="w-full h-full object-contain"
              />
            ) : (
              <span className="text-xl font-bold text-white">{initial}</span>
            )}
          </div>

          {/* Upload overlay */}
          <div
            onClick={handleUploadAvatar}
            className="absolute inset-0 w-16 h-16 rounded-full bg-[#2c2c2c]/70 
    flex items-center justify-center opacity-0 group-hover:opacity-100 
    transition cursor-pointer"
          >
            <Upload className="text-white" />

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleChangeFile}
            />
          </div>
        </div>
        <div>
          <p className="text-sm text-[#2c2c2c] mb-1">Xin chào,</p>
          <h3 className="font-serif text-xl text-[#2c2c2c]">
            {user?.fullName ?? ""}
          </h3>
        </div>
      </div>
      <nav className="space-y-2">
        <Link
          href="/profile"
          className="block px-4 py-3 bg-[#FAF8F5] text-[#8B1E26] font-medium border-l-2 border-[#8B1E26]"
        >
          Hồ sơ cá nhân
        </Link>
        <Link
          href="/profile/order-history"
          className="block px-4 py-3 text-[#2c2c2c] hover:bg-[#FAF8F5] hover:text-[#8B1E26]"
        >
          Lịch sử đơn hàng
        </Link>

      </nav>
    </div>
  );
}

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="grow pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="w-full lg:w-1/4">
            <ProfileSidebar />
          </aside>
          <div className="w-full lg:w-3/4 space-y-8">{children}</div>
        </div>
      </div>
    </main>
  );
}
