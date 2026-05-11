'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loginAction, registerUser, forgotPasswordAction } from '@/components/services/auth.services';
import { useAuth } from '@/components/providers/AuthProvider';
import './auth.css';
import { useAlert } from '@/components/providers/AlertProvider';

type AuthView = 'login' | 'register' | 'forgot';

interface FormErrors {
  [key: string]: string;
}

const backgroundStyles: Record<AuthView, React.CSSProperties> = {
  login: { background: 'radial-gradient(125% 125% at 50% 10%, #fff 40%, #6366f1 100%)' },
  register: { background: 'radial-gradient(125% 125% at 50% 10%, #ffffff 40%, #ec4899 100%)' },
  forgot: { background: 'radial-gradient(125% 125% at 50% 10%, #ffffff 40%, #10b981 100%)' },
};

const sloganData: Record<AuthView, { title: string; subtitle: string }> = {
  login: { title: 'Chào mừng trở lại!', subtitle: 'Đăng nhập để tiếp tục mua sắm áo dài' },
  register: { title: 'Gia nhập cùng chúng tôi!', subtitle: 'Tạo tài khoản để khám phá bộ sưu tập áo dài' },
  forgot: { title: 'Đừng lo lắng!', subtitle: 'Chúng tôi sẽ giúp bạn lấy lại mật khẩu' },
};

function SloganSection({ right = false, view }: { right?: boolean; view: AuthView }) {
  const { title, subtitle } = sloganData[view];
  return (
    <div
      className={`slogan-section hidden md:flex w-1/2 flex-col justify-center gap-2 bg-sky-900 text-white ${
        right
          ? 'right-section items-start rounded-r-[160px] pl-8'
          : 'items-end rounded-l-[160px] pr-8'
      }`}
    >
      <h3 className="text-center text-2xl font-bold text-white">{title}</h3>
      <p className="text-center text-sm text-white">{subtitle}</p>
    </div>
  );
}

