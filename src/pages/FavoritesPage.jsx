import { Navigate } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext.jsx';
import './pages.css';

export const FavoritesPage = () => {
  const { currentUser } = useAppData();

  if (!currentUser) {
    return (
      <div className="page-stack">
        <section className="hero-panel hero-panel--compact">
          <h1>Đăng nhập để lưu bộ sưu tập</h1>
          <p>
            Tạo tài khoản hoặc đăng nhập để đánh dấu phim yêu thích và xem lại lịch sử theo dõi của
            bạn.
          </p>
        </section>
        <div className="panel page-empty">
          <strong>Chưa có nội dung</strong>
          <span>Hãy đăng nhập ở khung bên trái để bắt đầu xây dựng tủ phim cá nhân.</span>
        </div>
      </div>
    );
  }

  // Redirect to new favorites page
  return <Navigate to="/my-favorites" replace />;
};
