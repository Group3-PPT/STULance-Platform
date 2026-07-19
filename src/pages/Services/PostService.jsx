import React, { useState, useRef } from 'react';
import { Container, Row, Col, Form, Button, InputGroup, Spinner } from 'react-bootstrap';
import { Image as ImageIcon, DollarSign, Clock, Layout, Loader2, Send, ListChecks, Upload, X } from 'lucide-react';
import { studentServiceService } from '../../services/studentserviceservice';
import '../../CSS/PostService.css';

const PostService = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    Title: '',
    Category: '',
    Description: '',
    Price: 0,
    DeliveryDays: 1,
    Features: '',
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file ảnh (JPG, PNG, WebP)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Kích thước ảnh tối đa 5MB');
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    ['Title', 'Category', 'Description', 'Price', 'DeliveryDays'].forEach(f => validate(f, formData[f]));
    if (Object.keys(errors).length > 0) {
      setTouched({ Title: true, Category: true, Description: true, Price: true, DeliveryDays: true });
      return;
    }

    setIsSaving(true);

    try {
      const fd = new FormData();
      fd.append('Title', formData.Title);
      fd.append('Category', formData.Category);
      fd.append('Description', formData.Description);
      fd.append('Price', Number(formData.Price));
      fd.append('DeliveryDays', parseInt(formData.DeliveryDays));
      fd.append('Features', formData.Features || '');
      fd.append('SaveAsDraft', formData.SaveAsDraft);
      if (imageFile) fd.append('SampleImageFile', imageFile);

      await studentServiceService.createService(fd);
      alert(formData.SaveAsDraft ? "Đã lưu bản nháp thành công!" : "Dịch vụ đã được đăng và đang chờ duyệt!");
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
                  <ImageIcon size={20} /> 2. Ảnh mẫu
                </h5>
                <Form.Group>
                  <div 
                    className="file-upload-zone text-center p-4 rounded-4 border border-dashed"
                    style={{ 
                      border: '2px dashed rgba(255,255,255,0.15)', 
                      background: 'rgba(255,255,255,0.02)',
                      cursor: 'pointer',
                      transition: '0.3s'
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--primary-blue)'; }}
                    onDragLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
                    onDrop={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; handleFileChange({ target: { files: e.dataTransfer.files } }); }}
                  >
                    {imagePreview ? (
                      <div className="position-relative">
                        <img src={imagePreview} alt="Preview" className="rounded-3" style={{ maxHeight: '250px', objectFit: 'cover', width: '100%' }} />
                        <Button 
                          variant="danger" size="sm" 
                          className="position-absolute top-0 end-0 m-2 rounded-circle d-flex align-items-center justify-content-center"
                          style={{ width: '32px', height: '32px' }}
                          onClick={(e) => { e.stopPropagation(); handleRemoveImage(); }}
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Upload size={36} className="text-primary mb-2 opacity-50" />
                        <p className="mb-1 text-white-50 small">Kéo thả ảnh vào đây hoặc <span className="text-primary fw-bold">Chọn file</span></p>
                        <p className="mb-0 text-white-25 x-small">JPG, PNG, WebP (tối đa 5MB)</p>
                      </>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" className="d-none" onChange={handleFileChange} />
                </Form.Group>
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