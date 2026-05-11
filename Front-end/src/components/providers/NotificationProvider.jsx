import { createContext, useContext, useCallback } from 'react';
import { notification, message } from 'antd';

const NotificationContext = createContext(null);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  // Notification API (hiển thị ở góc màn hình)
  const showNotification = useCallback((type, title, description = null) => {
    const config = {
      message: title,
      duration: 3,
      placement: 'topRight',
      showProgress: true,
      pauseOnHover: false,
    };
    
    // Chỉ thêm description nếu có giá trị
    if (description) {
      config.description = description;
    }
    
    notification[type](config);
  }, []);

  // Message API (hiển thị ở giữa màn hình)
  const showMessage = useCallback((type, content) => {
    message[type](content);
  }, []);

  // Các hàm tiện ích - mặc định dùng Notification (góc màn hình)
  const success = useCallback((title, description = null) => {
    showNotification('success', title, description);
  }, [showNotification]);

  const error = useCallback((title, description = null) => {
    showNotification('error', title, description);
  }, [showNotification]);

  const warning = useCallback((title, description = null) => {
    showNotification('warning', title, description);
  }, [showNotification]);

  const info = useCallback((title, description = null) => {
    showNotification('info', title, description);
  }, [showNotification]);

  const value = {
    success,
    error,
    warning,
    info,
    showNotification,
    showMessage,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

