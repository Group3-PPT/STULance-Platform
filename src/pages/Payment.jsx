import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Form, Spinner, Badge, Modal, Tabs, Tab } from 'react-bootstrap';
import {
  Wallet, ArrowUp, ArrowDown, Loader2, History, Banknote,
  CheckCircle2, XCircle, Clock, Plus, CreditCard, RefreshCw
} from 'lucide-react';
import { withdrawalService } from '../services/withdrawalService';
import { paymentService } from '../services/paymentservice';
import { profileService } from '../services/profileservice';
import { studentService } from '../services/studentservice';
import { enterpriseService } from '../services/enterprise.service';
import '../CSS/Payment.css';

const WITHDRAW_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED'
};

const STATUS_CONFIG = {
  PENDING: { color: 'warning', icon: <Clock size={14} />, label: 'Đang chờ' },
  APPROVED: { color: 'success', icon: <CheckCircle2 size={14} />, label: 'Đã duyệt' },
  REJECTED: { color: 'danger', icon: <XCircle size={14} />, label: 'Từ chối' },
  CANCELLED: { color: 'secondary', icon: <XCircle size={14} />, label: 'Đã hủy' },
};

const PAYMENT_TYPE = {
  DEPOSIT: 'DEPOSIT',
  WITHDRAWAL: 'WITHDRAWAL',
  ESCROW: 'ESCROW',
  REFUND: 'REFUND',
  PAYMENT: 'PAYMENT'
};

