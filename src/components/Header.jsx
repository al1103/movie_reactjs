import { useNavigate } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext';

export const Header = ({ 
  scrolled = true, 
  showSearch = false, 
  onSearchClick = null
}) => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAppData();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  // Home page navigation items
  const navItems = [
    { label: 'Home', onClick: () => navigate('/'), className: 'active' },
    { label: 'My List', onClick: () => navigate(currentUser ? '/my-favorites' : '/auth') }
  ];

  return (
    <header className={`MOIVE-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="header-left">
        <div className="MOIVE-logo" onClick={() => navigate('/')}>Movie</div>
        <nav className="header-nav">
          {navItems.map((item, index) => (
            <button 
              key={index}
              onClick={item.onClick} 
              className={`nav-link ${item.className || ''}`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
      
      <div className="header-right">
        {/* Search Button - only show on home page */}
        {showSearch && (
          <button 
            className="icon-btn search-btn" 
            title="Search" 
            onClick={onSearchClick}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        )}

        {/* Notifications - only show if logged in */}
        {currentUser && (
          <button className="icon-btn notification-btn" title="Notifications">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 17H20L18.595 15.595C18.4063 15.4063 18.3 15.1513 18.3 14.885V11C18.3 8.61305 16.7305 6.57 14.55 5.795C14.2672 4.77154 13.3873 4 12.3 4C11.2127 4 10.3328 4.77154 10.05 5.795C7.86954 6.57 6.3 8.61305 6.3 11V14.885C6.3 15.1513 6.19373 15.4063 6.005 15.595L4.6 17H9.3M15 17V18C15 19.6569 13.6569 21 12 21C10.3431 21 9 19.6569 9 18V17M15 17H9.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}

        {/* User Menu */}
        <div className="user-menu">
          <div className="user-profile">
            <img src="https://i.pravatar.cc/40" alt="User" />
          </div>
          <div className="user-dropdown">
            {currentUser ? (
              <>
                <button onClick={() => navigate('/profile')} className="dropdown-item">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Profile
                </button>
                {currentUser.role === 'admin' && (
                  <button onClick={() => navigate('/admin/movies')} className="dropdown-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Admin Panel
                  </button>
                )}
                <button onClick={handleLogout} className="dropdown-item">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Logout
                </button>
              </>
            ) : (
              <button onClick={() => navigate('/auth')} className="dropdown-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
