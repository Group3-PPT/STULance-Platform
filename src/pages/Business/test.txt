import React, { useState } from 'react';
import { Container, Row, Col, Button, Badge } from 'react-bootstrap';
import { 
  MapPin, Globe, Mail, Phone, Users, 
  CheckCircle, Briefcase, Star, ShieldCheck, 
  Info, Calendar 
} from 'lucide-react';
import '../../CSS/BusinessProfile.css';

const BusinessProfile = () => {
  // Dữ liệu mẫu Doanh nghiệp (Đã bỏ MXH)
  const [company] = useState({
    name: "TechNova Solutions",
    location: "Tầng 12, Tòa nhà Lotte, Liễu Giai, Hà Nội",
    website: "technova.vn",
    email: "hr@technova.vn",
    phone: "024 3333 8888",
    size: "100 - 200 nhân viên",
    bio: "TechNova Solutions là công ty công nghệ đi đầu trong lĩnh vực phát triển các giải pháp Trí tuệ nhân tạo (AI) và chuyển đổi số tại Việt Nam. Chúng tôi luôn mở rộng cánh cửa đón nhận những tài năng trẻ là các bạn sinh viên năng động, dám nghĩ dám làm. Tại TechNova, các bạn không chỉ làm việc, các bạn được học hỏi từ những chuyên gia hàng đầu.",
    stats: {
      projects: "50+",
      hired: "120",
      rating: "4.9/5",
      payment: "100%"
    }
  });

  const [jobs] = useState([
    { id: 1, title: 'Thực tập sinh Lập trình ReactJS', type: 'Internship', date: '2 ngày trước', salary: '5 - 7 triệu' },
    { id: 2, title: 'Thiết kế đồ họa Freelance', type: 'Dự án', date: '5 ngày trước', salary: 'Thỏa thuận' },
    { id: 3, title: 'Content Creator (Part-time)', type: 'Bán thời gian', date: '1 tuần trước', salary: '3 - 5 triệu' }
  ]);

  return (
    <div className="biz-profile-page">
      {/* HEADER: Banner & Logo */}
      <section className="biz-hero">
        <div className="biz-banner-wrap">
          <img src="https://images.unsplash.com/photo-1497366216548-37526070297c" alt="Banner" className="biz-banner-img" />
        </div>
        <Container>
          <div className="biz-main-info-row">
            <div className="biz-logo-large glass-card">
              <img src="https://upload.wikimedia.org/wikipedia/commons/c/cd/Facebook_logo_%282019%29.svg" alt="Logo" />
            </div>
            <div className="biz-title-area">
              <h1 className="fw-bold text-white d-flex align-items-center gap-2">
                {company.name} <CheckCircle className="text-primary-glow" size={24} />
              </h1>
              <p className=" mb-2"><MapPin size={16} className="me-1" /> {company.location}</p>
              <div className="d-flex gap-2">
                <Badge bg="primary" className="px-3">AI & Phần mềm</Badge>
                <Badge bg="info" className="px-3 text-dark">Expert Partner</Badge>
              </div>
            </div>
            <div className="biz-action-area">
              <Button variant="primary" className="fw-bold px-4 py-2 shadow-glow">THEO DÕI CÔNG TY</Button>
            </div>
          </div>
        </Container>
      </section>

      <Container className="pb-5">
        {/* STATS BAR */}
        <div className="glass-card biz-stats-bar mb-4">
          <Row className="text-center g-0">
            <Col xs={6} md={3} className="stat-box border-end-md">
              <h3 className="text-primary-glow fw-bold">{company.stats.projects}</h3>
              <p className="small  mb-0">Dự án đã đăng</p>
            </Col>
            <Col xs={6} md={3} className="stat-box border-end-md">
              <h3 className="text-primary-glow fw-bold">{company.stats.hired}</h3>
              <p className="small  mb-0">Sinh viên đã thuê</p>
            </Col>
            <Col xs={6} md={3} className="stat-box border-end-md">
              <h3 className="text-warning fw-bold">{company.stats.rating}</h3>
              <p className="small  mb-0">Đánh giá từ SV</p>
            </Col>
            <Col xs={6} md={3} className="stat-box">
              <h3 className="text-success fw-bold">{company.stats.payment}</h3>
              <p className="small  mb-0">Tỷ lệ thanh toán</p>
            </Col>
          </Row>
        </div>

        <Row className="g-4">
          {/* CỘT TRÁI: GIỚI THIỆU & CÔNG VIỆC */}
          <Col lg={8}>
            <div className="glass-card p-4 mb-4 shadow-sm">
              <h4 className="text-white fw-bold mb-3 border-start border-primary border-4 ps-3">Về chúng tôi</h4>
              <p className="text-secondary-cv">{company.bio}</p>
            </div>

            <div className="glass-card p-4 shadow-sm">
              <div className="d-flex justify-content-between align-items-center mb-4 border-start border-primary border-4 ps-3">
                <h4 className="text-white fw-bold mb-0">Đang tuyển dụng ({jobs.length})</h4>
                <Button variant="link" className="text-primary text-decoration-none small p-0">Xem tất cả</Button>
              </div>
              <div className="active-jobs-list d-grid gap-3">
                {jobs.map(job => (
                  <div key={job.id} className="job-hiring-item glass-card p-3 d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-white fw-bold mb-1">{job.title}</h6>
                      <p className="x-small  mb-0">{job.type} • {job.date}</p>
                    </div>
                    <div className="text-end">
                      <p className="fw-bold text-accent mb-1">{job.salary}</p>
                      <Button variant="outline-primary" size="sm" className="fw-bold px-3">Ứng tuyển</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Col>

          {/* CỘT PHẢI: THÔNG TIN LIÊN HỆ CHI TIẾT */}
          <Col lg={4}>
            <div className="glass-card p-4 mb-4 shadow-sm sticky-top" style={{ top: '100px' }}>
              <h5 className="text-white fw-bold mb-4 d-flex align-items-center gap-2">
                <Info size={18} className="text-primary" /> Thông tin liên hệ
              </h5>
              <ul className="list-unstyled d-grid gap-4 small">
                <li className="d-flex align-items-start gap-3">
                  <div className="contact-icon-bg"><Globe size={16} /></div>
                  <div>
                    <strong className="d-block text-white">Website</strong>
                    <span className="">{company.website}</span>
                  </div>
                </li>
                <li className="d-flex align-items-start gap-3">
                  <div className="contact-icon-bg"><Mail size={16} /></div>
                  <div>
                    <strong className="d-block text-white">Email tuyển dụng</strong>
                    <span className="">{company.email}</span>
                  </div>
                </li>
                <li className="d-flex align-items-start gap-3">
                  <div className="contact-icon-bg"><Phone size={16} /></div>
                  <div>
                    <strong className="d-block text-white">Hotline</strong>
                    <span className="">{company.phone}</span>
                  </div>
                </li>
                <li className="d-flex align-items-start gap-3">
                  <div className="contact-icon-bg"><Users size={16} /></div>
                  <div>
                    <strong className="d-block text-white">Quy mô</strong>
                    <span className="">{company.size}</span>
                  </div>
                </li>
              </ul>
              
              <div className="mt-4 pt-4 border-top border-secondary">
                <div className="d-flex align-items-center gap-2 text-primary small fw-bold">
                  <ShieldCheck size={16} /> Doanh nghiệp đã được xác thực
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default BusinessProfile;