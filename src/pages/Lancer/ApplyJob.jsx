import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, InputGroup, Spinner } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Send, ChevronLeft, DollarSign, Clock, FileText, CheckCircle, Info, Loader2 } from 'lucide-react';
import { bidService } from '../../services/bidservice';
import { jobService } from '../../services/jobservice';
import '../../CSS/PostJob.css'; // Tái sử dụng style form

const ApplyJob = () => {
  // ============================================================
  // ROUTING
  // ============================================================
  var params = useParams();
  var jobId = params.jobId;
  var navigate = useNavigate();

  // ============================================================
  // STATE
  // ============================================================

  // Thông tin công việc
  const [job, setJob] = useState(null);

  // Loading trang
  const [loading, setLoading] = useState(true);

  // Đang gửi đơn ứng tuyển
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ============================================================
  // STATE FORM ỨNG TUYỂN
  // ============================================================
  const [formData, setFormData] = useState({
    bidAmount: '',
    expectedDays: '',
    message: ''
  });

  // ============================================================
  // EFFECT: TẢI THÔNG TIN CÔNG VIỆC
  // ============================================================
  useEffect(function () {
    var fetchJob = async function () {
      try {
        var res = await jobService.getPublicJobDetail(jobId);
        setJob(res.data);
      } catch (err) {
        console.error("Lỗi tải thông tin dự án");
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  // ============================================================
  // HÀM XỬ LÝ THAY ĐỔI FORM
  // ============================================================
  const handleChange = function (e) {
    var name = e.target.name;
    var value = e.target.value;
    setFormData({ ...formData, [name]: value });
  };

  // ============================================================
  // HÀM GỬI ĐƠN ỨNG TUYỂN
  // ============================================================
  const handleSubmit = async function (e) {
    e.preventDefault();

    var bidAmount = Number(formData.bidAmount);
    var expectedDays = Number(formData.expectedDays);

    // Validate số tiền
    if (!bidAmount || bidAmount <= 0) {
      alert("Số tiền đặt giá phải lớn hơn 0!");
      return;
    }

    // Validate số ngày
    if (!expectedDays || expectedDays <= 0) {
      alert("Số ngày thực hiện phải lớn hơn 0!");
      return;
    }

    // Validate lời nhắn
    if (!formData.message.trim()) {
      alert("Vui lòng nhập lời đề nghị!");
      return;
    }

    setIsSubmitting(true);

    try {
      var payload = {
        bidAmount: bidAmount,
        expectedDays: expectedDays,
        message: formData.message
      };

      await bidService.createBid(jobId, payload);

      alert("🎉 Ứng tuyển thành công! Vui lòng đợi phản hồi từ doanh nghiệp.");

      // Quay về dashboard
      navigate('/dashboardlancer');

    } catch (err) {
      var msg = "Bạn đã ứng tuyển công việc này rồi hoặc có lỗi xảy ra.";
      if (err.response && err.response.data && err.response.data.message) {
        msg = err.response.data.message;
      }
      alert("Lỗi: " + msg);

    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="vh-100 d-flex justify-content-center align-items-center bg-dark text-white">
      <Spinner animation="border" variant="primary" />
    </div>
  );

  return (
    <div className="post-job-page py-5 text-white animate-fade-in">
      <Container>
        {/* Nút quay lại */}
        <div className="mb-4">
          <Link to={`/jobs/${jobId}`} className="text-decoration-none text-primary d-flex align-items-center gap-2 small fw-bold">
            <ChevronLeft size={18} /> QUAY LẠI CHI TIẾT CÔNG VIỆC
          </Link>
        </div>

        <Row className="g-4">
          {/* CỘT TRÁI: TÓM TẮT DỰ ÁN */}
          <Col lg={4}>
            <Card className="glass-card p-4 border-0 mb-4 h-100">
              <h5 className="text-primary-glow mb-4 uppercase-tracking fw-bold border-bottom border-white border-opacity-10 pb-2">
                Tóm tắt dự án
              </h5>
              <h4 className="fw-bold mb-3">{job?.title}</h4>
              
              <div className="d-grid gap-3 mb-4">
                <div className="d-flex align-items-center gap-2">
                  <div className="bg-primary bg-opacity-10 p-2 rounded text-primary"><DollarSign size={18}/></div>
                  <div>
                    <p className="x-small text-muted mb-0">Ngân sách tối đa</p>
                    <span className="fw-bold text-success">{job?.salary?.toLocaleString()}đ</span>
                  </div>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <div className="bg-info bg-opacity-10 p-2 rounded text-info"><Clock size={18}/></div>
                  <div>
                    <p className="x-small text-muted mb-0">Hạn nộp hồ sơ</p>
                    <span className="fw-bold">{new Date(job?.deadline).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded bg-white bg-opacity-5 border border-white border-opacity-10">
                <h6 className="small fw-bold mb-2 d-flex align-items-center gap-2 text-warning">
                   <Info size={14}/> Lưu ý cho bạn
                </h6>
                <p className="x-small text-white-50 mb-0 italic">
                  Bạn nên đưa ra mức giá cạnh tranh và lời nhắn ấn tượng để tăng cơ hội được chọn.
                </p>
              </div>
            </Card>
          </Col>

          {/* CỘT PHẢI: FORM ỨNG TUYỂN */}
          <Col lg={8}>
            <div className="glass-card p-4 p-md-5 border-0 shadow-lg">
              <h2 className="fw-bold mb-2">Gửi đề xuất <span className="text-primary-glow">Ứng tuyển</span></h2>
              <p className="text-muted mb-5 small">Đề xuất mức giá và kế hoạch thực hiện của bạn cho dự án này.</p>

              <Form onSubmit={handleSubmit}>
                <Row className="g-4">
                  {/* GIÁ THẦU */}
                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="small-label fw-bold">MỨC GIÁ BẠN ĐỀ XUẤT (VND)</Form.Label>
                      <InputGroup className="bg-dark-input rounded overflow-hidden border-0">
                        <InputGroup.Text className="bg-transparent border-0 text-primary"><DollarSign size={18}/></InputGroup.Text>
                        <Form.Control 
                          type="number" name="bidAmount" required 
                          className="bg-transparent text-white border-0 py-2 shadow-none"
                          placeholder="VD: 4500000"
                          value={formData.bidAmount} onChange={handleChange}
                        />
                      </InputGroup>
                      <small className="text-white-50 x-small mt-1 d-block italic">* Mức giá thực nhận sau khi trừ phí sàn.</small>
                    </Form.Group>
                  </Col>

                  {/* THỜI GIAN DỰ KIẾN */}
                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="small-label fw-bold">DỰ KIẾN HOÀN THÀNH (NGÀY)</Form.Label>
                      <InputGroup className="bg-dark-input rounded overflow-hidden border-0">
                        <InputGroup.Text className="bg-transparent border-0 text-info"><Clock size={18}/></InputGroup.Text>
                        <Form.Control 
                          type="number" name="expectedDays" required 
                          className="bg-transparent text-white border-0 py-2 shadow-none"
                          placeholder="VD: 5"
                          value={formData.expectedDays} onChange={handleChange}
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>

                  {/* LỜI NHẮN / COVER LETTER */}
                  <Col md={12}>
                    <Form.Group className="mb-4">
                      <Form.Label className="small-label fw-bold d-flex align-items-center gap-2">
                        <FileText size={16} className="text-primary"/> THƯ GIỚI THIỆU / KẾ HOẠCH
                      </Form.Label>
                      <Form.Control 
                        as="textarea" rows={6} name="message" required
                        className="bg-dark-input text-white border-0 py-3 shadow-none"
                        placeholder="Hãy mô tả tại sao bạn phù hợp với dự án này và bạn định làm nó như thế nào..."
                        value={formData.message} onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="escrow-notice glass-card p-3 d-flex align-items-center gap-3 mb-5 border-dashed-blue">
                   <CheckCircle size={30} className="text-success" />
                   <div className="x-small text-white-50">
                      Khi doanh nghiệp chấp nhận đề xuất, một <strong>hợp đồng điện tử</strong> sẽ được khởi tạo và số tiền sẽ được sàn bảo vệ cho đến khi bạn hoàn thành công việc.
                   </div>
                </div>

                <div className="text-end">
                   <Button 
                    type="submit" variant="primary" 
                    className="px-5 py-3 fw-bold shadow-glow d-flex align-items-center gap-2 ms-auto"
                    disabled={isSubmitting}
                   >
                     {isSubmitting ? <Loader2 className="spinner" /> : <Send size={20}/>}
                     XÁC NHẬN GỬI ỨNG TUYỂN
                   </Button>
                </div>
              </Form>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ApplyJob;