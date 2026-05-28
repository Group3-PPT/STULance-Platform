import React, { useState } from 'react';
import { Container, Row, Col, Button, Badge, Form } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FileText, ShieldCheck, CreditCard, Wallet, 
  ChevronLeft, ArrowRight, Info, CheckCircle2 
} from 'lucide-react';
import '../../CSS/ServiceInvoice.css';

const ServiceInvoice = () => {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('wallet');

  // Dữ liệu giả lập từ bước trước truyền sang
  const invoiceData = {
    Thanh
  };

  const formatMoney = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const handlePayment = () => {
    alert("Thanh toán thành công! Hợp đồng đã được khởi tạo.");
    navigate('/contract'); // Chuyển sang trang hợp đồng
  };

  return (
    <div className="invoice-page py-5">
      <Container>
        <div className="mb-4">
          <Link to="/service-detail" className="text-decoration-none text-primary d-flex align-items-center gap-2 small fw-bold">
            <ChevronLeft size={18} /> QUAY LẠI CHI TIẾT
          </Link>
        </div>

        <Row className="g-4">
          {/* CỘT TRÁI: CHI TIẾT HÓA ĐƠN */}
          <Col lg={8}>
            <div className="glass-card p-4 mb-4">
              <div className="d-flex justify-content-between align-items-center mb-4 border-bottom border-secondary pb-3">
                <h4 className="text-white fw-bold mb-0 d-flex align-items-center gap-2">
                  <FileText className="text-primary" /> Xác nhận thanh toán
                </h4>
                <span className="text-muted small">Mã đơn: {invoiceData.orderId}</span>
              </div>

              <div className="invoice-item-box glass-card p-3 mb-4">
                <div className="d-flex justify-content-between">
                  <div style={{ flex: 1 }}>
                    <Badge bg="primary" className="mb-2">DỊCH VỤ SINH VIÊN</Badge>
                    <h5 className="text-white fw-bold">{invoiceData.serviceTitle}</h5>
                    <p className="text-muted small mb-0">Cung cấp bởi: <strong>{invoiceData.author}</strong></p>
                    <p className="text-info x-small mt-2">Gói: {invoiceData.package}</p>
                  </div>
                  <div className="text-end">
                    <div className="text-white fw-bold">{formatMoney(invoiceData.price)}</div>
                  </div>
                </div>
              </div>

              <div className="payment-method-selection">
                <h6 className="text-white mb-3">Chọn nguồn thanh toán</h6>
                <div 
                  className={`method-row glass-card p-3 mb-2 ${paymentMethod === 'wallet' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('wallet')}
                >
                  <div className="d-flex align-items-center gap-3">
                    <Wallet className={paymentMethod === 'wallet' ? 'text-primary' : 'text-muted'} />
                    <div className="flex-grow-1">
                      <p className="mb-0 text-white small fw-bold">Ví StudentLance</p>
                      <p className="mb-0 x-small text-muted">Số dư: {formatMoney(invoiceData.walletBalance)}</p>
                    </div>
                    {paymentMethod === 'wallet' && <CheckCircle2 size={20} className="text-primary" />}
                  </div>
                </div>

                <div 
                  className={`method-row glass-card p-3 ${paymentMethod === 'direct' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('direct')}
                >
                  <div className="d-flex align-items-center gap-3">
                    <CreditCard className={paymentMethod === 'direct' ? 'text-primary' : 'text-muted'} />
                    <div className="flex-grow-1">
                      <p className="mb-0 text-white small fw-bold">Thanh toán trực tiếp</p>
                      <p className="mb-0 x-small text-muted">Visa, Master, Napas hoặc chuyển khoản QR</p>
                    </div>
                    {paymentMethod === 'direct' && <CheckCircle2 size={20} className="text-primary" />}
                  </div>
                </div>
              </div>
            </div>

            <div className="escrow-notice glass-card p-3 d-flex gap-3 align-items-center">
              <ShieldCheck size={40} className="text-success" />
              <div>
                <h6 className="text-white fw-bold mb-1">Thanh toán an toàn (Escrow)</h6>
                <p className="x-small text-muted mb-0">
                  Số dư sẽ được hệ thống giữ an toàn và chỉ chuyển cho sinh viên khi bạn xác nhận đã nhận được sản phẩm hoàn thiện.
                </p>
              </div>
            </div>
          </Col>

          {/* CỘT PHẢI: TỔNG KẾT CHI PHÍ */}
          <Col lg={4}>
            <div className="glass-card p-4 sticky-top" style={{ top: '100px' }}>
              <h5 className="text-white fw-bold mb-4">Tóm tắt chi phí</h5>
              
              <div className="d-flex justify-content-between mb-2 small text-muted">
                <span>Giá dịch vụ</span>
                <span>{formatMoney(invoiceData.price)}</span>
              </div>
              <div className="d-flex justify-content-between mb-4 small text-muted">
                <span>Phí giao dịch (5%)</span>
                <span>{formatMoney(invoiceData.fee)}</span>
              </div>

              <div className="d-flex justify-content-between border-top border-secondary pt-3 mb-4">
                <span className="text-white fw-bold">Tổng thanh toán</span>
                <span className="text-primary-glow h4 fw-bold">{formatMoney(invoiceData.total)}</span>
              </div>

              <Button 
                variant="primary" 
                className="w-100 py-3 fw-bold hub-btn-pay shadow-glow"
                onClick={handlePayment}
              >
                XÁC NHẬN THANH TOÁN
              </Button>

              <div className="mt-4 p-3 rounded-3 bg-dark-subtle border border-secondary">
                <div className="d-flex gap-2 text-warning mb-2">
                  <Info size={16} /> <strong className="x-small">Chính sách hủy đơn</strong>
                </div>
                <p className="x-small text-muted mb-0">
                  Bạn có thể yêu cầu hoàn tiền 100% nếu sinh viên không giao hàng đúng hạn cam kết.
                </p>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ServiceInvoice;