import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  initialActors,
  initialGenres,
  initialMovies,
  initialUsers,
} from '../data/sampleData.js';
import { loadState, saveState } from '../utils/storage.js';

const STORAGE_KEY = 'movie-portal-state-v1';

const defaultState = {
  movies: initialMovies,
  genres: initialGenres,
  actors: initialActors,
  users: initialUsers,
  currentUserId: null,
  commentThrottle: {},
  ratingThrottle: {},
};

const AppDataContext = createContext(null);

const DATA_URL = '/data/app-data.json';

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
        const response = await fetch(DATA_URL);
        if (!response.ok) {
          throw new Error('Không thể tải dữ liệu phim');
        }
        const payload = await response.json();
        if (!isSubscribed) return;

        setState((prev) => {
          const next = {
            ...prev,
            movies: (payload.movies || []).map(normalizeMovie),
            genres: payload.genres || prev.genres,
            actors: payload.actors || prev.actors,
          };
          saveState(STORAGE_KEY, next);
          return next;
        });
        setError(null);
      } catch (err) {
        if (!isSubscribed) return;
        console.error(err);
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

    const login = (email, password) => {
      console.log('🔍 Đang đăng nhập với email:', email);
      console.log('📋 Danh sách users hiện tại:', state.users.map(u => ({ email: u.email, id: u.id })));

      const user = findUserByEmail(email);
      console.log('👤 User tìm thấy:', user ? { email: user.email, id: user.id } : 'Không tìm thấy');

      if (!user) {
        throw new Error('Không tìm thấy tài khoản với email này');
      }

      if (user.password !== password) {
        console.log('❌ Sai mật khẩu! Mật khẩu đúng:', user.password, '| Mật khẩu nhập:', password);
        throw new Error('Sai mật khẩu');
      }

      console.log('✅ Đăng nhập thành công!');
      withPersist(
        (prev) => ({
          ...prev,
          currentUserId: user.id,
        }),
        setState
      );
      return user;
    };

    const logout = () => {
      withPersist(
        (prev) => ({
          ...prev,
          currentUserId: null,
        }),
        setState
      );
    };

    const register = ({ name, email, password }) => {
      if (findUserByEmail(email)) {
        throw new Error('Email đã tồn tại');
      }
      const newUser = {
        id: `u${Date.now()}`,
        name,
        email,
        password,
        role: 'user',
        favorites: [],
        history: [],
      };
      withPersist(
        (prev) => ({
          ...prev,
          users: [...prev.users, newUser],
          currentUserId: newUser.id,
        }),
        setState
      );
      return newUser;
    };

    const resetPassword = ({ email, newPassword }) => {
      const user = findUserByEmail(email);
      if (!user) throw new Error('Không tìm thấy tài khoản');
      withPersist(
        (prev) => ({
          ...prev,
          users: prev.users.map((item) =>
            item.id === user.id ? { ...item, password: newPassword } : item
          ),
        }),
        setState
      );
      return true;
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
