import React, { useMemo, useState } from 'react';
import { useAppData } from '../context/AppDataContext.jsx';
import './panel.css';

const emptyMovieForm = {
  id: '',
  title: '',
  description: '',
  year: new Date().getFullYear(),
  country: '',
  duration: 120,
  genres: [],
  director: '',
  cast: [],
  poster: '',
  banner: '',
  trailer: '',
  episodes: '',
};

export const AdminPanel = () => {
  const {
    currentUser,
    state: { movies, genres, actors, users },
    adminActions,
    stats,
  } = useAppData();
  const [movieForm, setMovieForm] = useState(emptyMovieForm);
  const [selectedMovieId, setSelectedMovieId] = useState('');
  const [genreName, setGenreName] = useState('');
  const [actorForm, setActorForm] = useState({ id: '', name: '', country: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const isAdmin = currentUser?.role === 'admin';

  const movieOptions = useMemo(
    () => movies.map((movie) => ({ value: movie.id, label: movie.title })),
    [movies]
  );

  const allComments = useMemo(
    () =>
      movies.flatMap((movie) =>
        movie.comments.map((comment) => ({
          ...comment,
          movie,
        }))
      ),
    [movies]
  );

  const handleMovieSelect = (movieId) => {
    setSelectedMovieId(movieId);
    if (!movieId) {
      setMovieForm(emptyMovieForm);
      return;
    }
    const movie = movies.find((item) => item.id === movieId);
    if (!movie) return;
    setMovieForm({
      ...movie,
      episodes: (movie.episodes || [])
        .map((episode) => `${episode.title}|${episode.duration}`)
        .join('\n'),
    });
  };

  const handleMovieFormChange = (event) => {
    const { name, value } = event.target;
    if (name === 'genres' || name === 'cast') {
      const options = Array.from(event.target.selectedOptions).map((option) => option.value);
      setMovieForm((prev) => ({ ...prev, [name]: options }));
    } else {
      setMovieForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const parseEpisodes = (value) =>
    value
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line, index) => {
        const [title, duration] = line.split('|').map((item) => item.trim());
        return {
          id: `${movieForm.id || `temp-${Date.now()}`}-ep-${index}`,
          title,
          duration: Number(duration) || 0,
        };
      });

  const handleMovieSubmit = (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    if (!movieForm.title.trim()) {
      setError('Tên phim không được để trống');
      return;
    }
    if (!movieForm.genres.length) {
      setError('Vui lòng chọn ít nhất một thể loại');
      return;
    }
    const payload = {
      ...movieForm,
      year: Number(movieForm.year),
      duration: Number(movieForm.duration),
      episodes: parseEpisodes(movieForm.episodes),
      ratings: movieForm.ratings || [],
      comments: movieForm.comments || [],
      views: movieForm.views || 0,
    };
    if (!payload.id) {
      payload.id = `m${Date.now()}`;
    }
    adminActions.upsertMovie(payload);
    setMessage('Đã lưu phim thành công');
    setSelectedMovieId(payload.id);
  };

  const handleMovieDelete = (movieId) => {
    if (!window.confirm('Xóa phim này?')) return;
    adminActions.deleteMovie(movieId);
    setSelectedMovieId('');
    setMovieForm(emptyMovieForm);
    setMessage('Đã xóa phim');
  };

  const handleGenreSubmit = (event) => {
    event.preventDefault();
    if (!genreName.trim()) return;
    adminActions.upsertGenre({ id: `g${Date.now()}`, name: genreName.trim() });
    setGenreName('');
    setMessage('Đã thêm thể loại');
  };

  const handleGenreDelete = (genreId) => {
    if (!window.confirm('Xóa thể loại này?')) return;
    adminActions.deleteGenre(genreId);
    setMessage('Đã xóa thể loại');
  };

  const handleActorSubmit = (event) => {
    event.preventDefault();
    if (!actorForm.name.trim()) return;
    const payload = {
      id: actorForm.id || `a${Date.now()}`,
      name: actorForm.name,
      country: actorForm.country,
    };
    adminActions.upsertActor(payload);
    setActorForm({ id: '', name: '', country: '' });
    setMessage('Đã lưu diễn viên');
  };

  const handleActorDelete = (actorId) => {
    if (!window.confirm('Xóa diễn viên này?')) return;
    adminActions.deleteActor(actorId);
    setMessage('Đã xóa diễn viên');
  };

  const toggleCommentVisibility = (movieId, commentId, hidden) => {
    adminActions.setCommentVisibility(movieId, commentId, hidden);
    setMessage('Đã cập nhật bình luận');
  };

  const removeComment = (movieId, commentId) => {
    if (!window.confirm('Xóa bình luận này?')) return;
    adminActions.deleteComment(movieId, commentId);
    setMessage('Đã xóa bình luận');
  };

  const handleRoleChange = (userId, role) => {
    adminActions.updateUserRole(userId, role);
    setMessage('Đã cập nhật vai trò');
  };

  const handleUserDelete = (userId) => {
    if (!window.confirm('Xóa người dùng này?')) return;
    adminActions.deleteUser(userId);
    setMessage('Đã xóa người dùng');
  };

  if (!isAdmin) {
    return (
      <div className="panel" style={{ marginTop: '1.5rem' }}>
        <h3>Khu vực quản trị</h3>
        <p>Vui lòng đăng nhập bằng tài khoản quản trị để tiếp tục.</p>
      </div>
    );
  }

  return (
    <div className="panel" style={{ marginTop: '1.5rem' }}>
      <h2>Quản trị hệ thống</h2>
      <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
        Quản lý phim, thể loại, diễn viên, bình luận và người dùng. Dán URL Cloudinary vào các trường Poster/Banner.
      </p>
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}

      <section style={{ marginTop: '1.5rem' }}>
        <h3>Phim</h3>
        <label style={{ display: 'block', marginBottom: '0.5rem' }}>
          Chọn phim để chỉnh sửa
          <select value={selectedMovieId} onChange={(event) => handleMovieSelect(event.target.value)}>
            <option value="">-- Phim mới --</option>
            {movieOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <form className="panel-form" onSubmit={handleMovieSubmit}>
          <label>
            Tên phim
            <input name="title" value={movieForm.title} onChange={handleMovieFormChange} required />
          </label>
          <label>
            Mô tả
            <textarea
              name="description"
              rows="4"
              value={movieForm.description}
              onChange={handleMovieFormChange}
            />
          </label>
          <div className="filters-grid">
            <label>
              Năm
              <input name="year" type="number" value={movieForm.year} onChange={handleMovieFormChange} />
            </label>
            <label>
              Quốc gia
              <input name="country" value={movieForm.country} onChange={handleMovieFormChange} />
            </label>
            <label>
              Độ dài (phút)
              <input
                name="duration"
                type="number"
                value={movieForm.duration}
                onChange={handleMovieFormChange}
              />
            </label>
          </div>
          <label>
            Đạo diễn
            <input name="director" value={movieForm.director} onChange={handleMovieFormChange} />
          </label>
          <label>
            Thể loại
            <select
              name="genres"
              multiple
              value={movieForm.genres}
              onChange={handleMovieFormChange}
              size={Math.min(6, Math.max(genres.length, 3))}
            >
              {genres.map((genre) => (
                <option key={genre.id} value={genre.id}>
                  {genre.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Diễn viên
            <select
              name="cast"
              multiple
              value={movieForm.cast}
              onChange={handleMovieFormChange}
              size={Math.min(6, Math.max(actors.length, 3))}
            >
              {actors.map((actor) => (
                <option key={actor.id} value={actor.id}>
                  {actor.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Poster (URL Cloudinary)
            <input name="poster" value={movieForm.poster} onChange={handleMovieFormChange} />
          </label>
          <label>
            Banner (URL Cloudinary)
            <input name="banner" value={movieForm.banner} onChange={handleMovieFormChange} />
          </label>
          <label>
            Trailer (URL YouTube)
            <input name="trailer" value={movieForm.trailer} onChange={handleMovieFormChange} />
          </label>
          <label>
            Danh sách tập (mỗi dòng: Tiêu đề|Số phút)
            <textarea
              name="episodes"
              rows="4"
              value={movieForm.episodes}
              onChange={handleMovieFormChange}
              placeholder="Tập 1|45\nTập 2|45"
            />
          </label>
          <div className="actions-row">
            <button className="primary" type="submit">
              Lưu phim
            </button>
            {selectedMovieId && (
              <button
                type="button"
                className="primary"
                onClick={() => handleMovieDelete(selectedMovieId)}
                style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}
              >
                Xóa phim
              </button>
            )}
          </div>
        </form>
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h3>Thể loại</h3>
        <form className="panel-form" onSubmit={handleGenreSubmit}>
          <label>
            Tên thể loại mới
            <input value={genreName} onChange={(event) => setGenreName(event.target.value)} />
          </label>
          <button className="primary" type="submit">
            Thêm thể loại
          </button>
        </form>
        <ul>
          {genres.map((genre) => (
            <li key={genre.id} style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
              <span>{genre.name}</span>
              <button
                className="primary"
                style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}
                onClick={() => handleGenreDelete(genre.id)}
              >
                Xóa
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h3>Diễn viên</h3>
        <form className="panel-form" onSubmit={handleActorSubmit}>
          <label>
            Tên diễn viên
            <input
              value={actorForm.name}
              onChange={(event) => setActorForm((prev) => ({ ...prev, name: event.target.value }))}
              required
            />
          </label>
          <label>
            Quốc gia
            <input
              value={actorForm.country}
              onChange={(event) => setActorForm((prev) => ({ ...prev, country: event.target.value }))}
            />
          </label>
          <button className="primary" type="submit">
            Lưu diễn viên
          </button>
        </form>
        <ul>
          {actors.map((actor) => (
            <li key={actor.id} style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
              <span>
                {actor.name} ({actor.country})
              </span>
              <div className="actions-row">
                <button
                  className="primary"
                  onClick={() => setActorForm(actor)}
                  style={{ background: 'linear-gradient(135deg, #22d3ee, #6366f1)' }}
                >
                  Sửa
                </button>
                <button
                  className="primary"
                  style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}
                  onClick={() => handleActorDelete(actor.id)}
                >
                  Xóa
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h3>Người dùng</h3>
        <div className="panel-form">
          {users.map((user) => (
            <div
              key={user.id}
              style={{
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
                paddingBottom: '0.5rem',
              }}
            >
              <div>
                <strong>{user.name}</strong> ({user.email})
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Vai trò: {user.role}</div>
              </div>
              <div className="actions-row">
                <select
                  value={user.role}
                  onChange={(event) => handleRoleChange(user.id, event.target.value)}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                {user.id !== currentUser.id && (
                  <button
                    className="primary"
                    style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}
                    onClick={() => handleUserDelete(user.id)}
                  >
                    Xóa
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h3>Bình luận</h3>
        <div className="comment-list">
          {!allComments.length && <p>Chưa có bình luận nào.</p>}
          {allComments.map((item) => (
            <div className="comment-item" key={item.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <strong>{item.userName}</strong> - <span>{item.movie.title}</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  {new Date(item.createdAt).toLocaleString('vi-VN')}
                </span>
              </div>
              {item.hidden ? (
                <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>Đang bị ẩn</p>
              ) : (
                <p>{item.text}</p>
              )}
              <div className="actions-row">
                <button
                  className="primary"
                  onClick={() => toggleCommentVisibility(item.movie.id, item.id, !item.hidden)}
                  style={{ background: 'linear-gradient(135deg, #22c55e, #10b981)' }}
                >
                  {item.hidden ? 'Bỏ ẩn' : 'Ẩn'}
                </button>
                <button
                  className="primary"
                  style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}
                  onClick={() => removeComment(item.movie.id, item.id)}
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h3>Thống kê</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">Tổng phim</span>
            <span className="stat-value">{stats.totalMovies}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Tổng người dùng</span>
            <span className="stat-value">{stats.totalUsers}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Tổng lượt xem</span>
            <span className="stat-value">{stats.totalViews.toLocaleString('vi-VN')}</span>
          </div>
        </div>
        <div style={{ marginTop: '1rem' }}>
          <h4>Top phim theo lượt xem</h4>
          <ol>
            {stats.topMovies.map((movie) => (
              <li key={movie.id}>
                {movie.title} - {movie.views.toLocaleString('vi-VN')} lượt xem
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
};
