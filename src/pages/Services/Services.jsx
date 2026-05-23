import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Heart, Bookmark, Play, Plus } from 'lucide-react';
import { Link } from 'react-router-dom'; 
import '../../CSS/Services.css'; 

const Services = () => {
  // Dữ liệu mẫu các gói dịch vụ
  const serviceList = [
    {
      id: 1,
      user: "@linh_design_ueh",
      title: "Thiết kế bộ nhận diện thương hiệu chuyên nghiệp cho các Startup sinh viên",
      price: "1.500.000đ",
      likes: "1.2k",
      img: "https://images.unsplash.com/photo-1572044162444-ad60f128bde2"
    },
    {
      id: 2,
      user: "@hoang_coder_hust",
      title: "Lập trình Landing Page bằng ReactJS chuẩn SEO, tích hợp hiệu ứng 3D mượt mà",
      price: "2.000.000đ",
      likes: "850",
      img: "https://images.unsplash.com/photo-1555066931-4365d14bab8c"
    },
    {
      id: 3,
      user: "@thuy_uiux_fpt",
      title: "Thiết kế giao diện Mobile App hiện đại (Figma) cho đồ án hoặc dự án khởi nghiệp",
      price: "3.500.000đ",
      likes: "2.5k",
      img: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c"
    },
    {
      id: 4,
      user: "@minh_media_vnu",
      title: "Dịch vụ Edit Video ngắn, làm Subtitle cho kênh TikTok doanh nghiệp",
      price: "800.000đ",
      likes: "1.8k",
      img: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d"
    },
     {
      id: 5,
      user: "@minh_media_vnu",
      title: "Dịch vụ Edit Video ngắn, làm Subtitle cho kênh TikTok doanh nghiệp",
      price: "800.000đ",
      likes: "1.8k",
      img: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d"
    }, {
      id: 6,
      user: "@minh_media_vnu",
      title: "Dịch vụ Edit Video ngắn, làm Subtitle cho kênh TikTok doanh nghiệp",
      price: "800.000đ",
      likes: "1.8k",
      img: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d"
    }
  ];

  return (
    <div className="services-page py-5">
      <Container>
        {/* Header trang */}
        <div className="d-flex justify-content-between align-items-end mb-5">
          <div>
            <h1 className="fw-bold text-white">
              Gói Dịch Vụ <span className="text-primary-glow">Freelance</span>
            </h1>
            <p className="text-white-50 mb-0">
              Khám phá các sản phẩm đóng gói sẵn từ cộng đồng sinh viên tài năng.
            </p>
          </div>
          <Button as={Link} to="/post-service" variant="primary" className="fw-bold d-flex align-items-center gap-2 shadow-glow">
          <Plus size={18} /> 
          <span>ĐĂNG DỊCH VỤ</span>
        </Button>
        </div>

         <Row xs={1} sm={2} md={3} lg={5} className="g-3">
          {serviceList.map((service) => (
            <Col key={service.id}>
              <Link to="/service-detail" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="tiktok-card glass-card shadow-lg">
                  <img src={service.img} alt="service" className="tiktok-bg-img" />
                  
                  <div className="tiktok-side-actions">
                    <div className="action-circle">
                      <Heart size={18} className="heart-icon" />
                      <span>{service.likes}</span>
                    </div>
                    <div className="action-circle">
                      <Bookmark size={18} />
                    </div>
                  </div>

                  <div className="tiktok-overlay-content">
                    <div className="author-tag mb-1">
                      <div className="play-indicator"><Play size={8} fill="white" /></div>
                      <span className="fw-bold text-white x-small-text">{service.user}</span>
                    </div>
                    
                    <h6 className="service-card-title text-white">{service.title}</h6>
                    
                    <div className="d-flex justify-content-between align-items-center mt-2">
                      <div className="service-price-tag text-white">
                        {service.price}
                      </div>
                      <button className="btn-buy-now-sm">THUÊ</button>
                    </div>
                  </div>
                </div>
              </Link>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
};

export default Services;