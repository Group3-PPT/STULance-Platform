import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Card, Badge, Form, Modal, Spinner, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom'; // Đảm bảo có Link
import { Plus, Edit3, Trash2, ExternalLink, Image as ImageIcon, Loader2, LayoutGrid, Link as LinkIcon, FileText, Save  ,User  } from 'lucide-react';
import { portfolioService } from '../../services/portfolioservice';
import '../../CSS/Portfolio.css';

const MyPortfolio = () => {
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // State cho Modal (Dùng chung cho cả Thêm và Sửa)
  const [showModal, setShowModal] = useState(false);
  const [currentProject, setCurrentProject] = useState({
    title: '',
    description: '',
    imageUrl: '',
    projectUrl: ''
  });

  // 1. Tải danh sách dự án từ API /portfolios/me
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

  useEffect(() => {
    fetchMyPortfolios();
  }, []);

  // 2. Mở modal để thêm hoặc sửa
  const handleOpenModal = (project = null) => {
    if (project) {
      setCurrentProject(project); // Chế độ Sửa
    } else {
      setCurrentProject({ title: '', description: '', imageUrl: '', projectUrl: '' }); // Chế độ Thêm mới
    }
    setShowModal(true);
  };

  // 3. Xử lý Lưu (POST hoặc PUT)
  const handleSaveProject = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (currentProject.portfolioId) {
        // GỌI PUT NẾU CÓ ID
        await portfolioService.updatePortfolio(currentProject.portfolioId, currentProject);
        alert("Đã cập nhật dự án thành công!");
      } else {
        // GỌI POST NẾU CHƯA CÓ ID
        await portfolioService.createPortfolio(currentProject);
        alert("Đã thêm dự án mới!");
      }
      setShowModal(false);
      fetchMyPortfolios(); // Tải lại danh sách
    } catch (err) {
      alert("Lỗi khi lưu dự án: " + (err.response?.data?.message || "Vui lòng thử lại"));
    } finally {
      setIsSaving(false);
    }
  };

  // 4. Xử lý Xóa (DELETE)
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
      <Spinner animation="border" variant="primary" />
    </div>
  );

  return (
    <div className="portfolio-page py-5 text-white animate-fade-in">
      <Container>
        {/* HEADER QUẢN LÝ */}
        <div className="d-flex justify-content-between align-items-end mb-5">
          <div>
            <h1 className="fw-bold display-6 mb-1">Dự án <span className="text-primary-glow">Cá nhân</span></h1>
            <p className="text-muted mb-0">Nơi trưng bày những sản phẩm tốt nhất của bạn</p>
          </div>
          
          {/* Cụm nút hành động */}
          <div className="d-flex gap-2">
            {/* NÚT TRỎ VỀ PORTFOLIO CÁ NHÂN */}
            <Button 
              as={Link} 
              to="/portfolio" 
              variant="outline-primary" 
              className="px-4 py-2 fw-bold d-flex align-items-center"
            >
              <User size={18} className="me-2" /> XEM HỒ SƠ
            </Button>

            {/* NÚT THÊM DỰ ÁN */}
            <Button 
              variant="primary" 
              className="px-4 py-2 fw-bold shadow-glow d-flex align-items-center" 
              onClick={() => handleOpenModal()}
            >
              <Plus size={20} className="me-2" /> THÊM DỰ ÁN
            </Button>
          </div>
        </div>

        {/* DANH SÁCH DỰ ÁN (GRID) */}
        <Row className="g-4">
          {portfolios.map((item) => (
            <Col md={6} lg={4} key={item.portfolioId}>
              <Card className="glass-card h-100 overflow-hidden border-0 project-card-manage">
                <div className="project-img-container">
                  <img 
                    src={item.imageUrl || 'https://via.placeholder.com/400x220?text=No+Image'} 
                    alt="Project" 
                    className="w-100 object-fit-cover"
                    style={{ height: '200px' }}
                  />
                  <div className="project-actions-overlay">
                    <button className="action-btn edit" title="Chỉnh sửa" onClick={() => handleOpenModal(item)}>
                      <Edit3 size={18} />
                    </button>
                    <button className="action-btn delete" title="Xóa dự án" onClick={() => handleDelete(item.portfolioId)}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                
                <Card.Body className="p-4">
                  <Card.Title className="fw-bold text-white mb-2">{item.title}</Card.Title>
                  <Card.Text className="text-muted small line-clamp-3 mb-3">
                    {item.description || "Chưa có mô tả chi tiết cho dự án này."}
                  </Card.Text>
                  
                  {item.projectUrl && (
                    <a href={item.projectUrl} target="_blank" rel="noreferrer" className="text-primary-glow text-decoration-none small fw-bold d-flex align-items-center gap-1">
                      <ExternalLink size={14} /> Xem demo sản phẩm
                    </a>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}

          {/* HIỂN THỊ KHI TRỐNG */}
          {portfolios.length === 0 && (
            <Col xs={12} className="text-center py-5">
              <div className="glass-card p-5 border-dashed-blue">
                <LayoutGrid size={48} className="text-muted mb-3 opacity-25" />
                <h5 className="text-muted">Bạn chưa có dự án nào trong danh sách</h5>
                <Button variant="link" className="text-primary fw-bold" onClick={() => handleOpenModal()}>
                  Bắt đầu thêm dự án đầu tiên của bạn
                </Button>
              </div>
            </Col>
          )}
        </Row>
      </Container>

      {/* MODAL THÊM / SỬA DỰ ÁN */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered contentClassName="glass-card text-white border-0 shadow-lg">
        <Form onSubmit={handleSaveProject}>
          <Modal.Header closeButton closeVariant="white" className="border-white border-opacity-10">
            <Modal.Title className="fw-bold d-flex align-items-center gap-2">
              {currentProject.portfolioId ? <Edit3 size={20} /> : <Plus size={20} />}
              {currentProject.portfolioId ? 'Cập nhật dự án' : 'Đăng dự án mới'}
            </Modal.Title>
          </Modal.Header>
          
          <Modal.Body className="p-4">
            <Form.Group className="mb-3">
              <Form.Label className="x-small text-muted fw-bold uppercase-tracking"><FileText size={14}/> TIÊU ĐỀ DỰ ÁN</Form.Label>
              <Form.Control 
                required className="bg-dark-input text-white border-0" 
                placeholder="VD: Website Bán hàng E-Commerce"
                value={currentProject.title}
                onChange={e => setCurrentProject({...currentProject, title: e.target.value})}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="x-small text-muted fw-bold uppercase-tracking">MÔ TẢ NGẮN</Form.Label>
              <Form.Control 
                as="textarea" rows={3} className="bg-dark-input text-white border-0" 
                placeholder="Nói qua về công nghệ sử dụng và vai trò của bạn..."
                value={currentProject.description}
                onChange={e => setCurrentProject({...currentProject, description: e.target.value})}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="x-small text-muted fw-bold uppercase-tracking"><ImageIcon size={14}/> LINK ẢNH MINH HỌA</Form.Label>
              <Form.Control 
                className="bg-dark-input text-white border-0" 
                placeholder="Dán URL ảnh (từ Imgur, Unsplash...)"
                value={currentProject.imageUrl}
                onChange={e => setCurrentProject({...currentProject, imageUrl: e.target.value})}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="x-small text-muted fw-bold uppercase-tracking"><LinkIcon size={14}/> LINK SẢN PHẨM / GITHUB</Form.Label>
              <Form.Control 
                className="bg-dark-input text-white border-0" 
                placeholder="https://github.com/your-project"
                value={currentProject.projectUrl}
                onChange={e => setCurrentProject({...currentProject, projectUrl: e.target.value})}
              />
            </Form.Group>
          </Modal.Body>

          <Modal.Footer className="border-white border-opacity-10">
            <Button variant="link" className="text-white text-decoration-none x-small" onClick={() => setShowModal(false)}>HỦY BỎ</Button>
            <Button variant="primary" type="submit" className="px-4 fw-bold shadow-glow" disabled={isSaving}>
              {isSaving ? <Loader2 className="spinner me-2" size={18} /> : <Save className="me-2" size={18} />}
              {currentProject.portfolioId ? 'CẬP NHẬT' : 'ĐĂNG DỰ ÁN'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default MyPortfolio;