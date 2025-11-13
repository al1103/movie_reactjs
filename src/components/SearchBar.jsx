import React, { useEffect, useState } from 'react';
import './panel.css';

export const SearchBar = ({ 
  query, 
  onChange, 
  onSearch,
  results = [],
  isLoading = false,
  placeholder = 'Ví dụ: Avengers, Bong Joon-ho, Scarlett...',
  title = '',
  description = 'Nhập tên phim, đạo diễn hoặc diễn viên để tìm nhanh.',
  showResults = false,
  onResultClick = null,
  variant = 'light', // 'light' or 'dark'
}) => {
  const [internalQuery, setInternalQuery] = useState(query);

  useEffect(() => {
    setInternalQuery(query);
  }, [query]);

  const handleChange = (event) => {
    const value = event.target.value;
    setInternalQuery(value);
    onChange(value);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && onSearch) {
      onSearch(internalQuery);
    }
  };

  const isDark = variant === 'dark';

  return (
    <div className="search-bar-container">
      {title && <h3 style={{ color: isDark ? '#e5e5e5' : '#0f172a' }}>{title}</h3>}
      {description && (
        <p style={{ 
          color: isDark ? '#b3b3b3' : '#64748b', 
          fontSize: '0.9rem',
          margin: '0 0 12px 0'
        }}>
          {description}
        </p>
      )}
      
      <div style={{ position: 'relative' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 16px',
          borderRadius: '10px',
          border: `2px solid ${isDark ? '#2a2a2a' : '#cbd5e1'}`,
          backgroundColor: isDark ? '#0a0a0a' : '#fff',
          transition: 'all 0.3s ease',
          boxShadow: isDark ? '0 4px 12px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.05)',
        }}>
          <span style={{ color: isDark ? '#808080' : '#64748b', fontSize: '18px' }}>🔍</span>
          
          <input
            type="text"
            placeholder={placeholder}
            value={internalQuery}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            style={{ 
              flex: 1,
              border: 'none',
              backgroundColor: 'transparent',
              color: isDark ? '#fff' : '#0f172a',
              fontSize: '15px',
              outline: 'none',
              fontFamily: 'inherit',
              '::placeholder': {
                color: isDark ? '#808080' : '#64748b',
              }
            }}
          />
          
          {isLoading && (
            <span style={{
              color: isDark ? '#808080' : '#64748b',
              fontSize: '14px',
              animation: 'spin 1s linear infinite',
            }}>
              ⏳
            </span>
          )}

          {internalQuery && !isLoading && (
            <button
              onClick={() => {
                setInternalQuery('');
                onChange('');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: isDark ? '#808080' : '#64748b',
                cursor: 'pointer',
                fontSize: '18px',
                padding: '4px',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => e.target.style.color = isDark ? '#e5e5e5' : '#0f172a'}
              onMouseLeave={(e) => e.target.style.color = isDark ? '#808080' : '#64748b'}
            >
              ✕
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showResults && results.length > 0 && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            right: 0,
            backgroundColor: isDark ? '#1a1a1a' : '#fff',
            border: `1px solid ${isDark ? '#2a2a2a' : '#cbd5e1'}`,
            borderRadius: '10px',
            maxHeight: '500px',
            overflowY: 'auto',
            boxShadow: isDark ? '0 10px 30px rgba(0, 0, 0, 0.5)' : '0 8px 24px rgba(0, 0, 0, 0.12)',
            zIndex: 1000,
          }}>
            <div style={{ 
              padding: '12px 16px',
              borderBottom: `1px solid ${isDark ? '#2a2a2a' : '#e2e8f0'}`,
              backgroundColor: isDark ? '#0a0a0a' : '#f8f9fa',
            }}>
              <p style={{ 
                fontSize: '12px', 
                color: isDark ? '#b3b3b3' : '#64748b',
                margin: 0,
                fontWeight: '600',
              }}>
                ✅ Tìm thấy {results.length} kết quả
              </p>
            </div>
            
            {results.map((movie, idx) => (
              <div
                key={movie.id || idx}
                onClick={() => onResultClick && onResultClick(movie)}
                style={{
                  padding: '12px 16px',
                  borderBottom: `1px solid ${isDark ? '#2a2a2a' : '#e2e8f0'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'center',
                  backgroundColor: isDark ? 'transparent' : 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = isDark ? '#1e1e1e' : '#f1f5f9';
                  e.currentTarget.style.borderLeftColor = '#e50914';
                  e.currentTarget.style.borderLeft = '3px solid #e50914';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderLeft = 'none';
                }}
              >
                <img 
                  src={movie.poster} 
                  alt={movie.title}
                  style={{
                    width: '50px',
                    height: '75px',
                    objectFit: 'cover',
                    borderRadius: '4px',
                    border: `1px solid ${isDark ? '#2a2a2a' : '#e2e8f0'}`,
                  }}
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300"%3E%3Crect fill="%23333" width="200" height="300"/%3E%3Ctext x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" fill="%23999" font-size="24"%3ENo Image%3C/text%3E%3C/svg%3E';
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{
                    margin: '0 0 6px 0',
                    fontSize: '15px',
                    fontWeight: '600',
                    color: isDark ? '#e5e5e5' : '#0f172a',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {movie.title}
                  </h4>
                  <div style={{
                    fontSize: '12px',
                    color: isDark ? '#b3b3b3' : '#64748b',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                  }}>
                    <span style={{ color: isDark ? '#fbbf24' : '#f59e0b', fontWeight: '600' }}>
                      ⭐ {(movie.rating || 0).toFixed(1)}
                    </span>
                    {movie.year && <span>📅 {movie.year}</span>}
                    {movie.duration && <span>⏱️ {movie.duration}m</span>}
                  </div>
                  {movie.description && (
                    <p style={{
                      fontSize: '12px',
                      color: isDark ? '#999' : '#999',
                      margin: '6px 0 0 0',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {movie.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {showResults && internalQuery && results.length === 0 && !isLoading && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            right: 0,
            backgroundColor: isDark ? '#1a1a1a' : '#fff',
            border: `1px solid ${isDark ? '#2a2a2a' : '#cbd5e1'}`,
            borderRadius: '10px',
            padding: '32px 20px',
            textAlign: 'center',
            color: isDark ? '#b3b3b3' : '#64748b',
            boxShadow: isDark ? '0 10px 30px rgba(0, 0, 0, 0.5)' : '0 8px 24px rgba(0, 0, 0, 0.12)',
            zIndex: 1000,
          }}>
            <p style={{ fontSize: '18px', margin: 0 }}>❌ Không tìm thấy phim nào</p>
            <p style={{ fontSize: '12px', margin: '8px 0 0 0', opacity: 0.7 }}>
              Thử tìm với từ khóa khác
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .search-bar-container input::placeholder {
          color: ${isDark ? '#808080' : '#64748b'};
        }
      `}</style>
    </div>
  );
};
