import React, { useState, useEffect, useMemo } from 'react';
import { Toast, useToast } from './Toast';
import './panel.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const FavoritesHistory = ({ movies, favorites: favoritesArray = [], history: historyArray = [] }) => {
  const [favorites, setFavorites] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toasts, show: showToast, remove: removeToast } = useToast();

  // ========== Fetch Favorites from API ==========
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/auth/favorites`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          console.warn('Failed to fetch favorites:', response.statusText);
          setFavorites(favoritesArray);
          return;
        }

        const data = await response.json();
        if (data.success && data.favorites) {
          // Extract movie IDs from favorites
          const favoriteIds = data.favorites.map(fav => {
            // If movieId is object with _id, use that; otherwise use movieId
            return fav.movieId?._id || fav.movieId || fav.movieSlug;
          });
          setFavorites(favoriteIds);
        } else {
          setFavorites(favoritesArray);
        }
      } catch (err) {
        console.error('Error fetching favorites:', err);
        setFavorites(favoritesArray);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  // ========== Add to Favorites ==========
  const addToFavorites = async (movieSlug) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/favorites/${movieSlug}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add to favorites');
      }

      const data = await response.json();
      if (data.success) {
        showToast('✅ Đã thêm vào yêu thích', 'success');
        // Refresh favorites
        const favResponse = await fetch(`${API_BASE_URL}/api/auth/favorites`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const favData = await favResponse.json();
        if (favData.success && favData.favorites) {
          const favoriteIds = favData.favorites.map(fav => fav.movieId?._id || fav.movieId || fav.movieSlug);
          setFavorites(favoriteIds);
        }
      }
    } catch (err) {
      showToast(`❌ Lỗi: ${err.message}`, 'error');
    }
  };

  // ========== Remove from Favorites ==========
  const removeFromFavorites = async (movieSlug) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/favorites/${movieSlug}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to remove from favorites');
      }

      const data = await response.json();
      if (data.success) {
        showToast('✅ Đã xóa khỏi yêu thích', 'success');
        // Refresh favorites
        const favResponse = await fetch(`${API_BASE_URL}/api/auth/favorites`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const favData = await favResponse.json();
        if (favData.success && favData.favorites) {
          const favoriteIds = favData.favorites.map(fav => fav.movieId?._id || fav.movieId || fav.movieSlug);
          setFavorites(favoriteIds);
        }
      }
    } catch (err) {
      showToast(`❌ Lỗi: ${err.message}`, 'error');
    }
  };

  // ========== Check if movie is favorited ==========
  const isFavorited = (movieSlug) => {
    return favorites.includes(movieSlug);
  };

  const favoriteMovies = useMemo(
    () => movies.filter((movie) => favorites.includes(movie.id) || favorites.includes(movie.slug)),
    [movies, favorites]
  );

  const historyWithMovies = useMemo(() => {
    const map = Object.fromEntries(movies.map((movie) => [movie.id, movie]));
    return historyArray
      .map((item) => ({
        ...item,
        movie: map[item.movieId],
      }))
      .filter((item) => item.movie);
  }, [historyArray, movies]);

  return (
    <section className="panel">
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

      <h3>Tủ phim của bạn</h3>
      <div style={{ display: 'grid', gap: '1rem' }}>
        <section>
          <h4>Yêu thích ({favoriteMovies.length})</h4>
          {loading ? (
            <p style={{ color: '#64748b' }}>Đang tải...</p>
          ) : favoriteMovies.length ? (
            <ul>
              {favoriteMovies.map((movie) => (
                <li key={movie.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span><strong>{movie.title}</strong> ({movie.year})</span>
                  <button
                    onClick={() => removeFromFavorites(movie.slug || movie.id)}
                    style={{
                      padding: '0.25rem 0.5rem',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                    }}
                  >
                    ✕ Xóa
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: '#64748b' }}>Chưa có phim yêu thích.</p>
          )}
        </section>
        <section>
          <h4>Lịch sử xem ({historyWithMovies.length})</h4>
          {historyWithMovies.length ? (
            <ul>
              {historyWithMovies.map((item) => (
                <li key={`${item.movieId}-${item.viewedAt}`}>
                  <strong>{item.movie.title}</strong> -{' '}
                  {new Date(item.viewedAt).toLocaleString('vi-VN')}
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: '#64748b' }}>Bạn chưa xem phim nào.</p>
          )}
        </section>
      </div>
    </section>
  );
};
