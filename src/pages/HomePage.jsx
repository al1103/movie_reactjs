import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext';
import './pages-modern.css';

export const HomePage = () => {
  const navigate = useNavigate();
  const { state, currentUser, recordView, toggleFavorite, logout } = useAppData();
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('trending');
  const [scrolled, setScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    if (state.movies.length > 0) {
      // Select a featured movie (highest rated or most viewed)
      const featured = [...state.movies].sort((a, b) => b.rating - a.rating)[0];
      setFeaturedMovie(featured);
    }
  }, [state.movies]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const results = state.movies.filter(movie => {
        const actorMap = state.actors.reduce((acc, actor) => {
          acc[actor.id] = actor.name;
          return acc;
        }, {});

        const matchTitle = movie.title.toLowerCase().includes(query);
        const matchDirector = movie.director.toLowerCase().includes(query);
        const matchActors = movie.cast.some(actorId =>
          actorMap[actorId]?.toLowerCase().includes(query)
        );
        const matchDescription = movie.description.toLowerCase().includes(query);

        return matchTitle || matchDirector || matchActors || matchDescription;
      });
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, state.movies, state.actors]);

  const handleMovieClick = (movieId) => {
    recordView(movieId);
    navigate(`/movie/${movieId}`);
  };

  const handleAddToList = (e, movieId) => {
    e.stopPropagation();
    if (!currentUser) {
      navigate('/auth');
      return;
    }
    try {
      toggleFavorite(movieId);
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const categories = [
    { id: 'trending', name: 'Trending Now' },
    { id: 'popular', name: 'Popular' },
    { id: 'netflix', name: 'Netflix Original' },
    { id: 'premiere', name: 'Premiere' },
    { id: 'recent', name: 'Recently Added' },
  ];

  const genres = [
    { id: 'action', name: 'Action' },
    { id: 'adventure', name: 'Adventure' },
    { id: 'anime', name: 'Anime' },
    { id: 'biography', name: 'Biography' },
    { id: 'crime', name: 'Crime' },
    { id: 'comedy', name: 'Comedy' },
    { id: 'documentary', name: 'Documentary' },
    { id: 'drama', name: 'Drama' },
  ];

  const getMoviesByCategory = (category) => {
    switch (category) {
      case 'trending':
        return [...state.movies].sort((a, b) => b.views - a.views).slice(0, 10);
      case 'popular':
        return [...state.movies].sort((a, b) => b.rating - a.rating).slice(0, 10);
      case 'recent':
        return [...state.movies].sort((a, b) => b.year - a.year).slice(0, 10);
      default:
        return state.movies.slice(0, 10);
    }
  };

  const displayMovies = getMoviesByCategory(selectedCategory);

  return (
    <div className="netflix-home">
      {/* Header */}
      <header className={`netflix-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="header-left">
          <div className="netflix-logo" onClick={() => navigate('/')}>NETFLIX</div>
          <nav className="header-nav">
            <button onClick={() => navigate('/')} className="nav-link active">Home</button>
            <button onClick={() => navigate('/')} className="nav-link">TV Shows</button>
            <button onClick={() => navigate('/')} className="nav-link">Movies</button>
            <button onClick={() => navigate('/')} className="nav-link">Recently Added</button>
            <button onClick={() => navigate(currentUser ? '/my-favorites' : '/auth')} className="nav-link">My List</button>
          </nav>
        </div>
        <div className="header-right">
          <button className="icon-btn search-btn" title="Search" onClick={() => setShowSearch(true)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          {currentUser && (
            <button className="icon-btn notification-btn" title="Notifications">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M15 17H20L18.595 15.595C18.4063 15.4063 18.3 15.1513 18.3 14.885V11C18.3 8.61305 16.7305 6.57 14.55 5.795C14.2672 4.77154 13.3873 4 12.3 4C11.2127 4 10.3328 4.77154 10.05 5.795C7.86954 6.57 6.3 8.61305 6.3 11V14.885C6.3 15.1513 6.19373 15.4063 6.005 15.595L4.6 17H9.3M15 17V18C15 19.6569 13.6569 21 12 21C10.3431 21 9 19.6569 9 18V17M15 17H9.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
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

      {/* Hero Section */}
      {featuredMovie && (
        <section className="hero-section">
          <div className="hero-backdrop">
            <img src={featuredMovie.banner || featuredMovie.poster} alt={featuredMovie.title} />
            <div className="hero-gradient"></div>
          </div>
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-top10">TOP<br/>10</span>
            </div>
            <div className="hero-metadata">
              <span className="hero-rating">★ {featuredMovie.rating}</span>
              <span className="hero-year">{featuredMovie.year}</span>
              <span className="hero-seasons">{featuredMovie.duration} phút</span>
            </div>
            <h1 className="hero-title">{featuredMovie.title}</h1>
            <p className="hero-description">{featuredMovie.description}</p>
            <div className="hero-actions">
              <button className="btn-play" onClick={() => handleMovieClick(featuredMovie.id)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                WATCH
              </button>
              <button className="btn-add" onClick={(e) => handleAddToList(e, featuredMovie.id)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 5v14M5 12h14" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                ADD TO LIST
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      <div className="categories-section">
        <div className="category-tabs">
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`category-tab ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Genre Pills */}
      <div className="genre-pills">
        {genres.map(genre => (
          <button key={genre.id} className="genre-pill">
            {genre.name}
          </button>
        ))}
      </div>

      {/* Movie Grid */}
      <div className="movies-section">
        <h2 className="section-title">{categories.find(c => c.id === selectedCategory)?.name}</h2>
        <div className="movies-grid-container">
          <div className="movies-grid">
            {displayMovies.map(movie => (
              <div
                key={movie.id}
                className="movie-card"
                onClick={() => handleMovieClick(movie.id)}
              >
                <img src={movie.poster} alt={movie.title} />
                <div className="movie-info">
                  <h3>{movie.title}</h3>
                  <div className="movie-meta">
                    <span className="movie-rating">★ {movie.rating}</span>
                    <span>{movie.year}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* All Movies Section */}
      <div className="movies-section">
        <h2 className="section-title">All Movies</h2>
        <div className="movies-grid-container">
          <div className="movies-grid">
            {state.movies.slice(0, 12).map(movie => (
              <div
                key={movie.id}
                className="movie-card"
                onClick={() => handleMovieClick(movie.id)}
              >
                <img src={movie.poster} alt={movie.title} />
                <div className="movie-info">
                  <h3>{movie.title}</h3>
                  <div className="movie-meta">
                    <span className="movie-rating">★ {movie.rating}</span>
                    <span>{movie.year}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="netflix-footer">
        <div className="footer-content">
          <div className="footer-links">
            <a href="#about">About</a>
            <a href="#help">Help Center</a>
            <a href="#terms">Terms of Use</a>
            <a href="#privacy">Privacy</a>
            <a href="#contact">Contact Us</a>
          </div>
          <p className="footer-copyright">© 2025 Netflix Clone. Built with React.</p>
        </div>
      </footer>

      {/* Search Modal */}
      {showSearch && (
        <div className="search-modal-overlay" onClick={() => setShowSearch(false)}>
          <div className="search-modal" onClick={(e) => e.stopPropagation()}>
            <div className="search-modal-header">
              <div className="search-input-wrapper">
                <svg className="search-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <input
                  type="text"
                  placeholder="Tìm kiếm phim, đạo diễn, diễn viên..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="search-modal-input"
                />
                {searchQuery && (
                  <button className="clear-search" onClick={() => setSearchQuery('')}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M18 6L6 18M6 6l12 12" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </button>
                )}
              </div>
              <button className="close-search" onClick={() => setShowSearch(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M18 6L6 18M6 6l12 12" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            <div className="search-modal-content">
              {searchQuery.trim() === '' ? (
                <div className="search-placeholder">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <p>Nhập từ khóa để tìm kiếm</p>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="search-results">
                  <div className="search-results-header">
                    <h3>Kết quả tìm kiếm</h3>
                    <span className="results-count">{searchResults.length} phim</span>
                  </div>
                  <div className="search-results-grid">
                    {searchResults.map(movie => (
                      <div
                        key={movie.id}
                        className="search-result-item"
                        onClick={() => {
                          handleMovieClick(movie.id);
                          setShowSearch(false);
                          setSearchQuery('');
                        }}
                      >
                        <img src={movie.poster} alt={movie.title} />
                        <div className="search-result-info">
                          <h4>{movie.title}</h4>
                          <div className="search-result-meta">
                            <span className="result-rating">★ {movie.rating}</span>
                            <span>{movie.year}</span>
                            <span>{movie.duration} phút</span>
                          </div>
                          <p className="result-description">{movie.description.substring(0, 100)}...</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="search-no-results">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M9.172 9.172a4 4 0 015.656 0M21 21l-4.35-4.35m2.35-5.65a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <h3>Không tìm thấy kết quả</h3>
                  <p>Không có phim nào phù hợp với từ khóa "{searchQuery}"</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
