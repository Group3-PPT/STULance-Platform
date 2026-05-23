import React, { useState } from 'react';
import { Container, Form, Button, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { User, Building2, Mail, Globe, Smartphone, Code } from 'lucide-react';
import '../CSS/Auth.css';

const Auth = () => {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [role, setRole] = useState('sv'); // 'sv' or 'dn'
  const navigate = useNavigate();

  const handleAuthAction = () => {
    if (mode === 'login') {
      alert(`Đang đăng nhập hệ thống ${role === 'sv' ? 'Sinh viên' : 'Doanh nghiệp'}...`);
      navigate(role === 'sv' ? '/portfolio' : '/');
    } else {
      alert('Yêu cầu đăng ký đã được gửi!');
    }
  };

  return (
    <div className="auth-wrapper">
      <Container className="d-flex justify-content-center">
        <div className="glass-card auth-card shadow-lg">
          {/* Main Tabs */}
          <div className="auth-tabs">
            <div 
              className={`tab ${mode === 'login' ? 'active' : ''}`} 
              onClick={() => setMode('login')}
            >
              Đăng nhập
            </div>
            <div 
              className={`tab ${mode === 'register' ? 'active' : ''}`} 
              onClick={() => setMode('register')}
            >
              Đăng ký
            </div>
          </div>

          {/* Role Selector */}
          <div className="role-selector">
            <div 
              className={`role-tab ${role === 'sv' ? 'active' : ''}`} 
              onClick={() => setRole('sv')}
            >
              <User size={14} className="me-1" /> Sinh viên
            </div>
            <div 
              className={`role-tab ${role === 'dn' ? 'active' : ''}`} 
              onClick={() => setRole('dn')}
            >
              <Building2 size={14} className="me-1" /> Doanh nghiệp
            </div>
          </div>

          <div className="auth-form-container">
            <h3 className="text-center text-white mb-4 fs-5">
              {mode === 'login' 
                ? (role === 'sv' ? 'Sinh viên đăng nhập' : 'Doanh nghiệp đăng nhập')
                : (role === 'sv' ? 'Đăng ký Sinh viên' : 'Đăng ký Doanh nghiệp')
              }
            </h3>

            <Form>
              {mode === 'register' && (
                <Form.Group className="mb-3 form-group">
                  <Form.Label>{role === 'sv' ? 'Họ và Tên' : 'Tên Công ty / Đơn vị'}</Form.Label>
                  <Form.Control 
                    className="form-control-dark" 
                    placeholder={role === 'sv' ? 'Nguyễn Văn A' : 'Công ty TechNova'} 
                  />
                </Form.Group>
              )}

              <Form.Group className="mb-3 form-group">
                <Form.Label>Email liên hệ</Form.Label>
                <Form.Control 
                  type="email" 
                  className="form-control-dark" 
                  placeholder="example@gmail.com" 
                />
              </Form.Group>

              {mode === 'register' && role === 'sv' && (
                <Form.Group className="mb-3 form-group">
                  <Form.Label>Trường đại học</Form.Label>
                  <Form.Control 
                    className="form-control-dark" 
                    placeholder="Ví dụ: ĐH Bách Khoa" 
                  />
                </Form.Group>
              )}

              <Form.Group className="mb-3 form-group">
                <Form.Label>Mật khẩu</Form.Label>
                <Form.Control 
                  type="password" 
                  className="form-control-dark" 
                  placeholder="••••••••" 
                />
              </Form.Group>

              <div className="d-flex justify-content-between align-items-center mb-4">
                <Form.Check 
                  type="checkbox" 
                  label={<span className="small text-secondary">Ghi nhớ</span>} 
                  id="remember-me"
                />
                {mode === 'login' && (
                  <a href="#forgot" className="small text-primary text-decoration-none">Quên mật khẩu?</a>
                )}
              </div>

              <Button 
                variant="primary" 
                className="w-100 py-3 fw-bold" 
                onClick={handleAuthAction}
              >
                {mode === 'login' ? 'ĐĂNG NHẬP' : 'TẠO TÀI KHOẢN'}
              </Button>
            </Form>

            <div className="social-text">Hoặc tiếp tục với</div>
            
            <div className="d-flex gap-3 justify-content-center">
              <div className="s-btn"><Globe size={20} /></div> {/* Thay cho Google/Chrome */}
              <div className="s-btn"><Mail size={20} /></div>
              <div className="s-btn"><Smartphone size={20} /></div> {/* Thay cho Apple */}
              <div className="s-btn"><Code size={20} /></div> {/* Thay cho Github */}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Auth;