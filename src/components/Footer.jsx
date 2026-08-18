import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  Mail, Phone, ShieldCheck, Bookmark, 
  User, Briefcase, Send, Plus, Megaphone, MapPin
} from 'lucide-react';
import '../CSS/Footer.css';

const FooterComp = () => {
  return (
    <footer className="footer-glass py-5 mt-5">
      <Container>
        <Row className="g-4">
          {/* CỘT 1: BRANDING (Chiếm 3/12 cột) */}
          <Col lg={3} md={6}>
            <Link to="/" className="text-decoration-none">
                <div className="footer-logo fw-bold fs-3 mb-3 text-uppercase">
                    STU<span className="text-primary-glow">LANCE</span>
                </div>
            </Link>
            <p className="text-white-50 small mb-4 pe-3">
              Nền tảng kết nối cơ hội việc làm Freelance dành riêng cho sinh viên Việt Nam. 
              Kiến tạo tương lai từ những trải nghiệm thực tế.
            </p>
            <div className="social-links d-flex gap-3">
                <a href="#" className="social-icon-btn fb"><i className="fab fa-facebook-f"></i></a>
                <a href="#" className="social-icon-btn li"><i className="fab fa-linkedin-in"></i></a>
                <a href="#" className="social-icon-btn gh"><i className="fab fa-github"></i></a>
            </div>
          </Col>

          {/* CỘT 2: TÍNH NĂNG (Chiếm 2/12 cột) */}
          <Col lg={2} xs={6}>
            <h6 className="footer-heading text-white fw-bold mb-4">TÍNH NĂNG</h6>
            <ul className="footer-links list-unstyled">
              <li><Link to="/jobs">Tìm việc làm</Link></li>
              <li><Link to="/services">Gói dịch vụ</Link></li>
              <li><Link to="/cv-maker">Tạo CV mẫu</Link></li>
              <li><Link to="/portfolio">Hồ sơ năng lực</Link></li>
            </ul>
          </Col>

          {/* CỘT 3: GIỚI THIỆU (Chiếm 2/12 cột) */}
          <Col lg={2} xs={6}>
            <h6 className="footer-heading text-white fw-bold mb-4">GIỚI THIỆU</h6>
            <ul className="footer-links list-unstyled">
              <li><Link to="/about">Về chúng tôi</Link></li>
              <li><Link to="/sponsors">Nhà tài trợ</Link></li>
              <li><Link to="/handbook">Kiến thức</Link></li>
              <li><Link to="/privacy">Bảo mật</Link></li>
            </ul>
          </Col>

          {/* CỘT 4: HỖ TRỢ (Chiếm 2/12 cột) */}
          <Col lg={2} md={6}>
            <h6 className="footer-heading text-white fw-bold mb-4">HỖ TRỢ</h6>
            <ul className="footer-links list-unstyled">
              <li><Link to="/help">Trợ giúp</Link></li>
              <li><Link to="/faq">Câu hỏi thường gặp</Link></li>
              <li>
                <Link to="/report" className="d-flex align-items-center gap-2">
                   Báo lỗi <Megaphone size={14} className="text-warning" />
                </Link>
              </li>
              <li><Link to="/contact">Liên hệ</Link></li>
            </ul>
          </Col>

          {/* CỘT 5: VĂN PHÒNG (Chiếm 3/12 cột) */}
          <Col lg={3} md={6}>
            <h6 className="footer-heading text-white fw-bold mb-4">VĂN PHÒNG</h6>
            <div className="contact-info small">
              <div className="d-flex align-items-center gap-3 mb-3 text-white-50">
                <div className="contact-circle"><Mail size={14}/></div>
                <span>support@studentlance.vn</span>
              </div>
              <div className="d-flex align-items-center gap-3 mb-3 text-white-50">
                <div className="contact-circle"><Phone size={14}/></div>
                <span>1900 1234</span>
              </div>
              <div className="d-flex align-items-start gap-3 text-white-50">
                <div className="contact-circle mt-1"><MapPin size={14}/></div>
                <span>180 Cao Lỗ,Phường 4, Quận 8, TP. HCM</span>
              </div>
            </div>
          </Col>
        </Row>

        <div className="footer-bottom text-center mt-5 pt-4 border-top border-white-5">
          <p className="mb-0 x-small text-muted">
            © 2026 StudentLance Platform. Thiết kế cho kỷ nguyên lao động mới.
          </p>
        </div>
      </Container>
    </footer>
  );
};

export default FooterComp;