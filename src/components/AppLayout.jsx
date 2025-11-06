import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext.jsx';
import { AuthPanel } from './AuthPanel.jsx';
import './layout.css';
import './panel.css';

const navLinkClass = ({ isActive }) =>
  isActive ? 'app-nav-link app-nav-link--active' : 'app-nav-link';

export const AppLayout = ({ children }) => {
  const { currentUser, stats } = useAppData();

  return (
    <div className="app-shell">
      <div className="app-background" />
      <header className="app-header">
        <div className="app-brand">
          <span role="img" aria-label="Projector">
            🎬
          </span>
          <div>
            <strong>CineVerse</strong>
            <small>Kho phim tương tác</small>
          </div>
        </div>
        <nav className="app-nav">
          <NavLink to="/" end className={navLinkClass}>
            Khám phá
          </NavLink>
          {currentUser && (
            <NavLink to="/favorites" className={navLinkClass}>
              Bộ sưu tập
            </NavLink>
          )}
          {currentUser?.role === 'admin' && (
            <NavLink to="/admin" className={navLinkClass}>
              Quản trị
            </NavLink>
          )}
        </nav>
      </header>

      <main className="app-main">
        <div className="app-grid">
          <aside className="app-sidebar">
            <AuthPanel />
            <div className="panel app-stats">
              <h3>Tổng quan</h3>
              <div className="stats-grid">
                <div className="stat-card">
                  <span className="stat-label">Phim</span>
                  <span className="stat-value">{stats.totalMovies}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Người dùng</span>
                  <span className="stat-value">{stats.totalUsers}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Lượt xem</span>
                  <span className="stat-value">
                    {stats.totalViews.toLocaleString('vi-VN')}
                  </span>
                </div>
              </div>
            </div>
          </aside>
          <section className="app-content">{children}</section>
        </div>
      </main>

      <footer className="app-footer">
        <span>CineVerse © {new Date().getFullYear()}</span>
        <span>Khám phá điện ảnh - Kết nối cảm xúc</span>
      </footer>
    </div>
  );
};
