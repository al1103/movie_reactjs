import './panel.css';

export const MovieFilters = ({
  genres,
  filters,
  onChange,
  onClear,
}) => {
  const handleGenreClick = (genreId) => {
    onChange({ ...filters, genre: filters.genre === genreId ? '' : genreId });
  };

  return (
    <div className="panel">
      <h3>Bộ lọc phim</h3>

      {/* Genre Badges */}
      {genres.length > 0 && (
        <div className="genre-badges">
          {genres.map((genre) => (
            <button
              key={genre.id}
              className={`genre-badge ${filters.genre === genre.id ? 'active' : ''}`}
              onClick={() => handleGenreClick(genre.id)}
              title={`Lọc theo thể loại: ${genre.name}`}
            >
              {genre.name}
            </button>
          ))}
        </div>
      )}

      <div className="filters-grid">
        <label>
          Thể loại
          <select
            value={filters.genre}
            onChange={(event) => onChange({ ...filters, genre: event.target.value })}
          >
            <option value="">Tất cả</option>
            {genres.map((genre) => (
              <option key={genre.id} value={genre.id}>
                {genre.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Năm
          <input
            type="number"
            value={filters.year}
            onChange={(event) => onChange({ ...filters, year: event.target.value })}
            placeholder="VD: 2019"
          />
        </label>
        <label>
          Quốc gia
          <input
            value={filters.country}
            onChange={(event) => onChange({ ...filters, country: event.target.value })}
            placeholder="VD: Mỹ"
          />
        </label>
        <label>
          Độ dài tối đa (phút)
          <input
            type="number"
            value={filters.maxDuration}
            onChange={(event) => onChange({ ...filters, maxDuration: event.target.value })}
            placeholder="VD: 120"
          />
        </label>
      </div>
      <button className="primary" onClick={onClear} style={{ marginTop: '1rem' }}>
        Xóa lọc
      </button>
    </div>
  );
};
