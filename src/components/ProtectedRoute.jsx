import { Navigate } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext.jsx';

export const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { currentUser } = useAppData();

  // Nếu chưa đăng nhập, redirect đến login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Nếu yêu cầu role cụ thể mà không đủ quyền
  if (requiredRole && currentUser.role !== requiredRole) {
    return (
      <div className="page-stack">
        <section className="hero-panel hero-panel--compact">
          <h1>Truy cập bị từ chối</h1>
          <p>Bạn không có quyền truy cập trang này. Chỉ {requiredRole}s mới có thể vào.</p>
        </section>
        <div className="panel page-empty">
          <strong>Quyền không đủ</strong>
          <span>Liên hệ quản trị viên nếu bạn cần hỗ trợ.</span>
        </div>
      </div>
    );
  }

  return children;
};
