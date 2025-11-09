import { useState } from 'react';
import './panel.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const STEPS = {
  POSTER: 'poster',           // Step 1: Upload poster image
  VIDEOS: 'videos',            // Step 2: Upload video files
  MOVIE_INFO: 'movie_info',    // Step 3: Create movie record
  EPISODES: 'episodes',        // Step 4: Create episodes
  COMPLETE: 'complete',        // Step 5: Completed
};

export const MovieUpload = () => {
  const [currentStep, setCurrentStep] = useState(STEPS.POSTER);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Step 1: Poster Upload State
  const [posterFile, setPosterFile] = useState(null);
  const [posterPreview, setPosterPreview] = useState('');
  const [posterUrl, setPosterUrl] = useState('');

  // Step 2: Video Upload State
  const [videoFiles, setVideoFiles] = useState([]);     // List of {name, file, duration, quality}
  const [uploadedVideos, setUploadedVideos] = useState([]); // List of {name, url, duration, quality}

  // Step 3: Movie Info Form State
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
    poster_url: '',
    thumb_url: '',
    time: '',
  });

  // Step 4: Episodes/Videos Mapping State
  const [episodes, setEpisodes] = useState([]);
  const [episodeForm, setEpisodeForm] = useState({
    episodeNumber: '',
    title: '',
    description: '',
    videoUrl: '',
    duration: '',
    quality: '1080p',
    language: 'Vietsub',
  });

  // Handle movie info input change
  const handleMovieInfoChange = (e) => {
    const { name, value } = e.target;
    setMovieInfo(prev => ({ ...prev, [name]: value }));
  };

  // Handle episode form input change
  const handleEpisodeFormChange = (e) => {
    const { name, value } = e.target;
    setEpisodeForm(prev => ({ ...prev, [name]: value }));
  };

  // Handle poster file select (for preview)
  const handlePosterFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPosterFile(file);
      // Show preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPosterPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // ========== STEP 1: Upload Poster Image ==========
  const handleSubmitPoster = async (e) => {
    e.preventDefault();
    if (!posterFile) {
      setError('Vui lòng chọn file poster');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('image', posterFile);

      const response = await fetch(`${API_BASE_URL}/api/upload/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload poster failed: ${response.statusText}`);
      }

      const data = await response.json();
      const uploadedPosterUrl = data.data.url;
      setPosterUrl(uploadedPosterUrl);
      
      setMessage('✅ Upload poster thành công! Bây giờ upload video.');
      setCurrentStep(STEPS.VIDEOS);
    } catch (err) {
      setError(`Lỗi upload poster: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ========== STEP 2: Upload Video Files ==========
  const handleVideoFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFiles(prev => [...prev, {
        id: Date.now(),
        name: file.name,
        file: file,
        duration: '',
        quality: '1080p',
      }]);
      setMessage(`✅ Chọn video: ${file.name}`);
      setTimeout(() => setMessage(''), 2000);
    }
  };

  const handleRemoveVideoFile = (id) => {
    setVideoFiles(prev => prev.filter(v => v.id !== id));
  };

  const handleUpdateVideoField = (id, field, value) => {
    setVideoFiles(prev => prev.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  const handleUploadAllVideos = async () => {
    if (videoFiles.length === 0) {
      setError('Vui lòng chọn ít nhất một video');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const uploaded = [];
      
      for (const videoItem of videoFiles) {
        const formData = new FormData();
        formData.append('video', videoItem.file);

        const response = await fetch(`${API_BASE_URL}/api/upload/video`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Upload video ${videoItem.name} failed`);
        }

        const data = await response.json();
        uploaded.push({
          name: videoItem.name,
          url: data.data.url,
          duration: data.data.duration || videoItem.duration,
          quality: videoItem.quality,
          originalId: videoItem.id,
        });

        setMessage(`📤 Đang upload: ${uploaded.length}/${videoFiles.length}`);
      }

      setUploadedVideos(uploaded);
      setMessage('✅ Upload tất cả video thành công! Bây giờ điền thông tin phim.');
      setCurrentStep(STEPS.MOVIE_INFO);
    } catch (err) {
      setError(`Lỗi upload video: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ========== STEP 3: Create Movie Record ==========
  const handleSubmitMovieInfo = async (e) => {
    e.preventDefault();
    if (!movieInfo.name || !movieInfo.slug) {
      setError('Vui lòng điền tên phim và slug');
      return;
    }
    if (!posterUrl) {
      setError('Poster URL không tìm thấy');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      // Parse comma-separated fields
      const directors = movieInfo.director
        .split(',')
        .map(d => d.trim())
        .filter(d => d);
      const actors = movieInfo.actor
        .split(',')
        .map(a => a.trim())
        .filter(a => a);
      const categories = movieInfo.category
        .split(',')
        .map(c => c.trim())
        .filter(c => c)
        .map(slug => ({ name: slug, slug }));
      const countries = movieInfo.country
        .split(',')
        .map(c => c.trim())
        .filter(c => c)
        .map(slug => ({ name: slug, slug }));

      const payload = {
        name: movieInfo.name,
        origin_name: movieInfo.origin_name,
        slug: movieInfo.slug,
        content: movieInfo.content,
        type: movieInfo.type,
        status: movieInfo.status,
        year: movieInfo.year,
        quality: movieInfo.quality,
        lang: movieInfo.lang,
        time: movieInfo.time,
        poster_url: posterUrl,
        thumb_url: posterUrl, // Use same image for thumb
        director: directors,
        actor: actors,
        category: categories,
        country: countries,
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
        throw new Error(`Create movie failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      setMessage('✅ Tạo phim thành công! Bây giờ liên kết video với tập phim.');
      setCurrentStep(STEPS.EPISODES);
    } catch (err) {
      setError(`Lỗi tạo phim: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Submit episodes
  const handleSubmitEpisodes = async (e) => {
    e.preventDefault();
    if (episodes.length === 0) {
      setError('Vui lòng chọn ít nhất một tập phim');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      for (const episode of episodes) {
        const payload = {
          episodeNumber: episode.episodeNumber,
          title: episode.title,
          description: episode.description || '',
          videoUrl: episode.videoUrl,
          duration: episode.duration,
          quality: episode.quality,
          language: episode.language,
        };

        const response = await fetch(
          `${API_BASE_URL}/api/movies/${movieInfo.slug}/episodes`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify(payload),
          }
        );

        if (!response.ok) {
          throw new Error(`Create episode failed: ${response.statusText}`);
        }

        setMessage(`✅ Đã tạo tập ${episode.episodeNumber}`);
      }

      setMessage('🎉 Hoàn thành upload phim thành công!');
      setCurrentStep(STEPS.COMPLETE);
      
      // Reset form after 2 seconds
      setTimeout(() => {
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
          poster_url: '',
          thumb_url: '',
          time: '',
        });
        setEpisodes([]);
        setEpisodeForm({
          episodeNumber: '',
          title: '',
          description: '',
          videoUrl: '',
          duration: '',
          quality: '1080p',
          language: 'Vietsub',
        });
        setPosterFile(null);
        setPosterPreview('');
        setPosterUrl('');
        setVideoFiles([]);
        setUploadedVideos([]);
        setCurrentStep(STEPS.POSTER);
        setMessage('');
      }, 2000);
    } catch (err) {
      setError(`Lỗi tạo tập phim: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: '900px',
      margin: '0 auto',
      padding: '2rem',
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '2rem',
      }}>
        <h1 style={{
          fontSize: '1.75rem',
          fontWeight: 'bold',
          marginBottom: '0.5rem',
          color: '#1f2937',
        }}>➕ Upload Phim Mới</h1>
        <p style={{
          fontSize: '0.95rem',
          color: '#6b7280',
          marginBottom: '2rem',
        }}>Thêm phim, tập phim và hình ảnh vào hệ thống</p>
      </div>

      {/* Step Indicator */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        marginBottom: '2rem',
        position: 'relative',
      }}>
        {[
          { key: STEPS.POSTER, label: 'Upload Poster', number: '1' },
          { key: STEPS.VIDEOS, label: 'Upload Video', number: '2' },
          { key: STEPS.MOVIE_INFO, label: 'Thông tin Phim', number: '3' },
          { key: STEPS.EPISODES, label: 'Tập phim', number: '4' },
          { key: STEPS.COMPLETE, label: 'Hoàn thành', number: '5' },
        ].map(step => (
          <div key={step.key} style={{ textAlign: 'center' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '0.9rem',
              backgroundColor: currentStep === step.key ? '#e11d48' : '#e5e7eb',
              color: currentStep === step.key ? 'white' : '#6b7280',
              zIndex: 2,
            }}>
              {step.number}
            </div>
            <div style={{
              fontSize: '0.75rem',
              marginTop: '0.5rem',
              fontWeight: '500',
              textAlign: 'center',
            }}>{step.label}</div>
          </div>
        ))}
      </div>

      {/* Messages */}
      {error && <div style={{
        padding: '1rem',
        borderRadius: '6px',
        fontSize: '0.95rem',
        backgroundColor: '#fee2e2',
        color: '#991b1b',
        border: '1px solid #fca5a5',
        marginBottom: '1rem',
      }}>{error}</div>}
      {message && <div style={{
        padding: '1rem',
        borderRadius: '6px',
        fontSize: '0.95rem',
        backgroundColor: '#dcfce7',
        color: '#166534',
        border: '1px solid #86efac',
        marginBottom: '1rem',
      }}>{message}</div>}

      {/* Debug Info */}
      <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#f3f4f6', borderRadius: '6px', fontSize: '0.85rem' }}>
        <span style={{ color: '#6b7280' }}>📍 Step: {currentStep} | Token: {localStorage.getItem('token') ? '✅' : '❌'}</span>
      </div>

      {/* Form */}

      {/* STEP 1: Upload Poster Image */}
      {currentStep === STEPS.POSTER && (
        <form onSubmit={handleSubmitPoster} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ backgroundColor: '#fef3c7', padding: '1rem', borderRadius: '8px' }}>
            <strong>📌 Bước 1/5: Upload Poster</strong>
            <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>Chọn file poster cho phim của bạn</p>
          </div>

          <div style={{ textAlign: 'center', backgroundColor: '#f8fafc', padding: '2rem', borderRadius: '8px', border: '2px solid #e5e7eb' }}>
            {posterPreview ? (
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ marginBottom: '0.75rem', color: '#10b981' }}>✅ Preview Poster</h4>
                <img
                  src={posterPreview}
                  alt="Poster preview"
                  style={{ 
                    maxWidth: '100%',
                    maxHeight: '350px',
                    width: 'auto',
                    height: 'auto',
                    borderRadius: '8px',
                    border: '3px solid #10b981',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
                  {posterFile && `📦 ${posterFile.name} (${Math.round(posterFile.size / 1024)}KB)`}
                </p>
              </div>
            ) : (
              <div style={{ padding: '2rem' }}>
                <p style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎬</p>
                <p style={{ fontSize: '1.1rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>Chưa chọn file poster</p>
                <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>Nhấp vào "Chọn file" bên dưới để upload</p>
              </div>
            )}
          </div>

          <label style={{ padding: '1rem', backgroundColor: '#f0f9ff', border: '2px dashed #3b82f6', borderRadius: '8px', cursor: 'pointer', textAlign: 'center' }}>
            <strong style={{ display: 'block', marginBottom: '0.5rem', color: '#1e40af' }}>📁 Chọn file Poster (JPG/PNG)</strong>
            <p style={{ fontSize: '0.9rem', color: '#1e40af', marginBottom: '0.5rem' }}>Kích thước khuyên: 300x450px</p>
            <input
              type="file"
              accept="image/jpeg,image/png"
              onChange={handlePosterFileSelect}
              required
              style={{ display: 'none' }}
            />
          </label>

          <button
            className="primary"
            type="submit"
            disabled={loading || !posterFile}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: !posterFile ? '#9ca3af' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: !posterFile ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              fontSize: '1rem'
            }}
          >
            {loading ? '⏳ Đang tải...' : !posterFile ? '⏸️ Chọn file trước' : '✅ Upload Poster → Tiếp theo'}
          </button>

          {/* Debug Button - Remove later */}
          <button
            type="button"
            onClick={() => setCurrentStep(STEPS.VIDEOS)}
            style={{
              padding: '0.5rem',
              backgroundColor: '#999',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            [DEBUG] Bỏ qua → STEP 2
          </button>
        </form>
      )}

      {/* STEP 2: Upload Video Files */}
      {currentStep === STEPS.VIDEOS && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ backgroundColor: '#fef3c7', padding: '1rem', borderRadius: '8px' }}>
            <strong>🎥 Bước 2/5: Upload Video</strong>
            <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>Upload các file video cho phim</p>
          </div>

          <div style={{ backgroundColor: '#eff6ff', padding: '1rem', borderRadius: '8px', border: '2px solid #3b82f6' }}>
            <p><strong>✅ Poster đã upload thành công!</strong></p>
            <p style={{ fontSize: '0.85rem', color: '#0369a1', wordBreak: 'break-all', marginTop: '0.5rem' }}>{posterUrl}</p>
          </div>

          {/* UPLOAD VIDEO AREA - PROMINENT */}
          <div style={{ 
            backgroundColor: '#f0fdf4',
            padding: '1.5rem',
            borderRadius: '8px',
            border: '3px solid #10b981'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '2rem', marginRight: '0.75rem' }}>⬇️</span>
              <h3 style={{ color: '#059669', margin: 0 }}>CHỖ UPLOAD VIDEO</h3>
            </div>
            
            <label style={{ 
              display: 'block',
              padding: '2rem',
              backgroundColor: '#ffffff',
              border: '3px dashed #10b981',
              borderRadius: '8px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}>
              <strong style={{ display: 'block', marginBottom: '0.75rem', color: '#059669', fontSize: '1.2rem' }}>
                🎥 Nhấp để chọn hoặc kéo file video
              </strong>
              <p style={{ fontSize: '0.95rem', color: '#059669', marginBottom: '0.5rem' }}>
                Hỗ trợ: MP4, WebM, MKV, AVI...
              </p>
              <p style={{ fontSize: '0.85rem', color: '#10b981' }}>
                Kích thước tối đa: 500MB (tùy theo cấu hình server)
              </p>
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoFileSelect}
                disabled={loading}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          {/* Video Files List */}
          {videoFiles.length > 0 && (
            <div>
              <h3>📹 Video đã chọn ({videoFiles.length})</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {videoFiles.map((vid) => (
                  <div
                    key={vid.id}
                    style={{
                      padding: '1rem',
                      backgroundColor: '#f8f9fa',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                    }}
                  >
                    {/* Video Preview Player */}
                    <div style={{ marginBottom: '1rem' }}>
                      <video
                        width="100%"
                        height="200"
                        controls
                        style={{ borderRadius: '6px', backgroundColor: '#000' }}
                      >
                        <source src={URL.createObjectURL(vid.file)} type={vid.file.type} />
                        Trình duyệt của bạn không hỗ trợ video
                      </video>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.75rem',
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div>
                          <strong>🎬 {vid.name}</strong>
                          <span style={{ marginLeft: '0.5rem', fontSize: '0.85rem', color: '#6b7280' }}>
                            ({Math.round(vid.file.size / 1024 / 1024)}MB)
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveVideoFile(vid.id)}
                        style={{
                          padding: '0.4rem 0.8rem',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          marginLeft: '1rem',
                        }}
                      >
                        ✕ Xóa
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
                      <label>
                        <strong>Chất lượng:</strong>
                        <select
                          value={vid.quality}
                          onChange={(e) => handleUpdateVideoField(vid.id, 'quality', e.target.value)}
                          style={{ marginLeft: '0.5rem', width: '100%', marginTop: '0.25rem' }}
                        >
                          <option>720p</option>
                          <option>1080p</option>
                          <option>2K</option>
                          <option>4K</option>
                        </select>
                      </label>
                      <label>
                        <strong>Thời lượng (giây):</strong>
                        <input
                          type="number"
                          value={vid.duration}
                          onChange={(e) => handleUpdateVideoField(vid.id, 'duration', e.target.value)}
                          placeholder="Tự động tính"
                          style={{ marginLeft: '0.5rem', width: '100%', marginTop: '0.25rem' }}
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Uploaded Videos Display */}
          {uploadedVideos.length > 0 && (
            <div style={{ backgroundColor: '#dcfce7', padding: '1.5rem', borderRadius: '8px', border: '2px solid #10b981' }}>
              <h3 style={{ color: '#166534', marginBottom: '1rem' }}>✅ Video đã upload ({uploadedVideos.length})</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {uploadedVideos.map((vid, idx) => (
                  <div key={idx} style={{
                    backgroundColor: 'white',
                    padding: '1rem',
                    borderRadius: '6px',
                    border: '1px solid #d1fae5',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                      <div style={{ flex: 1 }}>
                        <strong style={{ fontSize: '1rem', color: '#166534' }}>🎬 {vid.name}</strong>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.85rem' }}>
                        <span style={{ backgroundColor: '#d1fae5', padding: '0.25rem 0.75rem', borderRadius: '4px', color: '#166534' }}>
                          {vid.quality}
                        </span>
                        <span style={{ backgroundColor: '#d1fae5', padding: '0.25rem 0.75rem', borderRadius: '4px', color: '#166534' }}>
                          ⏱️ {Math.round(vid.duration)}s
                        </span>
                      </div>
                    </div>
                    
                    <div style={{ marginTop: '0.75rem' }}>
                      <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>📎 URL:</p>
                      <div style={{
                        backgroundColor: '#f0fdf4',
                        padding: '0.75rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        color: '#059669',
                        wordBreak: 'break-all',
                        fontFamily: 'monospace',
                        border: '1px solid #bbf7d0',
                      }}>
                        {vid.url}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="button"
              onClick={() => setCurrentStep(STEPS.POSTER)}
              disabled={loading}
              style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              ← Quay lại
            </button>
            <button
              type="button"
              onClick={handleUploadAllVideos}
              disabled={loading || videoFiles.length === 0}
              style={{
                flex: 2,
                padding: '0.75rem',
                backgroundColor: uploadedVideos.length > 0 ? '#10b981' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              {loading ? '⏳ Đang upload...' : uploadedVideos.length > 0 ? '✅ Upload hoàn tất → Tiếp theo' : '📤 Upload Video → Tiếp theo'}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Fill Movie Info */}
      {currentStep === STEPS.MOVIE_INFO && (
        <form onSubmit={handleSubmitMovieInfo} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ backgroundColor: '#fef3c7', padding: '1rem', borderRadius: '8px' }}>
            <strong>📝 Bước 3/5: Thông tin Phim</strong>
            <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>Điền thông tin chi tiết về phim</p>
          </div>

          <div style={{ backgroundColor: '#eff6ff', padding: '1rem', borderRadius: '8px' }}>
            <p><strong>✅ Poster URL:</strong></p>
            <p style={{ fontSize: '0.75rem', color: '#0369a1', wordBreak: 'break-all' }}>{posterUrl}</p>
            {uploadedVideos.length > 0 && (
              <>
                <p style={{ marginTop: '0.5rem' }}><strong>✅ {uploadedVideos.length} Video(s) đã upload</strong></p>
              </>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <label>
              Tên phim *
              <input
                type="text"
                name="name"
                value={movieInfo.name}
                onChange={handleMovieInfoChange}
                placeholder="VD: Trò Chơi Con Mực"
                required
              />
            </label>
            <label>
              Tên gốc
              <input
                type="text"
                name="origin_name"
                value={movieInfo.origin_name}
                onChange={handleMovieInfoChange}
                placeholder="VD: Squid Game"
              />
            </label>
            <label>
              Slug (URL) *
              <input
                type="text"
                name="slug"
                value={movieInfo.slug}
                onChange={handleMovieInfoChange}
                placeholder="VD: tro-choi-con-muc"
                required
              />
            </label>
            <label>
              Năm phát hành
              <input
                type="number"
                name="year"
                value={movieInfo.year}
                onChange={handleMovieInfoChange}
              />
            </label>
            <label>
              Thời lượng (phút)
              <input
                type="number"
                name="time"
                value={movieInfo.time}
                onChange={handleMovieInfoChange}
                placeholder="VD: 50"
              />
            </label>
            <label>
              Loại phim
              <select name="type" value={movieInfo.type} onChange={handleMovieInfoChange}>
                <option value="series">Phim bộ</option>
                <option value="movie">Phim lẻ</option>
                <option value="tv">TV Show</option>
                <option value="animation">Hoạt hình</option>
              </select>
            </label>
            <label>
              Trạng thái
              <select name="status" value={movieInfo.status} onChange={handleMovieInfoChange}>
                <option value="completed">Hoàn thành</option>
                <option value="ongoing">Đang chiếu</option>
                <option value="coming_soon">Sắp chiếu</option>
              </select>
            </label>
            <label>
              Chất lượng
              <select name="quality" value={movieInfo.quality} onChange={handleMovieInfoChange}>
                <option value="SD">SD</option>
                <option value="HD">HD</option>
                <option value="FHD">FHD</option>
                <option value="4K">4K</option>
              </select>
            </label>
            <label>
              Ngôn ngữ
              <input
                type="text"
                name="lang"
                value={movieInfo.lang}
                onChange={handleMovieInfoChange}
                placeholder="VD: Vietsub, Thuyết minh"
              />
            </label>
          </div>

          <label>
            Mô tả
            <textarea
              name="content"
              value={movieInfo.content}
              onChange={handleMovieInfoChange}
              placeholder="Nhập mô tả phim..."
              rows="4"
            />
          </label>

          <label>
            Đạo diễn (cách nhau bằng dấu phẩy)
            <input
              type="text"
              name="director"
              value={movieInfo.director}
              onChange={handleMovieInfoChange}
              placeholder="VD: Đạo diễn A, Đạo diễn B"
            />
          </label>

          <label>
            Diễn viên (cách nhau bằng dấu phẩy)
            <input
              type="text"
              name="actor"
              value={movieInfo.actor}
              onChange={handleMovieInfoChange}
              placeholder="VD: Diễn viên A, Diễn viên B"
            />
          </label>

          <label>
            Thể loại (slugs cách nhau bằng dấu phẩy)
            <input
              type="text"
              name="category"
              value={movieInfo.category}
              onChange={handleMovieInfoChange}
              placeholder="VD: tam-ly, tinh-cam, hanh-dong"
            />
          </label>

          <label>
            Quốc gia (slugs cách nhau bằng dấu phẩy)
            <input
              type="text"
              name="country"
              value={movieInfo.country}
              onChange={handleMovieInfoChange}
              placeholder="VD: quoc-gia-viet-nam, quoc-gia-han-quoc"
            />
          </label>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="button"
              onClick={() => setCurrentStep(STEPS.VIDEOS)}
              disabled={loading}
              style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              ← Quay lại
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 2,
                padding: '0.75rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              {loading ? '⏳ Đang tải...' : '✅ Tạo Phim → Tiếp theo'}
            </button>
          </div>
        </form>
      )}

      {/* STEP 4: Create Episodes and Link Videos */}
      {currentStep === STEPS.EPISODES && (
        <form onSubmit={handleSubmitEpisodes} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ backgroundColor: '#fef3c7', padding: '1rem', borderRadius: '8px' }}>
            <strong>📺 Bước 4/5: Tạo Tập Phim</strong>
            <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>Liên kết video với các tập phim</p>
          </div>

          <div style={{ backgroundColor: '#eff6ff', padding: '1rem', borderRadius: '8px' }}>
            <p><strong>Phim:</strong> {movieInfo.name}</p>
            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}><strong>📊 {uploadedVideos.length} video(s) sẵn sàng</strong></p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem' }}>
            <label>
              Tập số *
              <input
                type="number"
                name="episodeNumber"
                value={episodeForm.episodeNumber}
                onChange={handleEpisodeFormChange}
                placeholder="1"
                required
              />
            </label>
            <label>
              Tên tập *
              <input
                type="text"
                name="title"
                value={episodeForm.title}
                onChange={handleEpisodeFormChange}
                placeholder="VD: Khởi đầu"
                required
              />
            </label>
            <label>
              Chất lượng
              <select name="quality" value={episodeForm.quality} onChange={handleEpisodeFormChange}>
                <option value="720p">720p</option>
                <option value="1080p">1080p</option>
                <option value="2K">2K</option>
                <option value="4K">4K</option>
              </select>
            </label>
            <label>
              Ngôn ngữ
              <input
                type="text"
                name="language"
                value={episodeForm.language}
                onChange={handleEpisodeFormChange}
                placeholder="Vietsub"
              />
            </label>
          </div>

          <label>
            Mô tả (tùy chọn)
            <textarea
              name="description"
              value={episodeForm.description}
              onChange={handleEpisodeFormChange}
              placeholder="Mô tả nội dung tập phim..."
              rows="2"
            />
          </label>

          <label>
            Chọn Video *
            <select
              name="videoUrl"
              value={episodeForm.videoUrl}
              onChange={handleEpisodeFormChange}
              required
            >
              <option value="">-- Chọn video đã upload --</option>
              {uploadedVideos.map((video, idx) => (
                <option key={idx} value={video.url}>
                  {video.name} ({video.quality}) - {video.duration}s
                </option>
              ))}
            </select>
          </label>

          <label>
            Thời lượng (giây) *
            <input
              type="number"
              name="duration"
              value={episodeForm.duration}
              onChange={handleEpisodeFormChange}
              placeholder="VD: 2700"
              required
            />
          </label>

          <button
            type="button"
            onClick={() => {
              if (!episodeForm.episodeNumber || !episodeForm.title || !episodeForm.videoUrl || !episodeForm.duration) {
                setError('Vui lòng điền đầy đủ thông tin tập phim');
                return;
              }
              setEpisodes(prev => [...prev, { ...episodeForm, id: Date.now() }]);
              setEpisodeForm({
                episodeNumber: '',
                title: '',
                description: '',
                videoUrl: '',
                duration: '',
                quality: '1080p',
                language: 'Vietsub',
              });
              setMessage('✅ Đã thêm tập phim vào danh sách');
              setTimeout(() => setMessage(''), 2000);
            }}
            style={{
              padding: '0.75rem',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            ➕ Thêm tập phim
          </button>

          {/* Episodes List */}
          {episodes.length > 0 && (
            <div style={{ marginTop: '1rem', backgroundColor: '#f0fdf4', padding: '1.5rem', borderRadius: '8px', border: '2px solid #10b981' }}>
              <h3 style={{ color: '#166534', marginBottom: '1rem' }}>✅ Danh sách tập phim ({episodes.length} tập)</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {episodes.map((ep) => (
                  <div
                    key={ep.id}
                    style={{
                      padding: '1rem',
                      backgroundColor: 'white',
                      border: '1px solid #d1fae5',
                      borderRadius: '6px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                      <div>
                        <h4 style={{ color: '#059669', marginBottom: '0.25rem' }}>📺 Tập {ep.episodeNumber}: {ep.title}</h4>
                        <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                          {ep.quality} | {ep.language} | ⏱️ {ep.duration}s
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEpisodes(prev => prev.filter(e => e.id !== ep.id))}
                        style={{
                          padding: '0.4rem 0.75rem',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        ✕ Xóa
                      </button>
                    </div>
                    
                    {ep.description && (
                      <div style={{ marginBottom: '0.75rem', fontSize: '0.9rem', color: '#666' }}>
                        <p><strong>Mô tả:</strong> {ep.description}</p>
                      </div>
                    )}
                    
                    <div style={{
                      backgroundColor: '#f0fdf4',
                      padding: '0.75rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      color: '#059669',
                      wordBreak: 'break-all',
                      fontFamily: 'monospace',
                      border: '1px solid #d1fae5',
                    }}>
                      <p style={{ margin: '0 0 0.5rem 0', color: '#6b7280' }}>📎 Video URL:</p>
                      {ep.videoUrl}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={() => setCurrentStep(STEPS.MOVIE_INFO)}
              disabled={loading}
              style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              ← Quay lại
            </button>
            <button
              type="submit"
              disabled={loading || episodes.length === 0}
              style={{
                flex: 2,
                padding: '0.75rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              {loading ? '⏳ Đang tạo tập...' : '✅ Tạo Tất Cả Tập → Hoàn thành'}
            </button>
          </div>
        </form>
      )}

      {/* STEP 5: Complete */}
      {currentStep === STEPS.COMPLETE && (
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          backgroundColor: '#dcfce7',
          borderRadius: '8px',
          border: '2px solid #10b981',
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
          <h2 style={{ color: '#166534', marginBottom: '0.5rem' }}>Hoàn thành Upload Phim!</h2>
          <p style={{ color: '#166534', marginBottom: '1.5rem' }}>
            Phim "{movieInfo.name}" đã được thêm vào hệ thống với {episodes.length} tập
          </p>
          <p style={{ fontSize: '0.9rem', color: '#15803d', marginBottom: '1.5rem' }}>
            Bạn có thể quay lại trang chủ hoặc upload phim tiếp theo
          </p>
          <button
            onClick={() => {
              setCurrentStep(STEPS.POSTER);
              setMessage('');
              setError('');
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
                poster_url: '',
                thumb_url: '',
                time: '',
              });
              setEpisodes([]);
              setEpisodeForm({
                episodeNumber: '',
                title: '',
                description: '',
                videoUrl: '',
                duration: '',
                quality: '1080p',
                language: 'Vietsub',
              });
              setPosterFile(null);
              setPosterPreview('');
              setPosterUrl('');
              setVideoFiles([]);
              setUploadedVideos([]);
            }}
            style={{
              padding: '0.75rem 2rem',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1rem',
            }}
          >
            ➕ Upload Phim Tiếp Theo
          </button>
        </div>
      )}
    </div>
  );
};
