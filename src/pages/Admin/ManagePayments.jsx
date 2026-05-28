import React from 'react';
import { Container, Row, Col, Table, Badge } from 'react-bootstrap';
import { Wallet, ArrowRightLeft, ShieldCheck, AlertCircle, TrendingUp, Landmark } from 'lucide-react';
import '../../CSS/ManagePayments.css'; // Import CSS riêng biệt

const ManagePayments = () => {
  const transactions = [
    { id: "TX-9901", from: "TechNova", to: "Hệ thống", amount: "15.000.000đ", type: "Ký quỹ dự án", status: "Hoàn tất", date: "28/05/2026" },
    { id: "TX-9905", from: "Hệ thống", to: "Nguyễn Văn A", amount: "3.500.000đ", type: "Giải ngân hợp đồng", status: "Đang treo", date: "28/05/2026" },
    { id: "TX-9910", from: "Creative Lab", to: "Hệ thống", amount: "2.000.000đ", type: "Thanh toán dịch vụ", status: "Hoàn tất", date: "27/05/2026" },
    { id: "TX-9912", from: "Hệ thống", to: "Lê Trung Hiếu", amount: "1.200.000đ", type: "Rút tiền về NH", status: "Đang xử lý", date: "27/05/2026" },
  ];

  return (
    <div className="pay-manage-container animate-fade-in">
      {/* TIÊU ĐỀ */}
      <div className="mb-5">
        <h2 className="pay-main-title text-white fw-bold">
          Quản lý <span className="text-primary-glow">Dòng tiền & Ký quỹ</span>
        </h2>
        <p className="text-muted small">Giám sát giao dịch tài chính và hệ thống Escrow đảm bảo an toàn.</p>
      </div>
      
      {/* THẺ THỐNG KÊ NHANH */}
      <Row className="g-4 mb-5">
        <Col lg={4} md={6}>
           <div className="pay-stat-card glass-card border-left-success">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                    <p className="pay-stat-label">TIỀN KÝ QUỸ ĐANG GIỮ</p>
                    <h3 className="pay-stat-value text-white fw-bold">850.400.000đ</h3>
                </div>
                <div className="pay-icon-circle bg-success-light"><ShieldCheck size={20} /></div>
              </div>
              <div className="mt-3 x-small text-success fw-bold">
                <TrendingUp size={12} className="me-1" /> +12% so với tháng trước
              </div>
           </div>
        </Col>
        <Col lg={4} md={6}>
           <div className="pay-stat-card glass-card border-left-primary">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                    <p className="pay-stat-label">DOANH THU PHÍ SÀN (5%)</p>
                    <h3 className="pay-stat-value text-primary-glow fw-bold">42.520.000đ</h3>
                </div>
                <div className="pay-icon-circle bg-primary-light"><Landmark size={20} /></div>
              </div>
              <div className="mt-3 x-small text-primary fw-bold">
                <TrendingUp size={12} className="me-1" /> 1,240 giao dịch thành công
              </div>
           </div>
        </Col>
        <Col lg={4} md={12}>
           <div className="pay-stat-card glass-card border-left-warning">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                    <p className="pay-stat-label">YÊU CẦU RÚT TIỀN ĐANG CHỜ</p>
                    <h3 className="pay-stat-value text-warning fw-bold">12</h3>
                </div>
                <div className="pay-icon-circle bg-warning-light"><Wallet size={20} /></div>
              </div>
              <div className="mt-3 x-small text-muted italic">Cần phê duyệt trong 24h tới</div>
           </div>
        </Col>
      </Row>

      {/* BẢNG LỊCH SỬ GIAO DỊCH */}
      <div className="pay-table-wrapper glass-card shadow-lg">
        <div className="p-3 border-bottom border-secondary d-flex justify-content-between align-items-center">
            <h6 className="mb-0 text-white fw-bold">Lịch sử giao dịch hệ thống</h6>
            <button className="btn-export-pay">Xuất báo cáo</button>
        </div>
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
            {transactions.map(tx => (
              <tr key={tx.id} className="pay-row">
                <td className="ps-4"><span className="pay-id-tag">#{tx.id}</span></td>
                <td className="small text-muted">{tx.date}</td>
                <td className="small text-white-80">{tx.from}</td>
                <td className="small text-white-80">{tx.to}</td>
                <td className="fw-bold text-success">{tx.amount}</td>
                <td><span className="pay-type-text x-small">{tx.type}</span></td>
                <td>
                    <Badge 
                        className={`pay-status-badge ${
                            tx.status === 'Hoàn tất' ? 'st-done' : 
                            tx.status === 'Đang treo' ? 'st-hold' : 'st-pending'
                        }`}
                    >
                        {tx.status}
                    </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default ManagePayments;