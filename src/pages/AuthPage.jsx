import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout.jsx';
import { useAppData } from '../context/AppDataContext.jsx';
import './auth-page.css';

const modes = {
  LOGIN: 'login',
  REGISTER: 'register',
  RESET: 'reset',
};

export const AuthPage = () => {
  const navigate = useNavigate();
  const { login, register, resetPassword } = useAppData();
  const [mode, setMode] = useState(modes.LOGIN);
  const [form, setForm] = useState({ name: '', email: '', password: '', newPassword: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (mode === modes.LOGIN) {
        login(form.email, form.password);
        setMessage('Đăng nhập thành công!');
        setTimeout(() => navigate('/'), 500);
      } else if (mode === modes.REGISTER) {
        register({ name: form.name, email: form.email, password: form.password });
        setMessage('Đăng ký thành công! Vui lòng đăng nhập.');
        setMode(modes.LOGIN);
        setForm({ name: '', email: '', password: '', newPassword: '' });
      } else if (mode === modes.RESET) {
        resetPassword({ email: form.email, newPassword: form.newPassword });
        setMessage('Đổi mật khẩu thành công. Vui lòng đăng nhập lại.');
        setTimeout(() => setMode(modes.LOGIN), 1500);
        setForm({ name: '', email: '', password: '', newPassword: '' });
      }
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-box-netflix">
        <div className="auth-form-wrapper-netflix">
          <h1 className="auth-title-netflix">
            {mode === modes.LOGIN && 'Đăng nhập'}
            {mode === modes.REGISTER && 'Đăng ký'}
            {mode === modes.RESET && 'Đặt lại mật khẩu'}
          </h1>

          <form onSubmit={handleSubmit} className="auth-form-netflix">
            {mode === modes.REGISTER && (
              <div className="form-group-netflix">
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Họ tên"
                  disabled={loading}
                  className="input-netflix"
                  required
                />
              </div>
            )}

            <div className="form-group-netflix">
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email hoặc số điện thoại"
                disabled={loading}
                className="input-netflix"
                required
              />
            </div>

            {mode !== modes.RESET && (
              <div className="form-group-netflix password-group">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Mật khẩu"
                  disabled={loading}
                  className="input-netflix"
                  required
                />
                <button
                  type="button"
                  className="toggle-password-netflix"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Ẩn' : 'Hiện'}
                </button>
              </div>
            )}

            {mode === modes.RESET && (
              <div className="form-group-netflix password-group">
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={form.newPassword}
                  onChange={handleChange}
                  placeholder="Mật khẩu mới"
                  disabled={loading}
                  className="input-netflix"
                  required
                />
                <button
                  type="button"
                  className="toggle-password-netflix"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Ẩn' : 'Hiện'}
                </button>
              </div>
            )}

            {error && (
              <div className="alert-netflix error-netflix">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                  <path d="M15 9l-6 6M9 9l6 6" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                {error}
              </div>
            )}
            {message && (
              <div className="alert-netflix success-netflix">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeWidth="2" strokeLinecap="round"/>
                  <polyline points="22 4 12 14.01 9 11.01" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                {message}
              </div>
            )}

            <button
              type="submit"
              className="btn-submit-netflix"
              disabled={loading}
            >
              {loading ? (
                <div className="loading-spinner-netflix"></div>
              ) : mode === modes.LOGIN ? (
                'Đăng nhập'
              ) : mode === modes.REGISTER ? (
                'Đăng ký'
              ) : (
                'Đặt lại mật khẩu'
              )}
            </button>

            {mode === modes.LOGIN && (
              <div className="form-extras-netflix">
                <label className="remember-me-netflix">
                  <input type="checkbox" />
                  <span>Ghi nhớ đăng nhập</span>
                </label>
                <button
                  type="button"
                  className="forgot-link-netflix"
                  onClick={() => {
                    setMode(modes.RESET);
                    setError('');
                    setMessage('');
                  }}
                >
                  Quên mật khẩu?
                </button>
              </div>
            )}
          </form>

          <div className="auth-switch-netflix">
            {mode === modes.LOGIN && (
              <>
                <span className="switch-text">Bạn mới sử dụng Netflix?</span>
                <button
                  type="button"
                  className="switch-link-netflix"
                  onClick={() => {
                    setMode(modes.REGISTER);
                    setError('');
                    setMessage('');
                  }}
                >
                  Đăng ký ngay
                </button>
              </>
            )}
            {mode === modes.REGISTER && (
              <>
                <span className="switch-text">Đã có tài khoản?</span>
                <button
                  type="button"
                  className="switch-link-netflix"
                  onClick={() => {
                    setMode(modes.LOGIN);
                    setError('');
                    setMessage('');
                  }}
                >
                  Đăng nhập ngay
                </button>
              </>
            )}
            {mode === modes.RESET && (
              <button
                type="button"
                className="switch-link-netflix"
                onClick={() => {
                  setMode(modes.LOGIN);
                  setError('');
                  setMessage('');
                }}
              >
                ← Quay lại đăng nhập
              </button>
            )}
          </div>

          <div className="auth-info-netflix">
            <p>
              Trang này được bảo vệ bởi Google reCAPTCHA để đảm bảo bạn không phải là robot.{' '}
              <a href="#">Tìm hiểu thêm</a>.
            </p>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};
