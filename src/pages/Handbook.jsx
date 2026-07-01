import React, { useState } from 'react';
import { Container, Row, Col, Badge, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Calendar, Eye, Clock, ChevronRight, BookOpen, Loader2 } from 'lucide-react';
import '../CSS/Handbook.css';

const Handbook = () => {
  const [activeTab, setActiveTab] = useState('Tất cả');
  const [visibleCount, setVisibleCount] = useState(3);
  const [loadingMore, setLoadingMore] = useState(false);

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
    },
    {
      id: 5,
      category: 'KIẾN THỨC',
      date: '08/05/2026',
      views: '1.8k',
      title: 'Portfolio ấn tượng: Cách xây dựng hồ sơ năng lực cho Fresher',
      desc: 'Hướng dẫn chi tiết cách tạo Portfolio chuyên nghiệp dù bạn chưa có kinh nghiệm thực tế, kèm theo mẫu miễn phí.',
      img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d'
    },
    {
      id: 6,
      category: 'KINH NGHIỆM',
      date: '05/05/2026',
      views: '920',
      title: 'Từ chối như thế nào để không mất lòng khách hàng Freelance',
      desc: 'Nghệ thuật说 "Không" trong Freelancing giúp bạn bảo vệ thời gian mà vẫn duy trì mối quan hệ tốt với khách hàng.',
      img: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902'
    }
  ];

  const categories = ['Tất cả', 'Kiến thức', 'Kinh nghiệm', 'Cẩm nang', 'Xu hướng'];

  const filteredBlogs = activeTab === 'Tất cả' 
    ? blogs 
    : blogs.filter(b => b.category.toLowerCase() === activeTab.toLowerCase());

  const displayedBlogs = filteredBlogs.slice(0, visibleCount);
  const hasMore = visibleCount < filteredBlogs.length;

  const handleLoadMore = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleCount(prev => prev + 3);
      setLoadingMore(false);
    }, 800);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setVisibleCount(3);
  };

  return (
    <div className="handbook-page py-5">
      <Container>
        <div className="text-center mb-5 animate-fade-in">
          <h1 className="fw-bold text-white display-5">
            Cẩm nang & <span className="text-primary-glow">Kinh nghiệm</span>
          </h1>
          <p className="text-muted mx-auto mt-3" style={{ maxWidth: '600px' }}>
            Hành trang kiến thức giúp bạn tự tin bước vào thế giới làm việc tự do chuyên nghiệp.
          </p>
        </div>

        <div className="cat-filter-wrapper mb-5">
          <Nav variant="pills" className="justify-content-center gap-2">
            {categories.map((cat) => (
              <Nav.Item key={cat}>
                <Nav.Link 
                  active={activeTab === cat} 
                  onClick={() => handleTabChange(cat)}
                  className="cat-pill"
                >
                  {cat}
                </Nav.Link>
              </Nav.Item>
            ))}
          </Nav>
        </div>

        <Row className="g-4">
          {displayedBlogs.map((blog) => (
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

        {hasMore && (
          <div className="text-center mt-5">
            <button className="btn-load-more shadow-glow" onClick={handleLoadMore} disabled={loadingMore}>
              {loadingMore ? (
                <><Loader2 className="spinner me-2" size={16} /> ĐANG TẢI...</>
              ) : (
                'XEM THÊM BÀI VIẾT'
              )}
            </button>
          </div>
        )}
      </Container>
    </div>
  );
};

export default Handbook;
