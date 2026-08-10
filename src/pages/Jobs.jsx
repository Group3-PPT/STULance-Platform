import { useState, useEffect, useCallback, useRef } from 'react';
import { Container, Row, Col, Form, Button, Badge, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Search, Globe, MapPin, Bookmark, Send, Laptop, ShieldCheck, Zap, Loader2, Sparkles, Building2, Filter, X, ShieldAlert } from 'lucide-react';
import { jobService } from '../services/jobservice';
import { savedItemsService } from '../services/saveditemsservice';
import { recommendationService } from '../services/recommendationservice';
import { enterpriseService } from '../services/enterprise.service';
import PaginationBar from '../components/PaginationBar';
import ReportModal from '../components/ReportModal';
import '../CSS/Jobs.css';

const JOB_TYPES = ['Tất cả', 'Part-time', 'Full-time', 'Freelance', 'Thực tập'];
const SALARY_RANGES = [
  { label: 'Tất cả', min: 0, max: Infinity },
  { label: 'Dưới 5 triệu', min: 0, max: 5000000 },
  { label: '5 - 10 triệu', min: 5000000, max: 10000000 },
  { label: '10 - 20 triệu', min: 10000000, max: 20000000 },
  { label: 'Trên 20 triệu', min: 20000000, max: Infinity },
];

