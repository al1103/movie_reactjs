import { useMemo, useState } from 'react';

export const UserManagement = ({ users, currentUser, adminActions }) => {
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all'); // 'all', 'admin', 'user'

  const filteredUsers = useMemo(() => {
    let filtered = users;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.username?.toLowerCase().includes(query)
      );
    }

    // Filter by role
    if (filterRole !== 'all') {
      filtered = filtered.filter(user => user.role === filterRole);
    }

    return filtered;
  }, [users, searchQuery, filterRole]);

  const stats = useMemo(() => {
    return {
      total: users.length,
      admins: users.filter(u => u.role === 'admin').length,
      users: users.filter(u => u.role === 'user').length,
    };
  }, [users]);

  const handleRoleChange = (userId, role) => {
    if (userId === currentUser.id && role !== 'admin') {
      alert('Bạn không thể thay đổi vai trò của chính mình!');
      return;
    }
    adminActions.updateUserRole(userId, role);
    setMessage('✓ Đã cập nhật vai trò thành công');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleUserDelete = (userId) => {
    if (userId === currentUser.id) {
      alert('Bạn không thể xóa tài khoản của chính mình!');
      return;
    }
    if (!window.confirm('Bạn có chắc muốn xóa người dùng này?')) return;
    adminActions.deleteUser(userId);
    setMessage('✓ Đã xóa người dùng');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <section className="user-management-modern">
      {/* Stats Cards */}
      <div className="user-stats-grid">
        <div className="stat-card total">
          <div className="stat-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75M13 7a4 4 0 11-8 0 4 4 0 018 0z" strokeWidth="2"/>
            </svg>
          </div>
          <div className="stat-info">
            <h3>{stats.total}</h3>
            <p>Tổng người dùng</p>
          </div>
        </div>
        <div className="stat-card admins">
          <div className="stat-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeWidth="2"/>
            </svg>
          </div>
          <div className="stat-info">
            <h3>{stats.admins}</h3>
            <p>Quản trị viên</p>
          </div>
        </div>
        <div className="stat-card regular-users">
          <div className="stat-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeWidth="2"/>
            </svg>
          </div>
          <div className="stat-info">
            <h3>{stats.users}</h3>
            <p>Người dùng thường</p>
          </div>
        </div>
      </div>

      {message && <div className="alert-success">{message}</div>}

      {/* User List Section */}
      <div className="user-list-section">
        <div className="list-header-users">
          <h3>Danh sách người dùng</h3>
          <div className="header-controls">
            <div className="search-box-users">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                placeholder="Tìm kiếm người dùng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="filter-role">
              <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
                <option value="all">Tất cả vai trò</option>
                <option value="admin">Quản trị viên</option>
                <option value="user">Người dùng</option>
              </select>
            </div>
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="empty-state-users">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100-8 4 4 0 000 8z" strokeWidth="2"/>
            </svg>
            <h3>Không tìm thấy người dùng</h3>
            <p>{searchQuery ? `Không có người dùng nào khớp với "${searchQuery}"` : 'Chưa có người dùng nào'}</p>
          </div>
        ) : (
          <div className="users-table">
            <div className="table-header">
              <div className="col-user">Người dùng</div>
              <div className="col-email">Email</div>
              <div className="col-role">Vai trò</div>
              <div className="col-favorites">Yêu thích</div>
              <div className="col-actions">Thao tác</div>
            </div>
            <div className="table-body">
              {filteredUsers.map((user) => (
                <div key={user.id} className={`user-row ${user.id === currentUser.id ? 'current-user' : ''}`}>
                  <div className="col-user">
                    <div className="user-avatar-cell">
                      {user.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="user-info-cell">
                      <h4>{user.name || user.username || 'Unknown'}</h4>
                      <span className="user-id">@{user.username || user.id}</span>
                    </div>
                  </div>
                  <div className="col-email">
                    <span className="email-text">{user.email || 'N/A'}</span>
                  </div>
                  <div className="col-role">
                    <select
                      className={`role-select ${user.role}`}
                      value={user.role}
                      onChange={(event) => handleRoleChange(user.id, event.target.value)}
                      disabled={user.id === currentUser.id}
                    >
                      <option value="user">👤 User</option>
                      <option value="admin">🔐 Admin</option>
                    </select>
                  </div>
                  <div className="col-favorites">
                    <span className="favorites-badge">
                      ❤️ {user.favorites?.length || 0}
                    </span>
                  </div>
                  <div className="col-actions">
                    {user.id === currentUser.id ? (
                      <span className="current-badge">Bạn</span>
                    ) : (
                      <button
                        className="btn-delete-user"
                        onClick={() => handleUserDelete(user.id)}
                        title="Xóa người dùng"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" strokeWidth="2"/>
                        </svg>
                        Xóa
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
