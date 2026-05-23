import React, { useState } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { Info, UserCheck, FileText, CheckCircle2 } from 'lucide-react'; // Đã bỏ AddressCard và PaperPlane
import '../../CSS/PostJob.css';

const PostJob = () => {
  const [salaryType, setSalaryType] = useState('deal');

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Tin tuyển dụng của bạn đã được gửi thành công!");
  };

  return (
    <div className="post-job-page py-5">
      <Container>
        <div className="glass-card post-container mx-auto shadow-lg">
          {/* HEADER TRANG */}
          <div className="text-center mb-5">
            <h1 className="fw-bold text-white display-6">Đăng tin <span className="text-primary-glow">Tuyển dụng</span></h1>
            <p className="text-muted">Tiếp cận mạng lưới hàng ngàn sinh viên tài năng ngay lập tức</p>
          </div>

          <Form onSubmit={handleSubmit}>
            {/* PHẦN 1: THÔNG TIN CHUNG */}
            <div className="form-section-wrapper mb-5">
              <div className="section-header-title">
                <Info size={20} className="text-primary" /> 1. Thông tin chung
              </div>
              
              <Form.Group className="mb-4">
                <Form.Label className="small-label">Tiêu đề tuyển dụng <span className="text-danger">*</span></Form.Label>
                <Form.Control className="post-input" placeholder="Ví dụ: Tuyển thực tập sinh Thiết kế UI/UX tại Hà Nội" required />
              </Form.Group>

              <Row className="g-4">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small-label">Ngành nghề <span className="text-danger">*</span></Form.Label>
                    <Form.Select className="post-input" required>
                      <option value="">Chọn ngành nghề</option>
                      <option>IT / Phần mềm</option>
                      <option>Thiết kế / Sáng tạo</option>
                      <option>Marketing / Truyền thông</option>
                      <option>Dịch thuật / Viết lách</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small-label">Loại hình công việc <span className="text-danger">*</span></Form.Label>
                    <Form.Select className="post-input" required>
                      <option>Freelance (Dự án)</option>
                      <option>Part-time (Bán thời gian)</option>
                      <option>Internship (Thực tập)</option>
                      <option>Remote (Từ xa)</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row className="g-4 mt-1">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small-label">Mức lương <span className="text-danger">*</span></Form.Label>
                    <Form.Select className="post-input" value={salaryType} onChange={(e) => setSalaryType(e.target.value)}>
                      <option value="deal">Thỏa thuận</option>
                      <option value="fixed">Cố định (VND)</option>
                      <option value="range">Khoảng lương</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group style={{ opacity: salaryType === 'deal' ? 0.3 : 1 }}>
                    <Form.Label className="small-label">Số tiền / Khoảng lương</Form.Label>
                    <Form.Control 
                      className="post-input" 
                      placeholder="Ví dụ: 5,000,000" 
                      disabled={salaryType === 'deal'} 
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>

            {/* PHẦN 2: YÊU CẦU ỨNG VIÊN */}
            <div className="form-section-wrapper mb-5">
              <div className="section-header-title">
                <UserCheck size={20} className="text-primary" /> 2. Yêu cầu ứng viên
              </div>
              <Row className="g-4">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small-label">Số lượng tuyển <span className="text-danger">*</span></Form.Label>
                    <Form.Control type="number" className="post-input" placeholder="Ví dụ: 2" required />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small-label">Hạn chót nộp hồ sơ <span className="text-danger">*</span></Form.Label>
                    <Form.Control type="date" className="post-input" required />
                  </Form.Group>
                </Col>
              </Row>
            </div>

            {/* PHẦN 3: NỘI DUNG CHI TIẾT */}
            <div className="form-section-wrapper mb-5">
              <div className="section-header-title">
                <FileText size={20} className="text-primary" /> 3. Nội dung chi tiết
              </div>
              <Form.Group className="mb-4">
                <Form.Label className="small-label">Mô tả công việc <span className="text-danger">*</span></Form.Label>
                <Form.Control as="textarea" rows={5} className="post-input" placeholder="- Thực hiện các task thiết kế...&#10;- Báo cáo cho leader..." required />
              </Form.Group>
              <Form.Group>
                <Form.Label className="small-label">Quyền lợi ứng viên</Form.Label>
                <Form.Control as="textarea" rows={4} className="post-input" placeholder="- Được hỗ trợ dấu thực tập...&#10;- Thưởng theo hiệu quả dự án..." />
              </Form.Group>
            </div>

            {/* PHẦN 4: THÔNG TIN LIÊN HỆ */}
            <div className="form-section-wrapper mb-5">
              <div className="section-header-title">
                4. Thông tin liên hệ
              </div>
              <Row className="g-4">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small-label">Tên người liên hệ <span className="text-danger">*</span></Form.Label>
                    <Form.Control className="post-input" placeholder="Anh/Chị quản lý" required />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small-label">SĐT / Email nhận CV <span className="text-danger">*</span></Form.Label>
                    <Form.Control className="post-input" placeholder="Để ứng viên liên hệ" required />
                  </Form.Group>
                </Col>
              </Row>
            </div>

            <div className="text-center mt-5">
              <Button type="submit" variant="primary" className="w-100 py-3 fw-bold hub-btn-post shadow-glow">
                XÁC NHẬN ĐĂNG TIN TUYỂN DỤNG
              </Button>
            </div>
          </Form>
        </div>
      </Container>
    </div>
  );
};

export default PostJob;