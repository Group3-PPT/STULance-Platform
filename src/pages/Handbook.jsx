import React, { useState } from 'react';
import { Container, Row, Col, Badge, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Calendar, Eye, Clock, ChevronRight, BookOpen } from 'lucide-react';
import '../CSS/Handbook.css'; // Tuân thủ cấu trúc import bạn yêu cầu

const Handbook = () => {
  const [activeTab, setActiveTab] = useState('Tất cả');

  // Danh sách các bài viết mẫu
  const blogs = [
    {
      id: 1,
      category: 'KIẾN THỨC',
      date: '20/05/2026',
      views: '1.2k',
      title: 'Top 10 kỹ năng Freelance được săn đón nhất năm 2026',
      desc: 'Khám phá những xu hướng công nghệ mới và các kỹ năng mềm giúp sinh viên tăng gấp đôi thu nhập khi làm việc tự do.',
      img: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643'
    },
    {
      id: 2,
      category: 'KINH NGHIỆM',
      date: '18/05/2026',
      views: '850',
      title: 'Cách đàm phán hợp đồng Freelance cho sinh viên mới bắt đầu',
      desc: 'Đừng để bị ép giá! Đây là những điều khoản quan trọng bạn cần lưu ý khi ký kết hợp đồng điện tử trên StudentLance.',
      img: 'https://images.unsplash.com/photo-1454165833767-027eeea15c3e'
    },
    {
      id: 3,
      category: 'CẨM NANG',
      date: '15/05/2026',
      views: '2.1k',
      title: 'Bí quyết cân bằng giữa việc học và làm Freelance hiệu quả',
      desc: 'Chia sẻ lộ trình quản lý thời gian từ các "thủ khoa" Freelancer, giúp bạn vừa đạt điểm giỏi vừa có thu nhập ổn định.',
      img: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c'
    },
    {
        id: 4,
        category: 'XU HƯỚNG',
        date: '10/05/2026',
        views: '3.4k',
        title: 'Trí tuệ nhân tạo (AI) đang thay đổi bộ mặt Freelance như thế nào?',
        desc: 'Tận dụng ChatGPT, Midjourney và các công cụ AI khác để tối ưu hóa quy trình làm việc và nâng cao chất lượng sản phẩm.',
        img: 'https://images.unsplash.com/photo-1677442136019-21780ecad995'
      }
  ];

  const categories = ['Tất cả', 'Kiến thức', 'Kinh nghiệm', 'Cẩm nang', 'Xu hướng'];

  return (
    <div className="handbook-page py-5">
      <Container>
        {/* TIÊU ĐỀ TRANG */}
        <div className="text-center mb-5 animate-fade-in">
          <h1 className="fw-bold text-white display-5">
            Cẩm nang & <span className="text-primary-glow">Kinh nghiệm</span>
          </h1>
          <p className="text-muted mx-auto mt-3" style={{ maxWidth: '600px' }}>
            Hành trang kiến thức giúp bạn tự tin bước vào thế giới làm việc tự do chuyên nghiệp.
          </p>
        </div>

        {/* THANH LỌC DANH MỤC */}
        <div className="cat-filter-wrapper mb-5">
          <Nav variant="pills" className="justify-content-center gap-2">
            {categories.map((cat) => (
              <Nav.Item key={cat}>
                <Nav.Link 
                  active={activeTab === cat} 
                  onClick={() => setActiveTab(cat)}
                  className="cat-pill"
                >
                  {cat}
                </Nav.Link>
              </Nav.Item>
            ))}
          </Nav>
        </div>

        {/* LƯỚI BÀI VIẾT */}
        <Row className="g-4">
          {blogs.map((blog) => (
            <Col lg={4} md={6} key={blog.id}>
              <div className="glass-card blog-card-new h-100 shadow-lg">
                <div className="blog-img-box">
                  <img src={blog.img} alt="blog" className="blog-thumb" />
                  <div className="blog-cat-badge">{blog.category}</div>
                </div>
                
                <div className="blog-body p-4">
                  <div className="blog-meta-top d-flex gap-3 mb-3">
                    <span className="d-flex align-items-center gap-1"><Calendar size={14}/> {blog.date}</span>
                    <span className="d-flex align-items-center gap-1"><Eye size={14}/> {blog.views}</span>
                  </div>
                  
                  <h3 className="blog-title h5 fw-bold text-white mb-3">
                    {blog.title}
                  </h3>
                  
                  <p className="blog-desc text-muted-cv small mb-4">
                    {blog.desc}
                  </p>
                  
                  <Link to={`/handbook/${blog.id}`} className="read-more-link d-flex align-items-center gap-2">
                    Đọc tiếp <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            </Col>
          ))}
        </Row>

        {/* NÚT XEM THÊM */}
        <div className="text-center mt-5">
           <button className="btn-load-more shadow-glow">XEM THÊM BÀI VIẾT</button>
        </div>
      </Container>
    </div>
  );
};

export default Handbook;