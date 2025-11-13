import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext';
import { collectionApi, normalizeMovieFromAPI } from '../utils/movieApi';
import { SearchBar } from '../components/SearchBar';
import { Header } from '../components/Header';
import { Toast, useToast } from '../components/Toast';
import './pages-modern.css';

export const HomePage = () => {
  const navigate = useNavigate();
  const { state, currentUser, recordView, toggleFavorite, logout } = useAppData();
  const { toasts, show: showToast, remove: removeToast } = useToast();
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [topMovies, setTopMovies] = useState([]);
  const [currentMovieIndex, setCurrentMovieIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('phim-bo');
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [genres, setGenres] = useState([]);
  const [loadingGenres, setLoadingGenres] = useState(false);
  const [categoryMovies, setCategoryMovies] = useState({});
  const [loadingCategories, setLoadingCategories] = useState({});
  const [genreMovies, setGenreMovies] = useState({});
  const [loadingGenreMovies, setLoadingGenreMovies] = useState({});
  const [favoriteStates, setFavoriteStates] = useState({});

  useEffect(() => {
    const fetchTopMovies = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const response = await fetch(`${API_BASE_URL}/api/movies/top?limit=5`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Top movies from API:', data);
          
          // Handle different response formats
          let movies = Array.isArray(data) ? data : (data.movies || data.items || data.data || []);
          if (!Array.isArray(movies)) movies = [movies];
          
          if (movies.length > 0) {
            // Normalize the movies
            const normalizedMovies = movies.map(movie => ({
              id: movie._id || movie.id,
              title: movie.name || movie.title,
              origin_name: movie.origin_name,
              poster: movie.poster_url || movie.thumb_url || movie.poster,
              backdrop: movie.poster_url || movie.thumb_url || movie.poster,
              rating: movie.rating || 0,
              year: movie.year,
              duration: movie.time || movie.duration,
              description: movie.content || movie.description,
              slug: movie.slug,
              tmdb: movie.tmdb,
            }));
            setTopMovies(normalizedMovies);
            setFeaturedMovie(normalizedMovies[0]);
          }
        } else {
          console.warn('❌ Top movies API failed:', response.status);
          // Fallback to local state
          if (state.movies.length > 0) {
            const sorted = [...state.movies].sort((a, b) => (b.rating || 0) - (a.rating || 0));
            setTopMovies(sorted.slice(0, 5));
            setFeaturedMovie(sorted[0]);
          }
        }
      } catch (err) {
        console.error('❌ Error fetching top movies:', err);
        // Fallback to local state
        if (state.movies.length > 0) {
          const sorted = [...state.movies].sort((a, b) => (b.rating || 0) - (a.rating || 0));
          setTopMovies(sorted.slice(0, 5));
          setFeaturedMovie(sorted[0]);
        }
      }
    };

    fetchTopMovies();
  }, [state.movies]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch genres from API
  useEffect(() => {
    const fetchGenres = async () => {
      setLoadingGenres(true);
      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const response = await fetch(`${API_BASE_URL}/api/genres`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Genres from API:', data);
          
          // Handle different response formats
          const genreList = Array.isArray(data) ? data : (data.genres || data.items || data.data || []);
          setGenres(genreList);
          
          // Set first genre as selected if none selected
          if (genreList.length > 0 && !selectedGenre) {
            setSelectedGenre(genreList[0].id || genreList[0]._id);
          }
        } else {
          console.warn('❌ Genres API failed:', response.status);
          setGenres([]);
        }
      } catch (err) {
        console.error('❌ Error fetching genres:', err);
        setGenres([]);
      } finally {
        setLoadingGenres(false);
      }
    };

    fetchGenres();
  }, []);

  // Fetch movies for selected category
  useEffect(() => {
    const fetchCategoryMovies = async () => {
      // Check if already fetched to prevent duplicate requests
      if (categoryMovies[selectedCategory]) return;

      setLoadingCategories(prev => ({ ...prev, [selectedCategory]: true }));
      try {
        const data = await collectionApi.getCollections(selectedCategory, 1, 10);
        const movies = (data.items || []).map(normalizeMovieFromAPI);
        setCategoryMovies(prev => ({ ...prev, [selectedCategory]: movies }));
      } catch (err) {
        console.error('Error fetching category movies:', err);
        setCategoryMovies(prev => ({ ...prev, [selectedCategory]: [] }));
      } finally {
        setLoadingCategories(prev => ({ ...prev, [selectedCategory]: false }));
      }
    };

    fetchCategoryMovies();
  }, [selectedCategory]);

  // Fetch movies for selected genre from API
  useEffect(() => {
    if (!selectedGenre) return;
    
    const fetchGenreMovies = async () => {
      // Check if already fetched to prevent duplicate requests
      if (genreMovies[selectedGenre]) return;

      setLoadingGenreMovies(prev => ({ ...prev, [selectedGenre]: true }));
      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const genreId = encodeURIComponent(selectedGenre);
        const response = await fetch(`${API_BASE_URL}/api/genres/${genreId}/movies?page=1&limit=10`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Genre movies from API:', data);
          
          // Handle different response formats
          const movies = Array.isArray(data) ? data : (data.movies || data.items || data.data || []);
          
          // Normalize movies
          const normalizedMovies = movies.map(movie => ({
            id: movie._id || movie.id,
            title: movie.name || movie.title,
            origin_name: movie.origin_name,
            poster: movie.poster_url || movie.thumb_url || movie.poster,
            rating: movie.rating || 0,
            year: movie.year,
            duration: movie.time || movie.duration,
            description: movie.content || movie.description,
            slug: movie.slug,
          })).filter(Boolean);
          
          setGenreMovies(prev => ({ ...prev, [selectedGenre]: normalizedMovies }));
        } else {
          console.warn('❌ Genre movies API failed:', response.status);
          setGenreMovies(prev => ({ ...prev, [selectedGenre]: [] }));
        }
      } catch (err) {
        console.error('❌ Error fetching genre movies:', err);
        setGenreMovies(prev => ({ ...prev, [selectedGenre]: [] }));
      } finally {
        setLoadingGenreMovies(prev => ({ ...prev, [selectedGenre]: false }));
      }
    };

    fetchGenreMovies();
  }, [selectedGenre]);

  // Search functionality - use API
  useEffect(() => {
    if (searchQuery.trim()) {
      const fetchSearchResults = async () => {
        setSearchLoading(true);
        try {
          const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
          const keyword = encodeURIComponent(searchQuery);
          const response = await fetch(`${API_BASE_URL}/api/search?keyword=${keyword}&page=1&limit=20`);
          
          console.log('Search API response status:', response.status);
          
          if (response.ok) {
            const data = await response.json();
            console.log('✅ Search results from API:', data);
            
            // Handle different response formats
            const results = Array.isArray(data) ? data : (data.items || data.results || []);
            
            // Normalize results to match UI expectations
            const normalizedResults = results.map(movie => ({
              id: movie._id || movie.id,
              title: movie.name || movie.title,
              poster: movie.poster_url || movie.thumb_url || movie.poster,
              rating: movie.rating || 0,
              year: movie.year,
              duration: movie.time || movie.duration,
              description: movie.content || movie.description,
              slug: movie.slug,
            })).filter(Boolean);
            
            setSearchResults(normalizedResults);
          } else {
            console.warn('❌ Search API failed:', response.status);
            // Fallback to local search
            const query = searchQuery.toLowerCase();
            const results = state.movies.filter(movie => {
              const matchTitle = movie.title?.toLowerCase().includes(query) ||
                                movie.origin_name?.toLowerCase().includes(query);
              const matchDescription = movie.description?.toLowerCase().includes(query);
              return matchTitle || matchDescription;
            });
            setSearchResults(results);
          }
        } catch (err) {
          console.error('❌ Error searching:', err);
          // Fallback to local search
          const query = searchQuery.toLowerCase();
          const results = state.movies.filter(movie => {
            const matchTitle = movie.title?.toLowerCase().includes(query) ||
                              movie.origin_name?.toLowerCase().includes(query);
            const matchDescription = movie.description?.toLowerCase().includes(query);
            return matchTitle || matchDescription;
          });
          setSearchResults(results);
        } finally {
          setSearchLoading(false);
        }
      };
      
      fetchSearchResults();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, state.movies]);

  const handleMovieClick = (movieId) => {
    recordView(movieId);
    navigate(`/movie/${movieId}`);
  };

  const handleAddToList = async (e, movieId) => {
    e.stopPropagation();
    if (!currentUser) {
      navigate('/auth');
      return;
    }

    try {
      // Get movie slug - need to find from featuredMovie
      const movie = topMovies.find(m => m.id === movieId) || featuredMovie;
      const movieSlug = movie?.slug;
      
      if (!movieSlug) {
        console.error('❌ Movie slug not found:', movieId);
        showToast('❌ Lỗi: Không thể lấy thông tin phim', 'error');
        return;
      }

      // Call API to add to favorites
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      console.log('📤 Adding to favorites - Movie slug:', movieSlug);
      
      const response = await fetch(`${API_BASE_URL}/api/auth/favorites/${movieSlug}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        let errorMessage = 'Lỗi: Không thể thêm vào danh sách yêu thích';
        try {
          const error = await response.json();
          console.warn('❌ Failed to add to favorites:', error);
          // Get error message from API response
          errorMessage = error.message || error.error || error.msg || errorMessage;
        } catch {
          errorMessage = `Lỗi ${response.status}: ${response.statusText}`;
        }
        showToast(`❌ ${errorMessage}`, 'error');
      } else {
        console.log('✅ Added to favorites');
        // Update favorite state
        setFavoriteStates(prev => ({ ...prev, [movieId]: true }));
        showToast('❤️ Đã thêm vào danh sách yêu thích', 'success');
      }

      // Also update local state
      toggleFavorite(movieId);
    } catch (error) {
      console.error('❌ Error adding to favorites:', error);
      showToast('❌ Lỗi: ' + (error.message || 'Không thể kết nối đến server'), 'error');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const handleNextMovie = () => {
    if (topMovies.length > 0) {
      const nextIndex = (currentMovieIndex + 1) % topMovies.length;
      setCurrentMovieIndex(nextIndex);
      setFeaturedMovie(topMovies[nextIndex]);
    }
  };

  const handlePrevMovie = () => {
    if (topMovies.length > 0) {
      const prevIndex = (currentMovieIndex - 1 + topMovies.length) % topMovies.length;
      setCurrentMovieIndex(prevIndex);
      setFeaturedMovie(topMovies[prevIndex]);
    }
  };

  const categories = [
    { id: 'phim-bo', name: 'Phim Bộ' },
    { id: 'phim-le', name: 'Phim Lẻ' },
    { id: 'tv-shows', name: 'TV Shows' },
    { id: 'hoat-hinh', name: 'Hoạt Hình' },
    { id: 'phim-vietsub', name: 'Phim Vietsub' },
    { id: 'phim-thuyet-minh', name: 'Phim Thuyết Minh' },
  ];

  // Display genre movies if genre selected, otherwise category movies
  const displayMovies = selectedGenre && genreMovies[selectedGenre] 
    ? genreMovies[selectedGenre] 
    : (categoryMovies[selectedCategory] || state.movies.slice(0, 10));
  
  const isLoadingCategory = loadingCategories[selectedCategory] === true;
  const isLoadingGenre = selectedGenre && loadingGenreMovies[selectedGenre] === true;
  const isLoading = selectedGenre ? isLoadingGenre : isLoadingCategory;

  return (
    <div className="MOIVE-home">
      {/* Toast Notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}

      {/* Header */}
      <Header 
        scrolled={scrolled}
        showSearch={true}
        onSearchClick={() => setShowSearch(true)}
        isHomePage={true}
      />

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
              <span className="hero-rating">★ {(featuredMovie.rating || 0).toFixed(1)}</span>
              <span className="hero-year">{featuredMovie.year}</span>
              <span className="hero-seasons">{featuredMovie.duration || 'N/A'}</span>
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
              <button 
                className="btn-add" 
                onClick={(e) => handleAddToList(e, featuredMovie.id)}
                style={{
                  stroke: favoriteStates[featuredMovie.id] ? '#e50914' : 'currentColor',
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill={favoriteStates[featuredMovie.id] ? '#e50914' : 'none'} stroke={favoriteStates[featuredMovie.id] ? '#e50914' : 'currentColor'}>
                  <path d="M12 5v14M5 12h14" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                
              </button>
            </div>
          </div>
          
          {/* Slider Controls */}
          {topMovies.length > 1 && (
            <div className="hero-slider-controls">
              <button 
                className="slider-btn slider-prev"
                onClick={handlePrevMovie}
                title="Previous movie"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <div className="slider-indicators">
                {topMovies.map((_, index) => (
                  <button
                    key={index}
                    className={`indicator-dot ${index === currentMovieIndex ? 'active' : ''}`}
                    onClick={() => {
                      setCurrentMovieIndex(index);
                      setFeaturedMovie(topMovies[index]);
                    }}
                    title={`Movie ${index + 1}`}
                  />
                ))}
              </div>
              <button 
                className="slider-btn slider-next"
                onClick={handleNextMovie}
                title="Next movie"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          )}
        </section>
      )}

      {/* Categories Section with Unified Design */}
      <div style={{
        background: '#141414',
        padding: '40px 50px 20px',
        borderBottom: '1px solid #2a2a2a',
      }}>
        
      </div>

      {/* Genre Pills Section */}
      <div style={{
        background: '#141414',
        padding: '20px 50px',
        borderBottom: '1px solid #2a2a2a',
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <p style={{
            fontSize: '12px',
            color: '#b3b3b3',
            margin: '0 0 12px 0',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            🎬 Thể Loại
          </p>
          
          <div className="genre-pills" style={{
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
            margin: 0,
            padding: 0,
          }}>
            {loadingGenres ? (
              <span style={{ color: '#b3b3b3', fontSize: '14px' }}>⏳ Đang tải...</span>
            ) : genres.length > 0 ? (
              genres.slice(0, 12).map(genre => (
                <button 
                  key={genre.id || genre._id} 
                  onClick={() => setSelectedGenre(genre.id || genre._id)}
                  style={{
                    background: selectedGenre === (genre.id || genre._id) ? '#e50914' : '#2a2a2a',
                    border: selectedGenre === (genre.id || genre._id) ? '2px solid #e50914' : '2px solid #404040',
                    color: '#fff',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedGenre !== (genre.id || genre._id)) {
                      e.target.style.background = '#333';
                      e.target.style.borderColor = '#555';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedGenre !== (genre.id || genre._id)) {
                      e.target.style.background = '#2a2a2a';
                      e.target.style.borderColor = '#404040';
                    }
                  }}
                >
                  {genre.name}
                </button>
              ))
            ) : (
              <span style={{ color: '#b3b3b3', fontSize: '14px' }}>Không có thể loại</span>
            )}
          </div>
        </div>
      </div>

      {/* Movie Grid */}
      <div style={{
        background: '#141414',
        padding: '40px 50px',
        minHeight: '400px',
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '28px',
          }}>
            <span style={{ fontSize: '24px' }}>
              {selectedGenre ? '🎬' : '📺'}
            </span>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '700',
              margin: 0,
              color: '#e5e5e5',
            }}>
              {selectedGenre && genres.length > 0
                ? genres.find(g => (g.id || g._id) === selectedGenre)?.name || 'Thể loại'
                : categories.find(c => c.id === selectedCategory)?.name}
            </h2>
            {isLoading && (
              <span style={{
                fontSize: '14px',
                color: '#b3b3b3',
                marginLeft: 'auto',
              }}>
                ⏳ Đang tải...
              </span>
            )}
          </div>

          {!isLoading && displayMovies.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#b3b3b3',
            }}>
              <p style={{ fontSize: '18px', margin: '0 0 12px 0' }}>😢 Không có phim nào</p>
              <p style={{ fontSize: '14px', margin: 0, opacity: 0.7 }}>Thử chọn danh mục hoặc thể loại khác</p>
            </div>
          ) : (
            <div className="movies-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '20px',
              padding: 0,
            }}>
              {displayMovies.map(movie => (
                <div
                  key={movie.id}
                  className="movie-card"
                  onClick={() => handleMovieClick(movie.id)}
                  style={{
                    background: '#000',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: '1px solid #333',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 12px 32px rgba(229, 9, 20, 0.3)';
                    e.currentTarget.style.borderColor = '#e50914';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = '#333';
                  }}
                >
                  <img 
                    src={movie.poster} 
                    alt={movie.title}
                    style={{
                      width: '100%',
                      height: '70%',
                      objectFit: 'cover',
                    }}
                  />
                  <div className="movie-info" style={{
                    flex: 1,
                    padding: '12px',
                    background: '#000',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}>
                    <h3 style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      margin: 0,
                      color: '#fff',
                      lineHeight: 1.3,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}>{movie.title}</h3>
                    <div style={{
                      display: 'flex',
                      gap: '10px',
                      fontSize: '12px',
                      color: '#fff',
                      marginTop: '8px',
                      alignItems: 'center',
                    }}>
                      <span style={{ color: '#fbbf24', fontWeight: '600' }}>★ {(movie.rating || 0).toFixed(1)}</span>
                      <span style={{ color: '#999' }}>|</span>
                      <span style={{ color: '#999' }}>{movie.year}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Popular Movies Section */}
      <div style={{
        background: '#0a0a0a',
        padding: '40px 50px',
        borderTop: '1px solid #2a2a2a',
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '28px',
          }}>
            <span style={{ fontSize: '24px' }}>⭐</span>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '700',
              margin: 0,
              color: '#e5e5e5',
            }}>
              Phim Phổ Biến
            </h2>
          </div>

          <div className="movies-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '20px',
            padding: 0,
          }}>
            {state.movies.slice(0, 12).map(movie => (
              <div
                key={movie.id}
                className="movie-card"
                onClick={() => handleMovieClick(movie.id)}
                style={{
                  background: '#000',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: '1px solid #333',
                  display: 'flex',
                  flexDirection: 'column',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(229, 9, 20, 0.3)';
                  e.currentTarget.style.borderColor = '#e50914';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = '#333';
                }}
              >
                <img 
                  src={movie.poster} 
                  alt={movie.title}
                  style={{
                    width: '100%',
                    height: '70%',
                    objectFit: 'cover',
                  }}
                />
                <div className="movie-info" style={{
                  flex: 1,
                  padding: '12px',
                  background: '#000',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}>
                  <h3 style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    margin: 0,
                    color: '#fff',
                    lineHeight: 1.3,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}>{movie.title}</h3>
                  <div style={{
                    display: 'flex',
                    gap: '10px',
                    fontSize: '12px',
                    color: '#fff',
                    marginTop: '8px',
                    alignItems: 'center',
                  }}>
                    <span style={{ color: '#fbbf24', fontWeight: '600' }}>★ {(movie.rating || 0).toFixed(1)}</span>
                    <span style={{ color: '#999' }}>|</span>
                    <span style={{ color: '#999' }}>{movie.year}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="MOIVE-footer">
        <div className="footer-content">
          <div className="footer-links">
            <a href="#about">About</a>
            <a href="#help">Help Center</a>
            <a href="#terms">Terms of Use</a>
            <a href="#privacy">Privacy</a>
            <a href="#contact">Contact Us</a>
          </div>
        </div>
      </footer>

      {/* Search Modal */}
      {showSearch && (
        <div className="search-modal-overlay" onClick={() => setShowSearch(false)}>
          <div className="search-modal" onClick={(e) => e.stopPropagation()}>
            <div className="search-modal-header">
              <h2 style={{ margin: 0, fontSize: '20px', color: '#fff' }}>🔍 Tìm kiếm phim</h2>
              <button className="close-search" onClick={() => setShowSearch(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M18 6L6 18M6 6l12 12" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            <div className="search-modal-content" style={{ padding: '24px' }}>
              <SearchBar
                query={searchQuery}
                onChange={setSearchQuery}
                onSearch={setSearchQuery}
                results={searchResults}
                isLoading={searchLoading}
                showResults={true}
                description="Nhập tên phim, đạo diễn hoặc diễn viên để tìm kiếm"
                variant="dark"
                onResultClick={(movie) => {
                  handleMovieClick(movie.slug || movie.id);
                  setShowSearch(false);
                  setSearchQuery('');
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
