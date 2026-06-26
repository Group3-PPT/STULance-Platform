import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Form, Spinner, Badge } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom'; // Thêm để lấy ID từ URL
import { 
  Wallet, Landmark, CreditCard, ArrowDown, ArrowUp, 
  Info, CheckCircle2, QrCode, Loader2, History
} from 'lucide-react';
import { paymentService } from '../services/paymentservice';
import { studentService } from '../services/studentservice';
import { enterpriseService } from '../services/enterprise.service';
import { profileService } from '../services/profileservice';
import { roleService } from '../services/roleservice';
import '../CSS/Payment.css';

const Payment = () => {
  const [searchParams] = useSearchParams();
  const contractIdFromUrl = searchParams.get('contractId'); // Lấy ?contractId=...

  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState([]);
  const [userData, setUserData] = useState({ fullName: '', roleName: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    initData();
  }, []);

  const initData = async () => {
    setLoading(true);
    try {
      const basicProfileRes = await profileService.getBasicProfile();
      const myRoleId = basicProfileRes.data.roleId;
      const fullName = basicProfileRes.data.fullName;

      const rolesRes = await roleService.getRegisterOptions();
      const matchedRole = rolesRes.data.find(r => r.roleId === myRoleId);
      const myRoleName = matchedRole ? matchedRole.roleName : 'UNKNOWN';

      setUserData({ fullName, roleName: myRoleName });

      let financeData;
      if (myRoleName === 'STUDENT') {
        financeData = await studentService.getProfile();
      } else {
        financeData = await enterpriseService.getMe();
      }

      if (financeData?.data) setBalance(financeData.data.walletBalance || 0);

      const historyRes = await paymentService.getMyPayments();
      setHistory(historyRes.data || []);
    } catch (err) {
      console.error("Lỗi tải dữ liệu:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- HÀM THANH TOÁN QUAN TRỌNG ---
  const handlePayment = async () => {
    // Nếu API của bạn yêu cầu contractId, bạn phải có nó
    if (!contractIdFromUrl) {
        alert("Vui lòng chọn một hợp đồng cụ thể để thanh toán. (Thiếu mã hợp đồng)");
        return;
    }

    setIsProcessing(true);
    try {
      console.log("Đang khởi tạo thanh toán cho hợp đồng:", contractIdFromUrl);
      
      // 1. Gọi API lấy link VNPAY
      const response = await paymentService.createVnpayQr(contractIdFromUrl);

      // 2. Chuyển hướng
      if (response.success && response.data) {
          // Lưu ý: response.data có thể là chuỗi URL hoặc object { paymentUrl: '...' }
          const url = typeof response.data === 'string' ? response.data : response.data.paymentUrl;
          
          if (url) {
              window.location.href = url; // CHUYỂN HƯỚNG THẬT
          } else {
              alert("Server không trả về link thanh toán hợp lệ");
          }
      } else {
          alert("Thất bại: " + (response.message || "Giao dịch bị từ chối"));
      }
    } catch (err) {
      console.error("Lỗi chi tiết:", err.response?.data);
      const msg = err.response?.data?.message || "Server Azure trả về lỗi 500 hoặc 404";
      alert("Lỗi kết nối: " + msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatMoney = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  if (loading) return <div className="vh-100 d-flex justify-content-center align-items-center bg-dark"><Spinner animation="border" variant="primary" /></div>;

  return (
    <div className="payment-page py-5 text-white animate-fade-in">
      <Container>
        <div className="mb-5">
            <h1 className="fw-bold">Quản lý <span className="text-primary-glow">Tài chính</span></h1>
            {contractIdFromUrl && <Badge bg="warning" text="dark">ĐANG THANH TOÁN HỢP ĐỒNG: {contractIdFromUrl}</Badge>}
        </div>

        <Row className="g-4">
          <Col lg={5}>
            <div className="wallet-card-bg shadow-glow mb-4 p-4 rounded-4" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)' }}>
                <p className="x-small opacity-75 mb-1 uppercase-tracking fw-bold">SỐ DƯ KHẢ DỤNG</p>
                <h2 className="fw-bold mb-3">{formatMoney(balance)}</h2>
                <div className="mt-4 pt-3 border-top border-white border-opacity-10 d-flex justify-content-between">
                    <span className="x-small">{userData.fullName}</span>
                    <Badge bg="light" text="dark">{userData.roleName}</Badge>
                </div>
            </div>

            <div className="glass-card p-4">
              <h5 className="fw-bold mb-4 text-primary-glow">Thanh toán VNPAY</h5>
              <div className="method-box active p-3 rounded-3 border-primary-glow d-flex align-items-center gap-3 mb-4">
                  <QrCode className="text-primary" />
                  <div>
                      <p className="mb-0 small fw-bold">Cổng thanh toán VNPAY</p>
                      <p className="mb-0 x-small text-muted italic">Tự động chuyển hướng</p>
                  </div>
              </div>

              <Button 
                variant="primary" 
                className="w-100 py-3 fw-bold shadow-glow" 
                onClick={handlePayment}
                disabled={isProcessing}
              >
                {isProcessing ? <Loader2 className="spinner me-2" /> : <Landmark size={18} className="me-2" />}
                {contractIdFromUrl ? "THANH TOÁN NGAY" : "CHỌN HỢP ĐỒNG ĐỂ TIẾP TỤC"}
              </Button>
            </div>
          </Col>

          <Col lg={7}>
            <div className="glass-card p-4 h-100 border-white-10">
              <h5 className="fw-bold mb-4"><History size={20} className="me-2"/>Lịch sử giao dịch</h5>
              <div className="history-list" style={{maxHeight: '400px', overflowY: 'auto'}}>
                {history.map((item) => (
                  <div key={item.paymentId} className="history-item d-flex justify-content-between align-items-center p-3 border-bottom border-white border-opacity-5">
                    <div className="d-flex align-items-center gap-3">
                      <div className={`icon-box rounded-circle p-2 ${item.amount > 0 ? 'bg-success text-success' : 'bg-danger text-danger'} bg-opacity-10`}>
                        {item.amount > 0 ? <ArrowDown size={18} /> : <ArrowUp size={18} />}
                      </div>
                      <div>
                        <p className="fw-bold mb-0 small">{item.description}</p>
                        <p className="x-small text-white-50 mb-0">{new Date(item.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    <span className={item.amount > 0 ? 'text-success' : 'text-danger'}>{item.amount?.toLocaleString()}đ</span>
                  </div>
                ))}
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Payment;