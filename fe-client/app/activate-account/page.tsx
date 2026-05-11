'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { activateAccountAction } from '@/components/services/auth.services';
import { useAlert } from '@/components/providers/AlertProvider';
import LoadingSpinner from '@/components/UI/LoadingSpinner';

export default function ActivateAccountPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const { showAlert } = useAlert();

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }
  
    const activate = async () => {
      try {
        const result = await activateAccountAction(token);
  
        if (result.success) {
          setStatus("success");
          showAlert("success", result.message);
        } else {
          setStatus("error");
          showAlert("error", result.error);
        }
      } catch (err) {
        setStatus("error");
        showAlert("error", "Có lỗi xảy ra khi kích hoạt tài khoản");
      }
    };
  
    activate();
  }, [token, showAlert]);

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8 text-center">
        {status === 'loading' && (
          <>
            <div className="flex justify-center mb-4">
              <LoadingSpinner />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Đang kích hoạt tài khoản...</h2>
            <p className="text-gray-500">Vui lòng đợi trong giây lát.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="flex justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Kích hoạt thành công!</h2>
            <p className="text-gray-500 mb-6">Tài khoản của bạn đã được kích hoạt. Bạn có thể đăng nhập ngay bây giờ.</p>
            <Link
              href="/auth"
              className="inline-block px-6 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Đăng nhập
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="flex justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Kích hoạt thất bại</h2>
            <p className="text-gray-500 mb-6">
              Liên kết kích hoạt không hợp lệ hoặc đã hết hạn. Vui lòng thử đăng ký lại.
            </p>
            <Link
              href="/auth"
              className="inline-block px-6 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Quay lại đăng ký
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
