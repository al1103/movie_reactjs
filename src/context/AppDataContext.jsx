import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  countryApi,
  genreApi,
  movieApi,
  normalizeCountryFromAPI,
  normalizeGenreFromAPI,
  normalizeMovieFromAPI
} from '../utils/movieApi.js';
import { loadState, saveState } from '../utils/storage.js';

const STORAGE_KEY = 'movie-portal-state-v1';

const defaultState = {
  movies: [],
  genres: [],
  countries: [],
  actors: [],
  users: [],
  currentUserId: null,
  commentThrottle: {},
  ratingThrottle: {},
};

const AppDataContext = createContext(null);

const API_ENABLED = import.meta.env.VITE_USE_API === 'true';

const normalizeMovie = (movie) => {
  const ratings = movie.ratings || [];
  const ratingValue =
    ratings.length > 0
      ?
          Math.round(
            (ratings.reduce((total, item) => total + item.score, 0) / ratings.length) * 10
          ) / 10
      : typeof movie.rating === 'number'
      ? movie.rating
      : 0;
  return {
    ...movie,
    ratings,
    comments: movie.comments || [],
    rating: ratingValue,
    views: movie.views || 0,
  };
};

const withPersist = (updater, setState) => {
  setState((prev) => {
    const next = typeof updater === 'function' ? updater(prev) : updater;
    saveState(STORAGE_KEY, next);
    return next;
  });
};

