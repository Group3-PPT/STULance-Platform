import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Card, Badge, Spinner, ListGroup } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { Edit3, GraduationCap, Hash, BookOpen, ExternalLink, Mail, MapPin, Smartphone } from 'lucide-react';
import { profileService } from '../../services/profileservice'; // Lấy Tên, Bio, Avatar
import { studentService } from '../../services/studentservice'; // Lấy MSSV, GPA, School
import { portfolioService } from '../../services/portfolioservice'; // Lấy Danh sách dự án
import { skillService } from '../../services/skillservice';
import '../../CSS/Portfolio.css';

const Portfolio = () => {
  const { id } = useParams();
  const isPublicView = Boolean(id);
  const [loading, setLoading] = useState(true);

  // Gộp dữ liệu từ 2 API vào 1 state duy nhất để hiển thị
  const [combinedData, setCombinedData] = useState({
    // Từ Profile API
    fullName: 'Đang tải...',
    bio: '',
    avatarUrl: '',
    location: '',
    phoneNumber: '',
    // Từ Student API
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
      // CODE CHO XEM CÔNG KHAI
      const [studentRes, portRes] = await Promise.all([
        studentService.getPublicProfile(id),
        portfolioService.getStudentPortfolios(id)
      ]);
      
      setCombinedData(studentRes?.data || {});
      setProjects(portRes?.data || []);
      setSkills(studentRes?.data?.skills || []);
    } else {
      // CODE CHO CÁ NHÂN (An toàn với allSettled)
      const results = await Promise.allSettled([
        profileService.getBasicProfile(),   // [0]
        studentService.getProfile(),        // [1]
        studentService.getMySkills(),       // [2]
        portfolioService.getMyPortfolios()  // [3]
      ]);

      const basicRes = results[0];
      const studentRes = results[1];
      const skillRes = results[2];
      const portRes = results[3];

      let tempInfo = {};

      // Chỉ lấy dữ liệu nếu API đó thành công (status === 'fulfilled')
      if (basicRes.status === 'fulfilled' && basicRes.value?.success) {
        tempInfo = { ...tempInfo, ...basicRes.value.data };
      }

      if (studentRes.status === 'fulfilled' && studentRes.value?.success) {
        tempInfo = { ...tempInfo, ...studentRes.value.data };
      } else {
        console.warn("API Student bị lỗi hoặc chưa có dữ liệu");
      }
      
      setCombinedData(tempInfo);

      if (skillRes.status === 'fulfilled') {
        setSkills(skillRes.value?.data || []);
      }

      if (portRes.status === 'fulfilled') {
        setProjects(portRes.value?.data || []);
      }
    }
  } catch (err) {
    // Dòng này sẽ giúp bạn debug cực nhanh
    console.error("LỖI CODE TRONG LOAD DATA:", err.message);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => { loadData(); }, [id]);

  if (loading) return <div className="vh-100 d-flex justify-content-center align-items-center bg-dark"><Spinner animation="border" variant="primary" /></div>;

  return (
    <div className="portfolio-page py-5 text-white">
      <Container>
        {/* Nút sửa (Chỉ hiện khi là hồ sơ của mình) */}
        {!isPublicView && (
          <div className="text-end mb-4">
            <Button as={Link} to="/profile-settings" variant="outline-primary" className="fw-bold px-4 py-2 shadow-glow">
              <Edit3 size={18} className="me-2"/> CHỈNH SỬA HỒ SƠ
            </Button>
          </div>
        )}

        {/* PHẦN 1: HERO CARD (Thông tin từ Profile API) */}
        <div className="glass-card p-4 p-md-5 mb-5 animate-fade-in">
          <Row className="align-items-center">
            <Col md={3} className="text-center mb-4 mb-md-0">
              <img 
                src={combinedData.avatarUrl || `https://ui-avatars.com/api/?name=${combinedData.fullName}&background=0D8ABC&color=fff`} 
                className="profile-avatar shadow-lg" 
                alt="avatar" 
              />
            </Col>
            <Col md={9}>
              <div className="d-flex align-items-center gap-3 mb-2">
                <h1 className="fw-bold mb-0">{combinedData.fullName}</h1>
                <Badge bg={combinedData.verificationStatus === 'VERIFIED' ? 'success' : 'secondary'} className="x-small">
                  {combinedData.verificationStatus}
                </Badge>
              </div>
              <p className="h4 text-primary-glow mb-4">{combinedData.major || "Freelancer"}</p>
              
              {/* Thông tin liên hệ nhanh */}
              <div className="d-flex flex-wrap gap-4 mb-4 text-white-50 small">
                {combinedData.location && <span><MapPin size={14} className="me-1"/> {combinedData.location}</span>}
                {combinedData.phoneNumber && <span><Smartphone size={14} className="me-1"/> {combinedData.phoneNumber}</span>}
              </div>

              <p className="text-secondary-cv lead-sm">{combinedData.bio || "Chưa có lời giới thiệu bản thân."}</p>
            </Col>
          </Row>
        </div>

        <Row className="g-4">
          {/* CỘT TRÁI: HỌC VẤN & KỸ NĂNG */}
          <Col lg={4}>
            <div className="glass-card p-4 mb-4">
              <h5 className="fw-bold mb-4 text-primary-glow d-flex align-items-center gap-2">
                <GraduationCap size={20}/> HỌC VẤN
              </h5>
              <div className="mb-3">
                <label className="x-small text-muted d-block uppercase-tracking">Trường đại học</label>
                <span className="fw-bold">{combinedData.school || "Chưa cập nhật"}</span>
              </div>
              <div className="mb-3">
                <label className="x-small text-muted d-block uppercase-tracking">Mã sinh viên</label>
                <span className="fw-bold">{combinedData.studentCode || "N/A"}</span>
              </div>
              <div className="mb-0">
                <label className="x-small text-muted d-block uppercase-tracking">GPA tích lũy</label>
                <span className="text-success fw-bold">{combinedData.gpa} / 4.0</span>
              </div>
            </div>

            <div className="glass-card p-4">
              <h5 className="fw-bold mb-4 text-primary-glow">KỸ NĂNG</h5>
              <div className="d-flex flex-wrap gap-2">
                {skills.map(skill => (
                  <Badge key={skill.skillId} pill bg={skill.status === 'APPROVED' ? 'primary' : 'secondary'} className="px-3 py-2">
                    {skill.skillName}
                  </Badge>
                ))}
                {skills.length === 0 && <span className="text-muted small italic">Chưa có kỹ năng.</span>}
              </div>
            </div>
          </Col>

          {/* CỘT PHẢI: DỰ ÁN TIÊU BIỂU */}
          <Col lg={8}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold mb-0">Dự án tiêu biểu</h3>
                {!isPublicView && <Link to="/my-portfolio" className="text-primary-glow text-decoration-none small fw-bold">Quản lý dự án →</Link>}
            </div>
            
            <Row className="g-4">
              {projects.map(project => (
                <Col md={6} key={project.portfolioId}>
                  <Card className="glass-card h-100 border-0 overflow-hidden project-card-hover">
                    <Card.Img variant="top" src={project.imageUrl || 'https://via.placeholder.com/300x180'} style={{height: '180px', objectFit: 'cover'}}/>
                    <Card.Body className="p-4">
                      <Card.Title className="text-white fw-bold">{project.title}</Card.Title>
                      <Card.Text className="text-muted small line-clamp-2">{project.description}</Card.Text>
                      {project.projectUrl && (
                        <a href={project.projectUrl} target="_blank" rel="noreferrer" className="text-primary text-decoration-none x-small fw-bold">
                          <ExternalLink size={12} className="me-1"/> XEM CHI TIẾT
                        </a>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              ))}
              {projects.length === 0 && (
                <div className="text-center py-5 glass-card w-100">
                  <p className="text-muted mb-0">Chưa có dự án nào được đăng tải.</p>
                </div>
              )}
            </Row>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Portfolio;