function FormInput({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  autoComplete,
}: {
  id: string;
  label: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  autoComplete?: string;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={isPassword && showPassword ? 'text' : type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 ${
            error ? 'border-red-400' : 'border-gray-300'
          }`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {isPassword && value && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            )}
          </button>
        )}
      </div>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}

export default function AuthContent() {
  const router = useRouter();
  const { setAuth } = useAuth();
  const [currentView, setCurrentView] = useState<AuthView>('login');

  // Animation states
  const [animLogin, setAnimLogin] = useState(false);
  const [animRegister, setAnimRegister] = useState(false);
  const [animForgot, setAnimForgot] = useState(false);
  const [animForgotToLogin, setAnimForgotToLogin] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loginErrors, setLoginErrors] = useState<FormErrors>({});

  // Register form
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirm, setRegisterConfirm] = useState('');
  const [registerErrors, setRegisterErrors] = useState<FormErrors>({});

  // Forgot form
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotErrors, setForgotErrors] = useState<FormErrors>({});

  //Thông báo
  const { showAlert } = useAlert();

  useEffect(() => {
    const saved = localStorage.getItem('rememberUsers');
    if (saved) {
      try {
        const { username } = JSON.parse(saved);
        if (username) {
          setLoginEmail(username);
          setRememberMe(true);
        }
      } catch {
        /* ignore */
      }
    }
  }, []);

  // Animation handlers
  const clearMessages = () => {
    setSuccessMessage('');
    setLoginErrors({});
    setRegisterErrors({});
    setForgotErrors({});
  };

  const handleLoginToRegister = () => {
    clearMessages();
    setAnimLogin(true);
    setTimeout(() => {
      setCurrentView('register');
      setTimeout(() => setAnimLogin(false), 500);
    }, 500);
  };

  const handleRegisterToLogin = () => {
    clearMessages();
    setAnimRegister(true);
    setTimeout(() => {
      setCurrentView('login');
      setTimeout(() => setAnimRegister(false), 500);
    }, 500);
  };

  const handleLoginToForgot = () => {
    clearMessages();
    setAnimForgot(true);
    setTimeout(() => {
      setCurrentView('forgot');
      setTimeout(() => setAnimForgot(false), 500);
    }, 500);
  };

  const handleForgotToLogin = () => {
    clearMessages();
    setAnimForgotToLogin(true);
    setTimeout(() => {
      setCurrentView('login');
      setTimeout(() => setAnimForgotToLogin(false), 500);
    }, 500);
  };

  // Validation & submit
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: FormErrors = {};
    if (!loginEmail.trim()) errors.email = 'Vui lòng nhập email!';
    if (!loginPassword) errors.password = 'Vui lòng nhập mật khẩu!';
    setLoginErrors(errors);
    if (Object.keys(errors).length > 0) return;

    if (rememberMe) {
      localStorage.setItem('rememberUsers', JSON.stringify({ username: loginEmail }));
    } else {
      localStorage.removeItem('rememberUsers');
    }

    setIsSubmitting(true);
    try {
      const result = await loginAction(loginEmail, loginPassword);
      if (result.success && result.user) {
        setAuth(result.user, result.accessToken ?? '');
        showAlert("success", result.message ?? "Đăng nhập thành công");
        router.push('/');
      } else {
        showAlert("error", result.error ?? "Đăng nhập thất bại. Vui lòng kiểm tra email và mật khẩu.");
      }
    } catch {
      showAlert("error", "Đã xảy ra lỗi, vui lòng thử lại. Vui lòng kiểm tra email và mật khẩu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: FormErrors = {};
    if (!registerEmail.trim()) errors.email = 'Vui lòng nhập email!';
    else if (!/\S+@\S+\.\S+/.test(registerEmail)) errors.email = 'Email không hợp lệ!';
    if (!registerName.trim()) errors.name = 'Vui lòng nhập họ và tên!';
    if (!registerPassword) errors.password = 'Mật khẩu không được để trống.';
    else if (registerPassword.length < 8) errors.password = 'Mật khẩu phải có ít nhất 8 ký tự.';
    else if (!/(?=.*[a-z])/.test(registerPassword)) errors.password = 'Mật khẩu phải chứa ít nhất một chữ cái thường.';
    else if (!/(?=.*[A-Z])/.test(registerPassword)) errors.password = 'Mật khẩu phải chứa ít nhất một chữ cái viết hoa.';
    else if (!/(?=.*\d)/.test(registerPassword)) errors.password = 'Mật khẩu phải chứa ít nhất một số.';
    else if (!/(?=.*[@$!%*#?&])/.test(registerPassword)) errors.password = 'Mật khẩu phải chứa ít nhất một ký tự đặc biệt (@$!%*#?&).';
    if (!registerConfirm) errors.confirm = 'Vui lòng xác nhận mật khẩu!';
    else if (registerPassword !== registerConfirm) errors.confirm = 'Mật khẩu xác nhận không khớp!';
    setRegisterErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    try {
      const result = await registerUser(registerEmail, registerPassword, registerName);
      if (result.success) {
        setSuccessMessage(result.message ?? "Đăng ký thành công. Vui lòng kiểm tra email để kích hoạt tài khoản.");
        showAlert("success", result.message ?? "Đăng ký thành công");
      } else {
        showAlert("error", result.error ?? "Đăng ký thất bại");
      }
    } catch {
      showAlert("error", "Đã xảy ra lỗi, vui lòng thử lại");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: FormErrors = {};
    if (!forgotEmail.trim()) errors.email = 'Vui lòng nhập email!';
    else if (!/\S+@\S+\.\S+/.test(forgotEmail)) errors.email = 'Email không hợp lệ!';
    setForgotErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    try {
      const result = await forgotPasswordAction(forgotEmail);
      if (result.error) {
        setForgotErrors({ form: result.error });
      } else {
        setSuccessMessage(result.message || 'Email đã được gửi, vui lòng kiểm tra hòm thư.');
        setForgotEmail('');
      }
    } catch {
      setForgotErrors({ form: 'Đã xảy ra lỗi, vui lòng thử lại' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerClass = [
    'form-login-transition',
    'w-full max-w-[1200px] h-[60vh] mx-auto rounded-3xl shadow-xl',
    'flex flex-row overflow-hidden relative backdrop-blur-xl bg-white',
    animLogin ? 'animation-login' : '',
    animRegister ? 'animation-register' : '',
    animForgot ? 'animation-forgot' : '',
    animForgotToLogin ? 'animation-forgot-to-login' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className="fixed inset-0 z-50 flex h-screen w-full items-center justify-center px-4 transition-all duration-500"
      style={backgroundStyles[currentView]}
    >
      <div className={containerClass}>
        {/* ── Login View ── */}
        {currentView === 'login' && (
          <>
            <div className="login-section flex flex-1 flex-col items-center justify-center px-6 py-10 md:pl-4">
              <h2 className="mb-5 text-center text-2xl font-bold">Đăng nhập</h2>
              <form onSubmit={handleLogin} className="flex w-[70%] flex-col gap-4">
                {loginErrors.form && (
                  <div className="rounded-lg bg-red-50 p-3 text-center text-sm text-red-600">
                    {loginErrors.form}
                  </div>
                )}
                <FormInput
                  id="login-email"
                  label="Email"
                  type="email"
                  placeholder="Email"
                  autoComplete="email"
                  value={loginEmail}
                  onChange={setLoginEmail}
                  error={loginErrors.email}
                />
                <FormInput
                  id="login-password"
                  label="Mật khẩu"
                  type="password"
                  placeholder="Mật khẩu"
                  autoComplete="current-password"
                  value={loginPassword}
                  onChange={setLoginPassword}
                  error={loginErrors.password}
                />
                <div className="flex items-center justify-between text-sm">
                  <a
                    href="#"
                    className="text-blue-500 hover:underline"
                    onClick={(e) => {
                      e.preventDefault();
                      handleLoginToForgot();
                    }}
                  >
                    Quên mật khẩu?
                  </a>
                  <label className="flex cursor-pointer items-center gap-2 text-gray-600">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="accent-indigo-500"
                    />
                    Ghi nhớ đăng nhập
                  </label>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-lg bg-indigo-500 py-2.5 font-medium text-white transition-colors hover:bg-indigo-600 disabled:opacity-60"
                >
                  {isSubmitting ? 'Đang xử lý...' : 'Đăng nhập'}
                </button>
                <p className="text-center text-sm text-gray-500">
                  Chưa có tài khoản?{' '}
                  <a
                    href="#"
                    className="text-blue-500 hover:underline"
                    onClick={(e) => {
                      e.preventDefault();
                      handleLoginToRegister();
                    }}
                  >
                    Đăng ký
                  </a>
                </p>
              </form>
            </div>
            <SloganSection view="login" />
            <div className="bg-color" />
          </>
        )}

        {/* ── Register View ── */}
        {currentView === 'register' && (
          <>
            <SloganSection right view="register" />
            <div className="register-section flex flex-1 flex-col items-center justify-center px-6 py-10 md:pr-4">
              <h2 className="mb-5 text-center text-2xl font-bold">Đăng ký</h2>
              {successMessage ? (
                <div className="flex w-[70%] flex-col items-center gap-4 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  <p className="text-sm text-gray-600">{successMessage}</p>
                  <button
                    type="button"
                    className="text-sm font-medium text-blue-500 hover:underline"
                    onClick={() => {
                      setSuccessMessage('');
                      handleRegisterToLogin();
                    }}
                  >
                    Đăng nhập ngay
                  </button>
                </div>
              ) : (
              <form onSubmit={handleRegister} className="flex w-[70%] flex-col gap-4">
                {registerErrors.form && (
                  <div className="rounded-lg bg-red-50 p-3 text-center text-sm text-red-600">
                    {registerErrors.form}
                  </div>
                )}
                <FormInput
                  id="register-email"
                  label="Email"
                  type="email"
                  placeholder="Email"
                  autoComplete="email"
                  value={registerEmail}
                  onChange={setRegisterEmail}
                  error={registerErrors.email}
                />
                <FormInput
                  id="register-name"
                  label="Họ và tên"
                  placeholder="Họ và tên"
                  autoComplete="name"
                  value={registerName}
                  onChange={setRegisterName}
                  error={registerErrors.name}
                />
                <FormInput
                  id="register-password"
                  label="Mật khẩu"
                  type="password"
                  placeholder="Mật khẩu"
                  autoComplete="new-password"
                  value={registerPassword}
                  onChange={setRegisterPassword}
                  error={registerErrors.password}
                />
                <FormInput
                  id="register-confirm"
                  label="Xác nhận mật khẩu"
                  type="password"
                  placeholder="Xác nhận mật khẩu"
                  autoComplete="new-password"
                  value={registerConfirm}
                  onChange={setRegisterConfirm}
                  error={registerErrors.confirm}
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-lg bg-pink-500 py-2.5 font-medium text-white transition-colors hover:bg-pink-600 disabled:opacity-60"
                >
                  {isSubmitting ? 'Đang xử lý...' : 'Đăng ký'}
                </button>
                <p className="text-center text-sm text-gray-500">
                  Đã có tài khoản?{' '}
                  <a
                    href="#"
                    className="text-blue-500 hover:underline"
                    onClick={(e) => {
                      e.preventDefault();
                      handleRegisterToLogin();
                    }}
                  >
                    Đăng nhập
                  </a>
                </p>
              </form>
              )}
            </div>
            <div className="bg-color right-section" />
          </>
        )}

        {/* ── Forgot Password View ── */}
        {currentView === 'forgot' && (
          <>
            <SloganSection right view="forgot" />
            <div className="forgot-section flex flex-1 flex-col items-center justify-center px-6 py-10 md:pr-4">
              <h2 className="mb-5 text-center text-2xl font-bold">Quên mật khẩu</h2>
              {successMessage ? (
                <div className="flex w-[70%] flex-col items-center gap-4 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  <p className="text-sm text-gray-600">{successMessage}</p>
                  <button
                    type="button"
                    className="text-sm font-medium text-blue-500 hover:underline"
                    onClick={() => {
                      setSuccessMessage('');
                      handleForgotToLogin();
                    }}
                  >
                    Quay lại đăng nhập
                  </button>
                </div>
              ) : (
              <form onSubmit={handleForgotPassword} className="flex w-[70%] flex-col gap-4">
                {forgotErrors.form && (
                  <div className="rounded-lg bg-red-50 p-3 text-center text-sm text-red-600">
                    {forgotErrors.form}
                  </div>
                )}
                <FormInput
                  id="forgot-email"
                  label="Email"
                  type="email"
                  placeholder="Email"
                  value={forgotEmail}
                  onChange={setForgotEmail}
                  error={forgotErrors.email}
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-lg bg-emerald-500 py-2.5 font-medium text-white transition-colors hover:bg-emerald-600 disabled:opacity-60"
                >
                  {isSubmitting ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                </button>
                <p className="text-center text-sm text-gray-500">
                  <a
                    href="#"
                    className="text-blue-500 hover:underline"
                    onClick={(e) => {
                      e.preventDefault();
                      handleForgotToLogin();
                    }}
                  >
                    ← Quay lại đăng nhập
                  </a>
                </p>
              </form>
              )}
            </div>
            <div className="bg-color right-section" />
          </>
        )}
      </div>
    </div>
  );
}
