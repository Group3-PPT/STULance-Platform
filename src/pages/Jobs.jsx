import { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Badge, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Search, Globe, MapPin, Bookmark, Send, Laptop, ShieldCheck, Zap, Loader2, Sparkles, Building2 } from 'lucide-react';
import { jobService } from '../services/jobservice';
import { savedItemsService } from '../services/saveditemsservice';
import { recommendationService } from '../services/recommendationservice';
import { enterpriseService } from '../services/enterprise.service';
import { unwrapList } from '../services/responseUtils';
import '../CSS/Jobs.css';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [enterpriseInfo, setEnterpriseInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingEnterprise, setLoadingEnterprise] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [actionLoading, setActionLoading] = useState(null);
  const [aiMatching, setAiMatching] = useState(false);

  const token = localStorage.getItem('accessToken');
  const userRole = localStorage.getItem('userRole');
  const isStudent = userRole === 'STUDENT';

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const res = await jobService.getAllPublicJobs();

        if (res.success) {
          const data = unwrapList(res);
          setJobs(data);
          if (data.length > 0) setSelectedJob(data[0]);
        }

        if (token && isStudent) {
          const savedRes = await savedItemsService.getMySavedJobs();
          if (savedRes.success) {
            setSavedJobIds(new Set(unwrapList(savedRes).map(item => item.jobId)));
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

  useEffect(() => {
    if (selectedJob?.enterpriseId) {
      fetchEnterpriseInfo(selectedJob.enterpriseId);
    } else {
      setEnterpriseInfo(null);
    }
  }, [selectedJob]);

  const fetchEnterpriseInfo = async (enterpriseId) => {
    setLoadingEnterprise(true);
    try {
      const res = await enterpriseService.getPublicProfile(enterpriseId);
      if (res.success && res.data) {
        setEnterpriseInfo(res.data);
      } else {
        setEnterpriseInfo(null);
      }
    } catch (err) {
      console.error("Lỗi tải thông tin DN:", err);
      setEnterpriseInfo(null);
    } finally {
      setLoadingEnterprise(false);
    }
  };

  const filteredJobs = jobs.filter(job =>
    job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.enterpriseName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleSave = async (jobId) => {
    if (!token || !isStudent) return;
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

  const handleAIMatching = async () => {
    if (!token) {
      alert("Vui lòng đăng nhập để sử dụng AI Matching!");
      return;
    }
    setAiMatching(true);
    try {
      const res = await recommendationService.getMyRecommendations();
      if (res.success && res.data?.jobs) {
        setJobs(res.data.jobs);
        if (res.data.jobs.length > 0) setSelectedJob(res.data.jobs[0]);
        alert(`AI đã tìm được ${res.data.jobs.length} việc làm phù hợp với bạn!`);
      }
    } catch (err) {
      alert("Lỗi AI Matching: " + (err.response?.data?.message || "Không thể phân tích"));
    } finally {
      setAiMatching(false);
    }
  };

  const getJobPosterName = (job) => {
    if (enterpriseInfo && job.enterpriseId === enterpriseInfo.enterpriseId) {
      return enterpriseInfo.companyName || job.enterpriseName || 'Doanh nghiệp';
    }
    return job.enterpriseName || 'Doanh nghiệp';
  };

  const getJobPosterLogo = (job) => {
    if (enterpriseInfo && job.enterpriseId === enterpriseInfo.enterpriseId && enterpriseInfo.logoUrl) {
      return enterpriseInfo.logoUrl;
    }
    if (job.enterpriseLogoUrl) return job.enterpriseLogoUrl;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(job.enterpriseName || 'D')}&background=0d6efd&color=fff&size=48`;
  };

  const getJobPosterEmail = (job) => {
    if (enterpriseInfo && job.enterpriseId === enterpriseInfo.enterpriseId) {
      return enterpriseInfo.email || '';
    }
    return job.enterpriseEmail || '';
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
                <Search size={18} className="hub-search-icon text-white-50" style={{position:'absolute', left:'15px', top:'13px'}}/>
                <Form.Control
                  placeholder="Tìm kiếm dự án, công nghệ, doanh nghiệp..."
                  className="hub-input ps-5 bg-dark-input text-white border-0"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </Col>
            <Col md={3}>
                <Button variant="primary" className="w-100 fw-bold h-100 shadow-glow" onClick={handleAIMatching} disabled={aiMatching}>
                   {aiMatching ? <Loader2 className="spinner me-2" size={16}/> : <Sparkles size={16} className="me-2"/>}
                   {aiMatching ? 'ĐANG PHÂN TÍCH...' : 'AI MATCHING'}
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
                    <div className="d-flex gap-3">
                        <img
                            src={getJobPosterLogo(job)}
                            alt={job.enterpriseName}
                            loading="lazy"
                            style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid rgba(255,255,255,0.1)' }}
                            onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(job.enterpriseName || 'D')}&background=0d6efd&color=fff&size=40`; }}
                        />
                        <div className="flex-fill">
                            <div className="d-flex justify-content-between mb-1">
                                <Badge bg="primary" className="x-small-badge opacity-75">{job.jobType}</Badge>
                                <div className="d-flex align-items-center gap-2">
                                    <span className="x-small text-white opacity-50">{new Date(job.createdAt).toLocaleDateString()}</span>
                                    {isStudent && (
                                        <button
                                            className="border-0 bg-transparent p-0 d-flex align-items-center justify-content-center"
                                            style={{ width: 20, height: 20, cursor: 'pointer' }}
                                            onClick={(e) => { e.stopPropagation(); handleToggleSave(job.jobId); }}
                                            disabled={actionLoading === job.jobId}
                                            title={savedJobIds.has(job.jobId) ? 'Bỏ lưu' : 'Lưu việc làm'}
                                        >
                                            {actionLoading === job.jobId ? (
                                                <Spinner animation="border" size="sm" style={{width: 12, height: 12}} />
                                            ) : (
                                                <Bookmark 
                                                    size={14} 
                                                    fill={savedJobIds.has(job.jobId) ? '#f59e0b' : 'none'} 
                                                    color={savedJobIds.has(job.jobId) ? '#f59e0b' : 'rgba(255,255,255,0.4)'}
                                                />
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                            <h6 className="fw-bold text-white mb-1 line-clamp-1" style={{fontSize: '0.85rem'}}>{job.title}</h6>
                            <div className="fw-bold mb-1" style={{fontSize: '0.8rem', color: '#22c55e'}}>
                                {job.salary > 0 ? `${job.salary.toLocaleString()} VND` : "Thỏa thuận"}
                            </div>
                            <div className="d-flex align-items-center gap-1">
                                <Building2 size={10} style={{color: 'rgba(255,255,255,0.4)'}}/>
                                <span style={{fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)'}}>{getJobPosterName(job)}</span>
                            </div>
                        </div>
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
                            {isStudent && (
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
                            )}
                            {isStudent && (
                                <Button as={Link} to={`/jobs/apply/${selectedJob.jobId}`} className="hub-btn-pink px-4 py-2 fw-bold shadow-glow">
                                    <Send size={18} className="me-2"/> ỨNG TUYỂN NGAY
                                </Button>
                            )}
                        </div>
                    </div>

                    <Row className="mb-5 g-4">
                        <Col md={4}>
                            <div className="p-3 rounded-4 border border-white border-opacity-10" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                <p className="x-small text-white-50 mb-1 uppercase-tracking">NGÂN SÁCH</p>
                                <h4 className="text-success fw-bold mb-0">{selectedJob.salary?.toLocaleString() || "0"} <small className="fs-6">VND</small></h4>
                            </div>
                        </Col>
                        <Col md={4}>
                            <div className="p-3 rounded-4 border border-white border-opacity-10" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                <p className="x-small text-white-50 mb-1 uppercase-tracking">SỐ LƯỢNG</p>
                                <h4 className="text-white fw-bold mb-0">{selectedJob.quantity} <small className="fs-6 text-white-50">Ứng viên</small></h4>
                            </div>
                        </Col>
                        <Col md={4}>
                            <div className="p-3 rounded-4 border border-white border-opacity-10" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                <p className="x-small text-white-50 mb-1 uppercase-tracking">HẠN CHÓT</p>
                                <h4 className="text-warning fw-bold mb-0">{new Date(selectedJob.deadline).toLocaleDateString('vi-VN')}</h4>
                            </div>
                        </Col>
                    </Row>

                    {/* POSTER INFO - NGƯỜI ĐĂNG BÀI */}
                    <div className="p-4 rounded-4 mb-4" style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.15)' }}>
                        <p className="x-small text-primary fw-bold mb-3 uppercase-tracking">
                            <Building2 size={12} className="me-1"/> NGƯỜI ĐĂNG BÀI
                        </p>
                        <div className="d-flex align-items-center gap-3">
                            {loadingEnterprise ? (
                                <Spinner animation="border" size="sm" variant="primary" />
                            ) : (
                                <img
                                    src={getJobPosterLogo(selectedJob)}
                                    alt={getJobPosterName(selectedJob)}
                                    loading="lazy"
                                    style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(59,130,246,0.3)' }}
                                    onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(getJobPosterName(selectedJob))}&background=0d6efd&color=fff&size=56`; }}
                                />
                            )}
                            <div className="flex-fill">
                                <h6 className="fw-bold text-white mb-0">{getJobPosterName(selectedJob)}</h6>
                                {enterpriseInfo?.industry && (
                                    <p className="x-small text-primary mb-0">{enterpriseInfo.industry}</p>
                                )}
                                {getJobPosterEmail(selectedJob) && (
                                    <p className="x-small text-white-50 mb-0 mt-1">{getJobPosterEmail(selectedJob)}</p>
                                )}
                                {enterpriseInfo?.location && (
                                    <p className="x-small text-white-50 mb-0"><MapPin size={10} className="me-1"/>{enterpriseInfo.location}</p>
                                )}
                            </div>
                            {selectedJob.enterpriseId && (
                                <Button as={Link} to={`/businesses/business-profile/${selectedJob.enterpriseId}`} variant="outline-primary" size="sm" className="fw-bold px-3">
                                    Xem hồ sơ
                                </Button>
                            )}
                        </div>
                    </div>

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
