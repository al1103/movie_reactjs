import './auth-layout.css';

export const AuthLayout = ({ children }) => {
  return (
    <div className="auth-shell-MOIVE">
      <div className="auth-background-MOIVE" />
      <div className="auth-overlay-MOIVE" />
      <div className="auth-container-MOIVE">
        <div className="auth-header-MOIVE">
          <div className="MOIVE-logo-auth">MOIVE</div>
        </div>
        <div className="auth-content-MOIVE">{children}</div>
        <div className="auth-footer-MOIVE">
          <p>Câu hỏi? Liên hệ chúng tôi.</p>
          <div className="footer-links">
            <a href="#">Câu hỏi thường gặp</a>
            <a href="#">Trung tâm trợ giúp</a>
            <a href="#">Điều khoản sử dụng</a>
            <a href="#">Quyền riêng tư</a>
          </div>
          <p className="copyright">MOIVE Vietnam © {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
};
