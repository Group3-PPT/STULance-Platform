import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Spinner } from 'react-bootstrap';
import { Info, UserCheck, FileText, Save, Loader2, Send } from 'lucide-react';
import { jobService } from '../../services/jobservice';
import '../../CSS/PostJob.css';

const PostJob = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [salaryType, setSalaryType] = useState('deal');

  // State khớp 100% với Schema Swagger
  const [formData, setFormData] = useState({
    title: '',
    jobType: 'Freelance',
    salary: 0,
    quantity: 1,
    deadline: '',
    description: '',
    requirements: '',
    benefits: '',
    contactName: '',
    contactInfo: '',
    saveAsDraft: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Chuẩn hóa dữ liệu trước khi gửi
      const payload = {
        ...formData,
        // Nếu là thỏa thuận, gửi lương = 0
        salary: salaryType === 'deal' ? 0 : Number(formData.salary),
        quantity: Number(formData.quantity),
        // Chuyển date sang định dạng ISO 8601 mà Backend yêu cầu
        deadline: new Date(formData.deadline).toISOString(),
      };

      await jobService.postJob(payload);
      alert("🎉 Tin tuyển dụng đã được đăng thành công!");
      // Reset form hoặc điều hướng
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || "Không thể đăng tin"));
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
            <p className="text-muted">Điền đầy đủ thông tin để thu hút các ứng viên tốt nhất</p>
          </div>

          <Form onSubmit={handleSubmit}>
            {/* 1. THÔNG TIN CHUNG */}
            <div className="form-section-wrapper mb-5">
              <div className="section-header-title mb-4 d-flex align-items-center gap-2 text-primary">
                <Info size={20} /> <span>1. Thông tin chung</span>
              </div>
              
              <Form.Group className="mb-4">
                <Form.Label className="small-label">TIÊU ĐỀ TUYỂN DỤNG</Form.Label>
                <Form.Control 
                  name="title" required className="post-input" 
                  placeholder="Ví dụ: Tuyển thực tập sinh Thiết kế UI/UX"
                  value={formData.title} onChange={handleChange}
                />
              </Form.Group>

              <Row className="g-4">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small-label">LOẠI HÌNH</Form.Label>
                    <Form.Select name="jobType" className="post-input" value={formData.jobType} onChange={handleChange}>
                      <option>Freelance</option>
                      <option>Part-time</option>
                      <option>Internship</option>
                      <option>Full-time</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label className="small-label">LƯƠNG</Form.Label>
                    <Form.Select className="post-input" value={salaryType} onChange={(e) => setSalaryType(e.target.value)}>
                      <option value="deal">Thỏa thuận</option>
                      <option value="fixed">Cố định (VND)</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label className="small-label">SỐ TIỀN</Form.Label>
                    <Form.Control 
                      name="salary" type="number" className="post-input" 
                      disabled={salaryType === 'deal'}
                      value={formData.salary} onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>

            {/* 2. YÊU CẦU & SỐ LƯỢNG */}
            <div className="form-section-wrapper mb-5">
              <div className="section-header-title mb-4 d-flex align-items-center gap-2 text-primary">
                <UserCheck size={20} /> <span>2. Yêu cầu & Thời hạn</span>
              </div>
              <Row className="g-4">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="small-label">SỐ LƯỢNG TUYỂN</Form.Label>
                    <Form.Control name="quantity" type="number" className="post-input" value={formData.quantity} onChange={handleChange} />
                  </Form.Group>
                </Col>
                <Col md={8}>
                  <Form.Group>
                    <Form.Label className="small-label">HẠN CHÓT NỘP HỒ SƠ</Form.Label>
                    <Form.Control name="deadline" type="date" required className="post-input" value={formData.deadline} onChange={handleChange} />
                  </Form.Group>
                </Col>
              </Row>
            </div>

            {/* 3. NỘI DUNG CHI TIẾT (MÔ TẢ, YÊU CẦU, QUYỀN LỢI) */}
            <div className="form-section-wrapper mb-5">
              <div className="section-header-title mb-4 d-flex align-items-center gap-2 text-primary">
                <FileText size={20} /> <span>3. Nội dung chi tiết</span>
              </div>
              <Form.Group className="mb-4">
                <Form.Label className="small-label">MÔ TẢ CÔNG VIỆC</Form.Label>
                <Form.Control as="textarea" rows={4} name="description" required className="post-input" value={formData.description} onChange={handleChange} />
              </Form.Group>
              <Form.Group className="mb-4">
                <Form.Label className="small-label">YÊU CẦU ỨNG VIÊN</Form.Label>
                <Form.Control as="textarea" rows={3} name="requirements" className="post-input" value={formData.requirements} onChange={handleChange} />
              </Form.Group>
              <Form.Group>
                <Form.Label className="small-label">QUYỀN LỢI</Form.Label>
                <Form.Control as="textarea" rows={3} name="benefits" className="post-input" value={formData.benefits} onChange={handleChange} />
              </Form.Group>
            </div>

            {/* 4. LIÊN HỆ */}
            <div className="form-section-wrapper mb-5">
              <div className="section-header-title mb-4 text-primary">4. Thông tin liên hệ</div>
              <Row className="g-4">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small-label">TÊN NGƯỜI LIÊN HỆ</Form.Label>
                    <Form.Control name="contactName" required className="post-input" value={formData.contactName} onChange={handleChange} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small-label">EMAIL/SĐT NHẬN CV</Form.Label>
                    <Form.Control name="contactInfo" required className="post-input" value={formData.contactInfo} onChange={handleChange} />
                  </Form.Group>
                </Col>
              </Row>
            </div>

            <div className="d-flex align-items-center justify-content-between mt-5 pt-4 border-top border-white-10">
              <Form.Check 
                type="switch" label="Lưu dưới dạng bản nháp" 
                name="saveAsDraft" checked={formData.saveAsDraft} onChange={handleChange}
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