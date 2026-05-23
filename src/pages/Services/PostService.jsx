import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Badge, InputGroup } from 'react-bootstrap';
import { 
  Plus, Image as ImageIcon, DollarSign, Clock, 
  Settings, Info, CheckCircle2, Layout, Sparkles 
} from 'lucide-react';
import '../../CSS/PostService.css'; // Tuân thủ cấu trúc import bạn yêu cầu
const PostService = () => {
  const [activeTier, setActiveTier] = useState('basic'); // 'basic' hoặc 'premium'
  const [previewImage, setPreviewImage] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Dịch vụ của bạn đã được gửi và đang chờ kiểm duyệt!");
  };

  return (
    <div className="post-service-page py-5">
      <Container>
        <div className="text-center mb-5 animate-fade-in">
          <h1 className="fw-bold text-white display-6">Đăng <span className="text-primary-glow">Gói Dịch Vụ</span></h1>
          <p className="text-muted">Chia sẻ kỹ năng của bạn và bắt đầu thu nhập ngay hôm nay</p>
        </div>

        <Form onSubmit={handleSubmit}>
          <Row className="g-4">
            {/* CỘT TRÁI: THÔNG TIN CHI TIẾT */}
            <Col lg={8}>
              <div className="glass-card p-4 mb-4">
                <h5 className="text-white fw-bold mb-4 d-flex align-items-center gap-2">
                  <Layout size={20} className="text-primary" /> 1. Thông tin chung
                </h5>
                
                <Form.Group className="mb-4">
                  <Form.Label className="small-label">Tiêu đề dịch vụ</Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={2} 
                    className="post-input" 
                    placeholder="Ví dụ: Tôi sẽ thiết kế bộ nhận diện thương hiệu chuyên nghiệp..."
                    required
                  />
                  <small className="text-muted x-small italic">Gợi ý: Bắt đầu bằng 'Tôi sẽ...' để thu hút khách hàng.</small>
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="small-label">Danh mục</Form.Label>
                      <Form.Select className="post-input" required>
                        <option value="">Chọn lĩnh vực</option>
                        <option>Thiết kế Đồ họa</option>
                        <option>Lập trình Web</option>
                        <option>Video & Âm nhạc</option>
                        <option>Dịch thuật & Viết lách</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="small-label">Từ khóa (Tags)</Form.Label>
                      <Form.Control className="post-input" placeholder="Ví dụ: Logo, Figma, Web3" />
                    </Form.Group>
                  </Col>
                </Row>
              </div>

              <div className="glass-card p-4">
                <h5 className="text-white fw-bold mb-4 d-flex align-items-center gap-2">
                  <ImageIcon size={20} className="text-primary" /> 2. Hình ảnh sản phẩm mẫu
                </h5>
                <div 
                  className="upload-dropzone"
                  onClick={() => document.getElementById('img-upload').click()}
                >
                  {previewImage ? (
                    <img src={previewImage} alt="Preview" className="img-preview-full" />
                  ) : (
                    <div className="text-center py-5">
                      <Plus size={40} className="text-muted mb-2" />
                      <p className="mb-0 text-muted">Nhấn để tải lên ảnh đại diện dịch vụ</p>
                      <small className="x-small text-white-50">Kích thước khuyến nghị: 1280 x 720 (16:9)</small>
                    </div>
                  )}
                  <input type="file" id="img-upload" hidden onChange={handleImageChange} accept="image/*" />
                </div>
              </div>
            </Col>

            {/* CỘT PHẢI: THIẾT LẬP GÓI GIÁ (TIERS) */}
            <Col lg={4}>
              <div className="glass-card overflow-hidden sticky-top" style={{ top: '100px' }}>
                <div className="tier-switcher d-flex">
                  <div 
                    className={`tier-btn ${activeTier === 'basic' ? 'active' : ''}`}
                    onClick={() => setActiveTier('basic')}
                  >Cơ bản</div>
                  <div 
                    className={`tier-btn ${activeTier === 'premium' ? 'active' : ''}`}
                    onClick={() => setActiveTier('premium')}
                  >Cao cấp</div>
                </div>

                <div className="p-4">
                  <Form.Group className="mb-4">
                    <Form.Label className="small-label">Giá dịch vụ (VND)</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-dark-input border-0 text-white">
                        <DollarSign size={16} />
                      </InputGroup.Text>
                      <Form.Control type="number" className="post-input border-start-0" placeholder="500,000" />
                    </InputGroup>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="small-label">Thời gian bàn giao</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-dark-input border-0 text-white">
                        <Clock size={16} />
                      </InputGroup.Text>
                      <Form.Select className="post-input border-start-0">
                        <option>1 ngày</option>
                        <option>3 ngày</option>
                        <option>5 ngày</option>
                        <option>7 ngày</option>
                      </Form.Select>
                    </InputGroup>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="small-label">Mô tả gói ({activeTier})</Form.Label>
                    <Form.Control 
                      as="textarea" 
                      rows={3} 
                      className="post-input" 
                      placeholder="Gói này bao gồm những gì?..."
                    />
                  </Form.Group>

                  <div className="service-features mb-4">
                     <p className="small-label">Tính năng bao gồm</p>
                     <div className="feature-check-item d-flex align-items-center gap-2 mb-2">
                        <input type="checkbox" id="f1" /> <label htmlFor="f1" className="small text-white-50">File gốc gốc (AI/PSD)</label>
                     </div>
                     <div className="feature-check-item d-flex align-items-center gap-2 mb-2">
                        <input type="checkbox" id="f2" /> <label htmlFor="f2" className="small text-white-50">Sử dụng thương mại</label>
                     </div>
                  </div>

                  <Button type="submit" variant="primary" className="w-100 py-3 fw-bold hub-btn-pink shadow-glow">
                    XUẤT BẢN DỊCH VỤ
                  </Button>
                </div>
              </div>
              
              <div className="glass-card p-3 mt-3">
                <h6 className="text-warning small fw-bold mb-2 d-flex align-items-center gap-2">
                  <Info size={14} /> Mẹo đăng bài
                </h6>
                <p className="x-small text-muted mb-0">
                  Sử dụng hình ảnh thực tế bạn đã làm để tăng tỷ lệ được thuê lên 80%.
                </p>
              </div>
            </Col>
          </Row>
        </Form>
      </Container>
    </div>
  );
};

export default PostService;