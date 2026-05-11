import { useState, useEffect } from 'react';
import { Form } from 'antd';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ForgotPasswordForm from './ForgotPasswordForm';
import './AuthComponent.css';

const AuthComponent = ({ initialView = 'login' }) => {
  // View state: 'login', 'register', 'forgot'
  const [currentView, setCurrentView] = useState(initialView);

  // Cập nhật currentView khi initialView thay đổi (khi navigate bằng URL)
  useEffect(() => {
    setCurrentView(initialView);
  }, [initialView]);

  // Animation states
  const [isAnimationLogin, setIsAnimationLogin] = useState(false);
  const [isAnimationRegister, setIsAnimationRegister] = useState(false);
  const [isAnimationForgot, setIsAnimationForgot] = useState(false);
  const [isAnimationForgotToLogin, setIsAnimationForgotToLogin] = useState(false);

  // Background styles for each view
  const getBackgroundStyle = () => {
    switch (currentView) {
      case 'login':
        return {
          background: "radial-gradient(125% 125% at 50% 10%, #fff 40%, #6366f1 100%)",
        };
      case 'register':
        return {
          background: "radial-gradient(125% 125% at 50% 10%, #ffffff 40%, #ec4899 100%)",
        };
      case 'forgot':
        return {
          background: "radial-gradient(125% 125% at 50% 10%, #ffffff 40%, #10b981 100%)",
        };
      default:
        return {
          background: "radial-gradient(125% 125% at 50% 10%, #fff 40%, #6366f1 100%)",
        };
    }
  };

  // Form states
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();
  const [forgotForm] = Form.useForm();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);



  // Load remembered username
  useEffect(() => {
    const remembered = localStorage.getItem('rememberUsers');
    if (remembered) {
      try {
        const { username } = JSON.parse(remembered);
        if (username) {
          loginForm.setFieldsValue({ email: username });
          setRememberMe(true);
        }
      } catch (e) {
        console.error('Error parsing remembered users:', e);
      }
    }
  }, [loginForm]);


  // Animation handlers
  const handleAnimationLogin = () => {
    setIsAnimationLogin(true);
    setTimeout(() => {
      setCurrentView('register');
      setTimeout(() => {
        setIsAnimationLogin(false);
      }, 500);
    }, 500);
  };

  const handleAnimationRegister = () => {
    setIsAnimationRegister(true);
    setTimeout(() => {
      setCurrentView('login');
      setTimeout(() => {
        setIsAnimationRegister(false);
      }, 500);
    }, 500);
  };

  const handleForgotPasswordClick = () => {
    setIsAnimationForgot(true);
    setTimeout(() => {
      setCurrentView('forgot');
      setTimeout(() => {
        setIsAnimationForgot(false);
      }, 500);
    }, 500);
  };

  const handleBackToLogin = () => {
    setIsAnimationForgotToLogin(true);
    setTimeout(() => {
      setCurrentView('login');
      setTimeout(() => {
        setIsAnimationForgotToLogin(false);
      }, 500);
    }, 500);
  };

  const containerClass = `form-login-transition ${isAnimationLogin ? 'animation-login' : ''} ${isAnimationRegister ? 'animation-register' : ''} ${isAnimationForgot ? 'animation-forgot' : ''} ${isAnimationForgotToLogin ? 'animation-forgot-to-login' : ''}`;

  return (
    <div className="auth" style={getBackgroundStyle()}>
      <div className={containerClass}>
        {/* Login View */}
        {currentView === 'login' && (
          <>
            <LoginForm
              form={loginForm}
              rememberMe={rememberMe}
              setRememberMe={setRememberMe}
              isSubmitting={isSubmitting}
              setIsSubmitting={setIsSubmitting}
              onForgotPasswordClick={handleForgotPasswordClick}
              onRegisterClick={handleAnimationLogin}
            />
            <div className="slogan-section">
              <h3>Chào mừng bạn</h3>
              <p>Hệ thống quản lý áo dài</p>
            </div>
            <div className="bg-color" />
          </>
        )}

        {/* Register View */}
        {currentView === 'register' && (
          <>
            <div className="slogan-section right-section">
              <h3>Chào mừng bạn</h3>
              <p>Hệ thống quản lý áo dài</p>
            </div>
            <RegisterForm
              form={registerForm}
              isSubmitting={isSubmitting}
              setIsSubmitting={setIsSubmitting}
              onLoginClick={handleAnimationRegister}
            />
            <div className="bg-color right-section" />
          </>
        )}

        {/* Forgot Password View */}
        {currentView === 'forgot' && (
          <>
            <div className="slogan-section right-section">
              <h3>Chào mừng bạn</h3>
              <p>Hệ thống quản lý áo dài</p>
            </div>
            <ForgotPasswordForm
              form={forgotForm}
              isSubmitting={isSubmitting}
              setIsSubmitting={setIsSubmitting}
              onBackToLogin={handleBackToLogin}
            />
            <div className="bg-color right-section" />
          </>
        )}
      </div>
    </div>
  );
};

export default AuthComponent;

