import { useMemo, useState } from 'react';

export const CommentManagement = ({ movies, adminActions }) => {
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'visible', 'hidden'
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest'

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

  const filteredComments = useMemo(() => {
    let filtered = allComments;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(comment =>
        comment.text?.toLowerCase().includes(query) ||
        comment.userName?.toLowerCase().includes(query) ||
        comment.movie?.title?.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (filterStatus === 'visible') {
      filtered = filtered.filter(c => !c.hidden);
    } else if (filterStatus === 'hidden') {
      filtered = filtered.filter(c => c.hidden);
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
    });

    return filtered;
  }, [allComments, searchQuery, filterStatus, sortBy]);

  const stats = useMemo(() => {
    return {
      total: allComments.length,
      visible: allComments.filter(c => !c.hidden).length,
      hidden: allComments.filter(c => c.hidden).length,
    };
  }, [allComments]);

  const toggleCommentVisibility = (movieId, commentId, hidden) => {
    adminActions.setCommentVisibility(movieId, commentId, hidden);
    setMessage(`✓ Đã ${hidden ? 'ẩn' : 'hiển thị'} bình luận`);
    setTimeout(() => setMessage(''), 3000);
  };

  const removeComment = (movieId, commentId) => {
    if (!window.confirm('Bạn có chắc muốn xóa bình luận này?')) return;
    adminActions.deleteComment(movieId, commentId);
    setMessage('✓ Đã xóa bình luận');
    setTimeout(() => setMessage(''), 3000);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <section className="comment-management-modern">
      {/* Stats Cards */}
      <div className="comment-stats-grid">
        <div className="stat-card comment-total">
          <div className="stat-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" strokeWidth="2"/>
            </svg>
          </div>
          <div className="stat-info">
            <h3>{stats.total}</h3>
            <p>Tổng bình luận</p>
          </div>
        </div>
        <div className="stat-card comment-visible">
          <div className="stat-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeWidth="2"/>
              <circle cx="12" cy="12" r="3" strokeWidth="2"/>
            </svg>
          </div>
          <div className="stat-info">
            <h3>{stats.visible}</h3>
            <p>Đang hiển thị</p>
          </div>
        </div>
        <div className="stat-card comment-hidden">
          <div className="stat-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" strokeWidth="2"/>
            </svg>
          </div>
          <div className="stat-info">
            <h3>{stats.hidden}</h3>
            <p>Đã ẩn</p>
          </div>
        </div>
      </div>

      {message && <div className="alert-success">{message}</div>}

      {/* Comment List Section */}
      <div className="comment-list-section">
        <div className="list-header-comments">
          <h3>Danh sách bình luận</h3>
          <div className="header-controls-comments">
            <div className="search-box-comments">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                placeholder="Tìm kiếm bình luận..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="filter-status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Tất cả</option>
              <option value="visible">Đang hiển thị</option>
              <option value="hidden">Đã ẩn</option>
            </select>
            <select
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
            </select>
          </div>
        </div>

        {filteredComments.length === 0 ? (
          <div className="empty-state-comments">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" strokeWidth="2"/>
            </svg>
            <h3>Không tìm thấy bình luận</h3>
            <p>{searchQuery ? `Không có bình luận nào khớp với "${searchQuery}"` : 'Chưa có bình luận nào'}</p>
          </div>
        ) : (
          <div className="comments-grid">
            {filteredComments.map((item) => (
              <div key={item.id} className={`comment-card-admin ${item.hidden ? 'hidden-comment' : ''}`}>
                <div className="comment-header-admin">
                  <div className="comment-user-info">
                    <div className="user-avatar-comment">
                      {item.userName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="user-details">
                      <h4>{item.userName || 'Unknown'}</h4>
                      <span className="comment-date">{formatDate(item.createdAt)}</span>
                    </div>
                  </div>
                  {item.hidden && (
                    <span className="hidden-badge">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" strokeWidth="2"/>
                      </svg>
                      Đã ẩn
                    </span>
                  )}
                </div>

                <div className="comment-movie-info">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M7 4v16M17 4v16M3 8h4M17 8h4M3 12h18M3 16h4M17 16h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" strokeWidth="2"/>
                  </svg>
                  <span>{item.movie?.title || 'Unknown Movie'}</span>
                </div>

                <div className={`comment-text-admin ${item.hidden ? 'hidden-text' : ''}`}>
                  {item.hidden ? (
                    <em>Bình luận này đang bị ẩn</em>
                  ) : (
                    <p>{item.text}</p>
                  )}
                </div>

                <div className="comment-actions-admin">
                  <button
                    className={`btn-toggle-visibility ${item.hidden ? 'show' : 'hide'}`}
                    onClick={() => toggleCommentVisibility(item.movie.id, item.id, !item.hidden)}
                  >
                    {item.hidden ? (
                      <>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeWidth="2"/>
                          <circle cx="12" cy="12" r="3" strokeWidth="2"/>
                        </svg>
                        Hiển thị
                      </>
                    ) : (
                      <>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" strokeWidth="2"/>
                        </svg>
                        Ẩn
                      </>
                    )}
                  </button>
                  <button
                    className="btn-delete-comment"
                    onClick={() => removeComment(item.movie.id, item.id)}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" strokeWidth="2"/>
                    </svg>
                    Xóa
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
