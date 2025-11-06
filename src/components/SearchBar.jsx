import React from 'react';
import './panel.css';

export const SearchBar = ({ query, onChange }) => {
  return (
    <div className="panel">
      <h3>Tìm kiếm</h3>
      <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
        Nhập tên phim, đạo diễn hoặc diễn viên để tìm nhanh.
      </p>
      <input
        type="search"
        placeholder="Ví dụ: Avengers, Bong Joon-ho, Scarlett..."
        value={query}
        onChange={(event) => onChange(event.target.value)}
        style={{ marginTop: '0.75rem', width: '100%' }}
      />
    </div>
  );
};
