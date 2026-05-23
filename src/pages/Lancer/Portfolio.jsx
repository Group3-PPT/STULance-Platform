import React, { useState } from 'react';
import { Container, Row, Col, Button, Card, Badge, Form } from 'react-bootstrap';
import { Edit3, Save, Plus, Trash2, XCircle, Camera } from 'lucide-react';
import '../../CSS/Portfolio.css'; // Tuân thủ cấu trúc import bạn yêu cầu

const Portfolio = () => {
  const [isEditing, setIsEditing] = useState(false);
  
  // Quản lý dữ liệu hồ sơ bằng State
  const [profile, setProfile] = useState({
    name: 'Nguyễn Văn A',
    role: 'Sinh viên năm 4 - Web Developer',
    avatar: 'https://ui-avatars.com/api/?name=Nguyen+Van+A&size=200&background=0D8ABC&color=fff',
    bio: 'Em là sinh viên đam mê công nghệ, đã có 1 năm kinh nghiệm làm freelance thiết kế web UI/UX.',
    skills: ['ReactJS', 'Figma', 'NodeJS'],
    projects: [
      {
        id: 1,
        title: 'Website Quản lý CLB Sinh viên',
        desc: 'Sử dụng ReactJS và Firebase để quản lý hoạt động nội bộ.',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71'
      }
    ]
  });

  // Xử lý Kỹ năng
  const addSkill = (e) => {
    if (e.key === 'Enter' && e.target.value.trim() !== '') {
      setProfile({ ...profile, skills: [...profile.skills, e.target.value.trim()] });
      e.target.value = '';
    }
  };

  const removeSkill = (index) => {
    const newSkills = profile.skills.filter((_, i) => i !== index);
    setProfile({ ...profile, skills: newSkills });
  };

  // Xử lý Dự án
  const addProject = () => {
    const newProject = {
      id: Date.now(),
      title: 'Dự án mới',
      desc: 'Mô tả dự án của bạn...',
      image: 'https://via.placeholder.com/350x200'
    };
    setProfile({ ...profile, projects: [...profile.projects, newProject] });
  };

  const updateProject = (id, field, value) => {
    const newProjects = profile.projects.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    );
    setProfile({ ...profile, projects: newProjects });
  };

  const removeProject = (id) => {
    setProfile({ ...profile, projects: profile.projects.filter(p => p.id !== id) });
  };

  return (
    <div className="portfolio-page py-5">
      {/* Nút Bật/Tắt chế độ chỉnh sửa (Fixed) */}
      <Button 
        className="btn-edit-toggle shadow-lg" 
        variant={isEditing ? "primary" : "outline-primary"}
        onClick={() => setIsEditing(!isEditing)}
      >
        {isEditing ? <><Save size={20} className="me-2"/> Lưu hồ sơ</> : <><Edit3 size={20} className="me-2"/> Chỉnh sửa hồ sơ</>}
      </Button>

      <Container>
        {/* Header Hồ sơ */}
        <div className="glass-card p-4 p-md-5 mb-5">
          <Row className="align-items-center">
            <Col md={3} className="text-center mb-4 mb-md-0">
              <div className={`editable-avatar-container ${isEditing ? 'editing' : ''}`}>
                <img src={profile.avatar} className="profile-avatar shadow" alt="avatar" />
                {isEditing && (
                  <div className="camera-overlay">
                    <Camera size={24} />
                    <input 
                      type="text" 
                      className="avatar-url-input mt-2" 
                      placeholder="Dán link ảnh mới..."
                      value={profile.avatar}
                      onChange={(e) => setProfile({...profile, avatar: e.target.value})}
                    />
                  </div>
                )}
              </div>
            </Col>

            <Col md={9}>
              {isEditing ? (
                <div className="edit-mode-inputs">
                  <Form.Control 
                    size="lg" 
                    className="bg-dark-input text-white mb-2" 
                    value={profile.name}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                  />
                  <Form.Control 
                    className="bg-dark-input text-primary fw-bold mb-3" 
                    value={profile.role}
                    onChange={(e) => setProfile({...profile, role: e.target.value})}
                  />
                </div>
              ) : (
                <div className="view-mode-info">
                  <h1 className="display-5 fw-bold text-white mb-1">{profile.name}</h1>
                  <p className="h4 text-primary-glow mb-3">{profile.role}</p>
                </div>
              )}

              {/* Kỹ năng */}
              <div className="d-flex flex-wrap gap-2 mb-4">
                {profile.skills.map((skill, index) => (
                  <Badge key={index} pill bg="primary" className="skill-badge-edit px-3 py-2">
                    {skill}
                    {isEditing && <XCircle size={14} className="ms-2 pointer" onClick={() => removeSkill(index)} />}
                  </Badge>
                ))}
                {isEditing && (
                  <Form.Control 
                    placeholder="+ Thêm kỹ năng (Enter)" 
                    className="bg-dark-input text-white border-dashed-blue d-inline-block w-auto"
                    onKeyDown={addSkill}
                  />
                )}
              </div>

              {isEditing ? (
                <Form.Control 
                  as="textarea" 
                  rows={3} 
                  className="bg-dark-input text-white-50" 
                  value={profile.bio}
                  onChange={(e) => setProfile({...profile, bio: e.target.value})}
                />
              ) : (
                <p className="text-secondary-cv lead-sm mb-0">{profile.bio}</p>
              )}
            </Col>
          </Row>
        </div>

        {/* Section Dự án */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold text-white">Dự án tiêu biểu</h3>
          {isEditing && (
            <Button variant="primary" size="sm" className="rounded-pill px-4 fw-bold" onClick={addProject}>
              <Plus size={18} className="me-1"/> THÊM DỰ ÁN
            </Button>
          )}
        </div>

        <Row className="g-4">
          {profile.projects.map((project) => (
            <Col md={6} lg={4} key={project.id}>
              <Card className="glass-card h-100 overflow-hidden project-edit-card">
                <Card.Img variant="top" src={project.image} className="project-img-thumb" />
                <Card.Body className="p-4">
                  {isEditing ? (
                    <div className="d-grid gap-2">
                      <Form.Control 
                        size="sm" 
                        className="bg-dark-input text-white" 
                        placeholder="Link ảnh"
                        value={project.image}
                        onChange={(e) => updateProject(project.id, 'image', e.target.value)}
                      />
                      <Form.Control 
                        className="bg-dark-input text-white fw-bold" 
                        placeholder="Tên dự án"
                        value={project.title}
                        onChange={(e) => updateProject(project.id, 'title', e.target.value)}
                      />
                      <Form.Control 
                        as="textarea" 
                        className="bg-dark-input text-white-50" 
                        placeholder="Mô tả dự án"
                        value={project.desc}
                        onChange={(e) => updateProject(project.id, 'desc', e.target.value)}
                      />
                      <Button variant="danger" size="sm" className="mt-2" onClick={() => removeProject(project.id)}>
                        <Trash2 size={14} className="me-1"/> Xóa dự án
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Card.Title className="text-white fw-bold">{project.title}</Card.Title>
                      <Card.Text className="text-muted small">{project.desc}</Card.Text>
                    </>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
};

export default Portfolio;