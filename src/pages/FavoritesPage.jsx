import React from 'react';
import { useAppData } from '../context/AppDataContext.jsx';
import { FavoritesHistory } from '../components/FavoritesHistory.jsx';
import './pages.css';

export const FavoritesPage = () => {
  const {
    currentUser,
    state: { movies },
  } = useAppData();

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

  return (
    <div className="page-stack">
      <section className="hero-panel hero-panel--compact">
        <h1>Tủ phim cá nhân</h1>
        <p>
          Theo dõi những bộ phim bạn yêu thích và lịch sử xem gần đây. Đừng quên để lại đánh giá cho
          cộng đồng nhé!
        </p>
      </section>
      <FavoritesHistory
        movies={movies}
        favorites={currentUser.favorites || []}
        history={currentUser.history || []}
      />
    </div>
  );
};
