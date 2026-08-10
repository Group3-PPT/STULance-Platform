import React, { useState, useEffect } from 'react';
import { Container, Form, Button, InputGroup, Spinner, Alert } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn, ChevronLeft, Eye, EyeOff } from 'lucide-react';
import { authService } from '../../services/authService';
import '../../CSS/Login.css';

// ============================================================
// HẰNG SỐ
// ============================================================
const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

// ============================================================
// TÀI KHOẢN DÙNG THỬ (chỉ dùng khi development)
// ============================================================
const TEST_ACCOUNTS = [
    { email: 'admin@stulance.com',    password: 'Admin@123',    role: 'ADMIN' },
    { email: 'enterprise@demo.com',   password: 'Enterprise@1', role: 'ENTERPRISE' },
    { email: 'student@demo.com',      password: 'Student@1',    role: 'STUDENT' },
];

// ============================================================
// COMPONENT: Login
// Mô tả: Trang đăng nhập chính.
//   - Hỗ trợ phân quyền theo vai trò: STUDENT, ENTERPRISE, ADMIN
//   - Khóa tạm thời 15 phút sau 5 lần sai mật khẩu
//   - Chuyển trang Policy nếu chưa chấp nhận điều khoản
// ============================================================

const Login = function () {

    // ============================================================
    // STATE & HOOKS
    // ============================================================

    const navigate = useNavigate();

    // Ref cho email + password để demo auto-fill trigger React state
    const emailRef = React.useRef(null);
    const passwordRef = React.useRef(null);

    // Trạng thái loading khi gửi request đăng nhập
    const [loading, setLoading] = useState(false);

    // Hiển thị/ẩn mật khẩu (ban đầu ẩn)
    const [showPassword, setShowPassword] = useState(false);

    // Số lần thử sai mật khẩu (lưu trong localStorage để giữ state khi refresh trang)
    const [attempts, setAttempts] = useState(function () {
        var saved = localStorage.getItem('loginAttempts');
        if (saved) {
            var data = JSON.parse(saved);
            // Nếu lockUntil còn hiệu lực → giữ nguyên state
            if (data.lockUntil && Date.now() < data.lockUntil) {
                return { count: data.count, lockUntil: data.lockUntil };
            }
            // Hết hạn lock → xóa dữ liệu cũ
            localStorage.removeItem('loginAttempts');
        }
        return { count: 0, lockUntil: null };
    });

    // Trạng thái khóa tạm thời (true nếu lockUntil > thời gian hiện tại)
    var isLocked = attempts.lockUntil && Date.now() < attempts.lockUntil;

    // Số phút còn lại trước khi hết khóa
    var remainingMinutes = isLocked
        ? Math.ceil((attempts.lockUntil - Date.now()) / 60000)
        : 0;

    // ============================================================
    // EFFECT: Tự động hết hạn khóa sau LOCKOUT_MINUTES
    // Chạy mỗi giây, kiểm tra lockUntil đã hết hạn chưa
    // ============================================================

    useEffect(function () {
        if (!isLocked) return;

        var timer = setInterval(function () {
            if (Date.now() >= attempts.lockUntil) 
            {
              setAttempts({ count: 0, lockUntil: null });
              localStorage.removeItem('loginAttempts');
              clearInterval(timer);
            }
          }, 1000);

        return function () {
            clearInterval(timer);
        };
    }, [isLocked, attempts.lockUntil]);

    // ============================================================
    // HANDLER: Xử lý sự kiện đăng nhập
    // ============================================================

    const handleLogin = async function (e) {
        e.preventDefault();

        // Nếu đang bị khóa → không cho submit
        if (isLocked) {
            alert('Tài khoản bị khóa tạm thời. Vui lòng thử lại sau ' + remainingMinutes + ' phút.');
            return;
        }

        setLoading(true);

        try {
            // Lấy giá trị từ form
            var email = e.target.elements.email.value;
            var password = e.target.elements.password.value;

            // Gọi API đăng nhập
            var res = await authService.login({ email: email, password: password });
            var result = res.data.data;

            // Đăng nhập thành công → reset attempts
            setAttempts({ count: 0, lockUntil: null });
            localStorage.removeItem('loginAttempts');

            // Kiểm tra server trả về dữ liệu
            if (!result) {
                alert('Lỗi: Server không trả về dữ liệu!');
                return;
            }

            // Nếu yêu cầu chấp nhận chính sách → chuyển trang Policy
            if (result.requiresPolicyAcceptance) {
                sessionStorage.setItem('pendingPolicyEmail', email);
                sessionStorage.setItem('pendingPolicyPassword', password);
                navigate('/policy', {
                    state: {
                        email: email,
                        policyVersion: result.policyVersion,
                        policyUrl: result.policyUrl,
                        policyTitle: result.policyTitle
                    }
                });
                return;
            }

            // Kiểm tra Token
            var tokenToSave = result.accessToken || result.token;
            if (!tokenToSave) {
                alert('Lỗi: Server không trả về Token!');
                return;
            }

            // Dispatch event để Navbar và các component khác cập nhật state đăng nhập
            window.dispatchEvent(new Event('local-storage-update'));

            // ============================================================
            // PHÂN QUYỀN THEO VAI TRÒ
            //   STUDENT   → /dashboardlancer
            //   ENTERPRISE → /manage-jobs
            //   ADMIN     → /admin
            // ============================================================

            var roleValue = result.roleId || result.roleName || result.role;

            if (roleValue === 'STUDENT' || roleValue === 'odl1dDNm') {
                alert('Đăng nhập thành công!');
                navigate('/dashboardlancer');
            }
            else if (roleValue === 'ENTERPRISE' || roleValue === 'Jx7ze2Kd') {
                alert('Đăng nhập thành công!\nChào mừng quý đối tác, Nhà tuyển dụng');
                navigate('/manage-jobs');
            }
            else if (roleValue === 'ADMIN' || roleValue === 'pPDY5Dnk') {
                alert('Đăng nhập thành công!\nChào Quản trị viên');
                navigate('/admin');
            }
            else {
                alert('Đăng nhập thành công!');
                navigate('/');
            }

        } catch (error) {
            console.error('Lỗi đăng nhập:', error);
            var errorMsg = error.response?.data?.message || 'Email hoặc mật khẩu không chính xác!';

            // Tăng số lần thử sai
            var newCount = attempts.count + 1;

            if (newCount >= MAX_ATTEMPTS) {
                // Đạt giới hạn 5 lần → khóa tạm thời 15 phút
                var lockUntil = Date.now() + LOCKOUT_MINUTES * 60 * 1000;
                setAttempts({ count: newCount, lockUntil: lockUntil });
                localStorage.setItem('loginAttempts', JSON.stringify({ count: newCount, lockUntil: lockUntil }));
                alert('Đăng nhập thất bại quá ' + MAX_ATTEMPTS + ' lần. Tài khoản bị khóa ' + LOCKOUT_MINUTES + ' phút.');
            } else {
                // Chưa đạt giới hạn → cảnh báo số lần còn lại
                setAttempts({ count: newCount, lockUntil: null });
                localStorage.setItem('loginAttempts', JSON.stringify({ count: newCount, lockUntil: null }));
                alert('Đăng nhập thất bại: ' + errorMsg + '\nCòn lại ' + (MAX_ATTEMPTS - newCount) + ' lần thử.');
            }

        } finally {
            setLoading(false);
        }
    };

    // ============================================================
    // RENDER
    // ============================================================

    return (
        <div className="auth-container py-5 animate-fade-in">
            <Container className="d-flex justify-content-center align-items-center min-vh-100">
                <div className="glass-card auth-card p-4 p-md-5 shadow-lg">

                    {/* ---- TIÊU ĐỀ ---- */}
                    <div className="mb-4 text-center">
                        <h2 className="text-white fw-bold mb-2">ĐĂNG NHẬP</h2>
                        <p className="text-white-50 small">Hệ thống kết nối Freelancer Sinh viên</p>
                    </div>

                    {/* ---- FORM ĐĂNG NHẬP ---- */}
                    <Form onSubmit={handleLogin}>

                        {/* ---- Ô EMAIL ---- */}
                        <Form.Group className="mb-3">
                            <Form.Label className="text-white-80 small fw-bold">EMAIL</Form.Label>
                            <InputGroup className="auth-input-group">
                                <InputGroup.Text className="bg-transparent border-secondary text-primary">
                                    <Mail size={18} />
                                </InputGroup.Text>
                                <Form.Control
                                    name="email"
                                    type="email"
                                    className="auth-input bg-transparent text-white border-secondary shadow-none"
                                    placeholder="name@example.com"
                                    required
                                />
                            </InputGroup>
                        </Form.Group>

                        {/* ---- Ô MẬT KHẨU + NÚT HIỂN THỊ/ẨN ---- */}
                        <Form.Group className="mb-3">
                            <Form.Label className="text-white-80 small fw-bold">MẬT KHẨU</Form.Label>
                            <InputGroup className="auth-input-group">
                                <InputGroup.Text className="bg-transparent border-secondary text-primary">
                                    <Lock size={18} />
                                </InputGroup.Text>
                                <Form.Control
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    className="auth-input bg-transparent text-white border-secondary shadow-none"
                                    placeholder="••••••••"
                                    required
                                />
                                <InputGroup.Text
                                    className="bg-transparent border-secondary text-primary"
                                    style={{ cursor: 'pointer' }}
                                    onClick={function () { setShowPassword(!showPassword); }}
                                    title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </InputGroup.Text>
                            </InputGroup>
                        </Form.Group>

                        {/* ---- GHI NHỚ / QUÊN MẬT KHẨU ---- */}
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

                        {/* ---- NÚT ĐĂNG NHẬP ---- */}
                        <Button
                            type="submit"
                            variant="primary"
                            className="w-100 py-3 fw-bold mb-3 shadow-glow btn-main-login"
                            disabled={loading || isLocked}
                        >
                            {loading ? (
                                <Spinner animation="border" size="sm" />
                            ) : isLocked ? (
                                <>Khóa tạm thời - Thử lại sau {remainingMinutes} phút</>
                            ) : (
                                <><LogIn size={18} className="me-2" /> VÀO HỆ THỐNG</>
                            )}
                        </Button>

                        {/* ---- THÔNG BÁO SAI MẬT KHẨU ---- */}
                        {attempts.count > 0 && !isLocked && (
                            <div className="text-center mb-3">
                                <span className="x-small text-warning">
                                    Sai mật khẩu {attempts.count}/{MAX_ATTEMPTS} lần
                                </span>
                            </div>
                        )}
                    </Form>

                    {/* ---- LIÊN KẾT ĐĂNG KÝ ---- */}
                    <div className="text-center mt-4 pt-3 border-top border-white-10">
                        <span className="text-white-50 small">Chưa có tài khoản? </span>
                        <Link to="/register" className="text-primary small fw-bold text-decoration-none">Đăng ký ngay</Link>
                    </div>

                    {/* ---- QUAY LẠI TRANG CHỦ ---- */}
                    <div className="text-center mt-3">
                        <Link to="/" className="x-small text-muted text-decoration-none">
                            <ChevronLeft size={12} /> Quay lại trang chủ
                        </Link>
                    </div>

                    {/* ============================================================
                        GHI CHÚ: TÀI KHOẢN DÙNG THỬ (Development Only)
                        - Chỉ hiển thị khi chạy local (localhost)
                        - Bấm nút sẽ tự động điền email + password vào form
                        ============================================================ */}
                    {/* {window.location.hostname === 'localhost' && (
                        <div className="mt-4 pt-3 border-top border-white-10">
                            <p className="x-small text-white-50 text-center mb-2 fw-bold">
                                🧪 Tài khoản dùng thử (Localhost only)
                            </p>
                            <div className="d-flex flex-column gap-2">
                                {TEST_ACCOUNTS.map(function (account) {
                                    return (
                                        <button
                                            key={account.role}
                                            type="button"
                                            className="btn btn-outline-secondary btn-sm text-start x-small"
                                            style={{ fontSize: '0.75rem' }}
                                            onClick={function () {
                                                var emailField = document.querySelector('input[name="email"]');
                                                var passField = document.querySelector('input[name="password"]');
                                                if (emailField) emailField.value = account.email;
                                                if (passField) passField.value = account.password;
                                            }}
                                        >
                                            <span className="text-primary fw-bold">{account.role}</span>
                                            <span className="text-white-50 ms-2">{account.email}</span>
                                        </button>
                                    );
                                })}
                            </div>
                            <p className="x-small text-muted text-center mt-2 mb-0" style={{ fontSize: '0.65rem' }}>
                                Nhập email rồi bấm nút phía trên, sau đó bấm "VÀO HỆ THỐNG"
                            </p>
                        </div>
                    )} */}

                </div>
            </Container>
        </div>
    );
};

export default Login;
