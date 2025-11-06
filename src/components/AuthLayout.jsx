import './auth-layout.css';

export const AuthLayout = ({ children }) => {
  return (
    <div className="auth-shell-netflix">
      <div className="auth-background-netflix" />
      <div className="auth-overlay-netflix" />
      <div className="auth-container-netflix">
        <div className="auth-header-netflix">
          <div className="netflix-logo-auth">NETFLIX</div>
        </div>
        <div className="auth-content-netflix">{children}</div>
        <div className="auth-footer-netflix">
          <p>Câu hỏi? Liên hệ chúng tôi.</p>
          <div className="footer-links">
            <a href="#">Câu hỏi thường gặp</a>
            <a href="#">Trung tâm trợ giúp</a>
            <a href="#">Điều khoản sử dụng</a>
            <a href="#">Quyền riêng tư</a>
          </div>
          <p className="copyright">Netflix Vietnam © {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
};
