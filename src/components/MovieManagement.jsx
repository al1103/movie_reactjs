import { useMemo, useState } from 'react';

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

export const MovieManagement = ({ movies, genres, actors, adminActions }) => {
  const [movieForm, setMovieForm] = useState(emptyMovieForm);
  const [selectedMovieId, setSelectedMovieId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('form'); // 'form' or 'list'

  const movieOptions = useMemo(
    () => movies.map((movie) => ({ value: movie.id, label: movie.title })),
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

  const filteredMovies = useMemo(() => {
    if (!searchQuery.trim()) return movies;
    const query = searchQuery.toLowerCase();
    return movies.filter(movie =>
      movie.title.toLowerCase().includes(query) ||
      movie.director.toLowerCase().includes(query) ||
      movie.country.toLowerCase().includes(query)
    );
  }, [movies, searchQuery]);

  return (
    <section className="movie-management-modern">
      {/* View Mode Toggle */}
      <div className="view-mode-toggle">
        <button
          className={`mode-btn ${viewMode === 'list' ? 'active' : ''}`}
          onClick={() => setViewMode('list')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Danh sách
        </button>
        <button
          className={`mode-btn ${viewMode === 'form' ? 'active' : ''}`}
          onClick={() => setViewMode('form')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Form
        </button>
      </div>

      {viewMode === 'list' ? (
        /* List View */
        <div className="movies-list-view">
          <div className="list-header">
            <div className="search-box-admin">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                placeholder="Tìm kiếm phim..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="btn-add-new" onClick={() => {
              setViewMode('form');
              setSelectedMovieId('');
              setMovieForm(emptyMovieForm);
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 5v14M5 12h14" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Thêm phim mới
            </button>
          </div>

          <div className="movies-grid-admin">
            {filteredMovies.length === 0 ? (
              <div className="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" strokeWidth="2"/>
                </svg>
                <h3>Không tìm thấy phim</h3>
                <p>Thử tìm ki���m với từ khóa khác</p>
              </div>
            ) : (
              filteredMovies.map((movie) => (
                <div key={movie.id} className="movie-card-admin">
                  <div className="movie-poster-admin">
                    <img src={movie.poster} alt={movie.title} />
                    <div className="movie-overlay">
                      <button
                        className="btn-edit"
                        onClick={() => {
                          setViewMode('form');
                          handleMovieSelect(movie.id);
                        }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeWidth="2"/>
                        </svg>
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleMovieDelete(movie.id)}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" strokeWidth="2"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="movie-info-admin">
                    <h4>{movie.title}</h4>
                    <div className="movie-meta-admin">
                      <span>★ {movie.rating?.toFixed(1) || 'N/A'}</span>
                      <span>{movie.year}</span>
                      <span>{movie.duration} phút</span>
                    </div>
                    <div className="movie-stats">
                      <span>👁 {movie.views || 0}</span>
                      <span>💬 {movie.comments?.length || 0}</span>
                      <span>⭐ {movie.ratings?.length || 0}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* Form View */
        <div className="movie-form-view">
          <div className="form-header-admin">
            <h3>{selectedMovieId ? 'Chỉnh sửa phim' : 'Thêm phim mới'}</h3>
            <select
              className="movie-selector"
              value={selectedMovieId}
              onChange={(event) => handleMovieSelect(event.target.value)}
            >
              <option value="">-- Phim mới --</option>
              {movieOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {message && <div className="alert-success">{message}</div>}
          {error && <div className="alert-error">{error}</div>}

          <form className="admin-form-modern" onSubmit={handleMovieSubmit}>
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
            <div className="form-actions-admin">
              <button className="btn-save" type="submit">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" strokeWidth="2"/>
                  <path d="M17 21v-8H7v8M7 3v5h8" strokeWidth="2"/>
                </svg>
                Lưu phim
              </button>
              {selectedMovieId && (
                <button
                  type="button"
                  className="btn-delete-admin"
                  onClick={() => handleMovieDelete(selectedMovieId)}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" strokeWidth="2"/>
                  </svg>
                  Xóa phim
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </section>
  );
};
