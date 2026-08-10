import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Badge, Spinner } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin, Globe, Mail, Phone, Users,
  CheckCircle, ShieldCheck, Info, Heart, Loader2,
  Briefcase, Calendar, DollarSign, ExternalLink, Users as UsersIcon, ShieldAlert
} from 'lucide-react';
import { enterpriseService } from '../../services/enterprise.service';
import { jobService } from '../../services/jobservice';
import ReportModal from '../../components/ReportModal';
import '../../CSS/BusinessProfile.css';

const BusinessProfile = () => {
  // ============================================================
  // ROUTING
  // ============================================================
  var params = useParams();
  var id = params.id;

  // ============================================================
  // STATE
  // ============================================================

  // Loading trang
  const [loading, setLoading] = useState(true);

  // Thông tin doanh nghiệp
  const [company, setCompany] = useState(null);

  // Danh sách job đang tuyển
  const [jobs, setJobs] = useState([]);

  // Loading danh sách job
  const [jobsLoading, setJobsLoading] = useState(false);

  // Đang theo dõi
  const [isFollowing, setIsFollowing] = useState(false);

  // Loading theo dõi
  const [followLoading, setFollowLoading] = useState(false);

  // Có phải hồ sơ của mình không
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  // Hiện modal tố cáo
  const [showReportModal, setShowReportModal] = useState(false);

  // ============================================================
  // EFFECT: TẢI DỮ LIỆU
  // ============================================================
  useEffect(function () {
    var fetchProfile = async function () {
      setLoading(true);

      try {
        var res;

        if (id) {
          // Xem hồ sơ công khai
          res = await enterpriseService.getPublicProfile(id);
          setIsOwnProfile(false);
        } else {
          // Xem hồ sơ của mình
          res = await enterpriseService.getMe();
          setIsOwnProfile(true);
        }

        // Xử lý dữ liệu doanh nghiệp
        if (res.success !== false) {
          var data = res.data || res;
          setCompany(data);

          // Tải danh sách job
          setJobsLoading(true);

          try {
            var jobRes;

            if (id) {
              jobRes = await jobService.getAllPublicJobs({ enterpriseId: id, pageSize: 50 });
            } else {
              jobRes = await jobService.getMyJobs({ pageSize: 50 });
            }

            var jobData = jobRes.data || jobRes;
            setJobs(jobData.items || []);

          } catch (e) {
            console.error("Lỗi tải bài đăng:", e);

          } finally {
            setJobsLoading(false);
          }
        }

      } catch (err) {
        console.error("Lỗi tải hồ sơ doanh nghiệp:", err);

      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  // ============================================================
  // HÀM THEO DÕI
  // ============================================================
  const handleFollow = async function () {
    setFollowLoading(true);

    try {
      // Toggle theo dõi
      setIsFollowing(!isFollowing);

    } catch (err) {
      var msg = "Không thể thực hiện";
      if (err.response && err.response.data && err.response.data.message) {
        msg = err.response.data.message;
      }
      alert("Lỗi: " + msg);

    } finally {
      setFollowLoading(false);
    }
  };

  // ============================================================
  // HÀM FORMAT TIỀN TỆ
  // ============================================================
  const formatMoney = function (val) {
    if (!val) val = 0;
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(val);
  };

  // ============================================================
  // HÀM LẤY BADGE TRẠNG THÁI JOB
  // ============================================================
  const getStatusBadge = function (status) {
    var map = {
      'PENDING': { bg: 'warning', text: 'dark', label: 'Chờ duyệt' },
      'APPROVED': { bg: 'success', text: 'white', label: 'Đang tuyển' },
      'REJECTED': { bg: 'danger', text: 'white', label: 'Bị từ chối' },
      'CLOSED': { bg: 'secondary', text: 'white', label: 'Đã đóng' }
    };

    if (map[status]) {
      return map[status];
    }
    return { bg: 'secondary', text: 'white', label: status };
  };

  if (loading) return (
    <div className="vh-100 d-flex justify-content-center align-items-center bg-dark">
      <Spinner animation="border" variant="primary" />
    </div>
  );

  if (!company) return <div className="text-white text-center py-5">Không tìm thấy thông tin doanh nghiệp.</div>;

  return (
    <div className="biz-profile-page animate-fade-in">
      <section className="biz-hero">
          <div className="biz-banner-wrap">
          <img src="https://images.unsplash.com/photo-1497366216548-37526070297c" alt="Banner" className="biz-banner-img" />
        </div>
        <Container>
          <div className="biz-main-info-row">
            <div className="biz-logo-large glass-card p-2 bg-white">
              <img
                src={company.logoUrl || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150' fill='%23e2e8f0'%3E%3Crect width='150' height='150' rx='12'/%3E%3Ctext x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' fill='%2364748b' font-size='14'%3ELOGO%3C/text%3E%3C/svg%3E"}
                alt="Logo"
                className="w-100 h-100 object-fit-contain"
              />
            </div>
            <div className="biz-title-area">
              <h1 className="fw-bold text-white d-flex align-items-center gap-2">
                {company.companyName}
                {company.verificationStatus === 'VERIFIED' && <CheckCircle className="text-primary-glow" size={24} />}
              </h1>
              <p className="text-white-50 mb-2"><MapPin size={16} className="me-1" /> {company.address || 'Chưa cập nhật địa chỉ'}</p>
              <div className="d-flex gap-2">
                <Badge bg="primary" className="px-3">Doanh nghiệp</Badge>
                <Badge bg={company.verificationStatus === 'VERIFIED' ? "success" : "secondary"} className="px-3">
                  {company.verificationStatus}
                </Badge>
              </div>
            </div>
            <div className="biz-action-area">
              {isOwnProfile ? (
                <Button as={Link} to="/businesses/business-profile-settings" variant="outline-primary" className="fw-bold px-4 py-2">
                  <Info size={16} className="me-2" /> CHỈNH SỬA HỒ SƠ
                </Button>
              ) : (
                <div className="d-flex gap-2">
                  <Button
                    variant={isFollowing ? "outline-danger" : "primary"}
                    className="fw-bold px-4 py-2 shadow-glow"
                    onClick={handleFollow}
                    disabled={followLoading}
                  >
                    {followLoading ? <Loader2 className="spinner me-2" size={16} /> : <Heart size={16} className="me-2" fill={isFollowing ? "currentColor" : "none"} />}
                    {isFollowing ? 'BỎ THEO DÕI' : 'THEO DÕI CÔNG TY'}
                  </Button>
                  {localStorage.getItem('accessToken') && (
                    <Button variant="outline-danger" className="fw-bold px-3 py-2" onClick={() => setShowReportModal(true)}>
                      <ShieldAlert size={16} />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </Container>
      </section>

      <Container className="pb-5 mt-5">
        <Row className="g-4">
          <Col lg={8}>
            <div className="glass-card p-4 mb-4 shadow-sm">
              <h4 className="text-white fw-bold mb-3 border-start border-primary border-4 ps-3">Về chúng tôi</h4>
              <p className="text-secondary-cv" style={{ whiteSpace: 'pre-line' }}>
                {company.bio || `${company.companyName} chưa cập nhật thông tin giới thiệu.`}
              </p>
            </div>

            <div className="glass-card p-4 shadow-sm">
              <h4 className="text-white fw-bold mb-4 border-start border-primary border-4 ps-3">
                <Briefcase size={18} className="me-2" /> Vị trí đang tuyển ({jobs.length})
              </h4>
              {jobsLoading ? (
                <div className="text-center py-4"><Loader2 className="spinner text-primary" size={24} /></div>
              ) : jobs.length > 0 ? (
                <div className="d-grid gap-3">
                  {jobs.map(job => {
                    const st = getStatusBadge(job.status);
                    return (
                      <div key={job.jobId} className="p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-fill">
                            <div className="d-flex align-items-center gap-2 mb-1">
                              <Badge bg={st.bg} text={st.text} className="x-small fw-bold">{st.label}</Badge>
                              {job.jobType && <Badge bg="info" className="x-small">{job.jobType}</Badge>}
                            </div>
                            <h6 className="fw-bold text-white mb-1">{job.title || job.jobTitle}</h6>
                            <div className="d-flex flex-wrap gap-3 x-small text-white-50 mb-2">
                              {job.salary && <span><DollarSign size={11} className="me-1" />{formatMoney(job.salary)}</span>}
                              {job.location && <span><MapPin size={11} className="me-1" />{job.location}</span>}
                              {job.createdAt && <span><Calendar size={11} className="me-1" />{new Date(job.createdAt).toLocaleDateString('vi-VN')}</span>}
                            </div>
                          </div>
                          <div className="d-flex gap-2">
                            {isOwnProfile && (
                              <Button as={Link} to="/manage-jobs" variant="outline-primary" size="sm" className="x-small fw-bold px-3">
                                Quản lý
                              </Button>
                            )}
                            <Button as={Link} to={`/jobs/${job.jobId}`} variant="outline-light" size="sm" className="x-small fw-bold px-3">
                              <ExternalLink size={12} className="me-1" /> Xem
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted italic small text-center py-4">Chưa có vị trí tuyển dụng nào được đăng.</p>
              )}
            </div>
          </Col>

          <Col lg={4}>
            <div className="glass-card p-4 mb-4 shadow-sm sticky-top" style={{ top: '100px' }}>
              <h5 className="text-white fw-bold mb-4 d-flex align-items-center gap-2">
                <Info size={18} className="text-primary" /> Thông tin liên hệ
              </h5>
              <ul className="list-unstyled d-grid gap-4 small">
                <li className="d-flex align-items-start gap-3">
                  <div className="contact-icon-bg"><Globe size={16} /></div>
                  <div>
                    <strong className="d-block text-white">Website</strong>
                    <a href={company.website} target="_blank" rel="noreferrer" className="text-decoration-none text-primary">
                      {company.website || 'N/A'}
                    </a>
                  </div>
                </li>
                <li className="d-flex align-items-start gap-3">
                  <div className="contact-icon-bg"><Mail size={16} /></div>
                  <div>
                    <strong className="d-block text-white">Mã số thuế</strong>
                    <span className="text-white-50">{company.companyTaxCode}</span>
                  </div>
                </li>
                <li className="d-flex align-items-start gap-3">
                  <div className="contact-icon-bg"><Users size={16} /></div>
                  <div>
                    <strong className="d-block text-white">Người đại diện</strong>
                    <span className="text-white-50">{company.representName}</span>
                  </div>
                </li>
              </ul>

              <div className="mt-4 pt-4 border-top border-secondary">
                <div className={`d-flex align-items-center gap-2 small fw-bold ${company.verificationStatus === 'VERIFIED' ? 'text-primary' : 'text-muted'}`}>
                  <ShieldCheck size={16} />
                  {company.verificationStatus === 'VERIFIED' ? 'Doanh nghiệp đã được xác thực' : 'Đang chờ xác thực hồ sơ'}
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      {!isOwnProfile && company && (
        <ReportModal
          show={showReportModal}
          onHide={() => setShowReportModal(false)}
          targetType="ENTERPRISE"
          targetId={id || company.enterpriseId}
          targetName={company.companyName}
        />
      )}
    </div>
  );
};

export default BusinessProfile;
