import { useState } from 'react';
import { useAppData } from '../context/AppDataContext.jsx';
import './panel.css';

const modes = {
  LOGIN: 'login',
  REGISTER: 'register',
  RESET: 'reset',
};

export const AuthPanel = () => {
  const { currentUser, login, register, resetPassword, logout } = useAppData();
  const [mode, setMode] = useState(modes.LOGIN);
  const [form, setForm] = useState({ name: '', email: '', password: '', newPassword: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      if (mode === modes.LOGIN) {
        await login(form.email, form.password);
        setMessage('Đăng nhập thành công');
      } else if (mode === modes.REGISTER) {
        await register({ name: form.name, email: form.email, password: form.password });
        setMessage('Đăng ký thành công');
      } else if (mode === modes.RESET) {
        await resetPassword({ email: form.email, newPassword: form.newPassword });
        setMessage('Đổi mật khẩu thành công, hãy đăng nhập lại');
        setMode(modes.LOGIN);
      }
      setForm({ name: '', email: '', password: '', newPassword: '' });
    } catch (err) {
      setError(err.message);
    }
  };

  if (currentUser) {
    return (
      <div className="panel">
        <h3>Xin chào, {currentUser.name}</h3>
        <p>Vai trò: {currentUser.role === 'admin' ? 'Quản trị' : 'Thành viên'}</p>
        <button className="primary" onClick={logout}>
          Đăng xuất
        </button>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="panel-tabs">
        <button
          className={mode === modes.LOGIN ? 'active' : ''}
          onClick={() => setMode(modes.LOGIN)}
        >
          Đăng nhập
        </button>
        <button
          className={mode === modes.REGISTER ? 'active' : ''}
          onClick={() => setMode(modes.REGISTER)}
        >
          Đăng ký
        </button>
        <button
          className={mode === modes.RESET ? 'active' : ''}
          onClick={() => setMode(modes.RESET)}
        >
          Quên mật khẩu
        </button>
      </div>

      <form onSubmit={handleSubmit} className="panel-form">
        {mode === modes.REGISTER && (
          <label>
            Họ tên
            <input name="name" value={form.name} onChange={handleChange} required />
          </label>
        )}
        <label>
          Email
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </label>
        {mode !== modes.RESET && (
          <label>
            Mật khẩu
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </label>
        )}
        {mode === modes.RESET && (
          <label>
            Mật khẩu mới
            <input
              name="newPassword"
              type="password"
              value={form.newPassword}
              onChange={handleChange}
              required
            />
          </label>
        )}
        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}
        <button type="submit" className="primary">
          {mode === modes.LOGIN && 'Đăng nhập'}
          {mode === modes.REGISTER && 'Đăng ký'}
          {mode === modes.RESET && 'Đặt lại mật khẩu'}
        </button>
      </form>
    </div>
  );
};
