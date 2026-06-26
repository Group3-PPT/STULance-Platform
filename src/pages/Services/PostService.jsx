import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, InputGroup, Spinner } from 'react-bootstrap';
import { Image as ImageIcon, DollarSign, Clock, Layout, Loader2, Send, ListChecks } from 'lucide-react';
import { studentServiceService } from '../../services/studentserviceservice';
import '../../CSS/PostService.css';

const PostService = () => {
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    Title: '',
    Category: '',
    Description: '',
    Price: 0,
    DeliveryDays: 1,
    Features: '',
    SampleImageFile: '',
    SaveAsDraft: false
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.SampleImageFile) return alert("Vui lòng nhập URL hình ảnh mẫu cho dịch vụ!");

    setIsSaving(true);

    const payload = {
      Title: formData.Title,
      Category: formData.Category,
      Description: formData.Description,
      Price: Number(formData.Price),
      DeliveryDays: parseInt(formData.DeliveryDays),
      Features: formData.Features,
      SampleImageFile: formData.SampleImageFile,
      SaveAsDraft: formData.SaveAsDraft
    };

    try {
      await studentServiceService.createService(payload);
      alert(formData.SaveAsDraft ? "Đã lưu bản nháp thành công!" : "🎉 Dịch vụ đã được đăng và đang chờ duyệt!");
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || "Không thể xử lý yêu cầu"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="post-service-page py-5 text-white animate-fade-in">
      <Container>
        <div className="text-center mb-5">
          <h1 className="fw-bold display-6">Cung cấp <span className="text-primary-glow">Dịch Vụ</span></h1>
          <p className="text-muted small uppercase-tracking">Thiết lập gói dịch vụ chuyên nghiệp của riêng bạn</p>
        </div>

        <Form onSubmit={handleSubmit}>
          <Row className="g-4">
            {/* CỘT TRÁI: NỘI DUNG CHÍNH */}
            <Col lg={8}>
              <div className="glass-card p-4 mb-4">
                <h5 className="text-primary-glow mb-4 d-flex align-items-center gap-2">
                  <Layout size={20} /> 1. Nội dung hiển thị
                </h5>
                
                <Form.Group className="mb-4">
                  <Form.Label className="small-label">TIÊU ĐỀ DỊCH VỤ</Form.Label>
                  <Form.Control 
                    as="textarea" rows={2} name="Title" required
                    className="post-input" 
                    placeholder="VD: Tôi sẽ vẽ minh họa 2D phong cách Anime..."
                    value={formData.Title} onChange={handleInputChange}
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="small-label">DANH MỤC</Form.Label>
                  <Form.Select 
                    name="Category" required className="post-input"
                    value={formData.Category} onChange={handleInputChange}
                  >
                    <option value="">-- Chọn lĩnh vực --</option>
                    <option>Thiết kế Đồ họa</option>
                    <option>Lập trình & Tech</option>
                    <option>Viết lách & Dịch thuật</option>
                    <option>Video & Âm thanh</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="small-label">MÔ TẢ CHI TIẾT</Form.Label>
                  <Form.Control 
                    as="textarea" rows={6} name="Description" required
                    className="post-input" 
                    placeholder="Giới thiệu chi tiết về quy trình và chất lượng sản phẩm..."
                    value={formData.Description} onChange={handleInputChange}
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label className="small-label"><ListChecks size={16} className="me-2"/>CÁC TÍNH NĂNG ĐI KÈM</Form.Label>
                  <Form.Control 
                    as="textarea" rows={3} name="Features"
                    className="post-input" 
                    placeholder="VD: Cung cấp file gốc, Hỗ trợ sửa đổi 3 lần, Chất lượng 4K..."
                    value={formData.Features} onChange={handleInputChange}
                  />
                </Form.Group>
              </div>

              <div className="glass-card p-4">
                <h5 className="text-primary-glow mb-4 d-flex align-items-center gap-2">
                  <ImageIcon size={20} /> 2. Ảnh mẫu (URL)
                </h5>
                <Form.Group>
                  <Form.Control 
                    name="SampleImageFile"
                    className="post-input" 
                    placeholder="https://example.com/image.jpg"
                    value={formData.SampleImageFile} 
                    onChange={handleInputChange}
                  />
                </Form.Group>
                {formData.SampleImageFile && (
                  <div className="mt-3 rounded-4 overflow-hidden border border-white border-opacity-10">
                    <img 
                      src={formData.SampleImageFile} 
                      alt="Preview" 
                      className="w-100" 
                      style={{maxHeight: '300px', objectFit: 'cover'}}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                )}
              </div>
            </Col>

            {/* CỘT PHẢI: THIẾT LẬP GIÁ */}
            <Col lg={4}>
              <div className="glass-card p-4 sticky-top shadow-glow" style={{ top: '100px' }}>
                <h5 className="text-primary-glow mb-4 uppercase-tracking">Gói thanh toán</h5>
                
                <Form.Group className="mb-4">
                  <Form.Label className="small-label">GIÁ (VND)</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-dark-input border-0 text-white"><DollarSign size={16} /></InputGroup.Text>
                    <Form.Control 
                        type="number" name="Price" required
                        className="post-input border-start-0" 
                        value={formData.Price} onChange={handleInputChange}
                    />
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-5">
                  <Form.Label className="small-label">BÀN GIAO TRONG (NGÀY)</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-dark-input border-0 text-white"><Clock size={16} /></InputGroup.Text>
                    <Form.Control 
                        type="number" name="DeliveryDays" required min="1"
                        className="post-input border-start-0"
                        value={formData.DeliveryDays} onChange={handleInputChange}
                    />
                  </InputGroup>
                </Form.Group>

                <div className="mb-4">
                    <Form.Check 
                      type="switch"
                      id="draft-switch"
                      label="Lưu dưới dạng bản nháp"
                      name="SaveAsDraft"
                      checked={formData.SaveAsDraft}
                      onChange={handleInputChange}
                      className="x-small text-muted"
                    />
                </div>

                <Button type="submit" variant="primary" className="w-100 py-3 fw-bold shadow-glow d-flex align-items-center justify-content-center gap-2" disabled={isSaving}>
                  {isSaving ? <Loader2 className="spinner" /> : <Send size={18} />}
                  {formData.SaveAsDraft ? 'LƯU BẢN NHÁP' : 'XUẤT BẢN NGAY'}
                </Button>
              </div>
            </Col>
          </Row>
        </Form>
      </Container>
    </div>
  );
};

export default PostService;