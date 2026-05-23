import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom'; // Đừng quên import Link để nhảy sang trang Services
import { 
  Cpu, Code2, Calculator, Building, 
  Layers, Gavel, Camera, Briefcase 
} from 'lucide-react';
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
        { name: "Ứng dụng & tích hợp AI", count: 1 },
        { name: "AI Hình ảnh", count: 1 },
        { name: "AI Video", count: 1 },
        { name: "AI Content", count: 1 },
        { name: "AI Phân tích dữ liệu", count: 1 },
        { name: "Các dịch vụ AI khác", count: 1 },
      ]
    },
    {
      title: "IT và lập trình",
      icon: <Code2 size={20} />,
      total: 165,
      subs: [
        { name: "Lập trình web", count: 98 },
        { name: "Ứng dụng di động", count: 20 },
        { name: "Việc lập trình khác", count: 6 },
        { name: "Lập trình phần mềm", count: 17 },
        { name: "Tối ưu cho công cụ tìm kiếm - SEO", count: 7 },
        { name: "Tư vấn, thiết kế hệ thống mạng", count: 1 },
        { name: "QA Tester", count: 1 },
        { name: "Viết phần mềm theo yêu cầu", count: 8 },
      ]
    },
    {
      title: "Kế toán, Thuế & Tài chính",
      icon: <Calculator size={20} />,
      total: 10,
      subs: [
        { name: "Kế toán", count: 6 },
        { name: "Thuế", count: 3 },
        { name: "Tài chính doanh nghiệp", count: 1 },
      ]
    },
    {
      title: "Kiến trúc và xây dựng",
      icon: <Building size={20} />,
      total: 43,
      subs: [
        { name: "Thiết kế nội thất nhà và chung cư", count: 23 },
        { name: "Thiết kế ngoại thất", count: 1 },
        { name: "Thiết kế xây dựng nhà", count: 10 },
        { name: "Dựng phối cảnh 3D", count: 9 },
      ]
    },
    {
      title: "Lĩnh vực khác",
      icon: <Layers size={20} />,
      total: 5,
      subs: [
        { name: "Chụp ảnh", count: 4 },
        { name: "Tuyển dụng", count: 1 },
      ]
    },
    {
      title: "Luật & Pháp lý",
      icon: <Gavel size={20} />,
      total: 12,
      subs: [
        { name: "Tư vấn luật", count: 10 },
        { name: "Sở hữu trí tuệ", count: 2 },
      ]
    }
  ];

 return (
    <div className="services-list-page py-5">
      <Container>
        {/* THAY ĐỔI TẠI ĐÂY: Thêm animate-fade-in và text-primary-glow */}
        <div className="text-center mb-5 animate-fade-in">
          <h1 className="text-white fw-bold display-5">
            Tất cả lĩnh vực <span className="text-primary-glow">Gói dịch vụ</span>
          </h1>
          <p className=" mt-3 mx-auto" style={{ maxWidth: '600px' }}>
            Khám phá hệ sinh thái dịch vụ đa dạng từ cộng đồng sinh viên tài năng, 
            giúp tối ưu hóa quy trình vận hành cho doanh nghiệp của bạn.
          </p>
          <div className="title-underline mx-auto"></div>
        </div>

        {/* Thêm animation delay nhẹ cho phần danh sách để tạo hiệu ứng trượt lên */}
        <Row className="g-4 " style={{ animationDelay: '0.1s' }}>
          {categoryData.map((cat, index) => (
            <Col lg={4} md={6} key={index}>
              <div className="category-group-card glass-card">
                <div className="cat-group-header d-flex align-items-center mb-3">
                  <div className="cat-icon-box">
                    {cat.icon}
                  </div>
                  <h5 className="mb-0 ms-3 text-white fw-bold">
                    {cat.title} <span className="total-count">({cat.total})</span>
                  </h5>
                </div>

                <ul className="sub-cat-list">
                  {cat.subs.map((sub, i) => (
                    <li key={i} className="sub-cat-item">
                      <Link to="/services" className="sub-cat-link">
                        {sub.name} <span className="sub-count">({sub.count})</span>
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