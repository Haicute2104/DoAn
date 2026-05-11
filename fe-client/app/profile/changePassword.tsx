"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/UI/button";
import InputPassword from "@/components/UI/inputPassword";
import { PencilLine } from "lucide-react";
import { UpdatePasswordPayload, updatePasswordUser } from "@/components/services/user.services";
import { useAlert } from "@/components/providers/AlertProvider";
import { logoutAction } from "@/components/services/auth.services";
import { useAuth } from "@/components/providers/AuthProvider";

function ChangePassword() {
  const [isEditing, setIsEditing] = useState(false);
  const { user, loading, clearAuth } = useAuth();
  const { showAlert } = useAlert();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    const newPassword = formData.get("newPassword") as string;
    const password = formData.get("password") as string;

    const payload: UpdatePasswordPayload = {
      newPassword,
      password,
    };

    try {
      const result = await updatePasswordUser(payload);

      form.reset(); // ✅ reset form đúng cách

      showAlert("success", result.message);

      // Sau khi đổi mật khẩu → logout
      logoutAction();
      clearAuth();
      router.push("/auth");
    } catch (err) {
      showAlert(
        "error",
        err instanceof Error ? err.message : "Đổi mật khẩu thất bại"
      );
    } finally {
      setIsEditing(false);
      form.reset(); 
    }
  };

  return (
    <section className="bg-white p-8 border border-gray-100 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-serif text-2xl text-brand-dark">
          Đổi mật khẩu
        </h2>

        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-2 cursor-pointer hover:text-[#8B1E26] transition-colors duration-300 text-[#D4AF37]"
        >
          <PencilLine className="w-4 h-4" />
          <span className="text-sm font-medium">
            {!isEditing ? "Chỉnh sửa" : "Hủy"}
          </span>
        </button>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputPassword
            label="Mật khẩu cũ"
            name="password"
            placeholder="Nhập mật khẩu cũ"
            disabled={!isEditing}
            showValidation={isEditing}
          />

          <InputPassword
            label="Mật khẩu mới"
            name="newPassword"
            placeholder="Nhập mật khẩu mới"
            disabled={!isEditing}
            showValidation={isEditing}
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={!isEditing}
        >
          Cập nhật mật khẩu
        </Button>
      </form>
    </section>
  );
}

export default ChangePassword;