const Jobs = () => {
  // ============================================================
  // STATE
  // ============================================================

  // Danh sách job hiển thị trong sidebar
  const [jobs, setJobs] = useState([]);

  // Job đang được chọn xem chi tiết (bên phải)
  const [selectedJob, setSelectedJob] = useState(null);

  // Thông tin doanh nghiệp đăng bài (fetch riêng khi chọn job)
  const [enterpriseInfo, setEnterpriseInfo] = useState(null);

  // Loading chung (trang đang tải)
  const [loading, setLoading] = useState(true);

  // Loading thông tin doanh nghiệp (khi chọn job mới)
  const [loadingEnterprise, setLoadingEnterprise] = useState(false);

  // Từ khóa tìm kiếm
  const [searchTerm, setSearchTerm] = useState("");

  // Thông báo lỗi
  const [error, setError] = useState(null);

  // Set các job đã lưu (đánh dấu bookmark)
  const [savedJobIds, setSavedJobIds] = useState(new Set());

  // Job đang thực hiện thao tác lưu/bỏ lưu (hiện spinner)
  const [actionLoading, setActionLoading] = useState(null);

  // Hiện/ẩn modal tố cáo
  const [showReportModal, setShowReportModal] = useState(false);

  // Đang chạy AI Matching
  const [aiMatching, setAiMatching] = useState(false);

  // ID người dùng hiện tại
  const currentUserId = localStorage.getItem('userId');

  // Kiểm tra: job đang chọn có phải của mình không (không cho tố cáo)
  const isOwnJob = selectedJob && String(selectedJob.enterpriseId) === String(currentUserId);

  // Bộ lọc loại job (Part-time, Full-time, Freelance, Thực tập)
  const [selectedJobType, setSelectedJobType] = useState('Tất cả');

  // Bộ lọc khoảng lương (index trong SALARY_RANGES)
  const [selectedSalaryRange, setSelectedSalaryRange] = useState(0);

  // Ref lưu job đang chọn (dùng để so sánh khi dữ liệu mới加载)
  const selectedJobRef = useRef(null);

  // ============================================================
  // PHÂN TRANG
  // ============================================================

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 12;

  // ============================================================
  // AUTH
  // ============================================================

  const token = localStorage.getItem('accessToken');
  const userRole = localStorage.getItem('userRole');

  // Kiểm tra người dùng có phải sinh viên không
  const isStudent = userRole === 'STUDENT';

  // ============================================================
  // HÀM TẢI DANH SÁCH JOB (phân trang + bộ lọc)
  // ============================================================
  const fetchJobs = useCallback(async (page, keyword) => {
    // Gán mặc định nếu không truyền
    if (!page) page = 1;
    if (!keyword) keyword = '';

    try {
      setLoading(true);

      // Gọi API lấy danh sách job công khai
      const res = await jobService.getAllPublicJobs({
        page: page,
        pageSize: pageSize,
        keyword: keyword || undefined
      });

      // Kiểm tra response thành công
      if (res.success && res.data) {
        const data = res.data;

        // Lấy mảng job từ response
        let jobList = data.items || [];

        // ============================================================
        // BỘ LỌC LOẠI JOB (nếu không phải "Tất cả")
        // ============================================================
        if (selectedJobType !== 'Tất cả') {
          jobList = jobList.filter(function (j) {
            return j.jobType === selectedJobType;
          });
        }

        // ============================================================
        // BỘ LỌC LƯƠNG
        // ============================================================
        var salaryRange = SALARY_RANGES[selectedSalaryRange];

        // Nếu khoảng lương có giới hạn (không phải "Tất cả")
        if (salaryRange.min > 0 || salaryRange.max < Infinity) {
          jobList = jobList.filter(function (j) {
            return j.salary >= salaryRange.min && j.salary < salaryRange.max;
          });
        }

        // Lưu danh sách job đã lọc
        setJobs(jobList);

        // Lưu thông tin phân trang
        setTotalPages(data.totalPages || 1);
        setTotalItems(jobList.length);
        setCurrentPage(data.page || 1);

        // ============================================================
        // QUẢN LÝ JOB ĐANG CHỌN
        // ============================================================
        if (jobList.length > 0) {
          // Kiểm tra job đang chọn có còn trong danh sách mới không
          var currentStillExists = false;

          if (selectedJobRef.current) {
            // Duyệt danh sách để tìm job cũ
            for (var i = 0; i < jobList.length; i++) {
              if (jobList[i].jobId === selectedJobRef.current.jobId) {
                currentStillExists = true;
                break;
              }
            }
          }

          // Nếu job cũ không còn → chọn job đầu tiên
          if (!currentStillExists) {
            setSelectedJob(jobList[0]);
            selectedJobRef.current = jobList[0];
          }
        } else {
          // Không có job nào → bỏ chọn
          setSelectedJob(null);
          selectedJobRef.current = null;
        }
      }

      // ============================================================
      // TẢI JOB ĐÃ LƯ (nếu là sinh viên đã đăng nhập)
      // ============================================================
      if (token && isStudent) {
        var savedRes = await savedItemsService.getMySavedJobs();

        if (savedRes.success) {
          var savedData = savedRes.data;
          var savedList = [];

          // Xử lý nhiều dạng response
          if (savedData && savedData.items) {
            savedList = savedData.items;
          } else if (Array.isArray(savedData)) {
            savedList = savedData;
          }

          // Tạo Set chứa các jobId đã lưu
          var newSavedIds = new Set();
          for (var j = 0; j < savedList.length; j++) {
            newSavedIds.add(savedList[j].jobId);
          }
          setSavedJobIds(newSavedIds);
        }
      }

    } catch (err) {
      console.error("Lỗi lấy dữ liệu:", err);
      setError("Không thể tải danh sách việc làm.");
    } finally {
      setLoading(false);
    }
  }, [token, isStudent, selectedJobType, selectedSalaryRange]);

  // ============================================================
  // EFFECT: Tải danh sách khi trang loads
  // ============================================================
  useEffect(function () {
    fetchJobs(1);
  }, []);

  // ============================================================
  // EFFECT: Khi chọn job mới → tải thông tin doanh nghiệp
  // ============================================================
  useEffect(function () {
    if (selectedJob && selectedJob.enterpriseId) {
      fetchEnterpriseInfo(selectedJob.enterpriseId);
    } else {
      setEnterpriseInfo(null);
    }
  }, [selectedJob]);

  // ============================================================
  // HÀM TẢI THÔNG TIN DOANH NGHIỆP
  // ============================================================
  const fetchEnterpriseInfo = async function (enterpriseId) {
    setLoadingEnterprise(true);
    try {
      var res = await enterpriseService.getPublicProfile(enterpriseId);

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

  // ============================================================
  // HÀM XỬ LÝ TÌM KIẾM
  // ============================================================
  const handleSearch = function () {
    setCurrentPage(1);
    fetchJobs(1, searchTerm);
  };

  // ============================================================
  // HÀM XỬ LÝ CHUYỂN TRANG
  // ============================================================
  const handlePageChange = function (page) {
    fetchJobs(page, searchTerm);
  };

  // ============================================================
  // HÀM LƯU / BỎ LƯU JOB
  // ============================================================
  const handleToggleSave = async function (jobId) {
    // Chỉ sinh viên mới được lưu
    if (!token || !isStudent) return;

    var isSaved = savedJobIds.has(jobId);
    setActionLoading(jobId);

    try {
      if (isSaved) {
        // ĐÃ LƯ → BỎ LƯ
        await savedItemsService.unsaveJob(jobId);

        var newIds = new Set(savedJobIds);
        newIds.delete(jobId);
        setSavedJobIds(newIds);

      } else {
        // CHƯA LƯ → LƯ
        await savedItemsService.saveJob(jobId);

        var newIds2 = new Set(savedJobIds);
        newIds2.add(jobId);
        setSavedJobIds(newIds2);
      }
    } catch (err) {
      if (err.response && err.response.status === 403) {
        alert("Server từ chối: Tài khoản của bạn có thể đang bị khóa hoặc chưa đủ quyền xác minh.");
      } else {
        alert("Lỗi kết nối server.");
      }
    } finally {
      setActionLoading(null);
    }
  };

  // ============================================================
  // HÀM AI MATCHING
  // ============================================================
  const handleAIMatching = async function () {
    // Kiểm tra đăng nhập
    if (!token) {
      alert("Vui lòng đăng nhập để sử dụng AI Matching!");
      return;
    }

    setAiMatching(true);

    try {
      var res = await recommendationService.getMyRecommendations();

      if (res.success && res.data && res.data.jobs) {
        setJobs(res.data.jobs);

        // Chọn job đầu tiên nếu có kết quả
        if (res.data.jobs.length > 0) {
          setSelectedJob(res.data.jobs[0]);
          selectedJobRef.current = res.data.jobs[0];
        }

        alert("AI đã tìm được " + res.data.jobs.length + " việc làm phù hợp với bạn!");
      }
    } catch (err) {
      var msg = "Không thể phân tích";
      if (err.response && err.response.data && err.response.data.message) {
        msg = err.response.data.message;
      }
      alert("Lỗi AI Matching: " + msg);
    } finally {
      setAiMatching(false);
    }
  };

  // ============================================================
  // CÁC HÀM LẤY THÔNG TIN HIỂN THỊ
  // ============================================================

  // Lấy tên doanh nghiệp đăng bài
  const getJobPosterName = function (job) {
    if (enterpriseInfo && job.enterpriseId === enterpriseInfo.enterpriseId) {
      if (enterpriseInfo.companyName) {
        return enterpriseInfo.companyName;
      }
      if (job.enterpriseName) {
        return job.enterpriseName;
      }
      return 'Doanh nghiệp';
    }
    if (job.enterpriseName) {
      return job.enterpriseName;
    }
    return 'Doanh nghiệp';
  };

  // Lấy logo doanh nghiệp
  const getJobPosterLogo = function (job) {
    if (enterpriseInfo && job.enterpriseId === enterpriseInfo.enterpriseId && enterpriseInfo.logoUrl) {
      return enterpriseInfo.logoUrl;
    }
    if (job.enterpriseLogoUrl) {
      return job.enterpriseLogoUrl;
    }
    // Fallback: avatar từ tên
    var name = job.enterpriseName || 'D';
    return "https://ui-avatars.com/api/?name=" + encodeURIComponent(name) + "&background=0d6efd&color=fff&size=48";
  };

  // Lấy email doanh nghiệp
  const getJobPosterEmail = function (job) {
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
            <Col md={4}>
              <div className="hub-search-wrapper position-relative">
                <Search size={18} className="hub-search-icon text-white-50" style={{position:'absolute', left:'15px', top:'13px'}}/>
                <Form.Control
                  placeholder="Tìm dự án, công nghệ, doanh nghiệp..."
                  className="hub-input ps-5 bg-dark-input text-white border-0"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </Col>
            <Col md={2}>
              <Form.Select
                className="bg-dark-input text-white border-0 rounded-pill py-2"
                value={selectedJobType}
                onChange={(e) => setSelectedJobType(e.target.value)}
              >
                {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Select
                className="bg-dark-input text-white border-0 rounded-pill py-2"
                value={selectedSalaryRange}
                onChange={(e) => setSelectedSalaryRange(Number(e.target.value))}
              >
                {SALARY_RANGES.map((r, i) => <option key={i} value={i}>{r.label}</option>)}
              </Form.Select>
            </Col>
            <Col md={2}>
              <Button variant="primary" className="w-100 fw-bold h-100 shadow-glow rounded-pill" onClick={handleSearch}>
                <Filter size={16} className="me-1"/> Tìm kiếm
              </Button>
            </Col>
            <Col md={2}>
              <Button
                variant="outline-info"
                className="w-100 fw-bold h-100 rounded-pill"
                onClick={handleAIMatching}
                disabled={aiMatching}
              >
                {aiMatching ? <Loader2 className="spinner me-1" size={14}/> : <Sparkles size={14} className="me-1"/>}
                {aiMatching ? 'AI...' : 'AI Matching'}
              </Button>
            </Col>
          </Row>
        </div>

        {/* --- BỐ CỤC MASTER-DETAIL --- */}
        <div className="hub-main-layout d-flex gap-4">

          {/* CỘT TRÁI: DANH SÁCH TÓM TẮT (SIDEBAR) */}
          <div className="hub-sidebar-list flex-shrink-0" style={{width: '400px'}}>
            <div className="sidebar-header-text mb-3 opacity-50 x-small uppercase-tracking">
                TÌM THẤY {totalItems} KẾT QUẢ
            </div>
            <div className="sidebar-scroll-area overflow-auto" style={{maxHeight: 'calc(100vh - 350px)'}}>
                {jobs.map((job) => (
                <div
                    key={job.jobId}
                    className={`hub-sidebar-item glass-card p-3 mb-2 border-0 pointer transition-all ${selectedJob?.jobId === job.jobId ? 'active-job' : ''}`}
                    onClick={() => { setSelectedJob(job); selectedJobRef.current = job; }}
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
                                {job.salary > 0 ? `${job.salary.toLocaleString()} VND` : "Chưa có lương"}
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

            <PaginationBar
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
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
                            {token && !isOwnJob && (
                                <Button
                                    variant="outline-danger"
                                    className="border-danger border-opacity-20 p-2 rounded-3"
                                    title="Tố cáo bài đăng"
                                    onClick={() => setShowReportModal(true)}
                                >
                                    <ShieldAlert size={20} />
                                </Button>
                            )}
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

      {selectedJob && (
        <ReportModal
          show={showReportModal}
          onHide={() => setShowReportModal(false)}
          targetType="JOB"
          targetId={selectedJob.jobId}
          targetName={selectedJob.title}
        />
      )}
    </div>
  );
};

export default Jobs;
