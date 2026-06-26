import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Badge, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Search, Globe, MapPin, Bookmark, Send, Laptop, ShieldCheck, Zap, Loader2 } from 'lucide-react';
import { jobService } from '../services/jobservice'; 
import { savedItemsService } from '../services/saveditemsservice';
import '../CSS/Jobs.css'; 

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [actionLoading, setActionLoading] = useState(null);

  const token = localStorage.getItem('accessToken');

  // 1. Tải danh sách công việc công khai
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const res = await jobService.getAllPublicJobs();

        if (res.success) {
          const data = res.data || [];
          setJobs(data);
          if (data.length > 0) setSelectedJob(data[0]);
        }

        if (token) {
          const savedRes = await savedItemsService.getMySavedJobs();
          if (savedRes.success) {
            setSavedJobIds(new Set(savedRes.data.map(item => item.jobId)));
          }
        }
      } catch (err) {
        console.error("Lỗi lấy dữ liệu:", err);
        setError("Không thể tải danh sách việc làm.");
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter(job => 
    job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.enterpriseName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleSave = async (jobId) => {
    if (!token) return;
    const isSaved = savedJobIds.has(jobId);
    setActionLoading(jobId);
    try {
      if (isSaved) {
        await savedItemsService.unsaveJob(jobId);
        const newIds = new Set(savedJobIds);
        newIds.delete(jobId);
        setSavedJobIds(newIds);
      } else {
        await savedItemsService.saveJob(jobId);
        const newIds = new Set(savedJobIds);
        newIds.add(jobId);
        setSavedJobIds(newIds);
      }
    } catch (err) {
      if (err.response?.status === 403) {
        alert("Server từ chối: Tài khoản của bạn có thể đang bị khóa hoặc chưa đủ quyền xác minh.");
      } else {
        alert("Lỗi kết nối server.");
      }
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return (
    <div className="vh-100 d-flex justify-content-center align-items-center bg-dark text-white">
      <div className="text-center">
        <Loader2 className="spinner text-primary mb-3" size={40} />
        <p className="uppercase-tracking small opacity-75">Đang kết nối sàn STULance...</p>
      </div>
    </div>
  );

  return (
    <div className="jobs-hub-wrapper animate-fade-in text-white py-4">
      <Container fluid className="px-lg-5">
        
        {/* --- THANH FILTER --- */}
        <div className="hub-top-filter glass-card p-3 mb-4 border-0">
          <Row className="g-2 align-items-center">
            <Col md={9}>
              <div className="hub-search-wrapper position-relative">
                <Search size={18} className="hub-search-icon text-muted" style={{position:'absolute', left:'15px', top:'13px'}}/>
                <Form.Control 
                  placeholder="Tìm kiếm dự án, công nghệ, doanh nghiệp..." 
                  className="hub-input ps-5 bg-dark-input text-white border-0" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </Col>
            <Col md={3}>
                <Button variant="primary" className="w-100 fw-bold h-100 shadow-glow">
                   <Zap size={16} className="me-2"/> AI MATCHING
                </Button>
            </Col>
          </Row>
        </div>

        {/* --- BỐ CỤC MASTER-DETAIL --- */}
        <div className="hub-main-layout d-flex gap-4">
          
          {/* CỘT TRÁI: DANH SÁCH TÓM TẮT (SIDEBAR) */}
          <div className="hub-sidebar-list flex-shrink-0" style={{width: '400px'}}>
            <div className="sidebar-header-text mb-3 opacity-50 x-small uppercase-tracking">
                TÌM THẤY {filteredJobs.length} KẾT QUẢ
            </div>
            <div className="sidebar-scroll-area overflow-auto" style={{maxHeight: 'calc(100vh - 250px)'}}>
                {filteredJobs.map((job) => (
                <div 
                    key={job.jobId} 
                    className={`hub-sidebar-item glass-card p-3 mb-2 border-0 pointer transition-all ${selectedJob?.jobId === job.jobId ? 'active-job' : ''}`}
                    onClick={() => setSelectedJob(job)}
                >
                    <div className="d-flex justify-content-between mb-2">
                        <Badge bg="primary" className="x-small-badge opacity-75">{job.jobType}</Badge>
                        <span className="x-small text-white opacity-50">{new Date(job.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h6 className="fw-bold text-white mb-2 line-clamp-1">{job.title}</h6>
                    <div className="small text-primary-glow fw-bold mb-2">
                        {job.salary > 0 ? `${job.salary.toLocaleString()} VND` : "Thỏa thuận"}
                    </div>
                    <div className="x-small text-white opacity-50 d-flex align-items-center gap-1">
                        <MapPin size={12}/> {job.enterpriseName || "Doanh nghiệp xác thực"}
                    </div>
                </div>
                ))}
            </div>
          </div>

          {/* CỘT PHẢI: CHI TIẾT CÔNG VIỆC */}
          <div className="hub-detail-view flex-grow-1 glass-card p-5 border-0 shadow-lg position-sticky" style={{top: '100px', height: 'fit-content'}}>
            {selectedJob ? (
                <div className="animate-fade-in">
                    <div className="d-flex justify-content-between align-items-start mb-4">
                        <div>
                            <h2 className="fw-bold text-white mb-2">{selectedJob.title}</h2>
                            <div className="d-flex gap-3 text-info x-small fw-bold uppercase-tracking">
                                <span className="d-flex align-items-center gap-1"><Laptop size={14}/> {selectedJob.jobType}</span>
                                <span className="d-flex align-items-center gap-1"><ShieldCheck size={14}/> DOANH NGHIỆP UY TÍN</span>
                            </div>
                        </div>
                        <div className="d-flex gap-2">
                            <Button
                              variant="outline-light"
                              className="border-white border-opacity-10 p-2 rounded-3 position-relative"
                              onClick={() => handleToggleSave(selectedJob.jobId)}
                              disabled={actionLoading === selectedJob.jobId}
                            >
                              {actionLoading === selectedJob.jobId ? (
                                <Spinner animation="border" size="sm" />
                              ) : (
                                <Bookmark size={20} fill={savedJobIds.has(selectedJob.jobId) ? 'currentColor' : 'none'} />
                              )}
                            </Button>
                            {/* ĐIỀU HƯỚNG SANG TRANG APPLY */}
                            <Button as={Link} to={`/jobs/apply/${selectedJob.jobId}`} className="hub-btn-pink px-4 py-2 fw-bold shadow-glow">
                                <Send size={18} className="me-2"/> ỨNG TUYỂN NGAY
                            </Button>
                        </div>
                    </div>

                    <Row className="mb-5 g-4">
                        <Col md={4}>
                            <div className="p-3 rounded-4 bg-white bg-opacity-5 border border-white border-opacity-10">
                                <p className="x-small text-muted mb-1 uppercase-tracking">NGÂN SÁCH</p>
                                <h4 className="text-success fw-bold mb-0">{selectedJob.salary?.toLocaleString() || "0"} <small className="fs-6">VND</small></h4>
                            </div>
                        </Col>
                        <Col md={4}>
                            <div className="p-3 rounded-4 bg-white bg-opacity-5 border border-white border-opacity-10">
                                <p className="x-small text-muted mb-1 uppercase-tracking">SỐ LƯỢNG</p>
                                <h4 className="text-white fw-bold mb-0">{selectedJob.quantity} <small className="fs-6 text-muted">Ứng viên</small></h4>
                            </div>
                        </Col>
                        <Col md={4}>
                            <div className="p-3 rounded-4 bg-white bg-opacity-5 border border-white border-opacity-10">
                                <p className="x-small text-muted mb-1 uppercase-tracking">HẠN CHÓT</p>
                                <h4 className="text-warning fw-bold mb-0">{new Date(selectedJob.deadline).toLocaleDateString('vi-VN')}</h4>
                            </div>
                        </Col>
                    </Row>

                    <div className="job-content-section">
                        <div className="mb-4">
                            <h6 className="text-primary-glow fw-bold mb-2 uppercase-tracking">MÔ TẢ CÔNG VIỆC</h6>
                            <p className="text-white opacity-75" style={{whiteSpace: 'pre-line'}}>{selectedJob.description}</p>
                        </div>
                        <div className="mb-4">
                            <h6 className="text-primary-glow fw-bold mb-2 uppercase-tracking">YÊU CẦU ỨNG VIÊN</h6>
                            <p className="text-white opacity-75" style={{whiteSpace: 'pre-line'}}>{selectedJob.requirements || "Trao đổi trực tiếp khi phỏng vấn."}</p>
                        </div>
                        <div>
                            <h6 className="text-primary-glow fw-bold mb-2 uppercase-tracking">QUYỀN LỢI</h6>
                            <p className="text-white opacity-75" style={{whiteSpace: 'pre-line'}}>{selectedJob.benefits || "Môi trường làm việc năng động, hỗ trợ thực tập."}</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="vh-50 d-flex flex-column justify-content-center align-items-center opacity-50">
                    <Search size={48} className="mb-3"/>
                    <p>Chọn một công việc bên trái để xem chi tiết</p>
                </div>
            )}
          </div>

        </div>
      </Container>
    </div>
  );
};

export default Jobs;