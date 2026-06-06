import React, { useState, useRef, useEffect } from 'react';
import { Container, Form, Button, InputGroup, Spinner } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, Smartphone, RefreshCw, Clock, Building2 } from 'lucide-react';
import axios from 'axios';
import '../../CSS/Register.css';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [timer, setTimer] = useState(120); 
  
  // State form đăng ký theo Schema
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    roleId: 'odl1dDNm' // Mặc định ban đầu là Sinh viên (ID: 2)
  });

  const [otp, setOtp] = useState(new Array(6).fill(""));
  const inputRefs = useRef([]);

  // Logic đếm ngược
  useEffect(() => {
    let interval;
    if (isOtpSent && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else if (timer === 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isOtpSent, timer]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- LOGIC 1: GỬI ĐĂNG KÝ ---
  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }
    setLoading(true);
    try {
      // Dữ liệu gửi đi khớp 100% Schema: email, password, confirmPassword, roleId
      await axios.post('/api/v1/auth/register', {
        ...formData,
        roleId: String(formData.roleId)
      });
      setIsOtpSent(true);
      setTimer(120);
      alert("Mã OTP đã được gửi!");
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi đăng ký! Kiểm tra lại mật khẩu (Hoa, thường, số, ký tự đặc biệt).");
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIC 2: XÁC THỰC OTP ---
  const handleVerifyOtp = async () => {
    const codeString = otp.join("");
    if (codeString.length < 6) {
      alert("Vui lòng nhập đủ 6 chữ số.");
      return;
    }
    setLoading(true);
    try {
      await axios.post('/api/v1/auth/verify-otp', {
        email: formData.email,
        otpCode: codeString 
      });
      alert("Xác thực thành công!");
      navigate('/login');
    } catch (error) {
      alert("Mã OTP không chính xác hoặc đã hết hạn.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      await axios.post('/api/v1/auth/resend-otp', { email: formData.email });
      setTimer(120); 
      setOtp(new Array(6).fill(""));
      alert("Mã mới đã được gửi!");
    } catch (error) {
      alert("Lỗi khi gửi lại mã.");
    }
  };

  return (
    <div className="auth-container py-5 animate-fade-in">
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="glass-card auth-card p-4 p-md-5 shadow-lg">
          {!isOtpSent ? (
            <>
              <div className="text-center mb-4">
                <h3 className="text-success fw-bold">Đăng ký Thành viên</h3>
                <p className="text-white-50 small">Tham gia cộng đồng Freelancer sinh viên lớn nhất</p>
              </div>

              {/* BỘ CHỌN VAI TRÒ (MỚI THÊM) */}
              <div className="role-selection-group mb-4">
                <p className="x-small fw-bold  text-uppercase mb-2">Bạn đăng ký với tư cách:</p>
                <div className="d-flex gap-2">
                  <div 
                    className={`role-card-mini ${formData.roleId === 'odl1dDNm' ? 'active' : ''}`}
                    onClick={() => setFormData({...formData, roleId: 'odl1dDNm'})}
                  >
                    <User size={18} />
                    <span>Sinh viên</span>
                  </div>
                  <div 
                    className={`role-card-mini ${formData.roleId === 'Jx7ze2Kd' ? 'active' : ''}`}
                    onClick={() => setFormData({...formData, roleId: 'Jx7ze2Kd'})}
                  >
                    <Building2 size={18} />
                    <span>Doanh nghiệp</span>
                  </div>
                </div>
              </div>

              <Form onSubmit={handleRegister}>
                <Form.Group className="mb-3 auth-input-group">
                  <Form.Label className="small text-white-80">Email đăng ký</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-transparent border-secondary text-success"><Mail size={18} /></InputGroup.Text>
                    <Form.Control name="email" type="email" placeholder="email@example.com" onChange={handleChange} required className="bg-transparent text-white border-secondary" />
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-3 auth-input-group">
                  <Form.Label className="small text-white-80">Mật khẩu</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-transparent border-secondary text-success"><Lock size={18} /></InputGroup.Text>
                    <Form.Control name="password" type={showPass ? "text" : "password"} placeholder="••••••••" onChange={handleChange} required className="bg-transparent text-white border-secondary" />
                    <InputGroup.Text className="bg-transparent border-secondary text-white-50 pointer" onClick={() => setShowPass(!showPass)}>
                      {showPass ? <Eye size={18} /> : <EyeOff size={18} />}
                    </InputGroup.Text>
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="small text-white-80">Xác nhận mật khẩu</Form.Label>
                  <InputGroup className="auth-input-group">
                    <InputGroup.Text className="bg-transparent border-secondary text-success"><Lock size={18} /></InputGroup.Text>
                    <Form.Control name="confirmPassword" type="password" placeholder="••••••••" onChange={handleChange} required className="bg-transparent text-white border-secondary" />
                  </InputGroup>
                </Form.Group>

                <Button type="submit" variant="success" className="w-100 py-3 fw-bold shadow-glow" disabled={loading}>
                  {loading ? <Spinner size="sm" animation="border" /> : "GỬI MÃ XÁC THỰC"}
                </Button>
              </Form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="otp-icon-circle mx-auto mb-3">
                <Smartphone size={40} className="text-success" />
              </div>
              <h4 className="text-white fw-bold">Xác thực OTP</h4>
              <p className="text-white-50 small mb-2">Mã đã được gửi tới <b>{formData.email}</b></p>
              
              <div className={`d-flex align-items-center justify-content-center gap-2 mb-4 ${timer < 20 ? 'text-danger-pulse' : 'text-primary-glow'}`}>
                 <Clock size={16} />
                 <span className="fw-bold small">Hiệu lực: {formatTime(timer)}</span>
              </div>

              <div className="d-flex justify-content-center gap-2 mb-4">
                {otp.map((data, index) => (
                  <input key={index} type="text" className="otp-input-field" maxLength="1" value={data}
                    ref={(el) => (inputRefs.current[index] = el)}
                    onChange={(e) => {
                        if (isNaN(e.target.value)) return;
                        let newOtp = [...otp];
                        newOtp[index] = e.target.value;
                        setOtp(newOtp);
                        if (e.target.value !== "" && index < 5) inputRefs.current[index + 1].focus();
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Backspace" && !otp[index] && index > 0) inputRefs.current[index - 1].focus();
                    }}
                  />
                ))}
              </div>

              <Button onClick={handleVerifyOtp} variant="success" className="w-100 py-3 fw-bold mb-3 shadow-glow" disabled={loading || timer === 0}>
                {loading ? <Spinner size="sm" /> : "XÁC NHẬN MÃ"}
              </Button>
              <div className="d-flex justify-content-center gap-3">
                  <button className="btn btn-link text-success small text-decoration-none fw-bold" 
                          onClick={handleResendOtp} disabled={timer > 30}>
                    Gửi lại mã {timer > 30 ? `(${timer}s)` : ""}
                  </button>
                  <button className="btn btn-link  small text-decoration-none" onClick={() => setIsOtpSent(false)}>
                    Đổi Email
                  </button>
              </div>
            </div>
          )}

          <div className="text-center mt-4">
            <span className="text-white-50 small">Đã có tài khoản? </span>
            <Link to="/login" className="text-success small fw-bold text-decoration-none">Đăng nhập</Link>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Register;