import React from 'react';
import { AdminPanel } from '../components/AdminPanel.jsx';
import './pages.css';

export const AdminPage = () => {
  return (
    <div className="page-stack">
      <section className="hero-panel hero-panel--compact">
        <h1>Trung tâm quản trị</h1>
        <p>
          Quản lý kho phim, thể loại, diễn viên và cộng đồng người dùng. Mọi thay đổi được đồng bộ
          tức thời đến toàn bộ ứng dụng.
        </p>
      </section>
      <AdminPanel />
    </div>
  );
};
