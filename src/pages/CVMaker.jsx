import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, InputGroup } from 'react-bootstrap';
// Thêm useNavigate vào phần import
import { useNavigate, Link } from 'react-router-dom'; 
import { 
  Mail, Phone, MapPin, Globe, Plus, Trash2, Printer, 
  Wand2, Calendar, Award, CheckCircle, Heart, 
  UserCircle, GraduationCap, Laptop, Briefcase, Star, Activity, Save, Edit2, ChevronLeft
} from 'lucide-react';
import '../CSS/CVMaker.css';

const CVMaker = () => {
  // Khởi tạo điều hướng
  const navigate = useNavigate();

  const [cv, setCv] = useState({
    cvTitle: 'CV Thực tập Frontend - Bản 1',
    avatar: 'https://ui-avatars.com/api/?name=Dung+Tran&size=200&background=446872&color=fff',
    name: 'Trần Mạnh Dũng',
    title: 'Content Leader',
    phone: '0123 456 789',
    birthday: '18/12/1997',
    email: 'tech.growth@topcv.vn',
    address: 'Thanh Xuân, Hà Nội',
    objective: 'Content Leader với 6 năm kinh nghiệm xây dựng và triển khai chiến lược nội dung đa nền tảng cho các thương hiệu trong lĩnh vực FMCG, công nghệ, giáo dục và bán lẻ...',
    skills: 'Kỹ năng giao tiếp\nKỹ năng làm việc nhóm\nKỹ năng giải quyết vấn đề',
    hobbies: 'Đọc sách về Phát triển bản thân\nĐi bộ 15 - 30 phút/ngày',
    education: { 
      school: 'Đại học Kinh tế TOPCV', 
      time: '2015 - 2019', 
      major: 'Cử nhân Public Relation & Advertising',
      detail: 'Đạt giải Nhì cuộc thi "Chiến lược truyền thông sáng tạo"'
    },
    experience: [
      { id: 1, role: 'Content Leader', company: 'Công ty Công nghệ NTD Tech', time: '2023 - Nay', desc: '• Xây dựng chiến lược nội dung cho website, social media.\n• Quản lý đội nhóm 10 thành viên.' }
    ],
    certificates: [
      { id: 1, time: '2022', name: 'Google Digital Marketing' }
    ],
    projects: [
      { id: 1, name: 'Student Freelance Platform', role: 'Fullstack Developer', time: '2024', desc: 'Xây dựng nền tảng kết nối sinh viên.' }
    ]
  });

  // --- LOGIC LƯU VÀ CHUYỂN TRANG ---
  const handleSaveCV = () => {
    if(!cv.cvTitle.trim()) {
        alert("Vui lòng đặt tên cho bản CV!");
        return;
    }
    
    // Giả lập lưu dữ liệu
    alert(`Đã lưu bản CV: "${cv.cvTitle}". Hệ thống sẽ đưa bạn về Bảng điều khiển.`);
    
    // Chuyển hướng sang trang Dashboard
    // Lưu ý: Hãy đảm bảo bạn đã đặt path cho Dashboard là '/dashboardlaner' trong App.jsx
    navigate('/dashboardlaner'); 
  };

  const updateList = (key, index, field, value) => {
    let newArr = [...cv[key]];
    newArr[index][field] = value;
    setCv({ ...cv, [key]: newArr });
  };

  const addListItem = (key, defaultObj) => {
    setCv({ ...cv, [key]: [...cv[key], { ...defaultObj, id: Date.now() }] });
  };

  const removeListItem = (key, id) => {
    setCv({ ...cv, [key]: cv[key].filter(item => item.id !== id) });
  };

  return (
    <Container className="cv-maker-page py-5">
      {/* --- THANH TOOLBAR ĐIỀU KHIỂN --- */}
      <div className="glass-card p-3 mb-4 border-primary-glow animate-fade-in">
        <Row className="align-items-center">
          <Col md={1}>
             <Link to="/dashboard" className="text-muted"><ChevronLeft size={24}/></Link>
          </Col>
          <Col md={5}>
            <InputGroup className="cv-name-input-group">
              <InputGroup.Text className="bg-transparent border-0 text-primary">
                <Edit2 size={18} />
              </InputGroup.Text>
              <Form.Control 
                className="bg-transparent border-0 text-white fw-bold h5 mb-0" 
                placeholder="Đặt tên CV (Ví dụ: CV gửi FPT...)" 
                value={cv.cvTitle}
                onChange={(e) => setCv({...cv, cvTitle: e.target.value})}
              />
            </InputGroup>
          </Col>
          <Col md={6} className="text-md-end mt-3 mt-md-0">
            <div className="d-flex gap-2 justify-content-md-end">
              <Button variant="outline-primary" className="d-flex align-items-center gap-2" onClick={handleSaveCV}>
                <Save size={18} /> Lưu CV & Thoát
              </Button>
              <Button variant="primary" onClick={() => window.print()} className="d-flex align-items-center gap-2 shadow-glow">
                <Printer size={18} /> Xuất PDF
              </Button>
            </div>
          </Col>
        </Row>
      </div>

      <Row className="g-4">
        {/* --- CỘT TRÁI: EDITOR --- */}
        <Col lg={5} className="editor-column custom-scrollbar">
          <div className="glass-card p-4">
            <h5 className="text-primary mb-3 border-bottom border-secondary pb-2">1. Thông tin cá nhân</h5>
            <Form.Group className="mb-3">
              <Form.Label className="x-small fw-bold">HỌ VÀ TÊN</Form.Label>
              <input type="text" className="form-control bg-dark-input text-white" value={cv.name} onChange={(e) => setCv({...cv, name: e.target.value})} />
            </Form.Group>
            
            <Row>
              <Col md={6} className="mb-3">
                <Form.Label className="x-small fw-bold">VỊ TRÍ ỨNG TUYỂN</Form.Label>
                <input type="text" className="form-control bg-dark-input text-white" value={cv.title} onChange={(e) => setCv({...cv, title: e.target.value})} />
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label className="x-small fw-bold">NGÀY SINH</Form.Label>
                <input type="text" className="form-control bg-dark-input text-white" value={cv.birthday} onChange={(e) => setCv({...cv, birthday: e.target.value})} />
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label className="x-small fw-bold">EMAIL</Form.Label>
              <input type="email" className="form-control bg-dark-input text-white" value={cv.email} onChange={(e) => setCv({...cv, email: e.target.value})} />
            </Form.Group>

            <h5 className="text-primary mt-4 mb-3 border-bottom border-secondary pb-2">2. Mục tiêu nghề nghiệp</h5>
            <textarea className="form-control bg-dark-input text-white" rows={4} value={cv.objective} onChange={(e) => setCv({...cv, objective: e.target.value})} />

            <h5 className="text-primary mt-4 mb-3 border-bottom border-secondary pb-2 d-flex justify-content-between">
              3. Kinh nghiệm 
              <Button variant="link" className="p-0" onClick={() => addListItem('experience', {role:'', company:'', time:'', desc:''})}><Plus size={18}/></Button>
            </h5>
            {cv.experience.map((exp, i) => (
              <div key={exp.id} className="border border-secondary p-3 rounded mb-2 position-relative bg-white-5">
                <Trash2 size={14} className="text-danger position-absolute top-0 end-0 m-2 pointer" onClick={() => removeListItem('experience', exp.id)} />
                <input className="bg-transparent text-white border-0 w-100 fw-bold mb-1" placeholder="Vị trí" value={exp.role} onChange={(e) => updateList('experience', i, 'role', e.target.value)} />
                <input className="bg-transparent text-white-50 border-0 w-100 x-small" placeholder="Công ty" value={exp.company} onChange={(e) => updateList('experience', i, 'company', e.target.value)} />
              </div>
            ))}

            <h5 className="text-primary mt-4 mb-3 border-bottom border-secondary pb-2">4. Kỹ năng (mỗi dòng 1 mục)</h5>
            <textarea className="form-control bg-dark-input text-white" rows={4} value={cv.skills} onChange={(e) => setCv({...cv, skills: e.target.value})} />
          </div>
        </Col>

        {/* --- CỘT PHẢI: PREVIEW --- */}
        <Col lg={7} className="preview-column">
          <div className="a4-document shadow-2xl" id="cv-print">
            <div className="cv-sidebar-box">
              <div className="cv-avatar-circle"><span className="avatar-initials">DT</span></div>
              <h1 className="cv-name-text">{cv.name}</h1>
              <p className="cv-role-text">{cv.title}</p>
              <div className="cv-contact-section">
                <div className="cv-contact-item"><Phone size={12}/> <span>{cv.phone}</span></div>
                <div className="cv-contact-item"><Mail size={12}/> <span>{cv.email}</span></div>
                <div className="cv-contact-item"><MapPin size={12}/> <span>{cv.address}</span></div>
              </div>
              <div className="cv-sidebar-section">
                <h3 className="sidebar-pill">KỸ NĂNG</h3>
                <ul className="sidebar-list">
                  {cv.skills.split('\n').map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            </div>

            <div className="cv-main-box">
              <div className="cv-main-section">
                <div className="main-pill-header"><span>Mục tiêu</span><div className="pill-line"></div></div>
                <p className="main-text-content">{cv.objective}</p>
              </div>

              <div className="cv-main-section">
                <div className="main-pill-header"><span>Kinh nghiệm</span><div className="pill-line"></div></div>
                {cv.experience.map(exp => (
                  <div key={exp.id} className="exp-item-box">
                    <div className="d-flex justify-content-between"><strong>{exp.role}</strong><span className="x-small opacity-50">{exp.time}</span></div>
                    <p className="cv-accent-text x-small">{exp.company}</p>
                    <p className="main-text-content x-small white-space-pre">{exp.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default CVMaker;