export const AppDataProvider = ({ children }) => {
  const [state, setState] = useState(() => loadState(STORAGE_KEY, defaultState));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isSubscribed = true;

    const fetchData = async () => {
      try {
        setLoading(true);

        if (API_ENABLED) {
          // Fetch from API
          const [moviesData, genresData, countriesData] = await Promise.all([
            movieApi.getLatestMovies(1).catch(() => ({ items: [] })),
            genreApi.getAllGenres().catch(() => []),
            countryApi.getAllCountries().catch(() => []),
          ]);

          if (!isSubscribed) return;

          setState((prev) => {
            const movies = (moviesData.items || []).map(normalizeMovieFromAPI);
            // Handle both array and object response formats
            const genresArray = Array.isArray(genresData) ? genresData : (genresData?.items || []);
            const countriesArray = Array.isArray(countriesData) ? countriesData : (countriesData?.items || []);

            const genres = genresArray.map(normalizeGenreFromAPI);
            const countries = countriesArray.map(normalizeCountryFromAPI);

            const next = {
              ...prev,
              movies,
              genres,
              countries,
            };
            saveState(STORAGE_KEY, next);
            return next;
          });
        } else {
          // Use sample data - fallback
          setState((prev) => {
            const next = {
              ...prev,
              movies: [],
              genres: [],
            };
            saveState(STORAGE_KEY, next);
            return next;
          });
        }

        setError(null);
      } catch (err) {
        if (!isSubscribed) return;
        console.error('Data fetch error:', err);
        // Fallback to sample data on error
        setState((prev) => {
          const next = {
            ...prev,
            movies: initialMovies.map(normalizeMovie),
            genres: initialGenres,
          };
          saveState(STORAGE_KEY, next);
          return next;
        });
        setError(err.message || 'Đã xảy ra lỗi khi tải dữ liệu');
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isSubscribed = false;
    };
  }, []);

  const value = useMemo(() => {
    const findUserByEmail = (email) =>
      state.users.find((user) => user.email.toLowerCase() === email.toLowerCase());

    const login = async (email, password) => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

        // Call API login
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          try {
            const errorData = await response.json();
            throw new Error(errorData.error || `Lỗi ${response.status}: Đăng nhập thất bại`);
          } catch (e) {
            throw new Error(`Lỗi ${response.status}: Đăng nhập thất bại`);
          }
        }

        let data;
        try {
          data = await response.json();
        } catch (e) {
          throw new Error('Lỗi server: Response không hợp lệ');
        }
        const { token, user } = data;

        // Save token to localStorage
        localStorage.setItem('token', token);

        // Update local state with user info
        let localUser = findUserByEmail(email);

        if (!localUser) {
          // Create local user if not exists
          localUser = {
            id: user._id || `u${Date.now()}`,
            name: user.name || email.split('@')[0],
            email: user.email,
            password, // Store password locally for fallback
            role: user.role || 'user',
            favorites: user.favorites || [],
            history: user.history || [],
          };
          withPersist(
            (prev) => ({
              ...prev,
              users: [...prev.users, localUser],
              currentUserId: localUser.id,
            }),
            setState
          );
        } else {
          // Update existing local user
          withPersist(
            (prev) => ({
              ...prev,
              currentUserId: localUser.id,
            }),
            setState
          );
        }

        console.log('✅ Đăng nhập thành công!', { email, token: token.substring(0, 20) + '...' });
        return localUser;
      } catch (err) {
        console.error('❌ Lỗi đăng nhập:', err.message);
        throw err;
      }
    };

    const logout = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const token = localStorage.getItem('token');

        if (token) {
          // Call API logout
          await fetch(`${API_BASE_URL}/api/auth/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }).catch(() => {
            // Ignore network errors on logout
          });
        }

        // Clear token and local state
        localStorage.removeItem('token');

        withPersist(
          (prev) => ({
            ...prev,
            currentUserId: null,
          }),
          setState
        );

        console.log('✅ Đã đăng xuất');
      } catch (err) {
        console.error('❌ Lỗi đăng xuất:', err.message);
        // Still clear local state even if API call fails
        withPersist(
          (prev) => ({
            ...prev,
            currentUserId: null,
          }),
          setState
        );
      }
    };

    const register = async ({ name, email, password }) => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

        // Call API register
        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, email, password }),
        });

        if (!response.ok) {
          try {
            const errorData = await response.json();
            throw new Error(errorData.error || `Lỗi ${response.status}: Đăng ký thất bại`);
          } catch (e) {
            throw new Error(`Lỗi ${response.status}: Đăng ký thất bại`);
          }
        }

        let data;
        try {
          data = await response.json();
        } catch (e) {
          throw new Error('Lỗi server: Response không hợp lệ');
        }
        const { token, user } = data;

        // Save token to localStorage
        localStorage.setItem('token', token);

        // Create local user
        const newUser = {
          id: user._id || `u${Date.now()}`,
          name: user.name || name,
          email: user.email,
          password, // Store password locally for fallback
          role: user.role || 'user',
          favorites: user.favorites || [],
          history: user.history || [],
        };

        withPersist(
          (prev) => ({
            ...prev,
            users: [...prev.users, newUser],
            currentUserId: newUser.id,
          }),
          setState
        );

        console.log('✅ Đăng ký thành công!', { email, token: token.substring(0, 20) + '...' });
        return newUser;
      } catch (err) {
        console.error('❌ Lỗi đăng ký:', err.message);
        throw err;
      }
    };

    const resetPassword = async ({ email, newPassword }) => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const token = localStorage.getItem('token');

        // Call API update password
        const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            password: newPassword,
          }),
        });

        if (!response.ok) {
          try {
            const errorData = await response.json();
            throw new Error(errorData.error || `Lỗi ${response.status}: Đổi mật khẩu thất bại`);
          } catch (e) {
            throw new Error(`Lỗi ${response.status}: Đổi mật khẩu thất bại`);
          }
        }

        // Update local state
        const user = findUserByEmail(email);
        if (user) {
          updateUser(user.id, { password: newPassword });
        }

        console.log('✅ Đổi mật khẩu thành công!');
        return true;
      } catch (err) {
        console.error('❌ Lỗi đổi mật khẩu:', err.message);
        throw err;
      }
    };

    const currentUser = state.users.find((user) => user.id === state.currentUserId) || null;

    const updateUser = (userId, updater) => {
      withPersist(
        (prev) => ({
          ...prev,
          users: prev.users.map((user) =>
            user.id === userId ? { ...user, ...(typeof updater === 'function' ? updater(user) : updater) } : user
          ),
        }),
        setState
      );
    };

    const toggleFavorite = (movieId) => {
      if (!currentUser) throw new Error('Cần đăng nhập');
      updateUser(currentUser.id, (user) => {
        const exists = user.favorites.includes(movieId);
        return {
          favorites: exists
            ? user.favorites.filter((id) => id !== movieId)
            : [...user.favorites, movieId],
        };
      });
    };

    const recordView = (movieId) => {
      withPersist(
        (prev) => ({
          ...prev,
          movies: prev.movies.map((movie) =>
            movie.id === movieId ? { ...movie, views: (movie.views || 0) + 1 } : movie
          ),
        }),
        setState
      );

      if (currentUser) {
        updateUser(currentUser.id, (user) => {
          const historyItem = { movieId, viewedAt: Date.now() };
          const updated = [historyItem, ...(user.history || [])];
          return { history: updated.slice(0, 50) };
        });
      }
    };

    const addRating = (movieId, score, comment) => {
      if (!currentUser) throw new Error('Cần đăng nhập');
      const now = Date.now();
      const lastRating = state.ratingThrottle[currentUser.id] || 0;
      if (now - lastRating < 60 * 1000) {
        throw new Error('Vui lòng chờ trước khi đánh giá tiếp theo');
      }

      withPersist(
        (prev) => {
          const movies = prev.movies.map((movie) => {
            if (movie.id !== movieId) return movie;
            const existingRatingIndex = movie.ratings.findIndex(
              (item) => item.userId === currentUser.id
            );
            const nextRatings = [...movie.ratings];
            const ratingItem = {
              userId: currentUser.id,
              score,
              comment: comment || '',
              createdAt: now,
            };
            if (existingRatingIndex >= 0) {
              nextRatings[existingRatingIndex] = ratingItem;
            } else {
              nextRatings.push(ratingItem);
            }
            const avg =
              nextRatings.reduce((total, item) => total + item.score, 0) /
              (nextRatings.length || 1);
            return {
              ...movie,
              ratings: nextRatings,
              rating: Math.round(avg * 10) / 10,
            };
          });
          return {
            ...prev,
            movies,
            ratingThrottle: {
              ...prev.ratingThrottle,
              [currentUser.id]: now,
            },
          };
        },
        setState
      );
    };

    const addComment = (movieId, text) => {
      if (!currentUser) throw new Error('Cần đăng nhập');
      const now = Date.now();
      const lastComment = state.commentThrottle[currentUser.id] || 0;
      if (now - lastComment < 30 * 1000) {
        throw new Error('Bạn đang bình luận quá nhanh, vui lòng thử lại sau');
      }
      if (!text.trim()) throw new Error('Nội dung bình luận không hợp lệ');

      withPersist(
        (prev) => ({
          ...prev,
          movies: prev.movies.map((movie) => {
            if (movie.id !== movieId) return movie;
            const commentItem = {
              id: `${movieId}-${currentUser.id}-${now}`,
              userId: currentUser.id,
              userName: currentUser.name,
              text,
              createdAt: now,
              hidden: false,
            };
            return {
              ...movie,
              comments: [commentItem, ...movie.comments].slice(0, 100),
            };
          }),
          commentThrottle: {
            ...prev.commentThrottle,
            [currentUser.id]: now,
          },
        }),
        setState
      );
    };

    const setCommentVisibility = (movieId, commentId, hidden) => {
      withPersist(
        (prev) => ({
          ...prev,
          movies: prev.movies.map((movie) =>
            movie.id === movieId
              ? {
                  ...movie,
                  comments: movie.comments.map((comment) =>
                    comment.id === commentId ? { ...comment, hidden } : comment
                  ),
                }
              : movie
          ),
        }),
        setState
      );
    };

    const deleteComment = (movieId, commentId) => {
      withPersist(
        (prev) => ({
          ...prev,
          movies: prev.movies.map((movie) =>
            movie.id === movieId
              ? {
                  ...movie,
                  comments: movie.comments.filter((comment) => comment.id !== commentId),
                }
              : movie
          ),
        }),
        setState
      );
    };

    // ========== Fetch Movies from API ==========
    const fetchMovies = async (page = 1, limit = 20) => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        // Use GET /api/movies/new for latest movies with pagination
        const response = await fetch(`${API_BASE_URL}/api/movies/new?page=${page}&limit=${limit}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const moviesList = data.items || [];
          
          // Update state with fetched movies
          withPersist(
            (prev) => ({
              ...prev,
              movies: moviesList.map(movie => normalizeMovie(normalizeMovieFromAPI(movie))),
            }),
            setState
          );
          console.log(`Refreshed ${moviesList.length} movies from API (page ${page})`);
          return {
            movies: moviesList,
            pagination: data.pagination || {},
          };
        } else {
          console.warn('Failed to fetch movies from API');
          return { movies: [], pagination: {} };
        }
      } catch (err) {
        console.error('Error fetching movies:', err);
        return { movies: [], pagination: {} };
      }
    };

    const upsertMovie = (movie) => {
      withPersist(
        (prev) => {
          const exists = prev.movies.some((item) => item.id === movie.id);
          const normalized = normalizeMovie(movie);
          return {
            ...prev,
            movies: exists
              ? prev.movies.map((item) => (item.id === movie.id ? { ...item, ...normalized } : item))
              : [...prev.movies, { ...normalized, id: normalized.id || `m${Date.now()}` }],
          };
        },
        setState
      );
    };

    const deleteMovie = (movieId) => {
      withPersist(
        (prev) => ({
          ...prev,
          movies: prev.movies.filter((movie) => movie.id !== movieId),
          users: prev.users.map((user) => ({
            ...user,
            favorites: user.favorites.filter((id) => id !== movieId),
            history: (user.history || []).filter((item) => item.movieId !== movieId),
          })),
        }),
        setState
      );
    };

    const upsertGenre = (genre) => {
      withPersist(
        (prev) => {
          const exists = prev.genres.some((item) => item.id === genre.id);
          return {
            ...prev,
            genres: exists
              ? prev.genres.map((item) => (item.id === genre.id ? { ...item, ...genre } : item))
              : [...prev.genres, genre],
          };
        },
        setState
      );
    };

    const deleteGenre = (genreId) => {
      withPersist(
        (prev) => ({
          ...prev,
          genres: prev.genres.filter((item) => item.id !== genreId),
          movies: prev.movies.map((movie) => ({
            ...movie,
            genres: movie.genres.filter((id) => id !== genreId),
          })),
        }),
        setState
      );
    };

    const upsertActor = (actor) => {
      withPersist(
        (prev) => {
          const exists = prev.actors.some((item) => item.id === actor.id);
          return {
            ...prev,
            actors: exists
              ? prev.actors.map((item) => (item.id === actor.id ? { ...item, ...actor } : item))
              : [...prev.actors, actor],
          };
        },
        setState
      );
    };

    const deleteActor = (actorId) => {
      withPersist(
        (prev) => ({
          ...prev,
          actors: prev.actors.filter((item) => item.id !== actorId),
          movies: prev.movies.map((movie) => ({
            ...movie,
            cast: movie.cast.filter((id) => id !== actorId),
          })),
        }),
        setState
      );
    };

    const updateUserRole = (userId, role) => {
      updateUser(userId, { role });
    };

    const deleteUser = (userId) => {
      withPersist(
        (prev) => ({
          ...prev,
          users: prev.users.filter((user) => user.id !== userId),
          commentThrottle: Object.fromEntries(
            Object.entries(prev.commentThrottle).filter(([key]) => key !== userId)
          ),
          ratingThrottle: Object.fromEntries(
            Object.entries(prev.ratingThrottle).filter(([key]) => key !== userId)
          ),
          movies: prev.movies.map((movie) => ({
            ...movie,
            comments: movie.comments.filter((comment) => comment.userId !== userId),
            ratings: movie.ratings.filter((rating) => rating.userId !== userId),
          })),
          currentUserId: prev.currentUserId === userId ? null : prev.currentUserId,
        }),
        setState
      );
    };

    const stats = {
      totalMovies: state.movies.length,
      totalUsers: state.users.length,
      totalViews: state.movies.reduce((sum, movie) => sum + (movie.views || 0), 0),
      topMovies: [...state.movies]
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 5),
    };

    const adminActions = {
      upsertMovie,
      deleteMovie,
      fetchMovies,
      upsertGenre,
      deleteGenre,
      upsertActor,
      deleteActor,
      updateUserRole,
      deleteUser,
      setCommentVisibility,
      deleteComment,
    };

    return {
      state,
      currentUser,
      loading,
      error,
      login,
      logout,
      register,
      resetPassword,
      toggleFavorite,
      recordView,
      addRating,
      addComment,
      adminActions,
      stats,
    };
  }, [state, setState, loading, error]);

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
};

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (!context) throw new Error('useAppData phải được dùng trong AppDataProvider');
  return context;
};
