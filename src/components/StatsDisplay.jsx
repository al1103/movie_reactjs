export const StatsDisplay = ({ stats }) => {
  return (
    <section className="stats-display-modern">
      {/* Main Stats Cards */}
      <div className="stats-cards-grid">
        <div className="main-stat-card movies-stat">
          <div className="stat-icon-large">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M7 4v16M17 4v16M3 8h4M17 8h4M3 12h18M3 16h4M17 16h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-label-modern">Tổng Phim</span>
            <span className="stat-value-modern">{stats.totalMovies}</span>
            <span className="stat-description">Phim trong thư viện</span>
          </div>
        </div>

        <div className="main-stat-card users-stat">
          <div className="stat-icon-large">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75M13 7a4 4 0 11-8 0 4 4 0 018 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-label-modern">Người Dùng</span>
            <span className="stat-value-modern">{stats.totalUsers}</span>
            <span className="stat-description">Tài khoản đã đăng ký</span>
          </div>
        </div>

        <div className="main-stat-card views-stat">
          <div className="stat-icon-large">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="12" r="3" strokeWidth="2"/>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-label-modern">Tổng Lượt Xem</span>
            <span className="stat-value-modern">{stats.totalViews.toLocaleString('vi-VN')}</span>
            <span className="stat-description">Lượt xem toàn hệ thống</span>
          </div>
        </div>
      </div>

      {/* Top Movies Section */}
      <div className="top-movies-section">
        <div className="section-header-stats">
          <div className="header-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="header-text">
            <h3>Top Phim Xem Nhiều Nhất</h3>
            <p>Danh sách phim được yêu thích nhất theo lượt xem</p>
          </div>
        </div>

        {stats.topMovies && stats.topMovies.length > 0 ? (
          <div className="top-movies-list">
            {stats.topMovies.map((movie, index) => (
              <div key={movie.id} className="top-movie-item">
                <div className="movie-rank">
                  <span className={`rank-number rank-${index + 1}`}>#{index + 1}</span>
                </div>
                <div className="movie-info-stats">
                  <div className="movie-title-stats">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M7 4v16M17 4v16M3 8h4M17 8h4M3 12h18M3 16h4M17 16h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" strokeWidth="2"/>
                    </svg>
                    <h4>{movie.title}</h4>
                  </div>
                  <div className="movie-views-stats">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeWidth="2"/>
                      <circle cx="12" cy="12" r="3" strokeWidth="2"/>
                    </svg>
                    <span>{movie.views.toLocaleString('vi-VN')} lượt xem</span>
                  </div>
                </div>
                <div className="movie-progress">
                  <div
                    className="progress-bar"
                    style={{
                      width: `${Math.min((movie.views / stats.topMovies[0].views) * 100, 100)}%`
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state-stats">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M7 4v16M17 4v16M3 8h4M17 8h4M3 12h18M3 16h4M17 16h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" strokeWidth="2"/>
            </svg>
            <p>Chưa có dữ liệu thống kê</p>
          </div>
        )}
      </div>
    </section>
  );
};
