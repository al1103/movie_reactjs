import { useMemo, useState } from 'react';

export const GenreManagement = ({ genres, adminActions }) => {
  const [genreName, setGenreName] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGenres = useMemo(() => {
    if (!searchQuery.trim()) return genres;
    const query = searchQuery.toLowerCase();
    return genres.filter(genre => genre.name.toLowerCase().includes(query));
  }, [genres, searchQuery]);

  const handleGenreSubmit = (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!genreName.trim()) {
      setError('Tên thể loại không được để trống');
      return;
    }

    // Check duplicate
    const duplicate = genres.find(g => g.name.toLowerCase() === genreName.trim().toLowerCase());
    if (duplicate) {
      setError('Thể loại này đã tồn tại');
      return;
    }

    adminActions.upsertGenre({ id: `g${Date.now()}`, name: genreName.trim() });
    setGenreName('');
    setMessage('✓ Đã thêm thể loại thành công');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleGenreUpdate = (genreId) => {
    setError('');
    setMessage('');

    if (!editingName.trim()) {
      setError('Tên thể loại không được để trống');
      return;
    }

    // Check duplicate (excluding current)
    const duplicate = genres.find(g =>
      g.id !== genreId && g.name.toLowerCase() === editingName.trim().toLowerCase()
    );
    if (duplicate) {
      setError('Thể loại này đã tồn tại');
      return;
    }

    adminActions.upsertGenre({ id: genreId, name: editingName.trim() });
    setEditingId(null);
    setEditingName('');
    setMessage('✓ Đã cập nhật thể loại thành công');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleGenreDelete = (genreId) => {
    if (!window.confirm('Bạn có chắc muốn xóa thể loại này?')) return;
    adminActions.deleteGenre(genreId);
    setMessage('✓ Đã xóa thể loại');
    setTimeout(() => setMessage(''), 3000);
  };

  const startEditing = (genre) => {
    setEditingId(genre.id);
    setEditingName(genre.name);
    setError('');
    setMessage('');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingName('');
    setError('');
  };

  return (
    <section className="genre-management-modern">
      {/* Add Genre Form */}
      <div className="genre-add-section">
        <div className="section-header">
          <div className="header-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M7 7h10M7 12h4M7 17h10M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" strokeWidth="2"/>
            </svg>
          </div>
          <div>
            <h3>Thêm thể loại mới</h3>
            <p>Nhập tên thể loại phim để thêm vào hệ thống</p>
          </div>
        </div>

        {message && <div className="alert-success">{message}</div>}
        {error && <div className="alert-error">{error}</div>}

        <form className="genre-form" onSubmit={handleGenreSubmit}>
          <div className="form-group">
            <input
              type="text"
              className="genre-input"
              placeholder="Ví dụ: Action, Drama, Comedy..."
              value={genreName}
              onChange={(event) => setGenreName(event.target.value)}
            />
            <button className="btn-add-genre" type="submit">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 5v14M5 12h14" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Thêm thể loại
            </button>
          </div>
        </form>
      </div>

      {/* Genre List */}
      <div className="genre-list-section">
        <div className="list-header-genres">
          <div className="header-info">
            <h3>Danh sách thể loại</h3>
            <span className="genre-count">{genres.length} thể loại</span>
          </div>
          <div className="search-box-genres">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              placeholder="Tìm kiếm thể loại..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {filteredGenres.length === 0 ? (
          <div className="empty-state-genres">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M7 7h10M7 12h4M7 17h10M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" strokeWidth="2"/>
            </svg>
            <h3>Không tìm thấy thể loại</h3>
            <p>{searchQuery ? `Không có thể loại nào khớp với "${searchQuery}"` : 'Chưa có thể loại nào'}</p>
          </div>
        ) : (
          <div className="genres-grid">
            {filteredGenres.map((genre) => (
              <div key={genre.id} className="genre-card">
                {editingId === genre.id ? (
                  <div className="genre-edit-mode">
                    <input
                      type="text"
                      className="genre-edit-input"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      autoFocus
                    />
                    <div className="edit-actions">
                      <button
                        className="btn-save-edit"
                        onClick={() => handleGenreUpdate(genre.id)}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M20 6L9 17l-5-5" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </button>
                      <button
                        className="btn-cancel-edit"
                        onClick={cancelEditing}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M18 6L6 18M6 6l12 12" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="genre-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M7 7h10M7 12h4M7 17h10" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <div className="genre-info">
                      <h4>{genre.name}</h4>
                      <p className="genre-id">ID: {genre.id}</p>
                    </div>
                    <div className="genre-actions">
                      <button
                        className="btn-edit-genre"
                        onClick={() => startEditing(genre)}
                        title="Chỉnh sửa"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeWidth="2"/>
                        </svg>
                      </button>
                      <button
                        className="btn-delete-genre"
                        onClick={() => handleGenreDelete(genre.id)}
                        title="Xóa"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" strokeWidth="2"/>
                        </svg>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
