import { useNavigate } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext';

export const UserHeader = ({ scrolled = true }) => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAppData();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const userNavItems = [
    { label: 'Home', onClick: () => navigate('/') },
    { label: 'My Favorites', onClick: () => navigate('/my-favorites') }
  ];

  return (
    <header className={`MOIVE-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="header-left">
        <div className="MOIVE-logo" onClick={() => navigate('/')}>Movie</div>
        <nav className="header-nav">
          {userNavItems.map((item, index) => (
            <button 
              key={index}
              onClick={item.onClick} 
              className="nav-link"
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
      
      <div className="header-right">
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
