'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { resetPasswordAction } from '@/components/services/auth.services';
import { useAlert } from '@/components/providers/AlertProvider';

function getPasswordStrength(password: string): { level: number; label: string } {
  if (!password) return { level: 0, label: '' };
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { level: 1, label: 'Yếu' };
  if (score <= 3) return { level: 2, label: 'Trung bình' };
  return { level: 3, label: 'Mạnh' };
}

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const { showAlert } = useAlert();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!password) newErrors.password = 'Vui lòng nhập mật khẩu mới';
    else if (password.length < 6) newErrors.password = 'Mật khẩu phải ít nhất 6 ký tự';
    if (!confirmPassword) newErrors.confirm = 'Vui lòng xác nhận mật khẩu';
    else if (password !== confirmPassword) newErrors.confirm = 'Mật khẩu xác nhận không khớp';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    if (!token) {
      setErrors({ password: "Token không hợp lệ" });
      return;
    }

    const result = await resetPasswordAction(token, password);
    if (result.success) {
      setSubmitted(true);
      showAlert("success", result.message);
    } else {
      setErrors({ password: result.error });
      showAlert("error", result.error);
    }
    setPassword("");
    setConfirmPassword("");
  };

  if (!token) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Liên kết không hợp lệ</h2>
          <p className="text-gray-500 mb-6">Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.</p>
          <Link
            href="/auth"
            className="inline-block px-6 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Đặt lại mật khẩu thành công!</h2>
          <p className="text-gray-500 mb-6">Mật khẩu của bạn đã được cập nhật. Bạn có thể đăng nhập với mật khẩu mới.</p>
          <Link
            href="/auth"
            className="inline-block px-6 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  const strengthColors = ['#e5e7eb', '#e5e7eb', '#e5e7eb'];
  if (strength.level >= 1) strengthColors[0] = strength.level === 1 ? '#ef4444' : strength.level === 2 ? '#f59e0b' : '#10b981';
  if (strength.level >= 2) strengthColors[1] = strength.level === 2 ? '#f59e0b' : '#10b981';
  if (strength.level >= 3) strengthColors[2] = '#10b981';

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-1 text-center">Đặt lại mật khẩu</h2>
        <p className="text-gray-500 text-sm mb-6 text-center">Nhập mật khẩu mới cho tài khoản của bạn.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="new-password" className="text-sm font-medium text-gray-700">Mật khẩu mới</label>
            <input
              id="new-password"
              type="password"
              placeholder="••••••••"
              className={`w-full px-3 py-2.5 border rounded-lg text-sm outline-none transition-all focus:ring-2 focus:ring-gray-800/10 focus:border-gray-800 ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && <span className="text-xs text-red-500">{errors.password}</span>}
            {password && (
              <>
                <div className="flex gap-1 mt-1">
                  {strengthColors.map((color, i) => (
                    <div key={i} className="flex-1 h-1 rounded-full" style={{ background: color }} />
                  ))}
                </div>
                <span className="text-xs mt-0.5" style={{ color: strength.level === 1 ? '#ef4444' : strength.level === 2 ? '#f59e0b' : '#10b981' }}>
                  {strength.label}
                </span>
              </>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="confirm-password" className="text-sm font-medium text-gray-700">Xác nhận mật khẩu</label>
            <input
              id="confirm-password"
              type="password"
              placeholder="••••••••"
              className={`w-full px-3 py-2.5 border rounded-lg text-sm outline-none transition-all focus:ring-2 focus:ring-gray-800/10 focus:border-gray-800 ${errors.confirm ? 'border-red-500' : 'border-gray-300'}`}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {errors.confirm && <span className="text-xs text-red-500">{errors.confirm}</span>}
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors mt-1"
          >
            Đặt lại mật khẩu
          </button>

          <div className="text-center text-sm text-gray-500">
            <Link href="/auth" className="text-gray-800 font-medium underline">
              Quay lại đăng nhập
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
