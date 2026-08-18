import React, { useState, useRef, useEffect } from 'react';
import { Container, Button, Spinner } from 'react-bootstrap';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Smartphone, ChevronLeft } from 'lucide-react';
import axios from 'axios';
import '../../CSS/Login.css';

// ============================================================
// COMPONENT: VerifyOtp
// Mô tả: Trang xác thực OTP độc lập.
//   - Nhận email từ URL query (?email=xxx) hoặc navigation state
//   - Đếm ngược 10 phút (600 giây)
//   - Hỗ trợ gửi lại OTP
//   - Sau khi xác thực thành công → chuyển trang Policy
// ============================================================

var VerifyOtp = function () {

    var navigate = useNavigate();
    var location = useLocation();

    // Lấy email từ URL query hoặc navigation state
    var queryEmail = new URLSearchParams(location.search).get('email');
    var stateEmail = location.state?.email;
    var email = queryEmail || stateEmail || '';

    var pendingPassword = location.state?.password || '';

    var [otp, setOtp] = useState(new Array(6).fill(""));
    var inputRefs = useRef([]);
    var [timer, setTimer] = useState(600);
    var [loading, setLoading] = useState(false);

    // ============================================================
    // EFFECT: Đếm ngược OTP (10 phút = 600 giây)
    // ============================================================

    useEffect(function () {
        var interval;
        if (timer > 0) {
            interval = setInterval(function () {
                setTimer(function (prev) { return prev - 1; });
            }, 1000);
        }
        return function () { clearInterval(interval); };
    }, [timer]);

    // ============================================================
    // HÀM ĐỊNH DẠNG THỜI GIAN: 600 → "10:00"
    // ============================================================

    var formatTime = function (seconds) {
        var m = Math.floor(seconds / 60);
        var s = seconds % 60;
        return m + ':' + (s < 10 ? '0' : '') + s;
    };

    // ============================================================
    // HANDLER: Xử lý nhập OTP (tự nhảy ô)
    // ============================================================

    var handleOtpChange = function (val, index) {
        if (isNaN(val)) return;
        var newOtp = [...otp];
        newOtp[index] = val;
        setOtp(newOtp);
        if (val !== '' && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    // ============================================================
    // HANDLER: Xử lý phím Backspace (xóa + nhảy ô trước)
    // ============================================================

    var handleKeyDown = function (e, index) {
        if (e.key === 'Backspace') {
            e.preventDefault();
            var newOtp = [...otp];
            if (otp[index] !== '') {
                newOtp[index] = '';
                setOtp(newOtp);
            } else if (index > 0) {
                newOtp[index - 1] = '';
                setOtp(newOtp);
                inputRefs.current[index - 1].focus();
            }
        }
    };

    // ============================================================
    // HANDLER: Xác nhận OTP
    // ============================================================

    var handleVerifyOtp = async function () {
        var codeString = otp.join('');
        if (codeString.length < 6) {
            alert('Vui lòng nhập đủ 6 chữ số mã OTP.');
            return;
        }
        if (!email) {
            alert('Không tìm thấy email. Vui lòng quay lại đăng ký.');
            return;
        }

        setLoading(true);
        try {
            await axios.post('/api/v1/auth/verify-otp', {
                email: email,
                otpCode: codeString
            });
            alert('Xác thực OTP thành công!');

            // Chuyển trang Policy (để chấp nhận điều khoản)
            sessionStorage.setItem('pendingPolicyEmail', email);
            if (pendingPassword) {
                sessionStorage.setItem('pendingPolicyPassword', pendingPassword);
            }
            navigate('/policy', {
                state: {
                    email: email,
                    policyVersion: '2026.07.01',
                    policyUrl: '/policy',
                    policyTitle: 'Điều khoản sử dụng và chính sách STULance',
                    fromRegister: true
                }
            });
        } catch (error) {
            alert(error.response?.data?.message || 'Mã OTP không chính xác hoặc đã hết hạn.');
        } finally {
            setLoading(false);
        }
    };

    // ============================================================
    // HANDLER: Gửi lại OTP
    // ============================================================

    var handleResendOtp = async function () {
        if (!email) {
            alert('Không tìm thấy email. Vui lòng quay lại đăng ký.');
            return;
        }
        setLoading(true);
        try {
            // Thử gọi resend-otp endpoint trước
            try {
                await axios.post('/api/v1/auth/resend-otp', { email: email });
            } catch (_) {
                // Nếu resend-otp không tồn tại, gọi lại register endpoint
                await axios.post('/api/v1/auth/register', { email: email });
            }
            setTimer(600);
            setOtp(new Array(6).fill(""));
            alert('Mã OTP đã được gửi lại!');
        } catch (error) {
            alert(error.response?.data?.message || 'Không thể gửi lại mã. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    // ============================================================
    // RENDER
    // ============================================================

    if (!email) {
        return (
            <div className="auth-container py-5 animate-fade-in">
                <Container className="d-flex justify-content-center align-items-center min-vh-100">
                    <div className="glass-card auth-card p-4 p-md-5 shadow-lg text-center">
                        <p className="text-white-50 mb-3">Không tìm thấy thông tin email cần xác thực.</p>
                        <Link to="/register" className="text-primary fw-bold text-decoration-none">
                            Quay lại đăng ký
                        </Link>
                    </div>
                </Container>
            </div>
        );
    }

    return (
        <div className="auth-container py-5 animate-fade-in">
            <Container className="d-flex justify-content-center align-items-center min-vh-100">
                <div className="glass-card auth-card p-4 p-md-5 shadow-lg">

                    {/* ---- QUAY LẠI ---- */}
                    <div className="mb-3">
                        <Link to="/login" className="text-primary text-decoration-none fw-bold x-small">
                            <ChevronLeft size={14} /> Quay lại đăng nhập
                        </Link>
                    </div>

                    {/* ---- TIÊU ĐỀ ---- */}
                    <div className="text-center mb-4">
                        <div className="otp-icon-circle mx-auto mb-3">
                            <Smartphone size={40} className="text-primary" />
                        </div>
                        <h4 className="text-white fw-bold">Xác thực OTP</h4>
                        <p className="text-white-50 small mb-1">
                            Mã đã được gửi tới <b className="text-primary">{email}</b>
                        </p>
                        {timer > 0 ? (
                            <div className={timer < 60 ? 'text-danger' : 'text-primary-glow'}>
                                <span className="fw-bold small">Hiệu lực: {formatTime(timer)}</span>
                            </div>
                        ) : (
                            <div className="text-danger">
                                <span className="fw-bold small">Mã OTP đã hết hạn</span>
                            </div>
                        )}
                    </div>

                    {/* ---- Ô NHẬP OTP ---- */}
                    <div className="d-flex justify-content-center gap-2 mb-4">
                        {otp.map(function (data, index) {
                            return (
                                <input
                                    key={index}
                                    type="text"
                                    className="otp-input-field"
                                    maxLength="1"
                                    value={data}
                                    ref={function (el) { inputRefs.current[index] = el; }}
                                    onChange={function (e) { handleOtpChange(e.target.value, index); }}
                                    onKeyDown={function (e) { handleKeyDown(e, index); }}
                                />
                            );
                        })}
                    </div>

                    {/* ---- NÚT XÁC NHẬN ---- */}
                    <Button
                        onClick={handleVerifyOtp}
                        variant="primary"
                        className="w-100 py-3 fw-bold mb-3 shadow-glow"
                        disabled={loading || timer === 0}
                    >
                        {loading ? <Spinner size="sm" animation="border" /> : 'XÁC NHẬN MÃ'}
                    </Button>

                    {/* ---- NÚT GỬI LẠI MÃ ---- */}
                    {timer === 0 ? (
                        <div className="text-center">
                            <Button
                                variant="outline-primary"
                                className="fw-bold"
                                onClick={handleResendOtp}
                                disabled={loading}
                            >
                                Gửi lại mã OTP
                            </Button>
                        </div>
                    ) : (
                        <p className="text-center x-small text-white-50 mb-0">
                            Gửi lại mã sau <span className="text-primary fw-bold">{formatTime(timer)}</span>
                        </p>
                    )}

                </div>
            </Container>
        </div>
    );
};

export default VerifyOtp;
