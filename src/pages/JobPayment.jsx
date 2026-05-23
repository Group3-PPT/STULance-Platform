import React, { useState } from 'react';
import { Container, Row, Col, Button, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { CreditCard, Wallet, ShieldCheck, ChevronLeft, CheckCircle2, Info } from 'lucide-react';
import '../CSS/JobPayment.css';

const JobPayment = () => {
  const navigate = useNavigate();
  const [method, setMethod] = useState('wallet');

  const invoice = {
    jobTitle: "[Go/Next.js] Kỹ sư Backend hệ thống Streaming",
    fee: 50000, // Phí gửi báo giá (ví dụ 50k)
    tax: 5000,
    total: 55000,
    balance: 5000000
  };

  const handleConfirm = () => {
    alert("Thanh toán phí báo giá thành công!");
    navigate('/contract'); // Sau khi trả phí xong thì mới cho sang trang xem Hợp đồng
  };

  return (
    <div className="job-payment-page py-5">
      <Container>
        <div className="mb-4">
          <Link to="/jobs" className="text-decoration-none text-primary d-flex align-items-center gap-2 small fw-bold">
            <ChevronLeft size={18} /> QUAY LẠI DANH SÁCH DỰ ÁN
          </Link>
        </div>

        <Row className="justify-content-center">
          <Col lg={10}>
            <div className="glass-card p-0 overflow-hidden shadow-2xl">
              <Row className="g-0">
                {/* BÊN TRÁI: THÔNG TIN HÓA ĐƠN */}
                <Col md={7} className="p-4 p-md-5 border-end border-secondary-subtle">
                  <h4 className="text-white fw-bold mb-4">Xác nhận thanh toán phí</h4>
                  
                  <div className="payment-job-box p-3 rounded-4 mb-4" style={{background: 'rgba(255,255,255,0.03)'}}>
                    <Badge bg="primary" className="mb-2">DỰ ÁN ĐANG ỨNG TUYỂN</Badge>
                    <h6 className="text-white mb-0">{invoice.jobTitle}</h6>
                  </div>

                  <h6 className="text-muted small text-uppercase fw-bold mb-3">Phương thức thanh toán</h6>
                  <div className="d-grid gap-3">
                    <div 
                      className={`pay-method-card ${method === 'wallet' ? 'active' : ''}`}
                      onClick={() => setMethod('wallet')}
                    >
                      <Wallet size={24} className="text-primary" />
                      <div className="flex-grow-1">
                        <div className="text-white small fw-bold">Ví StudentLance</div>
                        <div className="x-small text-muted">Số dư: {invoice.balance.toLocaleString()}đ</div>
                      </div>
                      {method === 'wallet' && <CheckCircle2 size={20} className="text-primary" />}
                    </div>

                    <div 
                      className={`pay-method-card ${method === 'card' ? 'active' : ''}`}
                      onClick={() => setMethod('card')}
                    >
                      <CreditCard size={24} className="text-muted" />
                      <div className="text-white small fw-bold">Thẻ ngân hàng (NAPAS)</div>
                    </div>
                  </div>
                </Col>

                {/* BÊN PHẢI: TỔNG KẾT CHI PHÍ */}
                <Col md={5} className="p-4 p-md-5 bg-black-20">
                  <h5 className="text-white fw-bold mb-4 text-center">Tóm tắt đơn hàng</h5>
                  <div className="d-flex justify-content-between mb-2 small">
                    <span className="text-muted">Phí gửi báo giá</span>
                    <span className="text-white">{invoice.fee.toLocaleString()}đ</span>
                  </div>
                  <div className="d-flex justify-content-between mb-4 small">
                    <span className="text-muted">VAT (10%)</span>
                    <span className="text-white">{invoice.tax.toLocaleString()}đ</span>
                  </div>

                  <hr className="border-secondary" />
                  <div className="d-flex justify-content-between mb-5">
                    <span className="text-white fw-bold">Tổng số tiền</span>
                    <span className="text-primary-glow h4 fw-bold">{invoice.total.toLocaleString()}đ</span>
                  </div>

                  <Button variant="primary" className="w-100 py-3 fw-bold hub-btn-pay" onClick={handleConfirm}>
                    XÁC NHẬN & THANH TOÁN
                  </Button>

                  <div className="mt-4 text-center">
                    <div className="d-flex align-items-center justify-content-center gap-2 text-success small mb-2">
                       <ShieldCheck size={16} /> <span className="fw-bold">Bảo mật tuyệt đối</span>
                    </div>
                    <p className="x-small text-muted">Bằng việc thanh toán, bạn đồng ý với các điều khoản dịch vụ dành cho Freelancer.</p>
                  </div>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default JobPayment;