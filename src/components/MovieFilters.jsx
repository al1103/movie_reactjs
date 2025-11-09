import './panel.css';

export const MovieFilters = ({
  genres,
  countries,
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
      {genres && genres.length > 0 && (
        <div className="genre-badges">
          {genres.slice(0, 6).map((genre) => (
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
        {genres && genres.length > 0 && (
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
        )}
        <label>
          Năm
          <input
            type="number"
            value={filters.year}
            onChange={(event) => onChange({ ...filters, year: event.target.value })}
            placeholder="VD: 2024"
          />
        </label>
        {countries && countries.length > 0 && (
          <label>
            Quốc gia
            <select
              value={filters.country}
              onChange={(event) => onChange({ ...filters, country: event.target.value })}
            >
              <option value="">Tất cả</option>
              {countries.map((country) => (
                <option key={country.id} value={country.id}>
                  {country.name}
                </option>
              ))}
            </select>
          </label>
        )}
        <label>
          Chất lượng
          <select
            value={filters.quality}
            onChange={(event) => onChange({ ...filters, quality: event.target.value })}
          >
            <option value="">Tất cả</option>
            <option value="HD">HD</option>
            <option value="Full HD">Full HD</option>
            <option value="4K">4K</option>
          </select>
        </label>
      </div>
      <button className="primary" onClick={onClear} style={{ marginTop: '1rem' }}>
        Xóa lọc
      </button>
    </div>
  );
};
