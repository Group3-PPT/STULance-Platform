import React, { useState } from 'react';
import { Container, Form, Button, InputGroup, Spinner } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn, ChevronLeft } from 'lucide-react';
import { authService } from '../../services/authService'; 
import '../../CSS/Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const email = e.target.elements.email.value;
      const password = e.target.elements.password.value;

      const res = await authService.login({ email, password });
      const result = res.data.data;

      if (!result) {
        alert("Lỗi: Server không trả về dữ liệu!");
        return;
      }

      if (result.requiresPolicyAcceptance) {
        sessionStorage.setItem('pendingPolicyEmail', email);
        sessionStorage.setItem('pendingPolicyPassword', password);
        navigate('/policy', {
          state: {
            email,
            policyVersion: result.policyVersion,
            policyUrl: result.policyUrl,
            policyTitle: result.policyTitle
          }
        });
        return;
      }

      const tokenToSave = result.accessToken || result.token;
      if (!tokenToSave) {
        alert("Lỗi: Server không trả về Token!");
        return;
      }

      window.dispatchEvent(new Event("local-storage-update"));

      const roleValue = result.roleId || result.roleName || result.role;
      if (roleValue === 'STUDENT' || roleValue === 'odl1dDNm') { 
        alert("Đăng nhập thành công!");
        navigate('/dashboardlancer');
      }
      else if (roleValue === 'ENTERPRISE' || roleValue === 'Jx7ze2Kd') { 
        alert("Đăng nhập thành công! \nChào mừng quý đối tác, Nhà tuyển dụng");
        navigate('/manage-jobs');
      } 
      else if (roleValue === 'ADMIN' || roleValue === 'pPDY5Dnk') { 
        alert("Đăng nhập thành công! \nChào Quản trị viên");
        navigate('/admin');
      } 
      else {
        alert("Đăng nhập thành công!");
        navigate('/');
      }

    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      const errorMsg = error.response?.data?.message || "Email hoặc mật khẩu không chính xác!";
      alert("Đăng nhập thất bại: " + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container py-5 animate-fade-in">
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="glass-card auth-card p-4 p-md-5 shadow-lg">
          
          <div className="mb-4 text-center">
            <h2 className="text-white fw-bold mb-2">ĐĂNG NHẬP</h2>
            <p className="text-white-50 small">Hệ thống kết nối Freelancer Sinh viên</p>
          </div>

          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-3">
              <Form.Label className="text-white-80 small fw-bold">EMAIL</Form.Label>
              <InputGroup className="auth-input-group">
                <InputGroup.Text className="bg-transparent border-secondary text-primary"><Mail size={18}/></InputGroup.Text>
                <Form.Control 
                  name="email" 
                  type="email" 
                  className="auth-input bg-transparent text-white border-secondary shadow-none" 
                  placeholder="name@example.com" 
                  required 
                />
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="text-white-80 small fw-bold">MẬT KHẨU</Form.Label>
              <InputGroup className="auth-input-group">
                <InputGroup.Text className="bg-transparent border-secondary text-primary"><Lock size={18}/></InputGroup.Text>
                <Form.Control 
                  name="password"
                  type="password" 
                  className="auth-input bg-transparent text-white border-secondary shadow-none" 
                  placeholder="••••••••" 
                  required 
                />
              </InputGroup>
            </Form.Group>

            <div className="d-flex justify-content-between align-items-center mb-4">
              <Form.Check 
                type="checkbox" 
                id="remember-me" 
                label={<span className="x-small text-white-50">Ghi nhớ đăng nhập</span>}
                className="custom-checkbox"
              />
              <Link to="/forgot-password" size="sm" className="x-small text-primary text-decoration-none fw-bold">
                Quên mật khẩu?
              </Link>
            </div>

            <Button 
              type="submit" 
              variant="primary" 
              className="w-100 py-3 fw-bold mb-3 shadow-glow btn-main-login"
              disabled={loading}
            >
              {loading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                <><LogIn size={18} className="me-2" /> VÀO HỆ THỐNG</>
              )}
            </Button>
          </Form>

          <div className="social-divider my-4">
            <span>Hoặc tiếp tục với</span>
          </div>

          <div className="social-login-area text-center">
            <Button className="btn-google-login w-100 py-2 fw-bold" onClick={() => alert("Đăng nhập Google đang được phát triển. Vui lòng sử dụng email/mật khẩu.")}>
              <i className="fab fa-google me-2"></i> Google
            </Button>
          </div>

          <div className="text-center mt-4 pt-3 border-top border-white-10">
            <span className="text-white-50 small">Chưa có tài khoản? </span>
            <Link to="/register" className="text-primary small fw-bold text-decoration-none">Đăng ký ngay</Link>
          </div>
          
          <div className="text-center mt-3">
             <Link to="/" className="x-small text-muted text-decoration-none">
                <ChevronLeft size={12}/> Quay lại trang chủ
             </Link>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Login;
