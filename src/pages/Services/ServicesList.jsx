import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  Cpu, Code2, Calculator, Building, 
  Layers, Gavel, LayoutGrid, Sparkles 
} from 'lucide-react'; // Thêm LayoutGrid và Sparkles
import '../../CSS/ServicesList.css';

const ServicesList = () => {
  const categoryData = [
    {
      title: "AI & Trí tuệ nhân tạo",
      icon: <Cpu size={20} />,
      total: 9,
      subs: [
        { name: "Bot & Chatbot AI", count: 2 },
        { name: "Tự động hóa bằng AI", count: 1 },
        { name: "AI Content", count: 1 },
      ]
    },
    {
      title: "IT và lập trình",
      icon: <Code2 size={20} />,
      total: 165,
      subs: [
        { name: "Lập trình web", count: 98 },
        { name: "Ứng dụng di động", count: 20 },
        { name: "QA Tester", count: 1 },
      ]
    },
    {
      title: "Kiến trúc và xây dựng",
      icon: <Building size={20} />,
      total: 43,
      subs: [
        { name: "Thiết kế nội thất", count: 23 },
        { name: "Dựng phối cảnh 3D", count: 9 },
      ]
    }
  ];

  return (
    <div className="services-list-page py-5">
      <Container>
        <div className="text-center mb-5 animate-fade-in">
          <h1 className="text-white fw-bold display-5">
            Tất cả lĩnh vực <span className="text-primary-glow">Gói dịch vụ</span>
          </h1>
          <p className="text-white-50 mt-3 mx-auto" style={{ maxWidth: '600px' }}>
            Khám phá hệ sinh thái dịch vụ đa dạng từ cộng đồng sinh viên tài năng.
          </p>
          <div className="title-underline mx-auto"></div>
        </div>

        <Row className="g-4">
          {/* --- MỤC TỔNG HỢP: TẤT CẢ LĨNH VỰC --- */}
          <Col lg={4} md={6}>
            <Link 
              to="/services" 
              state={{ mainTitle: "Tất cả lĩnh vực", subName: null }}
              className="text-decoration-none"
            >
              <div className="category-group-card glass-card all-cats-highlight h-100 d-flex flex-column justify-content-center align-items-center text-center p-4">
                <div className="cat-icon-box bg-primary-glow mb-3">
                  <LayoutGrid size={32} className="text-white" />
                </div>
                <h4 className="text-white fw-bold mb-2">Xem tất cả dịch vụ</h4>
                <p className="text-white-50 small px-3">
                  Tổng hợp hơn 500+ dịch vụ từ mọi lĩnh vực chuyên môn trên sàn.
                </p>
                <div className="mt-3 text-primary-glow fw-bold x-small-text uppercase-tracking">
                    KHÁM PHÁ NGAY <Sparkles size={12} className="ms-1" />
                </div>
              </div>
            </Link>
          </Col>

          {/* DANH SÁCH CÁC CHUYÊN MỤC CỤ THỂ */}
          {categoryData.map((cat, index) => (
            <Col lg={4} md={6} key={index}>
              <div className="category-group-card glass-card animate-fade-in" style={{animationDelay: `${(index + 1) * 0.1}s`}}>
                <div className="cat-group-header d-flex align-items-center mb-3">
                  <div className="cat-icon-box">
                    {cat.icon}
                  </div>
                  <h5 className="mb-0 ms-3 text-white fw-bold">
                    {cat.title} <span className="total-count">({cat.total})</span>
                  </h5>
                </div>

                <ul className="sub-cat-list list-unstyled">
                  {cat.subs.map((sub, i) => (
                    <li key={i} className="sub-cat-item mb-2">
                      <Link 
                        to="/services" 
                        state={{ mainTitle: cat.title, subName: sub.name }} 
                        className="sub-cat-link text-white-50 text-decoration-none d-flex justify-content-between align-items-center"
                      >
                        <span>{sub.name}</span>
                        <span className="sub-count">({sub.count})</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
};

export default ServicesList;