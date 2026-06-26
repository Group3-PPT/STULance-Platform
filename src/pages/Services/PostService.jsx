import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, InputGroup, Spinner } from 'react-bootstrap';
import { Image as ImageIcon, DollarSign, Clock, Layout, Loader2, Send, ListChecks } from 'lucide-react';
import { studentServiceService } from '../../services/studentserviceservice';
import '../../CSS/PostService.css';

const PostService = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

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

  const validate = (field, value) => {
    const newErrors = { ...errors };
    switch (field) {
      case 'Title':
        if (!value || value.trim().length < 10) newErrors.Title = 'Tiêu đề phải có ít nhất 10 ký tự';
        else if (value.length > 300) newErrors.Title = 'Tiêu đề không quá 300 ký tự';
        else delete newErrors.Title;
        break;
      case 'Category':
        if (!value) newErrors.Category = 'Vui lòng chọn danh mục';
        else delete newErrors.Category;
        break;
      case 'Description':
        if (!value || value.trim().length < 20) newErrors.Description = 'Mô tả phải có ít nhất 20 ký tự';
        else delete newErrors.Description;
        break;
      case 'Price':
        if (!value || Number(value) < 50000) newErrors.Price = 'Giá tối thiểu 50,000 VND';
        else delete newErrors.Price;
        break;
      case 'DeliveryDays':
        if (!value || Number(value) < 1) newErrors.DeliveryDays = 'Tối thiểu 1 ngày';
        else delete newErrors.DeliveryDays;
        break;
      case 'SampleImageFile':
        if (!value) newErrors.SampleImageFile = 'Vui lòng nhập URL ảnh mẫu';
        else if (!/^https?:\/\/.+/.test(value)) newErrors.SampleImageFile = 'URL không hợp lệ (bắt đầu bằng http:// hoặc https://)';
        else delete newErrors.SampleImageFile;
        break;
      default: break;
    }
    setErrors(newErrors);
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validate(field, formData[field]);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newVal = type === 'checkbox' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: newVal }));
    if (touched[name]) validate(name, newVal);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    ['Title', 'Category', 'Description', 'Price', 'DeliveryDays', 'SampleImageFile'].forEach(f => validate(f, formData[f]));
    if (Object.keys(errors).length > 0) {
      setTouched({ Title: true, Category: true, Description: true, Price: true, DeliveryDays: true, SampleImageFile: true });
      return;
    }

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
                    className={`post-input ${touched.Title && errors.Title ? 'is-invalid' : ''}`}
                    placeholder="VD: Tôi sẽ vẽ minh họa 2D phong cách Anime..."
                    value={formData.Title} onChange={handleInputChange} onBlur={() => handleBlur('Title')}
                  />
                  {touched.Title && errors.Title && <div className="invalid-feedback d-block">{errors.Title}</div>}
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="small-label">DANH MỤC</Form.Label>
                  <Form.Select 
                    name="Category" required className={`post-input ${touched.Category && errors.Category ? 'is-invalid' : ''}`}
                    value={formData.Category} onChange={handleInputChange} onBlur={() => handleBlur('Category')}
                  >
                    <option value="">-- Chọn lĩnh vực --</option>
                    <option>Thiết kế Đồ họa</option>
                    <option>Lập trình & Tech</option>
                    <option>Viết lách & Dịch thuật</option>
                    <option>Video & Âm thanh</option>
                  </Form.Select>
                  {touched.Category && errors.Category && <div className="invalid-feedback d-block">{errors.Category}</div>}
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="small-label">MÔ TẢ CHI TIẾT</Form.Label>
                  <Form.Control 
                    as="textarea" rows={6} name="Description" required
                    className={`post-input ${touched.Description && errors.Description ? 'is-invalid' : ''}`}
                    placeholder="Giới thiệu chi tiết về quy trình và chất lượng sản phẩm..."
                    value={formData.Description} onChange={handleInputChange} onBlur={() => handleBlur('Description')}
                  />
                  {touched.Description && errors.Description && <div className="invalid-feedback d-block">{errors.Description}</div>}
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
                    className={`post-input ${touched.SampleImageFile && errors.SampleImageFile ? 'is-invalid' : ''}`}
                    placeholder="https://example.com/image.jpg"
                    value={formData.SampleImageFile} 
                    onChange={handleInputChange} onBlur={() => handleBlur('SampleImageFile')}
                  />
                  {touched.SampleImageFile && errors.SampleImageFile && <div className="invalid-feedback d-block">{errors.SampleImageFile}</div>}
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
                        className={`post-input border-start-0 ${touched.Price && errors.Price ? 'is-invalid' : ''}`}
                        value={formData.Price} onChange={handleInputChange} onBlur={() => handleBlur('Price')}
                    />
                  </InputGroup>
                  {touched.Price && errors.Price && <div className="text-danger small mt-1">{errors.Price}</div>}
                </Form.Group>

                <Form.Group className="mb-5">
                  <Form.Label className="small-label">BÀN GIAO TRONG (NGÀY)</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-dark-input border-0 text-white"><Clock size={16} /></InputGroup.Text>
                    <Form.Control 
                        type="number" name="DeliveryDays" required min="1"
                        className={`post-input border-start-0 ${touched.DeliveryDays && errors.DeliveryDays ? 'is-invalid' : ''}`}
                        value={formData.DeliveryDays} onChange={handleInputChange} onBlur={() => handleBlur('DeliveryDays')}
                    />
                  </InputGroup>
                  {touched.DeliveryDays && errors.DeliveryDays && <div className="text-danger small mt-1">{errors.DeliveryDays}</div>}
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