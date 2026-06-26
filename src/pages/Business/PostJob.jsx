import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, InputGroup, Spinner } from 'react-bootstrap';
import { Info, UserCheck, FileText, Save, Loader2, Send } from 'lucide-react';
import { jobService } from "../../services/jobservice"; 
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
      [name]: type === 'checkbox' || type === 'switch' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSaving(true);

  try {
    const payload = {
      ...formData,
      // THÊM TRƯỜNG NÀY ĐỂ FIX LỖI 400
      requesterType: "ENTERPRISE", 
      
      salary: salaryType === 'deal' ? 0 : Number(formData.salary),
      quantity: Number(formData.quantity),
      deadline: new Date(formData.deadline).toISOString(),
    };

    console.log("Dữ liệu chuẩn gửi đi:", payload);

    const res = await jobService.postJob(payload);

    if (res.success) {
      alert("🎉 Đăng tin thành công!");
      // Reset form...
    }
  } catch (err) {
    // Hiện lỗi chi tiết từ Server để dễ debug
    const serverMsg = err.response?.data?.message || "Lỗi không xác định";
    alert("Lỗi: " + serverMsg);
    console.error("Chi tiết lỗi 400:", err.response?.data);
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
                  name="title" required className="post-input" 
                  placeholder="Ví dụ: Tuyển thực tập sinh Thiết kế UI/UX"
                  value={formData.title} onChange={handleChange}
                />
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
                <Col md={3}>
                  <Form.Group>
                    <Form.Label className="small-label">HÌNH THỨC LƯƠNG</Form.Label>
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
                    <Form.Control name="deadline" type="date" required className="post-input" value={formData.deadline} onChange={handleChange} />
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
                <Form.Control as="textarea" rows={4} name="description" required className="post-input" placeholder="Viết chi tiết các task cần làm..." value={formData.description} onChange={handleChange} />
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