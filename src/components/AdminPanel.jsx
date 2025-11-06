import { useAppData } from '../context/AppDataContext.jsx';
import { ActorManagement } from './ActorManagement.jsx';
import { CommentManagement } from './CommentManagement.jsx';
import { GenreManagement } from './GenreManagement.jsx';
import { MovieManagement } from './MovieManagement.jsx';
import { StatsDisplay } from './StatsDisplay.jsx';
import { UserManagement } from './UserManagement.jsx';
import './panel.css';

export const AdminPanel = () => {
  const {
    currentUser,
    state: { movies, genres, actors, users },
    adminActions,
    stats,
  } = useAppData();

  const isAdmin = currentUser?.role === 'admin';

  if (!isAdmin) {
    return (
      <div className="panel">
        <h3>Khu vực quản trị</h3>
        <p>Vui lòng đăng nhập bằng tài khoản quản trị để tiếp tục.</p>
      </div>
    );
  }

  return (
    <div className="panel">
      <h2>Quản trị hệ thống</h2>
      <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
        Quản lý phim, thể loại, diễn viên, bình luận và người dùng. Dán URL Cloudinary vào các trường Poster/Banner.
      </p>

      <MovieManagement movies={movies} genres={genres} actors={actors} adminActions={adminActions} />
      <GenreManagement genres={genres} adminActions={adminActions} />
      <ActorManagement actors={actors} adminActions={adminActions} />
      <UserManagement users={users} currentUser={currentUser} adminActions={adminActions} />
      <CommentManagement movies={movies} adminActions={adminActions} />
      <StatsDisplay stats={stats} />
    </div>
  );
};
