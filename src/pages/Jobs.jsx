import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Badge, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Search, Globe, MapPin, Bookmark, Send, Laptop, ShieldCheck, Zap } from 'lucide-react';
import { jobService } from '../services/asd'; // Import service
import '../CSS/Jobs.css'; 

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const response = await jobService.getAllJobs();
        // Dữ liệu từ API Azure thường bọc trong response.data hoặc response.data.data
        const data = response.data?.$values || response.data || [];
        setJobs(data);
        
        // Tự động chọn công việc đầu tiên nếu có dữ liệu
        if (data.length > 0) {
          setSelectedJob(data[0]);
        }
      } catch (err) {
        console.error("Lỗi lấy dữ liệu dự án:", err);
        setError("Không thể tải dữ liệu từ máy chủ StudentLance.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Giao diện khi đang tải
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{height: '80vh'}}>
        <div className="text-center">
            <Spinner animation="border" variant="primary" />
            <p className="text-white mt-3">Đang kết nối hệ thống StudentLance...</p>
        </div>
      </div>
    );
  }

  // Giao diện khi lỗi API
  if (error) return <div className="text-danger text-center py-5">{error}</div>;

  return (
    <div className="jobs-hub-wrapper animate-fade-in">
      <Container fluid className="px-lg-5">
        
        {/* --- THANH FILTER NGANG --- */}
        <div className="hub-top-filter glass-card p-3 mb-4">
          <Row className="g-2 align-items-center">
            <Col md={2}><Form.Select className="hub-select"><option>Loại công việc</option></Form.Select></Col>
            <Col md={2}><Form.Select className="hub-select"><option>Mức lương</option></Form.Select></Col>
            <Col md={5}>
              <div className="hub-search-wrapper">
                <Search size={18} className="hub-search-icon" />
                <Form.Control placeholder="Tìm kiếm dự án thực tế..." className="hub-input" />
              </div>
            </Col>
            <Col md={1}><Button variant="primary" className="w-100 fw-bold h-100">Tìm</Button></Col>
            <Col md={2}>
                <Button variant="outline-primary" className="w-100 fw-bold h-100">AI Match</Button>
            </Col>
          </Row>
        </div>

        {/* --- BỐ CỤC MASTER-DETAIL --- */}
        <div className="hub-main-layout">
          
          {/* CỘT TRÁI: SIDEBAR LIST */}
          <div className="hub-sidebar-list">
            <div className="sidebar-header-text">Tìm thấy {jobs.length} dự án trên Azure</div>
            {jobs.map((job) => (
              <div 
                key={job.id || job.projectId} 
                className={`hub-sidebar-item ${selectedJob?.id === job.id ? 'active' : ''}`}
                onClick={() => setSelectedJob(job)}
              >
                <Badge bg="warning" text="dark" className="hub-badge-new mb-2">NEW</Badge>
                <span className="hub-sidebar-title">{job.title || job.projectName}</span>
                <div className="small mb-1 text-info"><Globe size={14} className="me-1"/> {job.remote || "Linh hoạt"}</div>
                <div className="hub-sidebar-salary">
                    {job.budget?.toLocaleString() || job.price} 
                    <small style={{fontSize: '11px'}}> VND</small>
                </div>
                <div className="hub-sidebar-meta">
                  <span><MapPin size={12}/> {job.location || "Toàn quốc"}</span>
                </div>
              </div>
            ))}
          </div>

          {/* CỘT PHẢI: DETAIL VIEW */}
          <div className="hub-detail-view p-4">
            {selectedJob ? (
                <div className="animate-fade-in" key={selectedJob.id}>
                    <h2 className="hub-detail-title mb-4">{selectedJob.title || selectedJob.projectName}</h2>
                    
                    <div className="d-flex gap-4 mb-4 text-info small">
                        <span className="d-flex align-items-center gap-1"><Laptop size={16}/> {selectedJob.remote || "Remote OK"}</span>
                        <span className="d-flex align-items-center gap-1"><ShieldCheck size={16}/> Doanh nghiệp xác thực</span>
                    </div>

                    <Row className="mb-4 align-items-end">
                        <Col md={7}>
                            <div className="hub-detail-price-box">
                                {selectedJob.budget?.toLocaleString() || selectedJob.price} 
                                <small style={{fontSize: '14px'}}> VND</small>
                            </div>
                            <div className="text-muted small mt-1">
                                <MapPin size={14} className="me-1"/> {selectedJob.location || "Việt Nam"}
                            </div>
                        </Col>
                        <Col md={5} className="text-end">
                            <div className="d-flex gap-2 justify-content-end">
                                <Button variant="light" style={{padding: '12px 20px', borderRadius: '10px'}}><Bookmark size={18}/></Button>
                                <Button as={Link} to="/JobPayment" className="hub-btn-pink rounded-pill shadow-glow">
                                    <Send size={18} className="me-2"/> GỬI BÁO GIÁ
                                </Button>
                            </div>
                        </Col>
                    </Row>

                    <div className="hub-info-table">
                        <div className="hub-info-row">
                            <div className="hub-info-label">Chi tiết dự án</div>
                            <div className="hub-info-value">{selectedJob.description || selectedJob.content}</div>
                        </div>
                        <div className="hub-info-row">
                            <div className="hub-info-label">Yêu cầu</div>
                            <div className="hub-info-value">{selectedJob.requirement || "Liên hệ để biết thêm chi tiết"}</div>
                        </div>
                        <div className="hub-info-row">
                            <div className="hub-info-label">Trạng thái</div>
                            <div className="hub-info-value">
                                <Badge bg="success">Đang nhận hồ sơ</Badge>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 p-4 rounded-4 bg-primary-subtle border border-primary text-primary small fw-bold">
                        <Zap size={16} className="me-2" /> Hệ thống gợi ý: Dự án này khớp với kỹ năng của bạn.
                    </div>
                </div>
            ) : (
                <div className="text-center text-muted py-5">Vui lòng chọn một dự án để xem chi tiết.</div>
            )}
          </div>

        </div>
      </Container>
    </div>
  );
};

export default Jobs;