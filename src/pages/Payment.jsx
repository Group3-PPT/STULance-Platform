import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Form, Spinner, Badge, Alert } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import {
  Wallet, Landmark, CreditCard, ArrowDown, ArrowUp,
  Info, CheckCircle2, QrCode, Loader2, History, Zap, AlertTriangle
} from 'lucide-react';
import { paymentService } from '../services/paymentservice';
import { studentService } from '../services/studentservice';
import { enterpriseService } from '../services/enterprise.service';
import { profileService } from '../services/profileservice';
import { roleService } from '../services/roleservice';
import { createSepayCheckout, generateCheckoutForm, simulateIPN } from '../services/sepayService';
import '../CSS/Payment.css';

const PAYMENT_METHODS = {
  VNPAY: 'vnpay',
  SEPAY: 'sepay'
};

const Payment = () => {
  const [searchParams] = useSearchParams();
  const contractIdFromUrl = searchParams.get('contractId');
  const returnUrl = searchParams.get('status');

  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState([]);
  const [userData, setUserData] = useState({ fullName: '', roleName: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS.SEPAY);
  const [sepayAmount, setSepayAmount] = useState('');
  const [sepayNote, setSepayNote] = useState('');
  const [paymentResult, setPaymentResult] = useState(null);

  useEffect(() => {
    if (returnUrl) {
      setPaymentResult({
        status: returnUrl,
        message: returnUrl === 'success' ? 'Thanh toán thành công!' :
                 returnUrl === 'error' ? 'Thanh toán thất bại.' : 'Đã hủy thanh toán.'
      });
    }
  }, [returnUrl]);

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

  const handleSepayPayment = async () => {
    const amount = parseInt(sepayAmount);
    if (!amount || amount < 1000) {
      alert('Số tiền tối thiểu là 1.000đ');
      return;
    }

    setIsProcessing(true);
    try {
      const orderId = `STU-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      const description = sepayNote || `STULance Nap tien ${orderId}`;

      const fields = await createSepayCheckout({
        amount,
        orderId,
        description,
        paymentMethod: 'BANK_TRANSFER',
        successUrl: `${window.location.origin}/payment?status=success`,
        errorUrl: `${window.location.origin}/payment?status=error`,
        cancelUrl: `${window.location.origin}/payment?status=cancel`
      });

      generateCheckoutForm(fields);
    } catch (err) {
      console.error('SePay error:', err);
      alert('Lỗi khởi tạo thanh toán: ' + err.message);
      setIsProcessing(false);
    }
  };

  const handleVnpayPayment = async () => {
    if (!contractIdFromUrl) {
      alert("Vui lòng chọn một hợp đồng cụ thể để thanh toán.");
      return;
    }

    setIsProcessing(true);
    try {
      const response = await paymentService.createVnpayQr(contractIdFromUrl);
      if (response.success && response.data) {
        const url = typeof response.data === 'string' ? response.data : response.data.paymentUrl;
        if (url) {
          window.location.href = url;
        } else {
          alert("Server không trả về link thanh toán hợp lệ");
        }
      } else {
        alert("Thất bại: " + (response.message || "Giao dịch bị từ chối"));
      }
    } catch (err) {
      console.error("Lỗi chi tiết:", err.response?.data);
      const msg = err.response?.data?.message || "Server Azure trả về lỗi";
      alert("Lỗi kết nối: " + msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = () => {
    if (paymentMethod === PAYMENT_METHODS.SEPAY) {
      handleSepayPayment();
    } else {
      handleVnpayPayment();
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

        {paymentResult && (
          <Alert
            variant={paymentResult.status === 'success' ? 'success' : paymentResult.status === 'error' ? 'danger' : 'warning'}
            className="mb-4 d-flex align-items-center gap-2"
            onClose={() => setPaymentResult(null)}
            dismissible
          >
            {paymentResult.status === 'success' ? <CheckCircle2 size={18} /> :
             paymentResult.status === 'error' ? <AlertTriangle size={18} /> : <AlertTriangle size={18} />}
            <span className="fw-bold">{paymentResult.message}</span>
          </Alert>
        )}

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
              <h5 className="fw-bold mb-4 text-primary-glow">Phương thức thanh toán</h5>

              {/* SePay Option */}
              <div
                className={`method-box p-3 rounded-3 mb-3 d-flex align-items-center gap-3 ${paymentMethod === PAYMENT_METHODS.SEPAY ? 'active border-primary-glow' : 'border-white border-opacity-10'}`}
                style={{ cursor: 'pointer', border: `1px solid ${paymentMethod === PAYMENT_METHODS.SEPAY ? '#3b82f6' : 'rgba(255,255,255,0.1)'}` }}
                onClick={() => setPaymentMethod(PAYMENT_METHODS.SEPAY)}
              >
                <div className={`rounded-circle p-2 ${paymentMethod === PAYMENT_METHODS.SEPAY ? 'bg-primary' : 'bg-white bg-opacity-10'}`}>
                  <Zap size={20} className={paymentMethod === PAYMENT_METHODS.SEPAY ? 'text-white' : 'text-white-50'} />
                </div>
                <div>
                  <p className="mb-0 small fw-bold">SePay - VietQR</p>
                  <p className="mb-0 x-small text-white-50">Chuyển khoản QR qua Sandbox</p>
                </div>
                {paymentMethod === PAYMENT_METHODS.SEPAY && <CheckCircle2 size={18} className="ms-auto text-primary" />}
              </div>

              {/* VNPAY Option */}
              <div
                className={`method-box p-3 rounded-3 mb-4 d-flex align-items-center gap-3 ${paymentMethod === PAYMENT_METHODS.VNPAY ? 'active border-primary-glow' : 'border-white border-opacity-10'}`}
                style={{ cursor: 'pointer', border: `1px solid ${paymentMethod === PAYMENT_METHODS.VNPAY ? '#3b82f6' : 'rgba(255,255,255,0.1)'}` }}
                onClick={() => setPaymentMethod(PAYMENT_METHODS.VNPAY)}
              >
                <div className={`rounded-circle p-2 ${paymentMethod === PAYMENT_METHODS.VNPAY ? 'bg-primary' : 'bg-white bg-opacity-10'}`}>
                  <QrCode size={20} className={paymentMethod === PAYMENT_METHODS.VNPAY ? 'text-white' : 'text-white-50'} />
                </div>
                <div>
                  <p className="mb-0 small fw-bold">VNPAY</p>
                  <p className="mb-0 x-small text-white-50">Cổng thanh toán VNPAY</p>
                </div>
                {paymentMethod === PAYMENT_METHODS.VNPAY && <CheckCircle2 size={18} className="ms-auto text-primary" />}
              </div>

              {/* SePay Form */}
              {paymentMethod === PAYMENT_METHODS.SEPAY && (
                <div className="sepay-form mb-4">
                  <Form.Group className="mb-3">
                    <Form.Label className="x-small fw-bold text-white-50">SỐ TIỀN (VND)</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="Nhập số tiền (tối thiểu 1.000đ)"
                      className="bg-dark-input text-white border-0"
                      value={sepayAmount}
                      onChange={(e) => setSepayAmount(e.target.value)}
                      min="1000"
                    />
                    <div className="d-flex gap-2 mt-2">
                      {[50000, 100000, 200000, 500000].map(amt => (
                        <Button
                          key={amt}
                          variant="outline-light"
                          size="sm"
                          className="x-small"
                          onClick={() => setSepayAmount(String(amt))}
                        >
                          {amt.toLocaleString()}
                        </Button>
                      ))}
                    </div>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label className="x-small fw-bold text-white-50">NỘI DUNG CHUYỂN KHOẢN</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="STULance Nap tien [Mã đơn]"
                      className="bg-dark-input text-white border-0"
                      value={sepayNote}
                      onChange={(e) => setSepayNote(e.target.value)}
                    />
                  </Form.Group>
                  <Alert variant="info" className="x-small mb-0">
                    <Info size={14} className="me-1" />
                    Sandbox - Thanh toán giả lập, không mất tiền thật
                  </Alert>
                </div>
              )}

              <Button
                variant="primary"
                className="w-100 py-3 fw-bold shadow-glow"
                onClick={handlePayment}
                disabled={isProcessing}
              >
                {isProcessing ? <Loader2 className="spinner me-2" /> :
                 paymentMethod === PAYMENT_METHODS.SEPAY ? <Zap size={18} className="me-2" /> : <Landmark size={18} className="me-2" />}
                {paymentMethod === PAYMENT_METHODS.SEPAY
                  ? (sepayAmount ? `THANH TOÁN ${parseInt(sepayAmount).toLocaleString()}đ` : 'NHẬP SỐ TIỀN')
                  : (contractIdFromUrl ? "THANH TOÁN NGAY" : "CHỌN HỢP ĐỒNG ĐỂ TIẾP TỤC")
                }
              </Button>
            </div>
          </Col>

          <Col lg={7}>
            <div className="glass-card p-4 h-100 border-white-10">
              <h5 className="fw-bold mb-4"><History size={20} className="me-2" />Lịch sử giao dịch</h5>
              <div className="history-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {history.length === 0 ? (
                  <p className="text-white-50 text-center py-4">Chưa có giao dịch nào</p>
                ) : (
                  history.map((item) => (
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
                  ))
                )}
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Payment;
