import React, { useState, useRef, useEffect } from 'react';
import { Container, Form, Button, InputGroup, Spinner } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, Smartphone, Clock, Building2, UserCircle } from 'lucide-react';
import axios from 'axios';
import '../../CSS/Register.css';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [timer, setTimer] = useState(120); 
  
  // --- MỚI: State lưu danh sách vai trò từ API ---
  const [roles, setRoles] = useState([]);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    roleId: '' // Sẽ được cập nhật khi fetch API xong
  });

  const [otp, setOtp] = useState(new Array(6).fill(""));
  const inputRefs = useRef([]);

  // --- 1. Fetch danh sách vai trò khi trang vừa load ---
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get('/api/v1/roles/register-options');
        const rolesData = response.data.data;
        setRoles(rolesData);
        
        // Mặc định chọn vai trò đầu tiên (thường là STUDENT)
        if (rolesData.length > 0) {
          setFormData(prev => ({ ...prev, roleId: rolesData[0].roleId }));
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách vai trò:", error);
      }
    };
    fetchRoles();
  }, []);

  // Logic đếm ngược OTP
  useEffect(() => {
    let interval;
    if (isOtpSent && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
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

  // Trong Register.jsx
const handleRegister = async (e) => {
  e.preventDefault();
  if (formData.password !== formData.confirmPassword) {
    alert("Mật khẩu xác nhận không khớp!");
    return;
  }
  setLoading(true);
  try {
    const res = await axios.post('/api/v1/auth/register', formData);
    setIsOtpSent(true);
    setTimer(120);
    alert("Mã OTP đã được gửi!");
  } catch (error) {
    // --- ĐOẠN FIX: Lấy lỗi chi tiết từ Server ---
    const serverError = error.response?.data;
    let errorMsg = "Lỗi đăng ký!";

    if (serverError) {
        // Nếu Server trả về message đơn giản
        if (serverError.message) errorMsg = serverError.message;
        
        // Nếu Server trả về mảng danh sách các lỗi (Validation)
        if (serverError.errors) {
            errorMsg = Object.values(serverError.errors).flat().join("\n");
        }
    }
    
    console.error("Chi tiết lỗi 400:", serverError);
    alert(errorMsg); 
    // Giờ đây alert sẽ hiện: "Mật khẩu thiếu chữ hoa", "Email đã tồn tại"...
  } finally {
    setLoading(false);
  }
};

  const handleVerifyOtp = async () => {
    const codeString = otp.join("");
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

  return (
    <div className="auth-container py-5 animate-fade-in">
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="glass-card auth-card p-4 p-md-5 shadow-lg">
          {!isOtpSent ? (
            <>
              <div className="text-center mb-4">
                <h3 className="text-success fw-bold">Đăng ký Thành viên</h3>
                <p className="text-white-50 small">Tham gia cộng đồng Freelancer sinh viên</p>
              </div>

              {/* --- 2. HIỂN THỊ VAI TRÒ ĐỘNG TỪ API --- */}
              <div className="role-selection-group mb-4">
                <p className="x-small fw-bold text-uppercase mb-2 text-white-50">Bạn đăng ký với tư cách:</p>
                <div className="d-flex gap-2">
                  {roles.map((role) => (
                    <div 
                      key={role.roleId}
                      className={`role-card-mini ${formData.roleId === role.roleId ? 'active' : ''}`}
                      onClick={() => setFormData({...formData, roleId: role.roleId})}
                    >
                      {/* Hiển thị icon dựa trên RoleName */}
                      {role.roleName === 'STUDENT' ? <User size={18} /> : <Building2 size={18} />}
                      <span>{role.roleName === 'STUDENT' ? 'Sinh viên' : 'Doanh nghiệp'}</span>
                    </div>
                  ))}
                  {roles.length === 0 && <Spinner animation="border" size="sm" variant="success" />}
                </div>
              </div>

              <Form onSubmit={handleRegister}>
                <Form.Group className="mb-3 auth-input-group">
                  <Form.Label className="small text-white-80">Email đăng ký</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-transparent border-secondary text-success"><Mail size={18} /></InputGroup.Text>
                    <Form.Control name="email" type="email" placeholder="name@example.com" onChange={handleChange} required className="bg-transparent text-white border-secondary shadow-none" />
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-3 auth-input-group">
                  <Form.Label className="small text-white-80">Mật khẩu</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-transparent border-secondary text-success"><Lock size={18} /></InputGroup.Text>
                    <Form.Control name="password" type={showPass ? "text" : "password"} placeholder="••••••••" onChange={handleChange} required className="bg-transparent text-white border-secondary shadow-none" />
                    <InputGroup.Text className="bg-transparent border-secondary text-white-50 pointer" onClick={() => setShowPass(!showPass)}>
                      {showPass ? <Eye size={18} /> : <EyeOff size={18} />}
                    </InputGroup.Text>
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="small text-white-80">Xác nhận mật khẩu</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-transparent border-secondary text-success"><Lock size={18} /></InputGroup.Text>
                    <Form.Control name="confirmPassword" type="password" placeholder="••••••••" onChange={handleChange} required className="bg-transparent text-white border-secondary shadow-none" />
                  </InputGroup>
                </Form.Group>

                <Button type="submit" variant="success" className="w-100 py-3 fw-bold shadow-glow" disabled={loading || !formData.roleId}>
                  {loading ? <Spinner size="sm" animation="border" /> : "GỬI MÃ XÁC THỰC"}
                </Button>
              </Form>
            </>
          ) : (
            // --- GIAO DIỆN OTP (GIỮ NGUYÊN) ---
            <div className="text-center py-4">
              <div className="otp-icon-circle mx-auto mb-3">
                <Smartphone size={40} className="text-success" />
              </div>
              <h4 className="text-white fw-bold">Xác thực OTP</h4>
              <p className="text-white-50 small mb-2">Mã đã được gửi tới <b>{formData.email}</b></p>
              <div className={`mb-4 ${timer < 20 ? 'text-danger' : 'text-primary-glow'}`}>
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
                  />
                ))}
              </div>
              <Button onClick={handleVerifyOtp} variant="success" className="w-100 py-3 fw-bold mb-3 shadow-glow" disabled={loading || timer === 0}>
                {loading ? <Spinner size="sm" /> : "XÁC NHẬN MÃ"}
              </Button>
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