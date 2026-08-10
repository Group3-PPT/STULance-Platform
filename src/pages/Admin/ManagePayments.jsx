import React, { useState, useEffect, useCallback } from 'react';
import { Table, Badge, Row, Col, Spinner, Button, Modal, Form } from 'react-bootstrap';
import { Wallet, ShieldCheck, TrendingUp, Landmark, Loader2, RefreshCw, FileText, Banknote, CheckCircle2, XCircle, Clock, Eye } from 'lucide-react';
import { adminService } from '../../services/adminservice';
import { withdrawalService } from '../../services/withdrawalService';
import { serviceOrderService } from '../../services/serviceorderservice';
import PaginationBar from '../../components/PaginationBar';
import '../../CSS/ManagePayments.css';

const TABS = { TRANSACTIONS: 'transactions', WITHDRAWALS: 'withdrawals' };

const WITHDRAW_STATUS = {
  PENDING: { color: 'warning', icon: <Clock size={14} />, label: 'Chờ duyệt' },
  APPROVED: { color: 'success', icon: <CheckCircle2 size={14} />, label: 'Đã duyệt' },
  REJECTED: { color: 'danger', icon: <XCircle size={14} />, label: 'Từ chối' },
  CANCELLED: { color: 'secondary', icon: <XCircle size={14} />, label: 'Đã hủy' },
};

