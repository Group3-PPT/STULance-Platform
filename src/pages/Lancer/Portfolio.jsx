import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Badge, Spinner } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { 
  Edit3, GraduationCap, BookOpen, ExternalLink, MapPin, 
  Smartphone, Star, Eye, Layers, Award, Code2, Briefcase,
  ChevronLeft, Loader2, ShieldAlert, FileText
} from 'lucide-react';
import { profileService } from '../../services/profileservice';
import { studentService } from '../../services/studentservice';
import { portfolioService } from '../../services/portfolioservice';
import { unwrapList } from '../../services/responseUtils';
import ReportModal from '../../components/ReportModal';
import '../../CSS/Portfolio.css';

const Portfolio = () => {
  // ============================================================
  // ROUTING
  // ============================================================
  var params = useParams();
  var id = params.id;
  var isPublicView = Boolean(id);

  // ============================================================
  // STATE
  // ============================================================

  // Loading trang
  const [loading, setLoading] = useState(true);

  // Hiện modal tố cáo
  const [showReportModal, setShowReportModal] = useState(false);

  // ID người dùng hiện tại
  const currentUserId = localStorage.getItem('userId');

  // Kiểm tra có phải portfolio của mình không
  const isOwnPortfolio = isPublicView ? String(id) === String(currentUserId) : false;

  // ============================================================
  // STATE DỮ LIỆU
  // ============================================================

  // Thông tin hồ sơ
  const [combinedData, setCombinedData] = useState({
    fullName: 'Đang tải...',
    bio: '',
    avatarUrl: '',
    location: '',
    phoneNumber: '',
    studentCode: '',
    school: '',
    major: '',
    gpa: 0,
    graduationYear: '',
    verificationStatus: 'UNVERIFIED'
  });

  // Danh sách kỹ năng
  const [skills, setSkills] = useState([]);

  // Danh sách dự án
  const [projects, setProjects] = useState([]);

  // ============================================================
  // HÀM TẢI DỮ LIỆU
  // ============================================================
  const loadData = async function () {
    setLoading(true);

    try {
      if (isPublicView) {
        // Xem công khai → gọi API public
        var res = await studentService.getPublicProfile(id);
        var data = (res && res.data) ? res.data : {};

        setCombinedData(data);
        setSkills(data.skills || []);
        setProjects(data.portfolios || []);

      } else {
        // Xem của mình → tải song song
        var results = await Promise.allSettled([
          profileService.getBasicProfile(),
          studentService.getProfile(),
          studentService.getMySkills(),
          portfolioService.getMyPortfolios()
        ]);

        var tempInfo = {};

        // Gộp thông tin từ profile và student
        if (results[0].status === 'fulfilled' && results[0].value && results[0].value.success) {
          var profileData = results[0].value.data;
          for (var key in profileData) {
            tempInfo[key] = profileData[key];
          }
        }

        if (results[1].status === 'fulfilled' && results[1].value && results[1].value.success) {
          var studentData = results[1].value.data;
          for (var key2 in studentData) {
            tempInfo[key2] = studentData[key2];
          }
        }

        setCombinedData(tempInfo);

        // Lấy kỹ năng
        if (results[2].status === 'fulfilled') {
          var skillsData = results[2].value && results[2].value.data;
          setSkills(skillsData || []);
        }

        // Lấy dự án
        if (results[3].status === 'fulfilled') {
          var projectsValue = results[3].value;
          var projectsList = [];
          if (projectsValue && Array.isArray(projectsValue)) {
            projectsList = projectsValue;
          } else if (projectsValue && projectsValue.data) {
            if (Array.isArray(projectsValue.data)) {
              projectsList = projectsValue.data;
            } else if (projectsValue.data.items) {
              projectsList = projectsValue.data.items;
            }
          }
          setProjects(projectsList);
        }
      }

    } catch (err) {
      console.error("Lỗi tải dữ liệu:", err.message);

    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // EFFECT: Tải dữ liệu khi mount hoặc id thay đổi
  // ============================================================
  useEffect(function () {
    loadData();
  }, [id]);

  if (loading) return (
    <div className="vh-100 d-flex justify-content-center align-items-center bg-dark">
      <div className="text-center">
        <Loader2 className="spinner text-primary mb-3" size={40} />
        <p className="text-muted small">Đang tải hồ sơ...</p>
      </div>
    </div>
  );

  const isVerified = combinedData.verificationStatus === 'VERIFIED';

  return (
    <div className="portfolio-page py-5 text-white">
      <Container>
        {/* Back button */}
        {!isPublicView && (
          <div className="text-end mb-4">
            <Button as={Link} to="/portfolio-manager" variant="link" className="text-primary p-0 text-decoration-none fw-bold d-flex align-items-center gap-1 ms-auto">
              <ChevronLeft size={18} /> QUẢN LÝ DỰ ÁN
            </Button>
          </div>
        )}

        {/* --- HERO PROFILE CARD --- */}
        <div className="portfolio-profile-card glass-card mb-5 position-relative overflow-hidden animate-fade-in">
          {/* Background gradient */}
          <div className="profile-hero-bg"></div>
          
          <div className="position-relative p-4 p-md-5">
            <Row className="align-items-center">
              <Col md={3} className="text-center mb-4 mb-md-0">
                <div className="profile-avatar-wrapper">
                  <img 
                    src={combinedData.avatarUrl || `https://ui-avatars.com/api/?name=${combinedData.fullName}&background=0D8ABC&color=fff&size=200`} 
                    className="profile-avatar-lg" 
                    alt="avatar" 
                  />
                  <div className={`avatar-status-dot ${isVerified ? 'verified' : ''}`}></div>
                </div>
              </Col>
              <Col md={9}>
                <div className="d-flex align-items-center gap-3 mb-2 flex-wrap">
                  <h1 className="fw-bold mb-0 display-6">{combinedData.fullName}</h1>
                  <Badge bg={isVerified ? 'success' : 'secondary'} className="px-3 py-2 d-flex align-items-center gap-1">
                    <Award size={14} /> {isVerified ? 'ĐÃ XÁC MINH' : 'CHƯA XÁC MINH'}
                  </Badge>
                  {isPublicView && !isOwnPortfolio && localStorage.getItem('accessToken') && (
                    <Button variant="outline-danger" size="sm" className="px-3 py-1 fw-bold" onClick={() => setShowReportModal(true)}>
                      <ShieldAlert size={14} className="me-1" /> Tố cáo
                    </Button>
                  )}
                </div>
                <p className="h4 text-primary-glow mb-3">{combinedData.major || "Freelancer"}</p>
                
                <div className="d-flex flex-wrap gap-4 mb-4 text-white-50 small">
                  {combinedData.school && (
                    <span className="d-flex align-items-center gap-1">
                      <GraduationCap size={16} className="text-info"/> {combinedData.school}
                    </span>
                  )}
                  {combinedData.location && (
                    <span className="d-flex align-items-center gap-1">
                      <MapPin size={16} className="text-warning"/> {combinedData.location}
                    </span>
                  )}
                  {combinedData.phoneNumber && (
                    <span className="d-flex align-items-center gap-1">
                      <Smartphone size={16} className="text-success"/> {combinedData.phoneNumber}
                    </span>
                  )}
                </div>

                {combinedData.bio && (
                  <p className="text-white-50 mb-0" style={{lineHeight: '1.8'}}>
                    {combinedData.bio}
                  </p>
                )}
                <div className="mt-3">
                  <Button as={Link} to={`/cv/student/${combinedData.userId || id}`} variant="outline-primary" size="sm" className="fw-bold px-3" target="_blank">
                    <FileText size={14} className="me-1" /> Xem CV
                  </Button>
                </div>
              </Col>
            </Row>
          </div>
        </div>

        <Row className="g-4">
          {/* --- CỘT TRÁI: THÔNG TIN --- */}
          <Col lg={4}>
            {/* Education Card */}
            <div className="portfolio-sidebar-card glass-card p-4 mb-4">
              <h5 className="fw-bold mb-4 text-primary-glow d-flex align-items-center gap-2">
                <GraduationCap size={20}/> HỌC VẤN
              </h5>
              {combinedData.school && (
                <div className="portfolio-info-item mb-3">
                  <span className="portfolio-info-label">Trường đại học</span>
                  <span className="portfolio-info-value">{combinedData.school}</span>
                </div>
              )}
              {combinedData.studentCode && (
                <div className="portfolio-info-item mb-3">
                  <span className="portfolio-info-label">Mã sinh viên</span>
                  <span className="portfolio-info-value">{combinedData.studentCode}</span>
                </div>
              )}
              {combinedData.gpa > 0 && (
                <div className="portfolio-info-item mb-3">
                  <span className="portfolio-info-label">GPA tích lũy</span>
                  <span className="portfolio-info-value text-success fw-bold">{combinedData.gpa} / 4.0</span>
                </div>
              )}
              {combinedData.graduationYear && (
                <div className="portfolio-info-item mb-0">
                  <span className="portfolio-info-label">Năm tốt nghiệp</span>
                  <span className="portfolio-info-value">{combinedData.graduationYear}</span>
                </div>
              )}
            </div>

            {/* Contact Card */}
            <div className="portfolio-sidebar-card glass-card p-4 mb-4">
              <h5 className="fw-bold mb-4 text-primary-glow d-flex align-items-center gap-2">
                <Smartphone size={20}/> LIÊN HỆ
              </h5>
              {combinedData.email && (
                <div className="portfolio-info-item mb-3">
                  <span className="portfolio-info-label">Email</span>
                  <span className="portfolio-info-value">{combinedData.email}</span>
                </div>
              )}
              {combinedData.phoneNumber && (
                <div className="portfolio-info-item mb-3">
                  <span className="portfolio-info-label">Số điện thoại</span>
                  <span className="portfolio-info-value">{combinedData.phoneNumber}</span>
                </div>
              )}
              {combinedData.location && (
                <div className="portfolio-info-item mb-3">
                  <span className="portfolio-info-label">Địa chỉ</span>
                  <span className="portfolio-info-value">{combinedData.location}</span>
                </div>
              )}
              {combinedData.birthday && (
                <div className="portfolio-info-item mb-0">
                  <span className="portfolio-info-label">Ngày sinh</span>
                  <span className="portfolio-info-value">{new Date(combinedData.birthday).toLocaleDateString('vi-VN')}</span>
                </div>
              )}
            </div>

            {/* Skills Card */}
            {skills.length > 0 && (
              <div className="portfolio-sidebar-card glass-card p-4">
                <h5 className="fw-bold mb-4 text-primary-glow d-flex align-items-center gap-2">
                  <Code2 size={20}/> KỸ NĂNG
                </h5>
                <div className="d-flex flex-wrap gap-2">
                  {skills.map(skill => (
                    <Badge key={skill.skillId} pill bg={skill.status === 'APPROVED' ? 'primary' : 'secondary'} className="portfolio-skill-badge">
                      {skill.skillName}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </Col>

          {/* --- CỘT PHẢI: DỰ ÁN --- */}
          <Col lg={8}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="d-flex align-items-center gap-3">
                <h3 className="fw-bold mb-0">Dự án tiêu biểu</h3>
                <Badge bg="primary" className="px-3 py-2">{projects.length}</Badge>
              </div>
              {!isPublicView && (
                <Link to="/portfolio-manager" className="text-primary-glow text-decoration-none small fw-bold d-flex align-items-center gap-1">
                  Quản lý <ChevronLeft size={14} style={{transform: 'rotate(180deg)'}}/>
                </Link>
              )}
            </div>
            
            {projects.length > 0 ? (
              <Row className="g-4">
                {projects.map((project, index) => (
                  <Col md={6} key={project.portfolioId}>
                    <div className="portfolio-view-card glass-card h-100 border-0 overflow-hidden" style={{animationDelay: `${index * 0.1}s`}}>
                      <div className="portfolio-view-img-wrapper">
                        <img 
                          src={project.imageUrl || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='340' fill='%230f172a'%3E%3Crect width='600' height='340'/%3E%3C/svg%3E"} 
                          alt={project.title} 
                          className="portfolio-view-img"
                        />
                        <div className="portfolio-view-img-overlay">
                          {project.projectUrl && (
                            <a href={project.projectUrl} target="_blank" rel="noreferrer" className="portfolio-view-demo-btn">
                              <Eye size={16} /> XEM DEMO
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="p-4">
                        <h5 className="fw-bold text-white mb-2">{project.projectName || project.title}</h5>
                        <p className="text-white-50 small line-clamp-2 mb-3">{project.description}</p>
                        {project.projectUrl && (
                          <a href={project.projectUrl} target="_blank" rel="noreferrer" className="text-primary-glow text-decoration-none small fw-bold d-flex align-items-center gap-1">
                            <ExternalLink size={14} /> Xem chi tiết
                          </a>
                        )}
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            ) : (
              <div className="empty-portfolio-view glass-card p-5 text-center">
                <Layers size={48} className="text-muted mb-3 opacity-25" />
                <p className="text-muted mb-0">Chưa có dự án nào được đăng tải.</p>
              </div>
            )}
          </Col>
        </Row>
      </Container>

      {isPublicView && (
        <ReportModal
          show={showReportModal}
          onHide={() => setShowReportModal(false)}
          targetType="STUDENT"
          targetId={id}
          targetName={combinedData.fullName}
        />
      )}
    </div>
  );
};

export default Portfolio;
