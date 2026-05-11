"use client";

import { useAlert } from "@/components/providers/AlertProvider";
import {
  updateProfileUser,
  type UpdateProfilePayload,
} from "@/components/services/user.services";
import { Alert } from "@/components/UI/alert";
import { Button } from "@/components/UI/button";
import { DatePicker } from "@/components/UI/date-picker";
import { Input } from "@/components/UI/input";
import { AuthUser } from "@/components/services/auth.services";
import { PencilLine } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type FormState = {
  fullName: string;
  phone: string;
  email: string;
  dateOfBirth: Date | undefined;
};

function ChangeProfile({
  user,
  onProfileUpdated,
}: {
  user: AuthUser;
  onProfileUpdated?: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showAlert } = useAlert();
  

  const [form, setForm] = useState<FormState>({
    fullName: user.fullName ?? "",
    phone: user.phone ?? "",
    email: user.email ?? "",
    dateOfBirth: user.dateOfBirth
      ? new Date(user.dateOfBirth)
      : undefined,
  });

  useEffect(() => {
    setForm({
      fullName: user.fullName ?? "",
      phone: user.phone ?? "",
      email: user.email ?? "",
      dateOfBirth: user.dateOfBirth
        ? new Date(user.dateOfBirth)
        : undefined,
    });
  }, [user]);

  const handleEdit = useCallback(() => {
    if (isEditing) {
      setForm({
        fullName: user.fullName ?? "",
        phone: user.phone ?? "",
        email: user.email ?? "",
        dateOfBirth: user.dateOfBirth
          ? new Date(user.dateOfBirth)
          : undefined,
      });
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  
    setError(null);
  }, [isEditing, user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payload: UpdateProfilePayload = {
        fullName: form.fullName.trim() || undefined,
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        dateOfBirth: form.dateOfBirth
          ? form.dateOfBirth.toISOString().split("T")[0]
          : undefined,
      };
      await updateProfileUser(payload);
      showAlert("success", "Cập nhật thông tin thành công");
      setIsEditing(false);
      setDisabled(true);
      onProfileUpdated?.();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Cập nhật thông tin thất bại"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-white p-8 border border-gray-100 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-serif text-2xl text-[#2c2c2c]">
          Thông tin tài khoản
        </h2>
          <button
            type="button"
            onClick={handleEdit}
            className="flex items-center gap-2 cursor-pointer hover:text-[#8B1E26] transition-colors duration-300 text-[#D4AF37]"
          >
            <PencilLine className="w-4 h-4" />
            <p className="text-sm font-medium">{isEditing ? "Hủy" : "Chỉnh sửa"}</p>
          </button>
      </div>

      <form className="space-y-6" onSubmit={handleSave}>
        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">
            {error}
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 flex flex-col h-full justify-between">
            <label
              htmlFor="fullName"
              className="text-sm text-gray-500 font-medium"
            >
              Họ và tên
            </label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              value={form.fullName}
              disabled={!isEditing}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, fullName: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2 flex flex-col">
            <label className="text-sm text-gray-500 font-medium">
              Ngày sinh
            </label>
            <DatePicker
              className="py-1"
              date={form.dateOfBirth}
              onDateChange={(date) =>
                setForm((prev) => ({ ...prev, dateOfBirth: date }))
              }
              disabled={!isEditing}
              placeholder="Chọn ngày"
            />
          </div>
        </div>

        <div className="space-y-2 flex flex-col">
          <label htmlFor="phone" className="text-sm text-gray-500 font-medium">
            Số điện thoại
          </label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={form.phone}
            disabled={!isEditing}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, phone: e.target.value }))
            }
          />
        </div>

        <div className="space-y-2 flex flex-col">
          <label htmlFor="email" className="text-sm text-gray-500 font-medium">
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            value={form.email}
            disabled={!isEditing}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, email: e.target.value }))
            }
          />
        </div>

        {isEditing && (
          <div className="space-y-2">
            <Button type="submit" className="w-full" disabled={loading || !isEditing}>
              {loading ? "Đang cập nhật..." : "Cập nhật"}
            </Button>
          </div>
        )}
      </form>
    </section>
  );
}

export default ChangeProfile;
