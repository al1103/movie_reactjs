import React, { useMemo, useState } from 'react';
import { AppDataProvider, useAppData } from './context/AppDataContext.jsx';
import { AuthPanel } from './components/AuthPanel.jsx';
import { MovieFilters } from './components/MovieFilters.jsx';
import { SearchBar } from './components/SearchBar.jsx';
import { MovieList } from './components/MovieList.jsx';
import { MovieDetail } from './components/MovieDetail.jsx';
import { FavoritesHistory } from './components/FavoritesHistory.jsx';
import { AdminPanel } from './components/AdminPanel.jsx';
import './components/panel.css';

const Dashboard = () => {
  const {
    state: { movies, genres, actors },
    currentUser,
  } = useAppData();
  const [filters, setFilters] = useState({ genre: '', year: '', country: '', maxDuration: '' });
  const [query, setQuery] = useState('');
  const [selectedMovieId, setSelectedMovieId] = useState(null);

  const actorMap = useMemo(() => Object.fromEntries(actors.map((actor) => [actor.id, actor])), [
    actors,
  ]);

  const filteredMovies = useMemo(() => {
    const q = query.trim().toLowerCase();
    return movies.filter((movie) => {
      if (filters.genre && !movie.genres.includes(filters.genre)) return false;
      if (filters.year && String(movie.year) !== String(filters.year)) return false;
      if (filters.country && !movie.country.toLowerCase().includes(filters.country.toLowerCase()))
        return false;
      if (filters.maxDuration && movie.duration > Number(filters.maxDuration)) return false;
      if (!q) return true;
      const actorNames = movie.cast.map((id) => actorMap[id]?.name || '').join(' ').toLowerCase();
      return (
        movie.title.toLowerCase().includes(q) ||
        movie.director.toLowerCase().includes(q) ||
        actorNames.includes(q)
      );
    });
  }, [movies, filters, query, actorMap]);

  const selectedMovie = useMemo(
    () => movies.find((movie) => movie.id === selectedMovieId) || null,
    [selectedMovieId, movies]
  );

  const suggestions = useMemo(() => {
    if (!selectedMovie) return [];
    const sameGenre = new Set(selectedMovie.genres);
    const sameActors = new Set(selectedMovie.cast);
    return movies
      .filter((movie) => movie.id !== selectedMovie.id)
      .map((movie) => {
        const genreOverlap = movie.genres.some((id) => sameGenre.has(id));
        const actorOverlap = movie.cast.some((id) => sameActors.has(id));
        const score = (genreOverlap ? 1 : 0) + (actorOverlap ? 1 : 0);
        return { movie, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((item) => item.movie);
  }, [selectedMovie, movies]);

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Movie Portal</h1>
        <p style={{ color: '#94a3b8' }}>
          Khám phá kho phim đa dạng, quản lý yêu thích và theo dõi lịch sử xem của bạn.
        </p>
      </header>

      <AuthPanel />
      <MovieFilters
        genres={genres}
        filters={filters}
        onChange={setFilters}
        onClear={() => setFilters({ genre: '', year: '', country: '', maxDuration: '' })}
      />
      <SearchBar query={query} onChange={setQuery} />
      <MovieList
        movies={filteredMovies}
        genres={genres}
        actors={actors}
        onSelect={(movie) => setSelectedMovieId(movie.id)}
        favorites={currentUser?.favorites || []}
      />

      {selectedMovie && (
        <MovieDetail
          movie={selectedMovie}
          genres={genres}
          actors={actors}
          suggestions={suggestions}
          onClose={() => setSelectedMovieId(null)}
        />
      )}

      {currentUser && currentUser.role !== 'admin' && (
        <FavoritesHistory
          movies={movies}
          favorites={currentUser.favorites || []}
          history={currentUser.history || []}
        />
      )}

      <AdminPanel />
    </div>
  );
};

const App = () => {
  return (
    <AppDataProvider>
      <Dashboard />
    </AppDataProvider>
  );
};

export default App;
