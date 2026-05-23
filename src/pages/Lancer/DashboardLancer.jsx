import React, { useState } from 'react';
import { Container, Row, Col, Button, Badge, ProgressBar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  FileText, Handshake, Plus, Eye, 
  MoreVertical, CheckCircle, Clock, ExternalLink 
} from 'lucide-react';
import '../../CSS/Dashboard.css'; // Tuân thủ cấu trúc import bạn yêu cầu

const Dashboard = () => {
  // Quản lý danh sách hợp đồng bằng State
  const [contracts] = useState([
    {
      id: 'SL-00124',
      title: 'Thiết kế giao diện Mobile App StudentCare',
      client: 'TechNova Solutions',
      budget: 5000000,
      deadline: '15/06/2026',
      progress: 65,
      status: 'Đang làm'
    },
    {
      id: 'SL-00130',
      title: 'Lập trình Landing Page 3D cho sự kiện trường',
      client: 'CLB IT Bách Khoa',
      budget: 3500000,
      deadline: '30/05/2026',
      progress: 20,
      status: 'Đang làm'
    }
  ]);

  const formatMoney = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  return (
    <div className="dashboard-page py-5">
      <Container>
        {/* LỜI CHÀO */}
        <div className="mb-5 animate-fade-in">
          <h1 className="fw-bold text-white">
            Chào quay trở lại, <span className="text-primary-glow">Nguyễn Văn A</span> 👋
          </h1>
          <p className="text-muted">Bạn có {contracts.length} công việc cần cập nhật tiến độ trong hôm nay.</p>
        </div>

        <Row className="g-4">
          {/* CỘT TRÁI: CV & TIẾN ĐỘ HỒ SƠ */}
          <Col lg={4}>
            <div className="glass-card p-4 h-100">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="text-white fw-bold mb-0 d-flex align-items-center gap-2">
                  <FileText size={20} className="text-primary" /> CV của tôi
                </h5>
                <Button as={Link} to="/cv-maker" variant="primary" size="sm" className="fw-bold px-3">
                  <Plus size={14} /> TẠO MỚI
                </Button>
              </div>

              <div className="cv-list mb-5">
                <div className="cv-item-box glass-card p-3 mb-3">
                  <div className="d-flex align-items-center gap-3">
                    <div className="cv-icon-bg"><FileText size={20} /></div>
                    <div className="flex-grow-1">
                      <p className="mb-0 text-white small fw-bold">CV Frontend Dev</p>
                      <p className="mb-0 x-small text-muted">Cập nhật: 2 giờ trước</p>
                    </div>
                    <div className="d-flex gap-2">
                      <button className="icon-btn-sm"><Eye size={14} /></button>
                      <button className="icon-btn-sm"><MoreVertical size={14} /></button>
                    </div>
                  </div>
                </div>

                <div className="cv-item-box glass-card p-3">
                  <div className="d-flex align-items-center gap-3">
                    <div className="cv-icon-bg"><FileText size={20} /></div>
                    <div className="flex-grow-1">
                      <p className="mb-0 text-white small fw-bold">CV UI/UX Designer</p>
                      <p className="mb-0 x-small text-muted">Cập nhật: 15/05/2026</p>
                    </div>
                    <div className="d-flex gap-2">
                      <button className="icon-btn-sm"><Eye size={14} /></button>
                      <button className="icon-btn-sm"><MoreVertical size={14} /></button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tiến độ Portfolio */}
              <div className="portfolio-progress-box text-center p-3 rounded-4 bg-white-5 border border-white-10">
                <p className="small text-muted mb-2">Hồ sơ năng lực hoàn thiện: <strong>85%</strong></p>
                <ProgressBar now={85} className="custom-progress mb-3" />
                <Link to="/portfolio" className="text-primary text-decoration-none small fw-bold d-flex align-items-center justify-content-center gap-2">
                  Hoàn thiện Portfolio ngay <ExternalLink size={14} />
                </Link>
              </div>
            </div>
          </Col>

          {/* CỘT PHẢI: HỢP ĐỒNG HIỆN TẠI */}
          <Col lg={8}>
            <div className="glass-card p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="text-white fw-bold mb-0 d-flex align-items-center gap-2">
                  <Handshake size={20} className="text-primary" /> Hợp đồng hiện tại
                </h5>
                <div className="small text-muted">
                  Tổng thu nhập chờ duyệt: <strong className="text-primary">{formatMoney(8500000)}</strong>
                </div>
              </div>

              <div className="contract-grid d-grid gap-3">
                {contracts.map((contract, index) => (
                  <div key={index} className="contract-card-item glass-card p-4">
                    <Row className="align-items-center">
                      <Col md={8}>
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <Badge bg="info" className="text-dark x-small-badge fw-bold uppercase-tracking">
                            {contract.status}
                          </Badge>
                          <span className="x-small text-muted"><Clock size={12} className="me-1" /> Hạn chót: {contract.deadline}</span>
                        </div>
                        <h4 className="text-white h6 fw-bold mb-2">{contract.title}</h4>
                        <p className="x-small text-muted mb-3">Khách hàng: <span className="text-white">{contract.client}</span></p>
                        
                        <div className="progress-section">
                           <div className="d-flex justify-content-between x-small mb-1">
                              <span className="text-muted">Tiến độ công việc</span>
                              <span className="text-primary fw-bold">{contract.progress}%</span>
                           </div>
                           <ProgressBar now={contract.progress} className="custom-progress-sm" />
                        </div>
                      </Col>
                      
                      <Col md={4} className="text-md-end mt-3 mt-md-0">
                        <div className="h5 fw-bold text-primary-glow mb-3">{formatMoney(contract.budget)}</div>
                        <div className="d-flex gap-2 justify-content-md-end">
                          <Button as={Link} to="/contract" variant="outline-light" size="sm" className="fw-bold px-3">CHI TIẾT</Button>
                          <Button variant="primary" size="sm" className="fw-bold px-3 shadow-glow">CẬP NHẬT</Button>
                        </div>
                      </Col>
                    </Row>
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

export default Dashboard;