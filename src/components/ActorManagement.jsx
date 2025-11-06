import { useMemo, useState } from 'react';

export const ActorManagement = ({ actors, adminActions }) => {
  const [actorForm, setActorForm] = useState({ id: '', name: '', country: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  const filteredActors = useMemo(() => {
    if (!searchQuery.trim()) return actors;
    const query = searchQuery.toLowerCase();
    return actors.filter(actor =>
      actor.name.toLowerCase().includes(query) ||
      actor.country?.toLowerCase().includes(query)
    );
  }, [actors, searchQuery]);

  const handleActorSubmit = (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!actorForm.name.trim()) {
      setError('Tên diễn viên không được để trống');
      return;
    }

    // Check duplicate
    const duplicate = actors.find(a =>
      a.id !== actorForm.id && a.name.toLowerCase() === actorForm.name.trim().toLowerCase()
    );
    if (duplicate) {
      setError('Diễn viên này đã tồn tại');
      return;
    }

    const payload = {
      id: actorForm.id || `a${Date.now()}`,
      name: actorForm.name.trim(),
      country: actorForm.country.trim() || 'N/A',
    };
    adminActions.upsertActor(payload);
    setActorForm({ id: '', name: '', country: '' });
    setMessage(`✓ ${actorForm.id ? 'Đã cập nhật' : 'Đã thêm'} diễn viên thành công`);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleActorDelete = (actorId) => {
    if (!window.confirm('Bạn có chắc muốn xóa diễn viên này?')) return;
    adminActions.deleteActor(actorId);
    setMessage('✓ Đã xóa diễn viên');
    setTimeout(() => setMessage(''), 3000);
  };

  const startEditing = (actor) => {
    setActorForm(actor);
    setError('');
    setMessage('');
  };

  const cancelEditing = () => {
    setActorForm({ id: '', name: '', country: '' });
    setError('');
  };

  return (
    <section className="actor-management-modern">
      {/* View Mode Toggle */}
      <div className="view-mode-toggle">
        <button
          className={`mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
          onClick={() => setViewMode('grid')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M10 3H3v7h7V3zM21 3h-7v7h7V3zM21 14h-7v7h7v-7zM10 14H3v7h7v-7z" strokeWidth="2"/>
          </svg>
          Grid
        </button>
        <button
          className={`mode-btn ${viewMode === 'list' ? 'active' : ''}`}
          onClick={() => setViewMode('list')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          List
        </button>
      </div>

      {/* Add/Edit Actor Form */}
      <div className="actor-add-section">
        <div className="section-header">
          <div className="header-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75M13 7a4 4 0 11-8 0 4 4 0 018 0z" strokeWidth="2"/>
            </svg>
          </div>
          <div>
            <h3>{actorForm.id ? 'Chỉnh sửa diễn viên' : 'Thêm diễn viên mới'}</h3>
            <p>Nhập thông tin diễn viên để {actorForm.id ? 'cập nhật' : 'thêm vào'} hệ thống</p>
          </div>
        </div>

        {message && <div className="alert-success">{message}</div>}
        {error && <div className="alert-error">{error}</div>}

        <form className="actor-form" onSubmit={handleActorSubmit}>
          <div className="form-row-actors">
            <div className="form-field">
              <label>Tên diễn viên</label>
              <input
                type="text"
                className="actor-input"
                placeholder="Ví dụ: Tom Hanks, Scarlett Johansson..."
                value={actorForm.name}
                onChange={(event) => setActorForm((prev) => ({ ...prev, name: event.target.value }))}
                required
              />
            </div>
            <div className="form-field">
              <label>Quốc gia</label>
              <input
                type="text"
                className="actor-input"
                placeholder="Ví dụ: USA, Korea, Vietnam..."
                value={actorForm.country}
                onChange={(event) => setActorForm((prev) => ({ ...prev, country: event.target.value }))}
              />
            </div>
          </div>
          <div className="form-actions-actors">
            <button className="btn-save-actor" type="submit">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" strokeWidth="2"/>
                <path d="M17 21v-8H7v8M7 3v5h8" strokeWidth="2"/>
              </svg>
              {actorForm.id ? 'Cập nhật' : 'Thêm diễn viên'}
            </button>
            {actorForm.id && (
              <button
                type="button"
                className="btn-cancel-actor"
                onClick={cancelEditing}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M18 6L6 18M6 6l12 12" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Hủy
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Actor List */}
      <div className="actor-list-section">
        <div className="list-header-actors">
          <div className="header-info">
            <h3>Danh sách diễn viên</h3>
            <span className="actor-count">{actors.length} diễn viên</span>
          </div>
          <div className="search-box-actors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              placeholder="Tìm kiếm diễn viên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {filteredActors.length === 0 ? (
          <div className="empty-state-actors">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100-8 4 4 0 000 8z" strokeWidth="2"/>
            </svg>
            <h3>Không tìm thấy diễn viên</h3>
            <p>{searchQuery ? `Không có diễn viên nào khớp với "${searchQuery}"` : 'Chưa có diễn viên nào'}</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'actors-grid' : 'actors-list'}>
            {filteredActors.map((actor) => (
              <div key={actor.id} className="actor-card">
                <div className="actor-avatar">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" strokeWidth="2"/>
                  </svg>
                </div>
                <div className="actor-info">
                  <h4>{actor.name}</h4>
                  <p className="actor-country">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z" strokeWidth="2"/>
                    </svg>
                    {actor.country || 'N/A'}
                  </p>
                  <p className="actor-id">ID: {actor.id}</p>
                </div>
                <div className="actor-actions">
                  <button
                    className="btn-edit-actor"
                    onClick={() => startEditing(actor)}
                    title="Chỉnh sửa"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeWidth="2"/>
                    </svg>
                  </button>
                  <button
                    className="btn-delete-actor"
                    onClick={() => handleActorDelete(actor.id)}
                    title="Xóa"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" strokeWidth="2"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
