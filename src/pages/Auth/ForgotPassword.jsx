import React, { useState, useRef, useEffect } from 'react';
import { Container, Form, Button, InputGroup, Spinner } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ChevronLeft, Smartphone, KeyRound, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import '../../CSS/Login.css'; // Tái sử dụng style nền của Login

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Nhập email, 2: Nhập OTP & Pass mới
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  
  const [email, setEmail] = useState("");
  const [formData, setFormData] = useState({
    otpCode: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  const [otpArray, setOtpArray] = useState(new Array(6).fill(""));
  const [timer, setTimer] = useState(600);
  const inputRefs = useRef([]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Timer countdown
  useEffect(() => {
    let interval;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Gửi lại OTP
  const handleResendOtp = async () => {
    setLoading(true);
    try {
      await axios.post('/api/v1/auth/forgot-password', { email });
      setTimer(600);
      setOtpArray(new Array(6).fill(""));
      alert("Mã OTP đã được gửi lại!");
    } catch (error) {
      alert("Không thể gửi lại mã. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  // --- BƯỚC 1: GỬI YÊU CẦU QUÊN MẬT KHẨU ---
  const handleRequestForgot = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // API: /api/v1/auth/forgot-password
      await axios.post('/api/v1/auth/forgot-password', { email });
      alert("Mã khôi phục đã được gửi vào Email của bạn!");
      setStep(2);
    } catch (error) {
      alert(error.response?.data?.message || "Email không tồn tại trong hệ thống!");
    } finally {
      setLoading(false);
    }
  };

  // --- BƯỚC 2: XÁC NHẬN ĐẶT LẠI MẬT KHẨU ---
  const handleResetPassword = async (e) => {
    e.preventDefault();
    const otpCode = otpArray.join("");
    
    if (otpCode.length < 6) return alert("Vui lòng nhập đủ mã OTP");
    if (formData.newPassword !== formData.confirmNewPassword) return alert("Mật khẩu không khớp");

    setLoading(true);
    try {
      // API: /api/v1/auth/reset-password
      const payload = {
        email: email,
        otpCode: otpCode,
        newPassword: formData.newPassword,
        confirmNewPassword: formData.confirmNewPassword
      };
      await axios.post('/api/v1/auth/reset-password', payload);
      
      alert("Mật khẩu đã được thay đổi thành công!");
      navigate('/login');
    } catch (error) {
      alert(error.response?.data?.message || "Mã OTP sai hoặc đã hết hạn!");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý ô nhập OTP nhảy tự động
  const handleOtpChange = (val, index) => {
    if (isNaN(val)) return;
    let newOtp = [...otpArray];
    newOtp[index] = val;
    setOtpArray(newOtp);
    if (val !== "" && index < 5) inputRefs.current[index + 1].focus();
  };

  return (
    <div className="auth-container py-5 animate-fade-in">
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="glass-card auth-card p-4 p-md-5 shadow-lg" style={{ maxWidth: '450px' }}>
          
          <div className="mb-4 text-center">
            <div className="icon-circle-bg mx-auto mb-3">
               <KeyRound size={32} className="text-primary" />
            </div>
            <h2 className="text-white fw-bold h4">Khôi phục mật khẩu</h2>
            <p className="text-white-50 small">
              {step === 1 ? "Nhập email tài khoản để nhận mã xác thực" : "Thiết lập mật khẩu mới cho tài khoản của bạn"}
            </p>
          </div>

          {step === 1 ? (
            /* FORM 1: NHẬP EMAIL */
            <Form onSubmit={handleRequestForgot}>
              <Form.Group className="mb-4">
                <Form.Label className="small text-white-80 fw-bold">EMAIL TÀI KHOẢN</Form.Label>
                <InputGroup className="auth-input-group">
                  <InputGroup.Text><Mail size={18}/></InputGroup.Text>
                  <Form.Control 
                    type="email" 
                    className="auth-input" 
                    placeholder="name@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </InputGroup>
              </Form.Group>

              <Button type="submit" variant="primary" className="w-100 py-3 fw-bold mb-3 shadow-glow" disabled={loading}>
                {loading ? <Spinner size="sm" /> : "GỬI MÃ XÁC THỰC"}
              </Button>
            </Form>
          ) : (
            /* FORM 2: NHẬP OTP & PASS MỚI */
            <Form onSubmit={handleResetPassword}>
              <div className="text-center mb-4">
                {timer > 0 && (
                  <div className={`mb-2 ${timer < 60 ? 'text-danger' : 'text-primary-glow'}`}>
                    <span className="fw-bold small">Hiệu lực: {formatTime(timer)}</span>
                  </div>
                )}
                <div className="d-flex justify-content-center gap-2 mb-2">
                  {otpArray.map((data, index) => (
                    <input
                      key={index}
                      type="text"
                      className="otp-input-field"
                      style={{ width: '40px', height: '50px' }}
                      maxLength="1"
                      value={data}
                      ref={el => inputRefs.current[index] = el}
                      onChange={(e) => handleOtpChange(e.target.value, index)}
                      onKeyDown={(e) => {
                        if (e.key === "Backspace") {
                          e.preventDefault();
                          let newOtp = [...otpArray];
                          if (otpArray[index] !== "") {
                            newOtp[index] = "";
                            setOtpArray(newOtp);
                          } else if (index > 0) {
                            newOtp[index - 1] = "";
                            setOtpArray(newOtp);
                            inputRefs.current[index - 1].focus();
                          }
                        }
                      }}
                    />
                  ))}
                </div>
                {timer === 0 ? (
                  <small className="text-primary pointer fw-bold" onClick={handleResendOtp}>Gửi lại mã OTP</small>
                ) : (
                  <small className="text-white-50">Gửi lại mã sau <span className="text-primary fw-bold">{formatTime(timer)}</span></small>
                )}
              </div>

              <Form.Group className="mb-3">
                <Form.Label className="small text-white-80 fw-bold">MẬT KHẨU MỚI</Form.Label>
                <InputGroup className="auth-input-group">
                  <InputGroup.Text><Lock size={18}/></InputGroup.Text>
                  <Form.Control 
                    name="newPassword"
                    type={showPass ? "text" : "password"} 
                    className="auth-input" 
                    placeholder="Tối thiểu 8 ký tự"
                    onChange={handleInputChange}
                    required 
                  />
                  <InputGroup.Text className="pointer" onClick={() => setShowPass(!showPass)}>
                    {showPass ? <EyeOff size={18}/> : <Eye size={18}/>}
                  </InputGroup.Text>
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="small text-white-80 fw-bold">XÁC NHẬN MẬT KHẨU</Form.Label>
                <InputGroup className="auth-input-group">
                  <InputGroup.Text><Lock size={18}/></InputGroup.Text>
                  <Form.Control 
                    name="confirmNewPassword"
                    type="password" 
                    className="auth-input" 
                    placeholder="Nhập lại mật khẩu mới"
                    onChange={handleInputChange}
                    required 
                  />
                </InputGroup>
              </Form.Group>

              <Button type="submit" variant="success" className="w-100 py-3 fw-bold mb-3 shadow-glow" disabled={loading}>
                {loading ? <Spinner size="sm" /> : "ĐẶT LẠI MẬT KHẨU"}
              </Button>
            </Form>
          )}

          <div className="text-center mt-3">
             <Link to="/login" className="x-small text-muted text-decoration-none d-flex align-items-center justify-content-center gap-2">
                <ChevronLeft size={14}/> Quay lại đăng nhập
             </Link>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default ForgotPassword;