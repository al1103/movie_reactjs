import React from 'react';
import './panel.css';

export const SearchBar = ({ query, onChange }) => {
  return (
    <div className="panel" style={{ marginTop: '1.5rem' }}>
      <h3>Tìm kiếm</h3>
      <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
        Nhập tên phim, đạo diễn hoặc diễn viên để tìm nhanh.
      </p>
      <input
        placeholder="Ví dụ: Avengers, Bong Joon-ho, Scarlett..."
        value={query}
        onChange={(event) => onChange(event.target.value)}
        style={{ marginTop: '0.75rem' }}
      />
    </div>
  );
};
