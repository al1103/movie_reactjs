import { useState } from 'react';
import './panel.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const STEPS = {
  INFO: 'info',
  EPISODES: 'episodes',
  POSTER: 'poster',
};

export const MovieUpload = () => {
  const [currentStep, setCurrentStep] = useState(STEPS.INFO);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Movie Info
  const [movieInfo, setMovieInfo] = useState({
    name: '',
    origin_name: '',
    slug: '',
    content: '',
    type: 'series',
    status: 'ongoing',
    year: new Date().getFullYear(),
    quality: 'HD',
    lang: 'Vietsub',
    director: '',
    actor: '',
    category: '',
    country: '',
  });

  // Episodes
  const [episodes, setEpisodes] = useState([]);
  const [episodeForm, setEpisodeForm] = useState({
    episode_number: '',
    episode_title: '',
    video_url: '',
    duration: '',
  });

  // Poster
  const [posterFile, setPosterFile] = useState(null);
  const [posterPreview, setPosterPreview] = useState('');

  // Handlers
  const handleMovieInfoChange = (e) => {
    const { name, value } = e.target;
    setMovieInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleEpisodeFormChange = (e) => {
    const { name, value } = e.target;
    setEpisodeForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAddEpisode = () => {
    if (!episodeForm.episode_number || !episodeForm.episode_title) {
      setError('Vui lòng điền đầy đủ thông tin tập phim');
      return;
    }
    setEpisodes(prev => [...prev, { ...episodeForm, id: Date.now() }]);
    setEpisodeForm({ episode_number: '', episode_title: '', video_url: '', duration: '' });
    setMessage('✅ Đã thêm tập phim');
    setTimeout(() => setMessage(''), 2000);
  };

  const handleRemoveEpisode = (id) => {
    setEpisodes(prev => prev.filter(ep => ep.id !== id));
  };

  const handlePosterFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPosterFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPosterPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // API Calls
  const handleSubmitMovieInfo = async (e) => {
    e.preventDefault();
    if (!movieInfo.name || !movieInfo.slug) {
      setError('Vui lòng điền tên phim và slug');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        ...movieInfo,
        director: movieInfo.director.split(',').map(d => d.trim()).filter(Boolean),
        actor: movieInfo.actor.split(',').map(a => a.trim()).filter(Boolean),
      };

      const response = await fetch(`${API_BASE_URL}/api/movies/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        try {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Lỗi tạo phim');
        } catch (e) {
          throw new Error('Lỗi tạo phim');
        }
      }

      setMessage('✅ Tạo phim thành công! Tiếp tục thêm tập phim.');
      setCurrentStep(STEPS.EPISODES);
    } catch (err) {
      setError('❌ ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitEpisodes = async (e) => {
    e.preventDefault();
    if (episodes.length === 0) {
      setError('Vui lòng thêm ít nhất 1 tập phim');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        episodes: episodes.map(ep => ({
          episode_number: ep.episode_number,
          episode_title: ep.episode_title,
          video_url: ep.video_url,
          duration: ep.duration,
        })),
      };

      const response = await fetch(`${API_BASE_URL}/api/movies/${movieInfo.slug}/episodes/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        try {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Lỗi tải tập phim');
        } catch (e) {
          throw new Error('Lỗi tải tập phim');
        }
      }

      setMessage('✅ Thêm tập phim thành công! Tiếp tục thêm poster.');
      setCurrentStep(STEPS.POSTER);
    } catch (err) {
      setError('❌ ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPoster = async (e) => {
    e.preventDefault();
    if (!posterFile) {
      setError('Vui lòng chọn file poster');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('poster', posterFile);

      const response = await fetch(`${API_BASE_URL}/api/movies/${movieInfo.slug}/poster/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        try {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Lỗi tải poster');
        } catch (e) {
          throw new Error('Lỗi tải poster');
        }
      }

      setMessage('✅ Upload hoàn thành! Phim đã được thêm vào hệ thống.');
      setTimeout(() => {
        setCurrentStep(STEPS.INFO);
        setMovieInfo({
          name: '',
          origin_name: '',
          slug: '',
          content: '',
          type: 'series',
          status: 'ongoing',
          year: new Date().getFullYear(),
          quality: 'HD',
          lang: 'Vietsub',
          director: '',
          actor: '',
          category: '',
          country: '',
        });
        setEpisodes([]);
        setPosterFile(null);
        setPosterPreview('');
        setMessage('');
      }, 2000);
    } catch (err) {
      setError('❌ ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Styles
  const styles = {
    container: {
      maxWidth: '900px',
      margin: '0 auto',
      padding: '2rem',
    },
    header: {
      textAlign: 'center',
      marginBottom: '2rem',
    },
    title: {
      fontSize: '1.75rem',
      fontWeight: 'bold',
      marginBottom: '0.5rem',
      color: '#1f2937',
    },
    subtitle: {
      fontSize: '0.95rem',
      color: '#6b7280',
      marginBottom: '2rem',
    },
    stepIndicator: {
      display: 'flex',
      justifyContent: 'space-around',
      marginBottom: '2rem',
      position: 'relative',
    },
    stepDot: (isActive) => ({
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      fontSize: '0.9rem',
      backgroundColor: isActive ? '#e11d48' : '#e5e7eb',
      color: isActive ? 'white' : '#6b7280',
      zIndex: 2,
    }),
    stepLabel: {
      fontSize: '0.85rem',
      marginTop: '0.5rem',
      fontWeight: '500',
      textAlign: 'center',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      backgroundColor: 'white',
      padding: '2rem',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    },
    label: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      fontWeight: '500',
      color: '#1f2937',
    },
    input: {
      padding: '0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '0.95rem',
      fontFamily: 'inherit',
    },
    textarea: {
      padding: '0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '0.95rem',
      fontFamily: 'inherit',
      minHeight: '100px',
    },
    grid2: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '1rem',
    },
    grid4: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '1rem',
    },
    button: {
      padding: '0.75rem 1.5rem',
      border: 'none',
      borderRadius: '6px',
      fontSize: '0.95rem',
      fontWeight: '600',
      cursor: 'pointer',
    },
    buttonPrimary: {
      backgroundColor: '#e11d48',
      color: 'white',
    },
    buttonSecondary: {
      backgroundColor: '#6b7280',
      color: 'white',
    },
    buttonGroup: {
      display: 'flex',
      gap: '1rem',
    },
    alert: (type) => ({
      padding: '1rem',
      borderRadius: '6px',
      fontSize: '0.95rem',
      backgroundColor: type === 'error' ? '#fee2e2' : '#dcfce7',
      color: type === 'error' ? '#991b1b' : '#166534',
      border: `1px solid ${type === 'error' ? '#fca5a5' : '#86efac'}`,
    }),
    episodeItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem',
      backgroundColor: '#f3f4f6',
      borderRadius: '6px',
      marginBottom: '0.5rem',
    },
    infoBox: {
      padding: '1rem',
      backgroundColor: '#f0f9ff',
      borderRadius: '6px',
      fontSize: '0.95rem',
      borderLeft: '4px solid #0284c7',
    },
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>➕ Upload Phim Mới</h1>
        <p style={styles.subtitle}>Thêm phim, tập phim và hình ảnh vào hệ thống</p>
      </div>

      {/* Step Indicator */}
      <div style={styles.stepIndicator}>
        {[
          { key: STEPS.INFO, label: 'Thông tin', number: '1' },
          { key: STEPS.EPISODES, label: 'Tập phim', number: '2' },
          { key: STEPS.POSTER, label: 'Poster', number: '3' },
        ].map(step => (
          <div key={step.key} style={{ textAlign: 'center' }}>
            <div style={styles.stepDot(currentStep === step.key)}>
              {step.number}
            </div>
            <div style={styles.stepLabel}>{step.label}</div>
          </div>
        ))}
      </div>

      {/* Messages */}
      {error && <div style={styles.alert('error')}>{error}</div>}
      {message && <div style={styles.alert('success')}>{message}</div>}

      {/* Form */}
      <form style={styles.form} onSubmit={
        currentStep === STEPS.INFO ? handleSubmitMovieInfo :
        currentStep === STEPS.EPISODES ? handleSubmitEpisodes :
        handleSubmitPoster
      }>

        {/* STEP 1: Movie Info */}
        {currentStep === STEPS.INFO && (
          <>
            <div style={styles.grid2}>
              <label style={styles.label}>
                Tên phim *
                <input
                  style={styles.input}
                  type="text"
                  name="name"
                  value={movieInfo.name}
                  onChange={handleMovieInfoChange}
                  placeholder="VD: Trò Chơi Con Mực"
                  required
                />
              </label>
              <label style={styles.label}>
                Tên gốc
                <input
                  style={styles.input}
                  type="text"
                  name="origin_name"
                  value={movieInfo.origin_name}
                  onChange={handleMovieInfoChange}
                  placeholder="VD: Squid Game"
                />
              </label>
            </div>

            <label style={styles.label}>
              Slug URL *
              <input
                style={styles.input}
                type="text"
                name="slug"
                value={movieInfo.slug}
                onChange={handleMovieInfoChange}
                placeholder="VD: tro-choi-con-muc"
                required
              />
            </label>

            <label style={styles.label}>
              Nội dung
              <textarea
                style={styles.textarea}
                name="content"
                value={movieInfo.content}
                onChange={handleMovieInfoChange}
                placeholder="Mô tả chi tiết về phim..."
              />
            </label>

            <div style={styles.grid2}>
              <label style={styles.label}>
                Loại
                <select style={styles.input} name="type" value={movieInfo.type} onChange={handleMovieInfoChange}>
                  <option value="series">Series</option>
                  <option value="movie">Movie</option>
                  <option value="single">Single</option>
                </select>
              </label>
              <label style={styles.label}>
                Trạng thái
                <select style={styles.input} name="status" value={movieInfo.status} onChange={handleMovieInfoChange}>
                  <option value="ongoing">Đang chiếu</option>
                  <option value="completed">Hoàn thành</option>
                  <option value="coming">Sắp chiếu</option>
                </select>
              </label>
            </div>

            <div style={styles.grid4}>
              <label style={styles.label}>
                Năm
                <input
                  style={styles.input}
                  type="number"
                  name="year"
                  value={movieInfo.year}
                  onChange={handleMovieInfoChange}
                />
              </label>
              <label style={styles.label}>
                Chất lượng
                <input
                  style={styles.input}
                  type="text"
                  name="quality"
                  value={movieInfo.quality}
                  onChange={handleMovieInfoChange}
                  placeholder="HD, 4K"
                />
              </label>
              <label style={styles.label}>
                Ngôn ngữ
                <input
                  style={styles.input}
                  type="text"
                  name="lang"
                  value={movieInfo.lang}
                  onChange={handleMovieInfoChange}
                  placeholder="Vietsub"
                />
              </label>
              <label style={styles.label}></label>
            </div>

            <label style={styles.label}>
              Đạo diễn (cách bằng dấu phẩy)
              <input
                style={styles.input}
                type="text"
                name="director"
                value={movieInfo.director}
                onChange={handleMovieInfoChange}
                placeholder="Đạo diễn A, Đạo diễn B"
              />
            </label>

            <label style={styles.label}>
              Diễn viên (cách bằng dấu phẩy)
              <input
                style={styles.input}
                type="text"
                name="actor"
                value={movieInfo.actor}
                onChange={handleMovieInfoChange}
                placeholder="Diễn viên A, Diễn viên B"
              />
            </label>

            <label style={styles.label}>
              Thể loại (cách bằng dấu phẩy)
              <input
                style={styles.input}
                type="text"
                name="category"
                value={movieInfo.category}
                onChange={handleMovieInfoChange}
                placeholder="tam-ly, tinh-cam"
              />
            </label>

            <label style={styles.label}>
              Quốc gia (cách bằng dấu phẩy)
              <input
                style={styles.input}
                type="text"
                name="country"
                value={movieInfo.country}
                onChange={handleMovieInfoChange}
                placeholder="quoc-gia-han-quoc"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              style={{ ...styles.button, ...styles.buttonPrimary, opacity: loading ? 0.6 : 1 }}
            >
              {loading ? '⏳ Đang xử lý...' : 'Tiếp tục → Thêm tập phim'}
            </button>
          </>
        )}

        {/* STEP 2: Episodes */}
        {currentStep === STEPS.EPISODES && (
          <>
            <div style={styles.infoBox}>
              <strong>📽️ Phim:</strong> {movieInfo.name} ({movieInfo.slug})
            </div>

            <div>
              <h3 style={{ marginBottom: '1rem' }}>Thêm Tập Phim</h3>
              <div style={styles.grid4}>
                <label style={styles.label}>
                  Số tập *
                  <input
                    style={styles.input}
                    type="number"
                    name="episode_number"
                    value={episodeForm.episode_number}
                    onChange={handleEpisodeFormChange}
                    placeholder="1"
                  />
                </label>
                <label style={styles.label}>
                  Tên tập *
                  <input
                    style={styles.input}
                    type="text"
                    name="episode_title"
                    value={episodeForm.episode_title}
                    onChange={handleEpisodeFormChange}
                    placeholder="Tập 1 - Khởi đầu"
                  />
                </label>
                <label style={styles.label}>
                  Thời lượng (phút)
                  <input
                    style={styles.input}
                    type="number"
                    name="duration"
                    value={episodeForm.duration}
                    onChange={handleEpisodeFormChange}
                    placeholder="45"
                  />
                </label>
                <label style={styles.label}>
                  <div style={{ height: '2rem' }}></div>
                  <button
                    type="button"
                    onClick={handleAddEpisode}
                    style={{ ...styles.button, ...styles.buttonPrimary, width: '100%' }}
                  >
                    + Thêm
                  </button>
                </label>
              </div>

              <label style={{ ...styles.label, marginTop: '1rem' }}>
                Video URL (tuỳ chọn)
                <input
                  style={styles.input}
                  type="url"
                  name="video_url"
                  value={episodeForm.video_url}
                  onChange={handleEpisodeFormChange}
                  placeholder="https://..."
                />
              </label>
            </div>

            {episodes.length > 0 && (
              <div>
                <h3 style={{ marginBottom: '1rem' }}>📋 Danh sách tập ({episodes.length} tập)</h3>
                {episodes.map(ep => (
                  <div key={ep.id} style={styles.episodeItem}>
                    <span>
                      <strong>Tập {ep.episode_number}:</strong> {ep.episode_title}
                      {ep.duration && ` (${ep.duration} phút)`}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveEpisode(ep.id)}
                      style={{ ...styles.button, ...styles.buttonSecondary, backgroundColor: '#ef4444' }}
                    >
                      Xóa
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div style={styles.buttonGroup}>
              <button
                type="button"
                onClick={() => setCurrentStep(STEPS.INFO)}
                style={{ ...styles.button, ...styles.buttonSecondary, flex: 1 }}
              >
                ← Quay lại
              </button>
              <button
                type="submit"
                disabled={loading || episodes.length === 0}
                style={{ ...styles.button, ...styles.buttonPrimary, flex: 1, opacity: episodes.length === 0 ? 0.5 : 1 }}
              >
                {loading ? '⏳ Đang xử lý...' : 'Tiếp tục → Thêm Poster'}
              </button>
            </div>
          </>
        )}

        {/* STEP 3: Poster */}
        {currentStep === STEPS.POSTER && (
          <>
            <div style={styles.infoBox}>
              <strong>📽️ Phim:</strong> {movieInfo.name} ({movieInfo.slug})
              <br />
              <strong>📺 Tập phim:</strong> {episodes.length} tập
            </div>

            <div>
              {posterPreview ? (
                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                  <img
                    src={posterPreview}
                    alt="Poster preview"
                    style={{ maxWidth: '250px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                  />
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '2rem',
                  border: '2px dashed #cbd5e1',
                  borderRadius: '8px',
                  backgroundColor: '#f8fafc',
                }}>
                  <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>🖼️ Chọn file Poster</p>
                  <p style={{ fontSize: '0.85rem', color: '#6b7280' }}>JPG hoặc PNG, kích thước tối đa: 5MB</p>
                </div>
              )}
            </div>

            <label style={styles.label}>
              Chọn file Poster *
              <input
                style={styles.input}
                type="file"
                accept="image/jpeg,image/png"
                onChange={handlePosterFileSelect}
                required
              />
            </label>

            <div style={styles.buttonGroup}>
              <button
                type="button"
                onClick={() => setCurrentStep(STEPS.EPISODES)}
                style={{ ...styles.button, ...styles.buttonSecondary, flex: 1 }}
              >
                ← Quay lại
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{ ...styles.button, ...styles.buttonPrimary, flex: 1, opacity: loading ? 0.6 : 1 }}
              >
                {loading ? '⏳ Đang xử lý...' : '✅ Hoàn thành Upload'}
              </button>
            </div>
          </>
        )}

      </form>
    </div>
  );
};
