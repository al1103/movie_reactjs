import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MovieManagement } from '../components/MovieManagement.jsx';
import { MovieUpload } from '../components/MovieUpload.jsx';
import { useAppData } from '../context/AppDataContext.jsx';
import { AdminHeader } from '../components/AdminHeader.jsx';
import './pages-modern.css';

export const AdminMoviesPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('list'); // list, upload
  const {
    state: { movies, genres, actors },
    currentUser,
    adminActions,
    logout,
  } = useAppData();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div className="MOIVE-home">
      {/* Header */}
      <AdminHeader scrolled={true} />

      {/* Content */}
      <div className="admin-content">
        <div className="admin-hero">
          <h1>Quản lý Phim</h1>
          <p>Thêm, sửa hoặc xóa phim trong hệ thống. Quản lý danh sách tập, hình ảnh và thông tin chi tiết.</p>
        </div>


        <div className="admin-panel">
          {activeTab === 'list' && (
            <MovieManagement movies={movies} genres={genres} actors={actors} adminActions={adminActions} />
          )}
          {activeTab === 'upload' && (
            <MovieUpload />
          )}
        </div>
      </div>
    </div>
  );
};
