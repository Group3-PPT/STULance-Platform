import React, { useState, useEffect } from 'react';
import { Table, Badge, Row, Col, Spinner } from 'react-bootstrap';
import { Wallet, ArrowRightLeft, ShieldCheck, AlertCircle, TrendingUp, Landmark, Loader2, RefreshCw, Eye, FileText } from 'lucide-react';
import { adminService } from '../../services/adminservice';
import '../../CSS/ManagePayments.css'; 

const ManagePayments = () => {
  const [contracts, setContracts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [contractsRes, ordersRes] = await Promise.all([
        adminService.getAllContracts(),
        adminService.getAllServiceOrders()
      ]);
      if (contractsRes.success) setContracts(contractsRes.data || []);
      if (ordersRes.success) setOrders(ordersRes.data || []);
    } catch (err) {
      console.error("Lỗi tải dữ liệu:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const totalEscrow = contracts.reduce((sum, c) => sum + (c.totalAmount || 0), 0);
  const totalOrders = orders.length;
  const pendingContracts = contracts.filter(c => c.status === 'PENDING' || c.status === 'IN_PROGRESS').length;

  const allTransactions = [
    ...contracts.map(c => ({
      id: c.contractId?.substring(0, 8),
      from: c.enterpriseName || 'N/A',
      to: c.studentName || 'N/A',
      amount: c.totalAmount,
      type: 'Hợp đồng',
      status: c.status,
      date: new Date(c.createdAt).toLocaleDateString('vi-VN')
    })),
    ...orders.map(o => ({
      id: o.orderId?.substring(0, 8),
      from: o.buyerName || 'N/A',
      to: o.sellerName || 'N/A',
      amount: o.totalAmount,
      type: 'Đơn hàng DV',
      status: o.status,
      date: new Date(o.createdAt).toLocaleDateString('vi-VN')
    }))
  ];

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED': return <Badge className="pay-status-badge st-done">Hoàn tất</Badge>;
      case 'IN_PROGRESS': return <Badge className="pay-status-badge st-hold">Đang thực hiện</Badge>;
      case 'PENDING': return <Badge className="pay-status-badge st-pending">Chờ xử lý</Badge>;
      case 'CANCELLED': return <Badge className="pay-status-badge" style={{background:'rgba(239,68,68,0.15)', color:'#ef4444'}}>Đã hủy</Badge>;
      default: return <Badge className="pay-status-badge st-pending">{status}</Badge>;
    }
  };

  return (
    <div className="pay-manage-container animate-fade-in">
      <div className="mb-5">
        <div className="d-flex justify-content-between align-items-center">
          <h2 className="pay-main-title text-white fw-bold">
            Quản lý <span className="text-primary-glow">Dòng tiền & Ký quỹ</span>
          </h2>
          <button className="btn-icon-table text-white-50" title="Làm mới" onClick={fetchData}><RefreshCw size={18}/></button>
        </div>
        <p className="text-white-50 small">Giám sát giao dịch tài chính và hệ thống Escrow đảm bảo an toàn.</p>
      </div>
      
      <Row className="g-4 mb-5">
        <Col lg={4} md={6}>
           <div className="pay-stat-card glass-card border-left-success">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                    <p className="pay-stat-label">TỔNG KÝ QUỸ</p>
                    <h3 className="pay-stat-value text-white fw-bold">{totalEscrow.toLocaleString()}đ</h3>
                </div>
                <div className="pay-icon-circle bg-success-light"><ShieldCheck size={20} /></div>
              </div>
              <div className="mt-3 x-small text-success fw-bold">
                <TrendingUp size={12} className="me-1" /> {contracts.length} hợp đồng
              </div>
           </div>
        </Col>
        <Col lg={4} md={6}>
           <div className="pay-stat-card glass-card border-left-primary">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                    <p className="pay-stat-label">TỔNG ĐƠN HÀNG DV</p>
                    <h3 className="pay-stat-value text-primary-glow fw-bold">{totalOrders}</h3>
                </div>
                <div className="pay-icon-circle bg-primary-light"><Landmark size={20} /></div>
              </div>
              <div className="mt-3 x-small fw-bold" style={{color: '#60a5fa'}}>
                <FileText size={12} className="me-1" /> Đơn hàng dịch vụ
              </div>
           </div>
        </Col>
        <Col lg={4} md={12}>
           <div className="pay-stat-card glass-card border-left-warning">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                    <p className="pay-stat-label">ĐANG XỬ LÝ</p>
                    <h3 className="pay-stat-value text-warning fw-bold">{pendingContracts}</h3>
                </div>
                <div className="pay-icon-circle bg-warning-light"><Wallet size={20} /></div>
              </div>
              <div className="mt-3 x-small text-white-50">Hợp đồng & đơn hàng chờ xử lý</div>
           </div>
        </Col>
      </Row>

      <div className="pay-table-wrapper glass-card shadow-lg">
        <div className="p-3 border-bottom d-flex justify-content-between align-items-center" style={{borderColor: 'rgba(255,255,255,0.06)'}}>
            <h6 className="mb-0 text-white fw-bold">Lịch sử giao dịch hệ thống</h6>
        </div>
        {loading ? (
          <div className="text-center py-5"><Loader2 className="spinner text-primary" size={40}/></div>
        ) : (
          <Table responsive variant="dark" className="mb-0 pay-custom-table align-middle">
            <thead>
              <tr>
                <th className="ps-4">Mã Giao Dịch</th>
                <th>Thời gian</th>
                <th>Nguồn gửi</th>
                <th>Người nhận</th>
                <th>Số tiền</th>
                <th>Loại hình</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {allTransactions.map((tx, idx) => (
                <tr key={tx.id || idx} className="pay-row">
                  <td className="ps-4"><span className="pay-id-tag">#{tx.id}</span></td>
                  <td className="small text-white-50">{tx.date}</td>
                  <td className="small text-white-80">{tx.from}</td>
                  <td className="small text-white-80">{tx.to}</td>
                  <td className="fw-bold text-success">{tx.amount?.toLocaleString()}đ</td>
                  <td><span className="pay-type-text x-small">{tx.type}</span></td>
                  <td>{renderStatusBadge(tx.status)}</td>
                </tr>
              ))}
              {allTransactions.length === 0 && (
                <tr><td colSpan="7" className="text-center py-5 text-white-50">Chưa có giao dịch nào.</td></tr>
              )}
            </tbody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default ManagePayments;
