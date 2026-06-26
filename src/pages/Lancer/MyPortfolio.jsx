import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Badge, Form, Modal, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  Plus, Edit3, Trash2, ExternalLink, Image as ImageIcon, 
  Loader2, LayoutGrid, Link as LinkIcon, FileText, Save, 
  User, Eye, FolderOpen, GripVertical 
} from 'lucide-react';
import { portfolioService } from '../../services/portfolioservice';
import '../../CSS/Portfolio.css';

const MyPortfolio = () => {
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [currentProject, setCurrentProject] = useState({
    title: '',
    description: '',
    imageUrl: '',
    projectUrl: ''
  });

  const fetchMyPortfolios = async () => {
    setLoading(true);
    try {
      const res = await portfolioService.getMyPortfolios();
      if (res.success) {
        setPortfolios(res.data || []);
      }
    } catch (err) {
      console.error("Lỗi tải danh sách dự án:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMyPortfolios(); }, []);

  const handleOpenModal = (project = null) => {
    if (project) {
      setCurrentProject(project);
    } else {
      setCurrentProject({ title: '', description: '', imageUrl: '', projectUrl: '' });
    }
    setShowModal(true);
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (currentProject.portfolioId) {
        await portfolioService.updatePortfolio(currentProject.portfolioId, currentProject);
        alert("Đã cập nhật dự án thành công!");
      } else {
        await portfolioService.createPortfolio(currentProject);
        alert("Đã thêm dự án mới!");
      }
      setShowModal(false);
      fetchMyPortfolios();
    } catch (err) {
      alert("Lỗi khi lưu dự án: " + (err.response?.data?.message || "Vui lòng thử lại"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa dự án này khỏi Portfolio?")) return;
    try {
      await portfolioService.deletePortfolio(id);
      setPortfolios(portfolios.filter(p => p.portfolioId !== id));
      alert("Đã xóa dự án.");
    } catch (err) {
      alert("Không thể xóa dự án này.");
    }
  };

  if (loading) return (
    <div className="vh-100 d-flex justify-content-center align-items-center bg-dark">
      <div className="text-center">
        <Loader2 className="spinner text-primary mb-3" size={40} />
        <p className="text-muted small">Đang tải portfolio...</p>
      </div>
    </div>
  );

  return (
    <div className="portfolio-page py-5 text-white animate-fade-in">
      <Container>
        {/* --- HERO HEADER --- */}
        <div className="portfolio-hero-card glass-card p-5 mb-5 position-relative overflow-hidden">
          <div className="hero-bg-pattern"></div>
          <Row className="align-items-center position-relative">
            <Col md={8}>
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="hero-icon-box">
                  <FolderOpen size={28} />
                </div>
                <div>
                  <h1 className="fw-bold display-6 mb-0">Dự án <span className="text-primary-glow">Cá nhân</span></h1>
                </div>
              </div>
              <p className="text-white-50 mb-4 lead-sm">Trưng bày những sản phẩm tốt nhất, gây ấn tượng với nhà tuyển dụng.</p>
              
              <div className="d-flex gap-4">
                <div className="hero-stat-box">
                  <span className="hero-stat-number">{portfolios.length}</span>
                  <span className="hero-stat-label">Dự án</span>
                </div>
                <div className="hero-stat-box">
                  <span className="hero-stat-number">{portfolios.filter(p => p.projectUrl).length}</span>
                  <span className="hero-stat-label">Có demo</span>
                </div>
              </div>
            </Col>
            <Col md={4} className="text-md-end mt-4 mt-md-0">
              <div className="d-flex gap-2 justify-content-md-end">
                <Button as={Link} to="/portfolio" variant="outline-light" className="px-4 py-2 fw-bold d-flex align-items-center border-white border-opacity-10">
                  <Eye size={18} className="me-2" /> XEM PORTFOLIO
                </Button>
                <Button variant="primary" className="px-4 py-2 fw-bold shadow-glow d-flex align-items-center" onClick={() => handleOpenModal()}>
                  <Plus size={20} className="me-2" /> THÊM DỰ ÁN
                </Button>
              </div>
            </Col>
          </Row>
        </div>

        {/* --- DANH SÁCH DỰ ÁN --- */}
        {portfolios.length > 0 ? (
          <Row className="g-4">
            {portfolios.map((item, index) => (
              <Col md={6} lg={4} key={item.portfolioId}>
                <div className="portfolio-manage-card glass-card h-100 border-0 overflow-hidden" style={{animationDelay: `${index * 0.05}s`}}>
                  {/* Image Section */}
                  <div className="portfolio-img-wrapper">
                    <img 
                      src={item.imageUrl || 'https://via.placeholder.com/600x340/0f172a/3b82f6?text=No+Image'} 
                      alt={item.title} 
                      className="portfolio-img"
                    />
                    <div className="portfolio-img-overlay">
                      <button className="portfolio-action-btn edit" onClick={() => handleOpenModal(item)}>
                        <Edit3 size={16} /> Sửa
                      </button>
                      <button className="portfolio-action-btn delete" onClick={() => handleDelete(item.portfolioId)}>
                        <Trash2 size={16} /> Xóa
                      </button>
                    </div>
                    <div className="portfolio-index-badge">
                      <span>#{index + 1}</span>
                    </div>
                  </div>
                  
                  {/* Content Section */}
                  <div className="p-4">
                    <h5 className="fw-bold text-white mb-2 line-clamp-1">{item.title}</h5>
                    <p className="text-white-50 small line-clamp-2 mb-3">
                      {item.description || "Chưa có mô tả chi tiết cho dự án này."}
                    </p>
                    
                    <div className="d-flex justify-content-between align-items-center">
                      {item.projectUrl ? (
                        <a href={item.projectUrl} target="_blank" rel="noreferrer" className="text-primary-glow text-decoration-none small fw-bold d-flex align-items-center gap-1 hover-primary">
                          <ExternalLink size={14} /> Xem demo
                        </a>
                      ) : (
                        <span className="text-muted x-small fst-italic">Chưa có link demo</span>
                      )}
                      <Badge bg="dark" className="opacity-50 x-small">ID: {item.portfolioId?.substring(0, 6)}</Badge>
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        ) : (
          /* --- EMPTY STATE --- */
          <div className="empty-portfolio-card glass-card p-5 text-center">
            <div className="empty-icon-wrapper mb-4">
              <LayoutGrid size={48} />
            </div>
            <h4 className="fw-bold text-white mb-2">Bắt đầu xây Portfolio</h4>
            <p className="text-white-50 mb-4 mx-auto" style={{maxWidth: '400px'}}>
              Thêm các dự án tiêu biểu để nhà tuyển dụng thấy được năng lực của bạn.
            </p>
            <Button variant="primary" className="px-5 py-3 fw-bold shadow-glow d-flex align-items-center gap-2 mx-auto" onClick={() => handleOpenModal()}>
              <Plus size={20} /> THÊM DỰ ÁN ĐẦU TIÊN
            </Button>
          </div>
        )}
      </Container>

      {/* --- MODAL THÊM / SỬA DỰ ÁN --- */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg" contentClassName="portfolio-modal">
        <Form onSubmit={handleSaveProject}>
          <div className="portfolio-modal-header">
            <div className="d-flex align-items-center gap-3">
              <div className="modal-icon-box">
                {currentProject.portfolioId ? <Edit3 size={22} /> : <Plus size={22} />}
              </div>
              <div>
                <h5 className="fw-bold mb-0 text-white">
                  {currentProject.portfolioId ? 'Cập nhật dự án' : 'Thêm dự án mới'}
                </h5>
                <p className="x-small text-white-50 mb-0">
                  {currentProject.portfolioId ? 'Chỉnh sửa thông tin dự án' : 'Điền thông tin dự án của bạn'}
                </p>
              </div>
            </div>
            <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
          </div>
          
          <Modal.Body className="p-4">
            <Row className="g-4">
              <Col md={8}>
                <Form.Group className="mb-4">
                  <Form.Label className="small-label fw-bold d-flex align-items-center gap-2">
                    <FileText size={14} className="text-primary"/> TIÊU ĐỀ DỰ ÁN
                  </Form.Label>
                  <Form.Control 
                    required 
                    className="portfolio-input" 
                    placeholder="VD: Website Bán hàng E-Commerce"
                    value={currentProject.title}
                    onChange={e => setCurrentProject({...currentProject, title: e.target.value})}
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="small-label fw-bold d-flex align-items-center gap-2">
                    <FileText size={14} className="text-primary"/> MÔ TẢ DỰ ÁN
                  </Form.Label>
                  <Form.Control 
                    as="textarea" rows={4} 
                    className="portfolio-input" 
                    placeholder="Mô tả chi tiết về dự án: công nghệ sử dụng, vai trò của bạn, kết quả đạt được..."
                    value={currentProject.description}
                    onChange={e => setCurrentProject({...currentProject, description: e.target.value})}
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                {/* Preview ảnh */}
                <div className="mb-4">
                  <Form.Label className="small-label fw-bold d-flex align-items-center gap-2">
                    <ImageIcon size={14} className="text-primary"/> ẢNH MINH HỌA
                  </Form.Label>
                  <div className="portfolio-preview-box mb-3">
                    {currentProject.imageUrl ? (
                      <img src={currentProject.imageUrl} alt="Preview" className="portfolio-preview-img" />
                    ) : (
                      <div className="portfolio-preview-placeholder">
                        <ImageIcon size={32} className="text-muted mb-2" />
                        <span className="x-small text-muted">Nhập URL để xem trước</span>
                      </div>
                    )}
                  </div>
                  <Form.Control 
                    className="portfolio-input" 
                    placeholder="https://example.com/image.jpg"
                    value={currentProject.imageUrl}
                    onChange={e => setCurrentProject({...currentProject, imageUrl: e.target.value})}
                  />
                </div>

                <Form.Group>
                  <Form.Label className="small-label fw-bold d-flex align-items-center gap-2">
                    <LinkIcon size={14} className="text-primary"/> LINK DEMO / GITHUB
                  </Form.Label>
                  <Form.Control 
                    className="portfolio-input" 
                    placeholder="https://github.com/your-project"
                    value={currentProject.projectUrl}
                    onChange={e => setCurrentProject({...currentProject, projectUrl: e.target.value})}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>

          <div className="portfolio-modal-footer">
            <Button variant="link" className="text-white text-decoration-none" onClick={() => setShowModal(false)}>
              HỦY BỎ
            </Button>
            <Button variant="primary" type="submit" className="px-5 fw-bold shadow-glow d-flex align-items-center gap-2" disabled={isSaving}>
              {isSaving ? <Loader2 className="spinner" size={18} /> : <Save size={18} />}
              {currentProject.portfolioId ? 'CẬP NHẬT' : 'ĐĂNG DỰ ÁN'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default MyPortfolio;
