import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  Search, Globe, MapPin, Bookmark, 
  Send, Laptop, ShieldCheck, Zap 
} from 'lucide-react';
import '../CSS/Jobs.css'; 

const Jobs = () => {
  // 1. Dữ liệu mẫu (Giả lập từ Database)
  const [jobs] = useState([
    {
      id: 1,
      title: "[SAP/Tiếng Anh] Dự án vận hành và bảo trì hệ thống cốt lõi cho một công ty thương mại.",
      salary: "850.000",
      unit: "VND/tháng",
      location: "Hà Nội",
      station: "Cầu Giấy",
      remote: "Có thể làm việc từ xa",
      type: "Công việc tự do",
      desc: "Tham gia vận hành và bảo trì hệ thống SAP (FI) cho doanh nghiệp thương mại lớn. Trách nhiệm gồm: Xử lý yêu cầu, khắc phục sự cố và điều chỉnh hệ thống.",
      skills: "Kinh nghiệm SAP 2 năm, Tiếng Anh giao tiếp tốt.",
      tags: ["SAP", "Consultant", "Engineer"]
    },
    {
      id: 2,
      title: "[Go/Next.js] Kỹ sư Backend phát triển hệ thống quản lý Live Streaming BtoB",
      salary: "1.600.000",
      unit: "VND/tháng",
      location: "TP. Hồ Chí Minh",
      station: "Quận 1",
      remote: "Full Remote",
      type: "Hợp đồng dự án",
      desc: "Thiết kế và triển khai API hiệu suất cao cho nền tảng livestream. Sử dụng Microservices với Go và hạ tầng Google Cloud.",
      skills: "Thành thạo Golang, Docker, hiểu biết về WebRTC.",
      tags: ["Go", "Next.js", "Cloud"]
    },
    {
        id: 3,
        title: "[UI/UX Designer] Thiết kế ứng dụng Tài chính (Fintech) cho sinh viên",
        salary: "15.000.000",
        unit: "VNĐ/Dự án",
        location: "Đà Nẵng",
        station: "Hải Châu",
        remote: "Linh hoạt",
        type: "Part-time",
        desc: "Thiết kế toàn bộ trải nghiệm người dùng cho ví điện tử. Yêu cầu thành thạo Figma và có tư duy thiết kế hiện đại.",
        skills: "Figma, Adobe XD, Design System.",
        tags: ["UI/UX", "Figma", "Design"]
      }
  ]);

  // 2. State quản lý Job đang được chọn để hiện bên phải
  const [selectedJob, setSelectedJob] = useState(jobs[0]);

  return (
    <div className="jobs-hub-wrapper">
      <Container fluid className="px-lg-5">
        
        {/* --- THANH FILTER NGANG TRÊN CÙNG --- */}
        <div className="hub-top-filter p-3 mb-4">
          <Row className="g-2 align-items-center">
            <Col md={2}><Form.Select className="hub-select"><option>Loại công việc</option></Form.Select></Col>
            <Col md={2}><Form.Select className="hub-select"><option>Mức lương</option></Form.Select></Col>
            <Col md={5}>
              <div className="hub-search-wrapper">
                <Search size={18} className="hub-search-icon" />
                <Form.Control placeholder="Từ khóa (Ví dụ: React, Java, Remote...)" className="hub-input" />
              </div>
            </Col>
            <Col md={1}><Button variant="primary" className="w-100 fw-bold h-100">Tìm</Button></Col>
            <Col md={2}>
                <Button variant="outline-primary" className="w-100 fw-bold h-100">Tìm kiếm AI</Button>
            </Col>
          </Row>
        </div>

        {/* --- BỐ CỤC CHÍNH MASTER-DETAIL --- */}
        <div className="hub-main-layout">
          
          {/* CỘT TRÁI: DANH SÁCH BÀI ĐĂNG (Sidebar) */}
          <div className="hub-sidebar-list">
            <div className="sidebar-header-text">Kết quả tìm kiếm ({jobs.length} dự án)</div>
            {jobs.map((job) => (
              <div 
                key={job.id} 
                className={`hub-sidebar-item ${selectedJob.id === job.id ? 'active' : ''}`}
                onClick={() => setSelectedJob(job)}
              >
                <Badge bg="warning" text="dark" className="hub-badge-new mb-2">NEW</Badge>
                <span className="hub-sidebar-title">{job.title}</span>
                <div className="small mb-1 text-info"><Globe size={14} className="me-1"/> {job.remote}</div>
                <div className="hub-sidebar-salary">{job.salary} <small style={{fontSize: '11px'}}>{job.unit}</small></div>
                <div className="hub-sidebar-meta">
                  <span><MapPin size={12}/> {job.location}</span>
                  <span>{job.station}</span>
                </div>
              </div>
            ))}
          </div>

          {/* CỘT PHẢI: CHI TIẾT BÀI ĐĂNG (Main Content) */}
          <div className="hub-detail-view p-4">
            <div className="animate-fade-in" key={selectedJob.id}>
              <h2 className="hub-detail-title mb-4">{selectedJob.title}</h2>
              
              <div className="d-flex gap-4 mb-4 text-info small">
                <span className="d-flex align-items-center gap-1"><Laptop size={16}/> {selectedJob.remote}</span>
                <span className="d-flex align-items-center gap-1"><ShieldCheck size={16}/> Doanh nghiệp xác thực</span>
              </div>

              <Row className="mb-4 align-items-end">
                <Col md={7}>
                  <div className="hub-detail-price-box">
                    {selectedJob.salary} <small style={{fontSize: '14px'}}>{selectedJob.unit}</small>
                  </div>
                  <div className="text-muted small mt-1">
                    <MapPin size={14} className="me-1"/> {selectedJob.location} | {selectedJob.station}
                  </div>
                </Col>
                <Col md={5} className="text-end">
                  <div className="d-flex gap-2 justify-content-end">
                    <Button variant="light" style={{padding: '12px 20px', borderRadius: '10px'}}><Bookmark size={18}/></Button>
                    {/* Gắn Link sang trang Hợp đồng */}
                    <Button as={Link} to="/JobPayment" className="hub-btn-pink rounded-pill shadow-glow">
                        <Send size={18} className="me-2"/> GỬI BÁO GIÁ
                    </Button>
                  </div>
                </Col>
              </Row>

              {/* BẢNG THÔNG TIN CHI TIẾT KIỂU NHẬT */}
              <div className="hub-info-table">
                <div className="hub-info-row">
                  <div className="hub-info-label">Vị trí công việc</div>
                  <div className="hub-info-value">
                    {selectedJob.tags.map(tag => <Badge key={tag} bg="primary" className="me-2">{tag}</Badge>)}
                  </div>
                </div>
                <div className="hub-info-row">
                  <div className="hub-info-label">Chi tiết công việc</div>
                  <div className="hub-info-value">{selectedJob.desc}</div>
                </div>
                <div className="hub-info-row">
                  <div className="hub-info-label">Kỹ năng yêu cầu</div>
                  <div className="hub-info-value">{selectedJob.skills}</div>
                </div>
                <div className="hub-info-row">
                  <div className="hub-info-label">Hợp đồng</div>
                  <div className="hub-info-value">{selectedJob.type}</div>
                </div>
                <div className="hub-info-row">
                  <div className="hub-info-label">Cập nhật lần cuối</div>
                  <div className="hub-info-value">23/05/2026</div>
                </div>
              </div>

              {/* Banner AI gợi ý (Tùy chọn thêm cho đẹp) */}
              <div className="mt-4 p-4 rounded-4 bg-primary-subtle border border-primary text-primary small fw-bold">
                 <Zap size={16} className="me-2" /> Hệ thống AI gợi ý: Dự án này khớp 95% với kỹ năng ReactJS trong Portfolio của bạn.
              </div>
            </div>
          </div>

        </div>
      </Container>
    </div>
  );
};

export default Jobs;