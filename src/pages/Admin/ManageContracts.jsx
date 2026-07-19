import React, { useState, useEffect, useCallback } from 'react';
import { Container, Badge, Button, Row, Col, Modal, Spinner, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import {
  Handshake, Loader2, CheckCircle, XCircle, AlertTriangle,
  Eye, RefreshCw, Search, User, DollarSign, Clock
} from 'lucide-react';
import { contractService } from '../../services/contractservice';
import PaginationBar from '../../components/PaginationBar';
import '../../CSS/ManageJobs.css';

const ManageContracts = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContract, setSelectedContract] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [resolveAction, setResolveAction] = useState('');
  const [resolveNote, setResolveNote] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 15;

  const fetchContracts = useCallback(async (page = 1, keyword = '') => {
    setLoading(true);
    try {
      const res = await contractService.adminGetAllContracts({
        page,
        pageSize,
        keyword: keyword || undefined
      });
      if (res.success && res.data) {
        const data = res.data;
        setContracts(data.items || []);
        setTotalPages(data.totalPages || 1);
        setTotalItems(data.totalItems || 0);
        setCurrentPage(data.page || 1);
      }
    } catch (err) {
      console.error("Lỗi tải hợp đồng:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchContracts(1); }, [fetchContracts]);

  const getStatusConfig = (status) => {
    const map = {
      'SIGNING': { label: 'Chờ ký', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
      'AWAITING_PAYMENT': { label: 'Chờ thanh toán', color: '#60a5fa', bg: 'rgba(96,165,250,0.12)' },
      'IN_PROGRESS': { label: 'Đang thực hiện', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
      'DELIVERED': { label: 'Đã bàn giao', color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
      'CANCEL_REQUESTED': { label: 'Yêu cầu hủy', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
      'DISPUTED': { label: 'Tranh chấp', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
      'COMPLETED': { label: 'Hoàn thành', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
      'CANCELLED': { label: 'Đã hủy', color: '#6b7280', bg: 'rgba(107,114,128,0.12)' },
      'EXPIRED': { label: 'Hết hạn', color: '#6b7280', bg: 'rgba(107,114,128,0.12)' },
    };
    return map[status] || { label: status, color: '#60a5fa', bg: 'rgba(96,165,250,0.12)' };
  };

  const formatMoney = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchContracts(1, searchTerm);
  };

  const handlePageChange = (page) => {
    fetchContracts(page, searchTerm);
  };

  const handleResolveDispute = async () => {
    if (!resolveAction || !selectedContract) return;
    setResolving(true);
    try {
      await contractService.adminResolveDispute(selectedContract.contractId, {
        action: resolveAction,
        note: resolveNote
      });
      alert("Xử lý tranh chấp thành công!");
      setShowDetailModal(false);
      setResolveAction('');
      setResolveNote('');
      fetchContracts();
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || "Không thể xử lý"));
    } finally {
      setResolving(false);
    }
  };

  return (
    <div className="mj-page py-5 text-white animate-fade-in">
      <Container fluid className="px-lg-5">
        <div className="d-flex justify-content-between align-items-center mb-5">
          <div>
            <h1 className="fw-bold display-6 mb-1">
              Quản lý <span className="text-primary-glow">Hợp đồng</span>
            </h1>
            <p className="text-white-50 mb-0">Xem và xử lý tranh chấp hợp đồng ({totalItems} hợp đồng)</p>
          </div>
        </div>

        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="mj-search">
            <Search size={16} className="text-white-50" />
            <input
              placeholder="Tìm kiếm hợp đồng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button variant="outline-primary" size="sm" onClick={handleSearch}>
            <RefreshCw size={14} className="me-1" /> Tải lại
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <Loader2 className="spinner text-primary" size={40} />
          </div>
        ) : contracts.length === 0 ? (
          <div className="mj-empty-state">
            <Handshake size={48} className="text-white-50 mb-3" />
            <p className="text-white-50">Không có hợp đồng nào</p>
          </div>
        ) : (
          <>
          <div className="mj-contract-list">
            {contracts.map((c) => {
              const st = getStatusConfig(c.status);
              return (
                <div key={c.contractId} className="mj-contract-card">
                  <div className="d-flex align-items-center gap-4 flex-fill">
                    <div className="mj-contract-avatar">
                      <User size={22} />
                    </div>
                    <div className="flex-fill">
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <h6 className="mj-contract-name mb-0">{c.contractName || c.jobTitle || 'Hợp đồng'}</h6>
                        <span className="mj-contract-id">#{c.contractId?.substring(0, 8)}</span>
                      </div>
                      <p className="mj-contract-student mb-0">
                        <User size={12} className="me-1" /> {c.enterpriseName || 'N/A'} → {c.studentName || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="mj-contract-info">
                    <span className="mj-contract-amount">{formatMoney(c.totalBudget || c.totalAmount)}</span>
                    <span className="mj-status-badge" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                  </div>

                  <div className="d-flex gap-2">
                    <Button as={Link} to={`/contract/${c.contractId}`} variant="outline-light" size="sm" className="mj-btn-sm">
                      <Eye size={13} /> Xem
                    </Button>
                    {c.status === 'DISPUTED' && (
                      <Button variant="danger" size="sm" className="mj-btn-sm" onClick={() => { setSelectedContract(c); setShowDetailModal(true); }}>
                        <AlertTriangle size={13} /> Xử lý
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <PaginationBar
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
          </>
        )}

        {/* MODAL XỬ LÝ TRANH CHẤP */}
        <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} centered dialogClassName="modal-dark">
          <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title className="fw-bold d-flex align-items-center gap-2">
              <div className="mj-stat-icon" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', width: 40, height: 40 }}>
                <AlertTriangle size={18} />
              </div>
              <div>
                <span className="text-white">Xử lý tranh chấp</span>
                <p className="x-small text-white-50 mb-0">#{selectedContract?.contractId?.substring(0, 8)}</p>
              </div>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="pt-3">
            <div className="mb-3 p-3 rounded" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <p className="x-small text-white-50 mb-1">Hợp đồng: <strong className="text-white">{selectedContract?.contractName || selectedContract?.jobTitle}</strong></p>
              <p className="x-small text-white-50 mb-1">Bên thuê: <strong className="text-white">{selectedContract?.enterpriseName}</strong></p>
              <p className="x-small text-white-50 mb-1">Bên thực hiện: <strong className="text-white">{selectedContract?.studentName}</strong></p>
              <p className="x-small text-white-50 mb-0">Giá trị: <strong className="text-warning">{formatMoney(selectedContract?.totalBudget || selectedContract?.totalAmount)}</strong></p>
            </div>

            <div className="mb-3 p-2 rounded x-small" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)', color: '#f59e0b' }}>
              <strong>Phí nền tảng:</strong> 10% giá trị hợp đồng sẽ được trừ khi hợp đồng hoàn thành.
            </div>

            <Form.Group className="mb-3">
              <Form.Label className="x-small fw-bold text-white-50">QUYẾT ĐỊNH *</Form.Label>
              <div className="d-grid gap-2">
                <Button
                  variant={resolveAction === 'IN_PROGRESS' ? 'primary' : 'outline-primary'}
                  className="text-start"
                  onClick={() => setResolveAction('IN_PROGRESS')}
                >
                  <RefreshCw size={14} className="me-2" /> Tiếp tục làm việc (IN_PROGRESS) — Hợp đồng được khôi phục, hai bên tiếp tục thực hiện
                </Button>
                <Button
                  variant={resolveAction === 'COMPLETED' ? 'success' : 'outline-success'}
                  className="text-start"
                  onClick={() => setResolveAction('COMPLETED')}
                >
                  <CheckCircle size={14} className="me-2" /> Hoàn thành & Giải ngân (COMPLETED) — Tiền ký quỹ giải ngân cho Bên B (trừ 10% phí nền tảng)
                </Button>
                <Button
                  variant={resolveAction === 'CANCELLED' ? 'danger' : 'outline-danger'}
                  className="text-start"
                  onClick={() => setResolveAction('CANCELLED')}
                >
                  <XCircle size={14} className="me-2" /> Hủy & Hoàn tiền (CANCELLED) — Hợp đồng bị hủy, tiền hoàn trả cho Bên A
                </Button>
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="x-small fw-bold text-white-50">GHI CHÚ XỬ LÝ *</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Nhập lý do xử lý tranh chấp..."
                className="bg-dark-input text-white border-0"
                value={resolveNote}
                onChange={(e) => setResolveNote(e.target.value)}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0">
            <Button variant="outline-light" onClick={() => setShowDetailModal(false)}>Hủy</Button>
            <Button variant="primary" onClick={handleResolveDispute} disabled={!resolveAction || resolving}>
              {resolving ? <><Loader2 className="spinner me-1" size={14} /> Đang xử lý...</> : 'Xác nhận'}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default ManageContracts;
