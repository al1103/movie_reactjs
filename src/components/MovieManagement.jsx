import { useMemo, useState, useEffect } from 'react';
import { Toast, useToast } from './Toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const emptyMovieForm = {
  id: '',
  title: '',
  description: '',
  year: new Date().getFullYear(),
  country: '',
  duration: 120,
  genres: [],
  director: [],  // Changed to array
  cast: [],
  poster: '',
  banner: '',
  trailer: '',
  episodes: '',
};

export const MovieManagement = ({ movies, genres: genresProp, actors, adminActions }) => {
  const [movieForm, setMovieForm] = useState(emptyMovieForm);
  const [selectedMovieId, setSelectedMovieId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'form' or 'list'
  const [uploading, setUploading] = useState(false);
  const [posterPreview, setPosterPreview] = useState('');
  const [bannerPreview, setBannerPreview] = useState('');
  const [trailerUrl, setTrailerUrl] = useState('');
  const [genres, setGenres] = useState(genresProp || []);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const { toasts, show: showToast, remove: removeToast } = useToast();

  // ========== Generate Slug from Title ==========
  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  };

  // ========== Normalize movie data to ensure all fields have correct types ==========
  const normalizeMovieForm = (movie) => {
    // Handle genres - convert objects to IDs or slug if needed
    let genresList = [];
    if (Array.isArray(movie.genres)) {
      genresList = movie.genres.map(g => {
        // If genre is object with _id or id, use that; otherwise use slug or the value itself
        if (typeof g === 'object') {
          return g._id || g.id || g.slug || g;
        }
        return g;
      });
    }

    return {
      id: movie.id || '',
      title: movie.title || '',
      description: movie.description || '',
      year: movie.year || new Date().getFullYear(),
      country: movie.country || '',
      duration: movie.duration || 120,
      genres: genresList,
      director: Array.isArray(movie.director) ? movie.director : [],
      cast: Array.isArray(movie.cast) ? movie.cast : [],
      poster: movie.poster || '',
      banner: movie.banner || '',
      trailer: movie.trailer || '',
      slug: movie.slug || generateSlug(movie.title || ''),
      rating: movie.rating || 0,
      ratings: Array.isArray(movie.ratings) ? movie.ratings : [],
      views: movie.views || 0,
    };
  };

  // ========== Fetch Genres from API ==========
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/genres`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          // API returns { items: [...] } or { data: [...] }
          const genresList = data.items || data.data || [];
          // Map _id to id for consistency with frontend
          const mappedGenres = genresList.map(genre => ({
            id: genre._id || genre.id,
            name: genre.name,
            slug: genre.slug,
          }));
          setGenres(mappedGenres);
        } else {
          console.warn('Failed to fetch genres, using default');
          setGenres(genresProp || []);
        }
      } catch (err) {
        console.error('Error fetching genres:', err);
        setGenres(genresProp || []);
      }
    };

    fetchGenres();
  }, [genresProp]);

  // ========== Refresh Movies when switching to list view ==========
  useEffect(() => {
    if (viewMode === 'list') {
      console.log('Switched to list view - fetching movies from API');
      // If adminActions has a fetchMovies method, call it here
      if (adminActions?.fetchMovies) {
        adminActions.fetchMovies();
      }
    }
  }, [viewMode]); // Only depend on viewMode, not adminActions

  // ========== Fetch movie details from API when selected ==========
  useEffect(() => {
    if (!selectedMovieId) return;
    
    const fetchMovieDetails = async () => {
      try {
        console.log('Fetching movie details for:', selectedMovieId);
        const response = await fetch(`${API_BASE_URL}/api/movies/${selectedMovieId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          console.warn('Failed to fetch movie details:', response.statusText);
          return;
        }

        
        const data = await response.json();
        // API returns { movie: {...} } or { data: {...} }
        const movieData = data.movie || data.data || data;
        
        console.log('Movie details from API:', movieData);
        console.log('Raw API response:', data);
        
        // Map API fields to form fields
        const mappedMovieData = {
          ...movieData,
          id: movieData._id || movieData.id,
          title: movieData.name || movieData.title,
          genres: movieData.category || movieData.genres || [],
          poster: movieData.poster || movieData.poster_url,
          banner: movieData.banner || movieData.poster_url,
          description: movieData.description || movieData.content || '',
          cast: movieData.cast || movieData.actor || [],
        };        const normalizedMovie = normalizeMovieForm(mappedMovieData);
        console.log('Normalized movie:', normalizedMovie);
        
        setMovieForm({
          ...normalizedMovie,
          episodes: (movieData.episodes || [])
            .map((episode) => {
              const duration = Number.isInteger(episode.duration) ? episode.duration : 0;
              return `${episode.title}|${duration}`;
            })
            .join('\n'),
        });
        setPosterPreview(normalizedMovie.poster);
        setBannerPreview(normalizedMovie.banner);
      } catch (err) {
        console.error('Error fetching movie details:', err);
      }
    };

    fetchMovieDetails();
  }, [selectedMovieId]); // Fetch when selectedMovieId changes


  const handleMovieSelect = (movieId) => {
    console.log('handleMovieSelect called with movieId:', movieId);
    setSelectedMovieId(movieId);
    if (!movieId) {
      setMovieForm(emptyMovieForm);
      setPosterPreview('');
      setBannerPreview('');
    }
    // API fetch happens in useEffect when selectedMovieId changes
  };

  // ========== Search movies from API ==========
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const searchMovies = async () => {
      setIsSearching(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/search?keyword=${encodeURIComponent(searchQuery)}&page=1&limit=20`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );

        if (!response.ok) {
          console.warn('Search failed:', response.statusText);
          setSearchResults([]);
          return;
        }

        const data = await response.json();
        // API returns { items: [...] } or { data: [...] }
        const results = data.items || data.data || [];
        
        // Normalize the results to match movie structure
        const normalizedResults = results.map(movie => ({
          id: movie._id || movie.id,
          _id: movie._id,
          title: movie.name || movie.title,
          slug: movie.slug,
          poster: movie.poster || movie.poster_url,
          banner: movie.banner || movie.poster_url,
          rating: movie.rating || 0,
          year: movie.year,
          duration: movie.duration,
          views: movie.views || 0,
          ratings: movie.ratings || [],
        }));
        
        setSearchResults(normalizedResults);
        console.log('Search results:', normalizedResults);
      } catch (err) {
        console.error('Search error:', err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      searchMovies();
    }, 500); // Debounce search by 500ms

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // ========== Upload Image Handler ==========
  const handleImageUpload = async (file, type) => {
    if (!file) return null;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${API_BASE_URL}/api/upload/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload ${type} failed: ${response.statusText}`);
      }

      const data = await response.json();
      const imageUrl = data.data.url;

      // Update form and preview
      if (type === 'poster') {
        setMovieForm(prev => ({ ...prev, poster: imageUrl }));
        setPosterPreview(imageUrl);
        showToast('✅ Upload poster thành công', 'success');
      } else if (type === 'banner') {
        setMovieForm(prev => ({ ...prev, banner: imageUrl }));
        setBannerPreview(imageUrl);
        showToast('✅ Upload banner thành công', 'success');
      }

      return imageUrl;
    } catch (err) {
      showToast(`❌ Lỗi upload ${type}: ${err.message}`, 'error');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handlePosterFileSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      await handleImageUpload(file, 'poster');
    }
  };

  const handleBannerFileSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      await handleImageUpload(file, 'banner');
    }
  };

  // ========== Upload Video Handler ==========
  const handleVideoUpload = async (file) => {
    if (!file) return null;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('video', file);

      const response = await fetch(`${API_BASE_URL}/api/upload/video`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload video failed: ${response.statusText}`);
      }

      const data = await response.json();
      const videoUrl = data.data.url;

      setMovieForm(prev => ({ ...prev, trailer: videoUrl }));
      setTrailerUrl(videoUrl);
      showToast('✅ Upload video thành công', 'success');

      return videoUrl;
    } catch (err) {
      showToast(`❌ Lỗi upload video: ${err.message}`, 'error');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleVideoFileSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      await handleVideoUpload(file);
    }
  };

  // ========== Extract Error Message from API Response ==========
  const getErrorMessage = async (response) => {
    try {
      const data = await response.json();
      // Try different error message paths
      return data.error || data.message || data.msg || `Error: ${response.statusText}`;
    } catch {
      return response.statusText || 'Unknown error occurred';
    }
  };


  const handleMovieFormChange = (event) => {
    const { name, value } = event.target;
    if (name === 'genres' || name === 'cast') {
      const options = Array.from(event.target.selectedOptions).map((option) => option.value);
      setMovieForm((prev) => ({ ...prev, [name]: options }));
    } else if (name === 'title') {
      // Only auto-generate slug when creating NEW movie (no selectedMovieId)
      if (selectedMovieId) {
        // Editing existing movie - don't change slug
        setMovieForm((prev) => ({ ...prev, [name]: value }));
      } else {
        // Creating new movie - auto-generate slug
        const slug = generateSlug(value);
        setMovieForm((prev) => ({ ...prev, [name]: value, slug: slug }));
      }
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
        // Split by | and extract only the numeric duration
        const parts = line.split('|');
        const title = parts[0]?.trim() || `Tập ${index + 1}`;
        // Extract only digits from duration part
        const durationStr = parts[1]?.trim() || '0';
        const durationMatch = durationStr.match(/\d+/);
        const duration = durationMatch ? parseInt(durationMatch[0]) : 0;
        
        return {
          id: `${movieForm.id || `temp-${Date.now()}`}-ep-${index}`,
          title,
          duration,
        };
      });

  const handleMovieSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    if (!movieForm.title?.trim()) {
      setError('Tên phim không được để trống');
      return;
    }
    if (!Array.isArray(movieForm.genres) || !movieForm.genres.length) {
      setError('Vui lòng chọn ít nhất một thể loại');
      return;
    }
    if (!movieForm.poster?.trim()) {
      setError('Vui lòng upload poster');
      return;
    }
    if (!movieForm.banner?.trim()) {
      setError('Vui lòng upload banner');
      return;
    }

    setUploading(true);
    try {
      const payload = {
        ...movieForm,
        year: Number(movieForm.year),
        duration: Number(movieForm.duration),
        ratings: movieForm.ratings || [],
        views: movieForm.views || 0,
      };

      const isNewMovie = !selectedMovieId;
      
      console.log('DEBUG: isNewMovie =', isNewMovie, 'selectedMovieId =', selectedMovieId);
      
      if (isNewMovie) {
        // ========== CREATE NEW MOVIE via POST /api/movies/upload ==========
        const createPayload = {
          name: payload.title,  // Backend expects 'name', not 'title'
          description: payload.description,
          poster: payload.poster,
          banner: payload.banner,
          year: payload.year,
          country: payload.country,
          duration: payload.duration,
          director: Array.isArray(payload.director) ? payload.director : (payload.director ? [payload.director] : []),
          genres: payload.genres,
          cast: payload.cast,
          trailer: payload.trailer,
          slug: payload.slug,
          status: 'ongoing',  // Backend requires: 'ongoing' or 'completed'
          quality: payload.quality || '720p',
        };

        const response = await fetch(`${API_BASE_URL}/api/movies/upload`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(createPayload),
        });

        if (!response.ok) {
          const errorMsg = await getErrorMessage(response);
          throw new Error(errorMsg);
        }

        const data = await response.json();
        console.log('API response:', data);
        
        // Handle different API response formats - API returns the movie _id from MongoDB
        const newMovieId = data.data?._id || data._id || data.data?.id || data.id;
        
        if (!newMovieId) {
          throw new Error('Backend did not return movie _id');
        }
        
        console.log('Got new movie _id:', newMovieId);
        
        // Parse episodes từ textarea
        const episodes = parseEpisodes(movieForm.episodes);
        
        // ========== CREATE EPISODES via POST /api/movies/:id/episodes ==========
        if (episodes.length > 0) {
          for (const episode of episodes) {
            const episodePayload = {
              episodeNumber: episode.title.match(/\d+/) ? parseInt(episode.title.match(/\d+/)[0]) : 1,
              title: episode.title,
              description: episode.description || '',
              duration: episode.duration || 0,
              videoUrl: episode.videoUrl || '',
              quality: '720p',
              language: 'Vietsub',
            };

            const episodeResponse = await fetch(`${API_BASE_URL}/api/movies/${newMovieId}/episodes`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
              },
              body: JSON.stringify(episodePayload),
            });

            if (!episodeResponse.ok) {
              console.warn(`Failed to create episode: ${episodeResponse.statusText}`);
            }
          }
        }
        
        // Add to local state
        adminActions.upsertMovie({ ...payload, id: newMovieId, slug: payload.slug });
        showToast('✅ Đã tạo phim mới, cập nhật episodes và lưu vào database', 'success');
        setSelectedMovieId(newMovieId);
      } else {
        // ========== UPDATE EXISTING MOVIE via PUT /api/movies/:id ==========
        const updatePayload = {
          name: payload.title,  // Backend expects 'name', not 'title'
          description: payload.description,
          poster: payload.poster,
          banner: payload.banner,
          year: payload.year,
          country: payload.country,
          duration: payload.duration,
          director: Array.isArray(payload.director) ? payload.director : (payload.director ? [payload.director] : []),
          genres: payload.genres,
          cast: payload.cast,
          trailer: payload.trailer,
          status: 'ongoing',  // Backend requires: 'ongoing' or 'completed'
          quality: payload.quality || '720p',
        };

        const response = await fetch(`${API_BASE_URL}/api/movies/${selectedMovieId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(updatePayload),
        });

        if (!response.ok) {
          const errorMsg = await getErrorMessage(response);
          throw new Error(errorMsg);
        }

        // Parse episodes từ textarea
        const episodes = parseEpisodes(movieForm.episodes);
        
        // ========== CREATE/UPDATE EPISODES via POST /api/movies/:id/episodes ==========
        if (episodes.length > 0) {
          for (const episode of episodes) {
            const episodePayload = {
              episodeNumber: episode.title.match(/\d+/) ? parseInt(episode.title.match(/\d+/)[0]) : 1,
              title: episode.title,
              description: episode.description || '',
              duration: episode.duration || 0,
              videoUrl: episode.videoUrl || '',
              quality: '720p',
              language: 'Vietsub',
            };

            const episodeResponse = await fetch(`${API_BASE_URL}/api/movies/${selectedMovieId}/episodes`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
              },
              body: JSON.stringify(episodePayload),
            });

            if (!episodeResponse.ok) {
              console.warn(`Failed to create episode: ${episodeResponse.statusText}`);
            }
          }
        }

        // Update local state - use selectedMovieId to find and update the movie
        adminActions.upsertMovie({ ...payload, id: selectedMovieId });
        showToast('✅ Đã cập nhật phim, episodes vào database', 'success');
        
        // Refresh movies list from API to get the latest data
        if (adminActions?.fetchMovies) {
          await adminActions.fetchMovies();
        }
      }

      console.log('Movie saved successfully with _id:', selectedMovieId);
      // Keep selectedMovieId as is for existing movies
      if (isNewMovie) {
        setSelectedMovieId(movieSlug);
      }
    } catch (err) {
      console.error('Movie submit error:', err);
      console.error('Error details:', {
        message: err.message,
        stack: err.stack,
      });
      showToast(`❌ Lỗi lưu phim: ${err.message}`, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleMovieDelete = async (movieId) => {
    if (!window.confirm('Xóa phim này?')) return;

    setUploading(true);
    try {
      // ========== DELETE via DELETE /api/movies/:id ==========
      const response = await fetch(`${API_BASE_URL}/api/movies/${movieId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const errorMsg = await getErrorMessage(response);
        throw new Error(errorMsg);
      }

      // Delete from local state
      adminActions.deleteMovie(movieId);
      setSelectedMovieId('');
      setMovieForm(emptyMovieForm);
      showToast('✅ Đã xóa phim khỏi database', 'success');
    } catch (err) {
      console.error('Movie delete error:', err);
      showToast(`❌ Lỗi xóa phim: ${err.message}`, 'error');
    } finally {
      setUploading(false);
    }
  };

  const filteredMovies = useMemo(() => {
    // If user is searching, use API search results
    if (searchQuery.trim()) {
      return searchResults;
    }
    // Otherwise use all movies
    return movies;
  }, [movies, searchResults, searchQuery]);

  return (
    <section className="movie-management-modern">
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
            {selectedMovieId && (
              <button
                type="button"
                onClick={() => {
                  setSelectedMovieId('');
                  setMovieForm(emptyMovieForm);
                  setPosterPreview('');
                  setBannerPreview('');
                }}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                }}
              >
                ➕ Thêm phim mới
              </button>
            )}
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
          Đạo diễn (mỗi dòng một người)
          <textarea
            name="director"
            rows="3"
            value={Array.isArray(movieForm.director) ? movieForm.director.join('\n') : movieForm.director}
            onChange={(e) => {
              const directors = e.target.value.split('\n').map(d => d.trim()).filter(Boolean);
              setMovieForm(prev => ({ ...prev, director: directors }));
            }}
            placeholder="Đạo diễn 1\nĐạo diễn 2\nĐạo diễn 3"
          />
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
          Poster (Upload ảnh)
          <div style={{ marginTop: '0.5rem' }}>
            {posterPreview && (
              <div style={{ marginBottom: '0.75rem' }}>
                <img
                  src={posterPreview}
                  alt="Poster preview"
                  style={{ maxWidth: '150px', maxHeight: '200px', borderRadius: '6px', border: '2px solid #e11d48' }}
                />
              </div>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png"
              onChange={handlePosterFileSelect}
              disabled={uploading}
            />
            {movieForm.poster && (
              <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem', wordBreak: 'break-all' }}>
                ✅ {movieForm.poster}
              </p>
            )}
          </div>
        </label>
        <label>
          Banner (Upload ảnh)
          <div style={{ marginTop: '0.5rem' }}>
            {bannerPreview && (
              <div style={{ marginBottom: '0.75rem' }}>
                <img
                  src={bannerPreview}
                  alt="Banner preview"
                  style={{ maxWidth: '300px', maxHeight: '120px', borderRadius: '6px', border: '2px solid #3b82f6' }}
                />
              </div>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleBannerFileSelect}
              disabled={uploading}
            />
            {movieForm.banner && (
              <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem', wordBreak: 'break-all' }}>
                ✅ {movieForm.banner}
              </p>
            )}
          </div>
        </label>
        <label>
          Video Trailer (Upload file hoặc URL YouTube)
          <div style={{ marginTop: '0.5rem' }}>
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoFileSelect}
              disabled={uploading}
            />
            <p style={{ fontSize: '0.8rem', color: '#666', margin: '0.5rem 0' }}>HOẶC nhập URL:</p>
            <input 
              name="trailer" 
              value={movieForm.trailer} 
              onChange={handleMovieFormChange}
              placeholder="https://youtube.com/... hoặc video URL"
            />
            {movieForm.trailer && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem', padding: '0.5rem', backgroundColor: '#dcfce7', borderRadius: '4px', border: '1px solid #22c55e' }}>
                <p style={{ fontSize: '0.85rem', color: '#22c55e', margin: 0, wordBreak: 'break-all', flex: 1 }}>
                  ✅ {movieForm.trailer}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setMovieForm(prev => ({ ...prev, trailer: '' }));
                    setTrailerUrl('');
                    setMessage('🗑️ Đã xóa video link');
                    setTimeout(() => setMessage(''), 2000);
                  }}
                  style={{
                    marginLeft: '0.75rem',
                    padding: '0.4rem 0.8rem',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  ✕ Xóa
                </button>
              </div>
            )}
          </div>
        </label>
        <label>
          Số phút
          <textarea
            name="episodes"
            rows="4"
            value={movieForm.episodes}
            onChange={handleMovieFormChange}
            placeholder="45"
          />
        </label>
            <div className="form-actions-admin">
              <button className="btn-save" type="submit">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" strokeWidth="2"/>
                  <path d="M17 21v-8H7v8M7 3v5h8" strokeWidth="2"/>
                </svg>
                {selectedMovieId ? 'Cập nhật' : 'Thêm phim'}
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
