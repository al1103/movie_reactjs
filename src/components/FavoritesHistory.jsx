import React, { useMemo } from 'react';
import './panel.css';

export const FavoritesHistory = ({ movies, favorites, history }) => {
  const favoriteMovies = useMemo(
    () => movies.filter((movie) => favorites.includes(movie.id)),
    [movies, favorites]
  );

  const historyWithMovies = useMemo(() => {
    const map = Object.fromEntries(movies.map((movie) => [movie.id, movie]));
    return history
      .map((item) => ({
        ...item,
        movie: map[item.movieId],
      }))
      .filter((item) => item.movie);
  }, [history, movies]);

  return (
    <div className="panel" style={{ marginTop: '1.5rem' }}>
      <h3>Tủ phim của bạn</h3>
      <div style={{ display: 'grid', gap: '1rem' }}>
        <section>
          <h4>Yêu thích ({favoriteMovies.length})</h4>
          {favoriteMovies.length ? (
            <ul>
              {favoriteMovies.map((movie) => (
                <li key={movie.id}>
                  <strong>{movie.title}</strong> ({movie.year})
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: '#94a3b8' }}>Chưa có phim yêu thích.</p>
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
            <p style={{ color: '#94a3b8' }}>Bạn chưa xem phim nào.</p>
          )}
        </section>
      </div>
    </div>
  );
};
