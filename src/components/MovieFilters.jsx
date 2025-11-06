import React from 'react';
import './panel.css';

export const MovieFilters = ({
  genres,
  filters,
  onChange,
  onClear,
}) => {
  return (
    <div className="panel">
      <h3>Bộ lọc phim</h3>
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
