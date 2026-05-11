import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../components/stores/useAuthStore';

/**
 * PrivateRoute - Component bảo vệ các route cần xác thực
 * Nếu user chưa đăng nhập, sẽ redirect về trang /auth
 * Nếu đã đăng nhập, sẽ render children hoặc Outlet
 */
export function PrivateRoute({ children }) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const location = useLocation();


  // Kiểm tra xem user đã đăng nhập chưa
  if (!accessToken) {
    console.log('No accessToken, redirecting to /auth');
    // Redirect về trang auth, lưu lại location hiện tại để sau khi login có thể quay lại
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Nếu đã đăng nhập, render children hoặc Outlet (cho nested routes)
  return children ? children : <Outlet />;
}

/**
 * PublicRoute - Component cho các route công khai (login, register, etc.)
 * Nếu user đã đăng nhập, sẽ redirect về dashboard
 * Nếu chưa đăng nhập, sẽ render children hoặc Outlet
 */
export function PublicRoute({ children }) {
  const accessToken = useAuthStore((state) => state.accessToken);


  if (accessToken) {
    console.log('AccessToken found in PublicRoute, redirecting to /dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  return children ? children : <Outlet />;
}