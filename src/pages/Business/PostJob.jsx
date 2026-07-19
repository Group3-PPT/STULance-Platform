import React, { useState, useRef } from 'react';
import { Container, Row, Col, Form, Button, InputGroup, Spinner } from 'react-bootstrap';
import { Info, UserCheck, FileText, Save, Loader2, Send, Image as ImageIcon, Upload, X } from 'lucide-react';
import { jobService } from "../../services/jobservice"; 
import '../../CSS/PostJob.css';

const PostJob = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    jobType: 'Freelance',
    salary: '',
    quantity: 1,
    deadline: '',
    description: '',
    requirements: '',
    benefits: '',
    contactName: '',
    contactInfo: '',
    saveAsDraft: false
  });

  const validate = (field, value) => {
    const newErrors = { ...errors };
    
    switch (field) {
      case 'title':
        if (!value || value.trim().length < 5) newErrors.title = 'Tiêu đề phải có ít nhất 5 ký tự';
        else if (value.length > 200) newErrors.title = 'Tiêu đề không quá 200 ký tự';
        else delete newErrors.title;
        break;
      case 'deadline':
        if (!value) newErrors.deadline = 'Vui lòng chọn hạn chót';
        else if (new Date(value) < new Date()) newErrors.deadline = 'Hạn chót phải sau ngày hôm nay';
        else delete newErrors.deadline;
        break;
      case 'description':
        if (!value || value.trim().length < 20) newErrors.description = 'Mô tả phải có ít nhất 20 ký tự';
        else delete newErrors.description;
        break;
      case 'contactName':
        if (!value || value.trim().length < 2) newErrors.contactName = 'Tên liên hệ phải có ít nhất 2 ký tự';
        else delete newErrors.contactName;
        break;
      case 'contactInfo':
        if (!value || value.trim().length < 3) newErrors.contactInfo = 'Email/SĐT không hợp lệ';
        else delete newErrors.contactInfo;
        break;
      case 'salary':
        if (!value || Number(value) < 100000) newErrors.salary = 'Lương tối thiểu 100,000 VND';
        else delete newErrors.salary;
        break;
      default: break;
    }
    setErrors(newErrors);
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validate(field, formData[field]);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newVal = type === 'checkbox' || type === 'switch' ? checked : value;
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
  
  ['title', 'deadline', 'description', 'contactName', 'contactInfo', 'salary'].forEach(f => validate(f, formData[f]));
  
  if (Object.keys(errors).length > 0) {
    setTouched({ title: true, deadline: true, description: true, contactName: true, contactInfo: true, salary: true });
    return;
  }

  setIsSaving(true);

  try {
    const fd = new FormData();
    fd.append('title', formData.title);
    fd.append('jobType', formData.jobType);
    fd.append('salary', Number(formData.salary));
    fd.append('quantity', Number(formData.quantity));
    fd.append('deadline', new Date(formData.deadline).toISOString());
    fd.append('description', formData.description);
    fd.append('requirements', formData.requirements || '');
    fd.append('benefits', formData.benefits || '');
    fd.append('contactName', formData.contactName);
    fd.append('contactInfo', formData.contactInfo);
    fd.append('saveAsDraft', formData.saveAsDraft);
    fd.append('requesterType', 'ENTERPRISE');
    if (imageFile) fd.append('thumbnailFile', imageFile);

    const res = await jobService.postJob(fd);

    if (res.success) {
      alert("Đăng tin thành công!");
    }
  } catch (err) {
    const serverMsg = err.response?.data?.message || "Lỗi không xác định";
    alert("Lỗi: " + serverMsg);
  } finally {
    setIsSaving(false);
  }
};

  return (
    <div className="post-job-page py-5 text-white animate-fade-in">
      <Container>
        <div className="glass-card post-container mx-auto shadow-lg p-4 p-md-5">
          <div className="text-center mb-5">
            <h1 className="fw-bold display-6">Đăng tin <span className="text-primary-glow">Tuyển dụng</span></h1>
            <p className="text-white opacity-75">Tiếp cận mạng lưới sinh viên tài năng trên hệ thống STULance</p>
          </div>

          <Form onSubmit={handleSubmit}>
            {/* 1. THÔNG TIN CHUNG */}
            <div className="form-section-wrapper mb-5">
              <div className="section-header-title mb-4 d-flex align-items-center gap-2 text-primary-glow fw-bold uppercase-tracking">
                <Info size={20} /> 1. Thông tin chung
              </div>
              
              <Form.Group className="mb-4">
                <Form.Label className="small-label">TIÊU ĐỀ TUYỂN DỤNG <span className="text-danger">*</span></Form.Label>
                <Form.Control 
                  name="title" required className={`post-input ${touched.title && errors.title ? 'is-invalid' : ''}`}
                  placeholder="Ví dụ: Tuyển thực tập sinh Thiết kế UI/UX"
                  value={formData.title} onChange={handleChange} onBlur={() => handleBlur('title')}
                />
                {touched.title && errors.title && <div className="invalid-feedback d-block">{errors.title}</div>}
              </Form.Group>

              <Row className="g-4">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small-label">LOẠI HÌNH CÔNG VIỆC</Form.Label>
                    <Form.Select name="jobType" className="post-input" value={formData.jobType} onChange={handleChange}>
                      <option value="Freelance">Freelance (Dự án)</option>
                      <option value="Part-time">Part-time (Bán thời gian)</option>
                      <option value="Internship">Internship (Thực tập)</option>
                      <option value="Full-time">Full-time (Toàn thời gian)</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small-label">LƯƠNG / PHÍ DỰ ÁN (VND) <span className="text-danger">*</span></Form.Label>
                    <Form.Control 
                      name="salary" type="number" className={`post-input ${touched.salary && errors.salary ? 'is-invalid' : ''}`}
                      value={formData.salary} onChange={handleChange} onBlur={() => handleBlur('salary')}
                      placeholder="Nhập số tiền (tối thiểu 100,000 VND)"
                    />
                    {touched.salary && errors.salary && <div className="invalid-feedback d-block">{errors.salary}</div>}
                  </Form.Group>
                </Col>
              </Row>
            </div>

            {/* 2. YÊU CẦU & SỐ LƯỢNG */}
            <div className="form-section-wrapper mb-5">
              <div className="section-header-title mb-4 d-flex align-items-center gap-2 text-primary-glow fw-bold uppercase-tracking">
                <UserCheck size={20} /> 2. Quy mô & Thời hạn
              </div>
              <Row className="g-4">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="small-label">SỐ LƯỢNG TUYỂN</Form.Label>
                    <Form.Control name="quantity" type="number" min="1" className="post-input" value={formData.quantity} onChange={handleChange} />
                  </Form.Group>
                </Col>
                <Col md={8}>
                  <Form.Group>
                    <Form.Label className="small-label">HẠN CHÓT NỘP HỒ SƠ <span className="text-danger">*</span></Form.Label>
                    <Form.Control name="deadline" type="date" required className={`post-input ${touched.deadline && errors.deadline ? 'is-invalid' : ''}`} value={formData.deadline} onChange={handleChange} onBlur={() => handleBlur('deadline')} />
                    {touched.deadline && errors.deadline && <div className="invalid-feedback d-block">{errors.deadline}</div>}
                  </Form.Group>
                </Col>
              </Row>
            </div>

            {/* 3. NỘI DUNG CHI TIẾT */}
            <div className="form-section-wrapper mb-5">
              <div className="section-header-title mb-4 d-flex align-items-center gap-2 text-primary-glow fw-bold uppercase-tracking">
                <FileText size={20} /> 3. Nội dung công việc
              </div>
              <Form.Group className="mb-4">
                <Form.Label className="small-label">MÔ TẢ CÔNG VIỆC</Form.Label>
                <Form.Control as="textarea" rows={4} name="description" required className={`post-input ${touched.description && errors.description ? 'is-invalid' : ''}`} placeholder="Viết chi tiết các task cần làm..." value={formData.description} onChange={handleChange} onBlur={() => handleBlur('description')} />
                {touched.description && errors.description && <div className="invalid-feedback d-block">{errors.description}</div>}
              </Form.Group>
              <Form.Group className="mb-4">
                <Form.Label className="small-label">YÊU CẦU ỨNG VIÊN</Form.Label>
                <Form.Control as="textarea" rows={3} name="requirements" className="post-input" placeholder="Kỹ năng cần có, thiết bị, thời gian..." value={formData.requirements} onChange={handleChange} />
              </Form.Group>
              <Form.Group>
                <Form.Label className="small-label">QUYỀN LỢI</Form.Label>
                <Form.Control as="textarea" rows={3} name="benefits" className="post-input" placeholder="Lương thưởng, hỗ trợ con dấu, training..." value={formData.benefits} onChange={handleChange} />
              </Form.Group>
            </div>

            {/* 4. THÔNG TIN LIÊN HỆ */}
            <div className="form-section-wrapper mb-5">
              <div className="section-header-title mb-4 text-primary-glow fw-bold uppercase-tracking">4. Thông tin liên hệ</div>
              <Row className="g-4">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small-label">TÊN NGƯỜI LIÊN HỆ</Form.Label>
                    <Form.Control name="contactName" required className={`post-input ${touched.contactName && errors.contactName ? 'is-invalid' : ''}`} value={formData.contactName} onChange={handleChange} onBlur={() => handleBlur('contactName')} />
                    {touched.contactName && errors.contactName && <div className="invalid-feedback d-block">{errors.contactName}</div>}
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small-label">EMAIL/SĐT NHẬN CV</Form.Label>
                    <Form.Control name="contactInfo" required className={`post-input ${touched.contactInfo && errors.contactInfo ? 'is-invalid' : ''}`} value={formData.contactInfo} onChange={handleChange} onBlur={() => handleBlur('contactInfo')} />
                    {touched.contactInfo && errors.contactInfo && <div className="invalid-feedback d-block">{errors.contactInfo}</div>}
                  </Form.Group>
                </Col>
              </Row>
            </div>

            {/* 5. ẢNH ĐẠI DIỆN */}
            <div className="form-section-wrapper mb-5">
              <div className="section-header-title mb-4 d-flex align-items-center gap-2 text-primary-glow fw-bold uppercase-tracking">
                <ImageIcon size={20} /> 5. Ảnh đại diện tin tuyển dụng
              </div>
              <Form.Group>
                <div 
                  className="text-center p-4 rounded-4"
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

            <div className="d-flex align-items-center justify-content-between mt-5 pt-4 border-top border-white-10">
              <Form.Check 
                type="switch" 
                id="draft-switch"
                label={<span className="x-small text-white-50">Lưu dưới dạng bản nháp (Chỉ bạn nhìn thấy)</span>}
                name="saveAsDraft" 
                checked={formData.saveAsDraft} 
                onChange={handleChange}
              />
              <Button type="submit" variant="primary" className="px-5 py-3 fw-bold shadow-glow" disabled={isSaving}>
                {isSaving ? <Loader2 className="spinner me-2" /> : <Send size={18} className="me-2" />}
                XÁC NHẬN ĐĂNG TIN
              </Button>
            </div>
          </Form>
        </div>
      </Container>
    </div>
  );
};

export default PostJob;