const ManagePayments = () => {
  // ============================================================
  // STATE
  // ============================================================

  // Tab đang xem (giao dịch / rút tiền)
  const [activeTab, setActiveTab] = useState(TABS.TRANSACTIONS);

  // Danh sách hợp đồng
  const [contracts, setContracts] = useState([]);

  // Danh sách đơn hàng dịch vụ
  const [orders, setOrders] = useState([]);

  // Danh sách yêu cầu rút tiền
  const [withdrawals, setWithdrawals] = useState([]);

  // Loading trang
  const [loading, setLoading] = useState(true);

  // Yêu cầu rút tiền đang xem chi tiết
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);

  // Hiện modal chi tiết
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Lý do từ chối
  const [rejectReason, setRejectReason] = useState('');

  // Đang xử lý (duyệt/từ chối)
  const [processing, setProcessing] = useState(false);

  // ============================================================
  // PHÂN TRANG - GIAO DỊCH
  // ============================================================
  const [txPage, setTxPage] = useState(1);
  const [txTotalPages, setTxTotalPages] = useState(1);
  const [txTotalItems, setTxTotalItems] = useState(0);

  // ============================================================
  // PHÂN TRANG - RÚT TIỀN
  // ============================================================
  const [wdPage, setWdPage] = useState(1);
  const [wdTotalPages, setWdTotalPages] = useState(1);
  const [wdTotalItems, setWdTotalItems] = useState(0);

  const pageSize = 15;

  // ============================================================
  // HÀM TẢI DỮ LIỆU GIAO DỊCH
  // ============================================================
  const fetchData = useCallback(async function (page) {
    if (!page) page = 1;

    setLoading(true);

    try {
      // Tải song song hợp đồng và đơn hàng dịch vụ
      var results = await Promise.all([
        adminService.getAllContracts({ page: page, pageSize: pageSize }),
        serviceOrderService.adminGetAllOrders({ page: page, pageSize: pageSize })
      ]);

      var contractsRes = results[0];
      var ordersRes = results[1];

      // Xử lý hợp đồng
      if (contractsRes.success && contractsRes.data) {
        setContracts(contractsRes.data.items || []);
        setTxTotalPages(contractsRes.data.totalPages || 1);
        setTxTotalItems(contractsRes.data.totalItems || 0);
        setTxPage(contractsRes.data.page || 1);
      }

      // Xử lý đơn hàng dịch vụ
      if (ordersRes.success && ordersRes.data) {
        setOrders(ordersRes.data.items || []);
      }

    } catch (err) {
      console.error('Lỗi tải dữ liệu:', err);

    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================
  // HÀM TẢI YÊU CẦU RÚT TIỀN
  // ============================================================
  const fetchWithdrawals = useCallback(async function (page) {
    if (!page) page = 1;

    setLoading(true);

    try {
      var res = await withdrawalService.adminGetAllWithdrawals({ page: page, pageSize: pageSize });

      if (res.success && res.data) {
        setWithdrawals(res.data.items || []);
        setWdTotalPages(res.data.totalPages || 1);
        setWdTotalItems(res.data.totalItems || 0);
        setWdPage(res.data.page || 1);
      }

    } catch (err) {
      console.error('Lỗi tải withdrawals:', err);

    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================
  // EFFECT: Tải dữ liệu khi chuyển tab
  // ============================================================
  useEffect(function () {
    if (activeTab === TABS.TRANSACTIONS) {
      fetchData(1);
    } else {
      fetchWithdrawals(1);
    }
  }, [activeTab, fetchData, fetchWithdrawals]);

  // ============================================================
  // HÀM DUYỆT RÚT TIỀN
  // ============================================================
  const handleApprove = async function (id) {
    var confirmed = window.confirm('Duyệt yêu cầu rút tiền này?');
    if (!confirmed) return;

    setProcessing(true);

    try {
      await withdrawalService.adminApprove(id, {
        adminNote: 'Đã duyệt bởi admin',
        transferReference: 'REF-' + Date.now()
      });
      alert('Đã duyệt!');
      setShowDetailModal(false);

      // Tải lại danh sách
      fetchWithdrawals(wdPage);

    } catch (err) {
      var msg = err.message;
      if (err.response && err.response.data && err.response.data.message) {
        msg = err.response.data.message;
      }
      alert('Lỗi: ' + msg);

    } finally {
      setProcessing(false);
    }
  };

  // ============================================================
  // HÀM TỪ CHỐI RÚT TIỀN
  // ============================================================
  const handleReject = async function (id) {
    // Validate lý do từ chối
    if (!rejectReason.trim()) {
      alert('Vui lòng nhập lý do từ chối');
      return;
    }

    setProcessing(true);

    try {
      await withdrawalService.adminReject(id, { reason: rejectReason });
      alert('Đã từ chối!');
      setShowDetailModal(false);
      setRejectReason('');

      // Tải lại danh sách
      fetchWithdrawals(wdPage);

    } catch (err) {
      var msg = err.message;
      if (err.response && err.response.data && err.response.data.message) {
        msg = err.response.data.message;
      }
      alert('Lỗi: ' + msg);

    } finally {
      setProcessing(false);
    }
  };

  // ============================================================
  // TÍNH TOÁN THỐNG KÊ
  // ============================================================

  // Tổng ký quỹ (tất cả hợp đồng)
  var totalEscrow = 0;
  for (var i = 0; i < contracts.length; i++) {
    totalEscrow += contracts[i].totalBudget || contracts[i].totalAmount || 0;
  }

  // Doanh thu từ hợp đồng hoàn thành
  var completedRevenue = 0;
  for (var j = 0; j < contracts.length; j++) {
    if (contracts[j].status === 'COMPLETED') {
      completedRevenue += contracts[j].totalBudget || contracts[j].totalAmount || 0;
    }
  }

  // Doanh thu từ đơn hàng dịch vụ hoàn thành
  var serviceOrderRevenue = 0;
  for (var k = 0; k < orders.length; k++) {
    if (orders[k].status === 'COMPLETED') {
      serviceOrderRevenue += orders[k].totalBudget || orders[k].totalAmount || 0;
    }
  }

  // Tổng doanh thu
  var totalRevenue = completedRevenue + serviceOrderRevenue;

  // Số yêu cầu rút tiền chờ duyệt
  var pendingWithdrawals = 0;
  for (var l = 0; l < withdrawals.length; l++) {
    if (withdrawals[l].status === 'PENDING') {
      pendingWithdrawals++;
    }
  }

  // ============================================================
  // HÀM FORMAT TIỀN TỆ
  // ============================================================
  const formatMoney = function (val) {
    if (!val) val = 0;
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(val);
  };

  return (
    <div className="pay-manage-container animate-fade-in">
      <div className="mb-5">
        <div className="d-flex justify-content-between align-items-center">
          <h2 className="pay-main-title text-white fw-bold">
            Quản lý <span className="text-primary-glow">Thanh toán</span>
          </h2>
          <button className="btn-icon-table text-white-50" title="Làm mới"
            onClick={() => activeTab === TABS.TRANSACTIONS ? fetchData(txPage) : fetchWithdrawals(wdPage)}>
            <RefreshCw size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="d-flex gap-2 mt-3">
          <button className={`btn btn-sm ${activeTab === TABS.TRANSACTIONS ? 'btn-primary' : 'btn-outline-light'}`}
            onClick={() => setActiveTab(TABS.TRANSACTIONS)}>
            <FileText size={14} className="me-1" /> Giao dịch
          </button>
          <button className={`btn btn-sm ${activeTab === TABS.WITHDRAWALS ? 'btn-primary' : 'btn-outline-light'}`}
            onClick={() => setActiveTab(TABS.WITHDRAWALS)}>
            <Banknote size={14} className="me-1" /> Rút tiền
            {pendingWithdrawals > 0 && <Badge bg="danger" className="ms-1">{pendingWithdrawals}</Badge>}
          </button>
        </div>
      </div>

      {/* Stats */}
      <Row className="g-4 mb-5">
        <Col lg={3} md={6}>
          <div className="pay-stat-card glass-card border-left-success">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <p className="pay-stat-label">TỔNG KÝ QUỸ</p>
                <h3 className="pay-stat-value text-white fw-bold">{formatMoney(totalEscrow)}</h3>
              </div>
              <div className="pay-icon-circle bg-success-light"><ShieldCheck size={20} /></div>
            </div>
            <div className="mt-3 x-small text-success fw-bold">
              <TrendingUp size={12} className="me-1" /> {contracts.length} hợp đồng
            </div>
          </div>
        </Col>
        <Col lg={3} md={6}>
          <div className="pay-stat-card glass-card border-left-primary">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <p className="pay-stat-label">DOANH THU</p>
                <h3 className="pay-stat-value text-primary-glow fw-bold">{formatMoney(totalRevenue)}</h3>
              </div>
              <div className="pay-icon-circle bg-primary-light"><TrendingUp size={20} /></div>
            </div>
            <div className="mt-3 x-small text-white-50">
              HD: {formatMoney(completedRevenue)} | DV: {formatMoney(serviceOrderRevenue)}
            </div>
          </div>
        </Col>
        <Col lg={3} md={6}>
          <div className="pay-stat-card glass-card border-left-info">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <p className="pay-stat-label">TỔNG ĐƠN HÀNG DV</p>
                <h3 className="pay-stat-value text-info fw-bold">{orders.length}</h3>
              </div>
              <div className="pay-icon-circle bg-info-light"><Landmark size={20} /></div>
            </div>
          </div>
        </Col>
        <Col lg={3} md={12}>
          <div className="pay-stat-card glass-card border-left-warning">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <p className="pay-stat-label">YÊU CẦU RÚT TIỀN</p>
                <h3 className="pay-stat-value text-warning fw-bold">{pendingWithdrawals}</h3>
              </div>
              <div className="pay-icon-circle bg-warning-light"><Banknote size={20} /></div>
            </div>
            <div className="mt-3 x-small text-white-50">Chờ duyệt rút tiền</div>
          </div>
        </Col>
      </Row>

      {/* Table */}
      <div className="pay-table-wrapper glass-card shadow-lg">
        <div className="p-3 border-bottom" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <h6 className="mb-0 text-white fw-bold">
            {activeTab === TABS.TRANSACTIONS ? 'Lịch sử giao dịch hệ thống' : 'Yêu cầu rút tiền'}
          </h6>
        </div>

        {loading ? (
          <div className="text-center py-5"><Loader2 className="spinner text-primary" size={40} /></div>
        ) : activeTab === TABS.TRANSACTIONS ? (
          <>
          <Table responsive variant="dark" className="mb-0 pay-custom-table align-middle">
            <thead>
              <tr>
                <th className="ps-4">Mã GD</th>
                <th>Thời gian</th>
                <th>Nguồn gửi</th>
                <th>Người nhận</th>
                <th>Số tiền</th>
                <th>Loại hình</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {[...contracts.map(c => ({
                id: 'c-' + c.contractId?.substring(0, 8),
                from: c.clientName || c.enterpriseName || 'N/A',
                to: c.providerName || c.studentName || 'N/A',
                amount: c.totalBudget || c.totalAmount || c.amount || 0,
                type: 'Hợp đồng',
                status: c.status,
                date: new Date(c.createdAt).toLocaleDateString('vi-VN')
              })),
              ...orders.map(o => ({
                id: 'o-' + o.orderId?.substring(0, 8),
                from: o.buyerName || 'N/A',
                to: o.sellerName || 'N/A',
                amount: o.totalBudget || o.totalAmount || o.amount || 0,
                type: 'Đơn hàng DV',
                status: o.status,
                date: new Date(o.createdAt).toLocaleDateString('vi-VN')
              }))].map((tx, idx) => (
                <tr key={tx.id || idx} className="pay-row">
                  <td className="ps-4"><span className="pay-id-tag">#{tx.id}</span></td>
                  <td className="small text-white-50">{tx.date}</td>
                  <td className="small text-white-80">{tx.from}</td>
                  <td className="small text-white-80">{tx.to}</td>
                  <td className="fw-bold text-success">{formatMoney(tx.amount)}</td>
                  <td><span className="pay-type-text x-small">{tx.type}</span></td>
                  <td><Badge className={`pay-status-badge ${tx.status === 'COMPLETED' ? 'st-done' : 'st-pending'}`}>{tx.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </Table>
          <div className="p-3 border-top" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <PaginationBar
              currentPage={txPage}
              totalPages={txTotalPages}
              onPageChange={(p) => fetchData(p)}
            />
          </div>
          </>
        ) : (
          <>
          <Table responsive variant="dark" className="mb-0 pay-custom-table align-middle">
            <thead>
              <tr>
                <th className="ps-4">Mã yêu cầu</th>
                <th>Người rút</th>
                <th>Ngân hàng</th>
                <th>Số TK</th>
                <th>Số tiền</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map((w) => {
                const st = WITHDRAW_STATUS[w.status] || WITHDRAW_STATUS.PENDING;
                return (
                  <tr key={w.withdrawalRequestId || w.id} className="pay-row">
                    <td className="ps-4"><span className="pay-id-tag">#{(w.withdrawalRequestId || w.id)?.substring(0, 8)}</span></td>
                    <td className="small text-white-80">{w.fullName || w.userName || 'N/A'}</td>
                    <td className="small text-white-80">{w.bankName}</td>
                    <td className="small text-white-50">{w.accountNumber}</td>
                    <td className="fw-bold text-warning">{formatMoney(w.amount)}</td>
                    <td><Badge bg={st.color} className="d-inline-flex align-items-center gap-1">{st.icon} {st.label}</Badge></td>
                    <td>
                      <Button variant="outline-light" size="sm" className="x-small"
                        onClick={() => { setSelectedWithdrawal(w); setShowDetailModal(true); setRejectReason(''); }}>
                        <Eye size={14} />
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {withdrawals.length === 0 && (
                <tr><td colSpan="7" className="text-center py-5 text-white-50">Chưa có yêu cầu rút tiền nào</td></tr>
              )}
            </tbody>
          </Table>
          <div className="p-3 border-top" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <PaginationBar
              currentPage={wdPage}
              totalPages={wdTotalPages}
              onPageChange={(p) => fetchWithdrawals(p)}
            />
          </div>
          </>
        )}
      </div>

      {/* DETAIL MODAL */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} centered className="cv-ai-modal">
        <Modal.Header className="cv-ai-header">
          <Modal.Title className="text-white">Chi tiết yêu cầu rút tiền</Modal.Title>
          <Button variant="link" className="text-white-50" onClick={() => setShowDetailModal(false)}>&times;</Button>
        </Modal.Header>
        <Modal.Body className="cv-ai-body">
          {selectedWithdrawal && (
            <div>
              <div className="text-center mb-4">
                <h3 className="fw-bold text-warning">{formatMoney(selectedWithdrawal.amount)}</h3>
                {(() => {
                  const st = WITHDRAW_STATUS[selectedWithdrawal.status] || WITHDRAW_STATUS.PENDING;
                  return <Badge bg={st.color} className="fs-6">{st.label}</Badge>;
                })()}
              </div>

              <div className="p-3 rounded mb-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-white-50 small">Người rút</span>
                  <span className="fw-bold small">{selectedWithdrawal.fullName || selectedWithdrawal.userName || 'N/A'}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-white-50 small">Ngân hàng</span>
                  <span className="fw-bold small">{selectedWithdrawal.bankName}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-white-50 small">Số tài khoản</span>
                  <span className="fw-bold small">{selectedWithdrawal.bankAccountNumber}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-white-50 small">Chủ tài khoản</span>
                  <span className="fw-bold small">{selectedWithdrawal.bankAccountHolder}</span>
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
              </div>

              {selectedWithdrawal.status === 'PENDING' && (
                <div>
                  <Form.Group className="mb-3">
                    <Form.Label className="x-small fw-bold text-white-50">LÝ DO TỪ CHỐI (nếu reject)</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      placeholder="Nhập lý do..."
                      className="bg-dark-input text-white border-0"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                    />
                  </Form.Group>
                  <div className="d-flex gap-2">
                    <Button variant="danger" className="flex-fill fw-bold"
                      onClick={() => handleReject(selectedWithdrawal.withdrawalRequestId || selectedWithdrawal.id)}
                      disabled={processing}>
                      {processing ? <Loader2 className="spinner me-1" size={14} /> : <XCircle size={14} className="me-1" />}
                      Từ chối
                    </Button>
                    <Button variant="success" className="flex-fill fw-bold"
                      onClick={() => handleApprove(selectedWithdrawal.withdrawalRequestId || selectedWithdrawal.id)}
                      disabled={processing}>
                      {processing ? <Loader2 className="spinner me-1" size={14} /> : <CheckCircle2 size={14} className="me-1" />}
                      Duyệt
                    </Button>
                  </div>
                </div>
              )}

              {selectedWithdrawal.rejectedReason && (
                <div className="mt-3 p-3 rounded" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <p className="x-small text-danger fw-bold mb-1">Lý do từ chối:</p>
                  <p className="small text-white mb-0">{selectedWithdrawal.rejectedReason}</p>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ManagePayments;
