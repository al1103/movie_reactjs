import React from 'react';
import './panel.css';

export const MovieList = ({ movies, genres, actors, onSelect, favorites }) => {
  const genreMap = Object.fromEntries(genres.map((genre) => [genre.id, genre.name]));
  const actorMap = Object.fromEntries(actors.map((actor) => [actor.id, actor.name]));

  if (!movies.length) {
    return (
      <div className="panel" style={{ marginTop: '1.5rem' }}>
        <h3>Kết quả</h3>
        <p>Không tìm thấy phim phù hợp.</p>
      </div>
    );
  }

  return (
    <div className="panel" style={{ marginTop: '1.5rem' }}>
      <h3>Kết quả ({movies.length})</h3>
      <div className="movie-grid">
        {movies.map((movie) => (
          <div className="movie-card" key={movie.id}>
            <img src={movie.poster} alt={movie.title} loading="lazy" />
            <div className="movie-card-content">
              <h4>{movie.title}</h4>
              <div className="tag-list">
                <span className="tag">{movie.year}</span>
                <span className="tag">{movie.country}</span>
                {movie.genres.map((genreId) => (
                  <span className="tag" key={genreId}>
                    {genreMap[genreId] || 'Khác'}
                  </span>
                ))}
              </div>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{movie.description}</p>
              <p style={{ fontSize: '0.85rem' }}>
                Đạo diễn: <strong>{movie.director}</strong>
              </p>
              <p style={{ fontSize: '0.85rem' }}>
                Diễn viên:{' '}
                <strong>{movie.cast.map((id) => actorMap[id]).join(', ')}</strong>
              </p>
              <div className="actions-row">
                <button className="primary" onClick={() => onSelect(movie)}>
                  Xem chi tiết
                </button>
                {favorites.includes(movie.id) && <span className="badge">Yêu thích</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