const Payment = () => {
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [payments, setPayments] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [userData, setUserData] = useState({ fullName: '', roleName: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawBank, setWithdrawBank] = useState('');
  const [withdrawAccount, setWithdrawAccount] = useState('');
  const [withdrawAccountName, setWithdrawAccountName] = useState('');
  const [withdrawNote, setWithdrawNote] = useState('');
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [activeTab, setActiveTab] = useState('history');
  const [error, setError] = useState(null);

  useEffect(() => { initData(); }, []);

  const initData = async () => {
    setLoading(true);
    setError(null);
    try {
      const userRole = localStorage.getItem('userRole');

      const [profileRes, financeRes] = await Promise.allSettled([
        profileService.getBasicProfile(),
        userRole === 'STUDENT' ? studentService.getProfile() : enterpriseService.getMe()
      ]);

      if (profileRes.status === 'fulfilled' && profileRes.value.success) {
        setUserData({
          fullName: profileRes.value.data.fullName,
          roleName: userRole || ''
        });
      }

      if (financeRes.status === 'fulfilled' && financeRes.value.success) {
        setBalance(financeRes.value.data.walletBalance || 0);
      }

      const [paymentsRes, withdrawalsRes] = await Promise.allSettled([
        paymentService.getMyPayments(),
        withdrawalService.getMyWithdrawals()
      ]);

      if (paymentsRes.status === 'fulfilled') {
        const pData = paymentsRes.value?.data || paymentsRes.value || [];
        setPayments(Array.isArray(pData) ? pData : pData.items || []);
      }

      if (withdrawalsRes.status === 'fulfilled') {
        const wData = withdrawalsRes.value?.data || withdrawalsRes.value || [];
        setWithdrawals(Array.isArray(wData) ? wData : wData.items || []);
      }
    } catch (err) {
      console.error('Lỗi tải dữ liệu:', err);
      setError('Không thể tải dữ liệu tài chính. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWithdrawal = async () => {
    const amount = parseInt(withdrawAmount);
    if (!amount || amount < 50000) {
      alert('Số tiền tối thiểu 50.000đ');
      return;
    }
    if (amount > balance) {
      alert('Số dư không đủ');
      return;
    }
    if (!withdrawBank.trim() || !withdrawAccount.trim() || !withdrawAccountName.trim()) {
      alert('Vui lòng nhập đầy đủ thông tin ngân hàng');
      return;
    }

    setIsProcessing(true);
    try {
      await withdrawalService.createWithdrawal({
        amount,
        bankName: withdrawBank,
        accountNumber: withdrawAccount,
        accountName: withdrawAccountName,
        note: withdrawNote
      });
      alert('Gửi yêu cầu rút tiền thành công!');
      setShowWithdrawModal(false);
      resetForm();
      initData();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelWithdrawal = async (id) => {
    if (!window.confirm('Bạn muốn hủy yêu cầu rút tiền này?')) return;
    try {
      await withdrawalService.cancelWithdrawal(id);
      alert('Đã hủy yêu cầu');
      initData();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const resetForm = () => {
    setWithdrawAmount('');
    setWithdrawBank('');
    setWithdrawAccount('');
    setWithdrawAccountName('');
    setWithdrawNote('');
    setDepositAmount('');
  };

  const formatMoney = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'DEPOSIT': return <ArrowDown size={16} className="text-success" />;
      case 'WITHDRAWAL': return <ArrowUp size={16} className="text-danger" />;
      case 'ESCROW': return <Banknote size={16} className="text-warning" />;
      case 'PAYMENT': return <CreditCard size={16} className="text-primary" />;
      case 'REFUND': return <RefreshCw size={16} className="text-info" />;
      default: return <Banknote size={16} className="text-white-50" />;
    }
  };

  const getTransactionLabel = (type) => {
    switch (type) {
      case 'DEPOSIT': return 'Nạp tiền';
      case 'WITHDRAWAL': return 'Rút tiền';
      case 'ESCROW': return 'Ký quỹ';
      case 'PAYMENT': return 'Thanh toán';
      case 'REFUND': return 'Hoàn tiền';
      default: return type || 'Giao dịch';
    }
  };

  if (loading) {
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center bg-dark">
        <div className="text-center">
          <Loader2 className="spinner text-primary mb-3" size={40} />
          <p className="text-white-50">Đang tải dữ liệu tài chính...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page py-5 text-white animate-fade-in">
      <Container>
        {error && (
          <div className="alert alert-danger mb-4" role="alert">
            {error}
            <Button variant="outline-light" size="sm" className="ms-3" onClick={initData}>Thử lại</Button>
          </div>
        )}

        <div className="mb-5">
          <h1 className="fw-bold">Quản lý <span className="text-primary-glow">Tài chính</span></h1>
        </div>

        <Row className="g-4">
          <Col lg={4}>
            {/* Wallet Card */}
            <div className="wallet-card-bg shadow-glow mb-4 p-4 rounded-4" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)' }}>
              <p className="x-small opacity-75 mb-1 uppercase-tracking fw-bold">SỐ DƯ KHẢ DỤNG</p>
              <h2 className="fw-bold mb-3">{formatMoney(balance)}</h2>
              <div className="mt-4 pt-3 border-top border-white border-opacity-10 d-flex justify-content-between">
                <span className="x-small">{userData.fullName}</span>
                <Badge bg="light" text="dark">{userData.roleName}</Badge>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="glass-card p-4">
              <Button
                variant="primary"
                className="w-100 py-3 fw-bold shadow-glow d-flex align-items-center justify-content-center gap-2"
                onClick={() => setShowWithdrawModal(true)}
              >
                <Banknote size={20} /> RÚT TIỀN
              </Button>
              <p className="x-small text-white-50 text-center mt-2 mb-0">
                Số dư tối thiểu rút: 50.000đ
              </p>
            </div>
          </Col>

          <Col lg={8}>
            <div className="glass-card p-4 h-100 border-white-10">
              <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4 custom-tabs">
                <Tab eventKey="history" title={<span className="fw-bold"><History size={16} className="me-2" />Lịch sử giao dịch</span>}>
                  <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                    {payments.length === 0 ? (
                      <p className="text-white-50 text-center py-4">Chưa có giao dịch nào</p>
                    ) : (
                      payments.map((item) => (
                        <div
                          key={item.paymentId || item.id}
                          className="d-flex justify-content-between align-items-center p-3 mb-2 rounded"
                          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                        >
                          <div className="d-flex align-items-center gap-3">
                            <div className="icon-box rounded-circle p-2" style={{ background: 'rgba(255,255,255,0.05)' }}>
                              {getTransactionIcon(item.type)}
                            </div>
                            <div>
                              <p className="fw-bold mb-0 small">{getTransactionLabel(item.type)}</p>
                              <p className="x-small text-white-50 mb-0">{item.description || item.note || 'Không có mô tả'}</p>
                              <p className="x-small text-white-50 mb-0">{new Date(item.createdAt).toLocaleString('vi-VN')}</p>
                            </div>
                          </div>
                          <div className="text-end">
                            <p className={`fw-bold mb-0 small ${item.type === 'DEPOSIT' || item.type === 'REFUND' ? 'text-success' : 'text-danger'}`}>
                              {item.type === 'DEPOSIT' || item.type === 'REFUND' ? '+' : '-'}{formatMoney(item.amount)}
                            </p>
                            {item.status && (
                              <Badge bg={item.status === 'SUCCESS' ? 'success' : item.status === 'FAILED' ? 'danger' : 'warning'} className="x-small">
                                {item.status}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </Tab>

                <Tab eventKey="withdrawals" title={<span className="fw-bold"><Banknote size={16} className="me-2" />Yêu cầu rút tiền</span>}>
                  <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                    {withdrawals.length === 0 ? (
                      <p className="text-white-50 text-center py-4">Chưa có yêu cầu rút tiền nào</p>
                    ) : (
                      withdrawals.map((item) => {
                        const st = STATUS_CONFIG[item.status] || STATUS_CONFIG.PENDING;
                        return (
                          <div
                            key={item.withdrawalRequestId || item.id}
                            className="d-flex justify-content-between align-items-center p-3 mb-2 rounded"
                            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer' }}
                            onClick={() => { setSelectedWithdrawal(item); setShowDetailModal(true); }}
                          >
                            <div className="d-flex align-items-center gap-3">
                              <div className={`icon-box rounded-circle p-2 bg-${st.color} bg-opacity-10`}>
                                <ArrowUp size={16} className={`text-${st.color}`} />
                              </div>
                              <div>
                                <p className="fw-bold mb-0 small">{formatMoney(item.amount)}</p>
                                <p className="x-small text-white-50 mb-0">{item.bankName} - {item.accountNumber}</p>
                                <p className="x-small text-white-50 mb-0">{new Date(item.createdAt || item.requestedAt).toLocaleString('vi-VN')}</p>
                              </div>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                              <Badge bg={st.color} className="d-flex align-items-center gap-1">
                                {st.icon} {st.label}
                              </Badge>
                              {item.status === WITHDRAW_STATUS.PENDING && (
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  className="x-small"
                                  onClick={(e) => { e.stopPropagation(); handleCancelWithdrawal(item.withdrawalRequestId || item.id); }}
                                >
                                  Hủy
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </Tab>
              </Tabs>
            </div>
          </Col>
        </Row>
      </Container>

      {/* WITHDRAW MODAL */}
      <Modal show={showWithdrawModal} onHide={() => setShowWithdrawModal(false)} centered className="cv-ai-modal">
        <Modal.Header className="cv-ai-header">
          <Modal.Title className="d-flex align-items-center gap-2 text-white"><Banknote size={20} /> Rút tiền</Modal.Title>
          <Button variant="link" className="text-white-50" onClick={() => setShowWithdrawModal(false)}>&times;</Button>
        </Modal.Header>
        <Modal.Body className="cv-ai-body">
          <div className="mb-3 p-3 rounded" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
            <p className="x-small text-white-50 mb-1">Số dư hiện tại</p>
            <h4 className="fw-bold text-primary mb-0">{formatMoney(balance)}</h4>
          </div>

          <Form.Group className="mb-3">
            <Form.Label className="x-small fw-bold text-white-50">SỐ TIỀN RÚT (VND)</Form.Label>
            <Form.Control
              type="number"
              placeholder="Tối thiểu 50.000đ"
              className="bg-dark-input text-white border-0"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              min="50000"
            />
            <div className="d-flex gap-2 mt-2">
              {[100000, 200000, 500000].map(amt => (
                <Button key={amt} variant="outline-light" size="sm" className="x-small"
                  onClick={() => setWithdrawAmount(String(amt))}>
                  {amt.toLocaleString()}
                </Button>
              ))}
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="x-small fw-bold text-white-50">NGÂN HÀNG</Form.Label>
            <Form.Select className="bg-dark-input text-white border-0" value={withdrawBank} onChange={(e) => setWithdrawBank(e.target.value)}>
              <option value="">Chọn ngân hàng</option>
              <option value="Vietcombank">Vietcombank</option>
              <option value="BIDV">BIDV</option>
              <option value="VietinBank">VietinBank</option>
              <option value="Techcombank">Techcombank</option>
              <option value="MBBank">MBBank</option>
              <option value="ACB">ACB</option>
              <option value="VPBank">VPBank</option>
              <option value="TPBank">TPBank</option>
              <option value="Sacombank">Sacombank</option>
              <option value="MSB">MSB</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="x-small fw-bold text-white-50">SỐ TÀI KHOẢN</Form.Label>
            <Form.Control
              type="text"
              placeholder="Nhập số tài khoản"
              className="bg-dark-input text-white border-0"
              value={withdrawAccount}
              onChange={(e) => setWithdrawAccount(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="x-small fw-bold text-white-50">TÊN CHỦ TÀI KHOẢN</Form.Label>
            <Form.Control
              type="text"
              placeholder="Nhập tên chủ tài khoản"
              className="bg-dark-input text-white border-0"
              value={withdrawAccountName}
              onChange={(e) => setWithdrawAccountName(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="x-small fw-bold text-white-50">GHI CHÚ (tùy chọn)</Form.Label>
            <Form.Control
              type="text"
              placeholder="Nội dung chuyển khoản"
              className="bg-dark-input text-white border-0"
              value={withdrawNote}
              onChange={(e) => setWithdrawNote(e.target.value)}
            />
          </Form.Group>

          <Button
            variant="primary"
            className="w-100 py-3 fw-bold"
            onClick={handleCreateWithdrawal}
            disabled={isProcessing}
          >
            {isProcessing ? <Loader2 className="spinner me-2" /> : <Banknote size={18} className="me-2" />}
            GỬI YÊU CẦU RÚT TIỀN
          </Button>
        </Modal.Body>
      </Modal>

      {/* DETAIL MODAL */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} centered className="cv-ai-modal">
        <Modal.Header className="cv-ai-header">
          <Modal.Title className="text-white">Chi tiết yêu cầu</Modal.Title>
          <Button variant="link" className="text-white-50" onClick={() => setShowDetailModal(false)}>&times;</Button>
        </Modal.Header>
        <Modal.Body className="cv-ai-body">
          {selectedWithdrawal && (
            <div>
              {(() => {
                const st = STATUS_CONFIG[selectedWithdrawal.status] || STATUS_CONFIG.PENDING;
                return (
                  <div className="text-center mb-4">
                    <div className={`d-inline-flex align-items-center justify-content-center rounded-circle p-3 bg-${st.color} bg-opacity-10 mb-3`}>
                      {st.icon}
                    </div>
                    <h4 className="fw-bold">{formatMoney(selectedWithdrawal.amount)}</h4>
                    <Badge bg={st.color} className="fs-6">{st.label}</Badge>
                  </div>
                );
              })()}
              <div className="p-3 rounded" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-white-50 small">Ngân hàng</span>
                  <span className="fw-bold small">{selectedWithdrawal.bankName}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-white-50 small">Số tài khoản</span>
                  <span className="fw-bold small">{selectedWithdrawal.accountNumber}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-white-50 small">Chủ tài khoản</span>
                  <span className="fw-bold small">{selectedWithdrawal.accountName}</span>
                </div>
                {selectedWithdrawal.note && (
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-white-50 small">Ghi chú</span>
                    <span className="fw-bold small">{selectedWithdrawal.note}</span>
                  </div>
                )}
                <div className="d-flex justify-content-between">
                  <span className="text-white-50 small">Ngày tạo</span>
                  <span className="small">{new Date(selectedWithdrawal.createdAt || selectedWithdrawal.requestedAt).toLocaleString('vi-VN')}</span>
                </div>
                {selectedWithdrawal.rejectedReason && (
                  <div className="d-flex justify-content-between mt-2 pt-2 border-top border-secondary">
                    <span className="text-danger small">Lý do từ chối</span>
                    <span className="text-danger small fw-bold">{selectedWithdrawal.rejectedReason}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Payment;
