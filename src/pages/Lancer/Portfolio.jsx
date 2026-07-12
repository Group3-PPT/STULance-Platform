import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Badge, Spinner } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { 
  Edit3, GraduationCap, BookOpen, ExternalLink, MapPin, 
  Smartphone, Star, Eye, Layers, Award, Code2, Briefcase,
  ChevronLeft, Loader2
} from 'lucide-react';
import { profileService } from '../../services/profileservice';
import { studentService } from '../../services/studentservice';
import { portfolioService } from '../../services/portfolioservice';
import { unwrapList } from '../../services/responseUtils';
import '../../CSS/Portfolio.css';

const Portfolio = () => {
  const { id } = useParams();
  const isPublicView = Boolean(id);
  const [loading, setLoading] = useState(true);

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

  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (isPublicView) {
        const [studentRes, portRes] = await Promise.all([
          studentService.getPublicProfile(id),
          portfolioService.getStudentPortfolios(id)
        ]);
        setCombinedData(studentRes?.data || {});
        setProjects(unwrapList(portRes));
        setSkills(studentRes?.data?.skills || []);
      } else {
        const results = await Promise.allSettled([
          profileService.getBasicProfile(),
          studentService.getProfile(),
          studentService.getMySkills(),
          portfolioService.getMyPortfolios()
        ]);

        let tempInfo = {};

        if (results[0].status === 'fulfilled' && results[0].value?.success) {
          tempInfo = { ...tempInfo, ...results[0].value.data };
        }
        if (results[1].status === 'fulfilled' && results[1].value?.success) {
          tempInfo = { ...tempInfo, ...results[1].value.data };
        }
        setCombinedData(tempInfo);

        if (results[2].status === 'fulfilled') setSkills(results[2].value?.data || []);
        if (results[3].status === 'fulfilled') setProjects(unwrapList(results[3].value));
      }
    } catch (err) {
      console.error("Lỗi tải dữ liệu:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [id]);

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

                <p className="text-white-50 mb-0" style={{lineHeight: '1.8'}}>
                  {combinedData.bio || "Chưa có lời giới thiệu bản thân."}
                </p>
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
              <div className="portfolio-info-item mb-3">
                <span className="portfolio-info-label">Trường đại học</span>
                <span className="portfolio-info-value">{combinedData.school || "Chưa cập nhật"}</span>
              </div>
              <div className="portfolio-info-item mb-3">
                <span className="portfolio-info-label">Mã sinh viên</span>
                <span className="portfolio-info-value">{combinedData.studentCode || "N/A"}</span>
              </div>
              <div className="portfolio-info-item mb-0">
                <span className="portfolio-info-label">GPA tích lũy</span>
                <span className="portfolio-info-value text-success fw-bold">{combinedData.gpa || 'N/A'} / 4.0</span>
              </div>
            </div>

            {/* Contact Card */}
            <div className="portfolio-sidebar-card glass-card p-4 mb-4">
              <h5 className="fw-bold mb-4 text-primary-glow d-flex align-items-center gap-2">
                <Smartphone size={20}/> LIÊN HỆ
              </h5>
              <div className="portfolio-info-item mb-3">
                <span className="portfolio-info-label">Số điện thoại</span>
                <span className="portfolio-info-value">{combinedData.phoneNumber || "Chưa cập nhật"}</span>
              </div>
              <div className="portfolio-info-item mb-3">
                <span className="portfolio-info-label">Địa chỉ</span>
                <span className="portfolio-info-value">{combinedData.location || "Chưa cập nhật"}</span>
              </div>
              {combinedData.dateOfBirth && (
                <div className="portfolio-info-item mb-0">
                  <span className="portfolio-info-label">Ngày sinh</span>
                  <span className="portfolio-info-value">{new Date(combinedData.dateOfBirth).toLocaleDateString('vi-VN')}</span>
                </div>
              )}
            </div>

            {/* Skills Card */}
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
                {skills.length === 0 && (
                  <span className="text-muted small italic">Chưa có kỹ năng nào.</span>
                )}
              </div>
            </div>
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
                          src={project.imageUrl || 'https://via.placeholder.com/600x340/0f172a/3b82f6?text=Project'} 
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
                        <h5 className="fw-bold text-white mb-2">{project.title}</h5>
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
    </div>
  );
};

export default Portfolio;
