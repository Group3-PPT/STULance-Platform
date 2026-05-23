import React, { useState } from 'react';
import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import { 
  Wallet, Landmark, CreditCard, ArrowDown, ArrowUp, 
  Download, Info, CheckCircle2, QrCode 
} from 'lucide-react';
import '../CSS/Payment.css'; // Tuân thủ cấu trúc bạn yêu cầu

const Payment = () => {
  const [balance, setBalance] = useState(5000000);
  const [topupAmount, setTopupAmount] = useState(500000);
  const [method, setMethod] = useState('bank');
  const [history, setHistory] = useState([
    { id: 1, title: 'Nạp tiền vào ví', date: '20/05/2026 10:30', amount: 2000000, type: 'plus' },
    { id: 2, title: 'Thanh toán hợp đồng SL-00124', date: '18/05/2026 14:15', amount: 5000000, type: 'minus' },
    { id: 3, title: 'Nhận tiền hoàn từ dự án hủy', date: '15/05/2026 09:00', amount: 1500000, type: 'plus' }
  ]);

  const formatMoney = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const simulateSuccess = () => {
    if (topupAmount < 10000) {
      alert("Số tiền nạp tối thiểu là 10.000đ");
      return;
    }
    alert("Yêu cầu nạp tiền đang được xử lý! Số dư sẽ cập nhật trong vài giây.");
    
    // Cập nhật số dư và lịch sử
    const newBalance = balance + parseInt(topupAmount);
    setBalance(newBalance);
    
    const newEntry = {
      id: Date.now(),
      title: 'Nạp tiền vào ví (Thành công)',
      date: new Date().toLocaleString(),
      amount: parseInt(topupAmount),
      type: 'plus'
    };
    setHistory([newEntry, ...history]);
  };

  return (
    <div className="payment-page py-5">
      <Container>
        <div className="mb-5">
            <h1 className="fw-bold text-white">Quản lý <span className="text-primary-glow">Tài chính</span></h1>
            <p className="text-muted">Nạp tiền ký quỹ dự án và theo dõi thu nhập của bạn.</p>
        </div>

        <Row className="g-4">
          {/* CỘT TRÁI: VÍ & NẠP TIỀN */}
          <Col lg={5}>
            {/* Thẻ Ví */}
            <div className="wallet-card-bg shadow-lg mb-4">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="small opacity-75 mb-1">Số dư khả dụng</p>
                  <h2 className="fw-bold mb-3">{formatMoney(balance)}</h2>
                </div>
                <Wallet size={32} className="opacity-50" />
              </div>
              <div className="mt-4 pt-3 border-top border-white-10">
                <p className="x-small mb-0 opacity-75 uppercase-tracking">Mã ví: SL-99210045</p>
              </div>
            </div>

            {/* Form Nạp Tiền */}
            <div className="glass-card p-4">
              <h5 className="text-white fw-bold mb-4">Nạp tiền vào ví</h5>
              
              <Form.Group className="mb-4">
                <Form.Label className="small text-muted">Số tiền muốn nạp (VND)</Form.Label>
                <Form.Control 
                  type="number" 
                  value={topupAmount} 
                  onChange={(e) => setTopupAmount(e.target.value)}
                  className="topup-input"
                />
              </Form.Group>

              <p className="small text-muted mb-2">Phương thức thanh toán</p>
              <div className="method-grid mb-4">
                <div 
                  className={`method-box ${method === 'bank' ? 'active' : ''}`}
                  onClick={() => setMethod('bank')}
                >
                  <Landmark size={20} />
                  <span>Ngân hàng</span>
                </div>
                <div 
                  className={`method-box ${method === 'momo' ? 'active' : ''}`}
                  onClick={() => setMethod('momo')}
                >
                  <Wallet size={20} />
                  <span>Ví MoMo</span>
                </div>
                <div 
                  className={`method-box ${method === 'card' ? 'active' : ''}`}
                  onClick={() => setMethod('card')}
                >
                  <CreditCard size={20} />
                  <span>Visa/Master</span>
                </div>
              </div>

              {topupAmount >= 10000 && (
                <div className="qr-container animate-fade-in">
                  <div className="qr-inner bg-white p-3 rounded-4 mb-3 mx-auto">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=STDLANCE_TOPUP_${topupAmount}`} 
                      alt="QR Payment" 
                      className="qr-img"
                    />
                  </div>
                  <p className="small text-center mb-3">Nội dung chuyển khoản: <br/> 
                    <strong className="text-primary">NAP SL 99210045</strong>
                  </p>
                  <Button variant="primary" className="w-100 py-3 fw-bold shadow-glow" onClick={simulateSuccess}>
                    XÁC NHẬN ĐÃ CHUYỂN KHOẢN
                  </Button>
                </div>
              )}
            </div>
          </Col>

          {/* CỘT PHẢI: LỊCH SỬ GIAO DỊCH */}
          <Col lg={7}>
            <div className="glass-card p-4 h-100 d-flex flex-column">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="text-white fw-bold mb-0">Lịch sử giao dịch</h5>
                <Button variant="outline-light" size="sm" className="d-flex align-items-center gap-2">
                  <Download size={14} /> Xuất sao kê
                </Button>
              </div>

              <div className="history-list flex-grow-1">
                {history.map((item) => (
                  <div key={item.id} className="history-item d-flex justify-content-between align-items-center p-3">
                    <div className="d-flex align-items-center gap-3">
                      <div className={`icon-box ${item.type}`}>
                        {item.type === 'plus' ? <ArrowDown size={18} /> : <ArrowUp size={18} />}
                      </div>
                      <div>
                        <p className="fw-bold mb-0 small text-white">{item.title}</p>
                        <p className="x-small text-muted mb-0">{item.date}</p>
                      </div>
                    </div>
                    <div className={`amount-text ${item.type}`}>
                      {item.type === 'plus' ? '+' : '-'}{formatMoney(item.amount)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="payment-rules mt-4 p-3 rounded-4 bg-white-5 border border-white-10">
                <h6 className="small text-primary fw-bold mb-2 d-flex align-items-center gap-2">
                  <Info size={14} /> Quy định thanh toán
                </h6>
                <ul className="x-small text-muted ps-3 mb-0">
                  <li>Tiền nạp qua QR Ngân hàng sẽ được cộng tự động sau 1-3 phút.</li>
                  <li>Thu nhập từ dự án sẽ được hệ thống giữ 3 ngày (thời gian khiếu nại) trước khi khả dụng.</li>
                </ul>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Payment;