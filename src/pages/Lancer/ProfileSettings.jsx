import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Form, Button, Badge, Spinner, InputGroup, ListGroup } from 'react-bootstrap';
import { 
  UserCircle, GraduationCap, Lock, Save, Camera, 
  Smartphone, MapPin, Calendar, Loader2, Key, 
  Hash, BookOpen, Search, Plus, XCircle, Info 
} from 'lucide-react';
import { profileService } from '../../services/profileservice';
import { studentService } from '../../services/studentservice';
import { skillService } from '../../services/skillservice';
import { authService } from '../../services/authService';
import '../../CSS/ProfileSettings.css';

const ProfileSettings = () => {
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const dropdownRef = useRef(null);

  // --- STATE DỮ LIỆU ---
  const [basicInfo, setBasicInfo] = useState({
    fullName: '', birthday: '', gender: true, phoneNumber: '', avatarUrl: '', location: '', bio: ''
  });

  const [studentInfo, setStudentInfo] = useState({
    studentCode: '', school: '', major: '', gpa: 0, graduationYear: 2024, citizenId: ''
  });

  const [mySkills, setMySkills] = useState([]); // Kỹ năng hiện tại của SV
  const [systemSkills, setSystemSkills] = useState([]); // Danh mục kỹ năng hệ thống (Approved)
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '', newPassword: '', confirmNewPassword: ''
  });

  // --- 1. TẢI DỮ LIỆU BAN ĐẦU ---
  const initData = async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        profileService.getBasicProfile(),
        studentService.getProfile(),
        studentService.getMySkills(),
        skillService.getApprovedSkills()
      ]);

      if (results[0].status === 'fulfilled') setBasicInfo(results[0].value.data);
      if (results[1].status === 'fulfilled') setStudentInfo(results[1].value.data);
      if (results[2].status === 'fulfilled') setMySkills(results[2].value.data || []);
      if (results[3].status === 'fulfilled') setSystemSkills(results[3].value.data || []);
      
    } catch (err) {
      console.error("Lỗi khởi tạo dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { initData(); }, []);

  // --- 2. XỬ LÝ AVATAR ---
  const handleAvatarUpdate = async (url) => {
    try {
      await profileService.updateAvatar(url);
      setBasicInfo({ ...basicInfo, avatarUrl: url });
      alert("Đã cập nhật ảnh đại diện!");
    } catch (err) { alert("Lỗi cập nhật ảnh"); }
  };

  // --- 3. LOGIC KỸ NĂNG (ADD/SUGGEST) ---
  const handleSelectSkill = (skill) => {
    if (!mySkills.find(s => s.skillId === skill.skillId)) {
      setMySkills([...mySkills, skill]);
    }
    setSearchTerm('');
    setShowDropdown(false);
  };

  const handleSuggestSkill = async () => {
    if (!searchTerm.trim()) return;
    try {
      const res = await studentService.suggestSkill(searchTerm.trim());
      setMySkills([...mySkills, res.data]); // Thêm ngay vào list với status PENDING
      setSearchTerm('');
      setShowDropdown(false);
      alert("Đã gửi đề xuất kỹ năng mới!");
    } catch (err) { alert("Kỹ năng đã tồn tại hoặc có lỗi."); }
  };

  const removeSkill = (id) => setMySkills(mySkills.filter(s => s.skillId !== id));

  // --- 4. XỬ LÝ LƯU TỔNG THỂ ---
  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (activeTab === 'personal') {
        const payload = { ...basicInfo, gender: Boolean(basicInfo.gender) };
        await profileService.updateBasicProfile(payload);
        alert("Lưu thông tin cá nhân thành công!");
      } 
      else if (activeTab === 'edu') {
        // A. Lưu thông tin học vấn
        const eduPayload = {
          ...studentInfo,
          gpa: parseFloat(studentInfo.gpa),
          graduationYear: parseInt(studentInfo.graduationYear)
        };
        await studentService.updateProfile(eduPayload);

        // B. Lưu danh sách kỹ năng (QUY TẮC 4.2: Chỉ gửi skill APPROVED)
        const approvedIds = mySkills
          .filter(s => s.status === 'APPROVED')
          .map(s => s.skillId);
        await studentService.updateMySkills(approvedIds);

        alert("Lưu hồ sơ học vấn và kỹ năng thành công!");
      }
      else if (activeTab === 'security') {
        if (passwordData.newPassword !== passwordData.confirmNewPassword) return alert("Mật khẩu mới không khớp!");
        await authService.changePassword(passwordData);
        alert("Đổi mật khẩu thành công!");
        setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      }
      initData();
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || "Không thể thực hiện"));
    } finally { setIsSaving(false); }
  };

  const filteredSuggestions = systemSkills.filter(s => 
    s.skillName.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !mySkills.find(ms => ms.skillId === s.skillId)
  );

  if (loading) return <div className="vh-100 d-flex justify-content-center align-items-center bg-dark"><Spinner animation="border" variant="primary" /></div>;

  return (
    <div className="settings-page py-5 text-white animate-fade-in">
      <Container>
        <h1 className="fw-bold mb-5">Thiết lập <span className="text-primary-glow">Tài khoản</span></h1>
        
        <Row className="g-4">
          <Col lg={3}>
            <aside className="settings-sidebar glass-card p-3 sticky-top" style={{ top: '100px' }}>
              <div className={`settings-nav-item ${activeTab === 'personal' ? 'active' : ''}`} onClick={() => setActiveTab('personal')}>
                <UserCircle size={20} /> <span>Thông tin cơ bản</span>
              </div>
              <div className={`settings-nav-item ${activeTab === 'edu' ? 'active' : ''}`} onClick={() => setActiveTab('edu')}>
                <GraduationCap size={20} /> <span>Học vấn & Kỹ năng</span>
              </div>
              <div className={`settings-nav-item ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>
                <Lock size={20} /> <span>Bảo mật & Mật khẩu</span>
              </div>
            </aside>
          </Col>

          <Col lg={9}>
            <div className="glass-card p-4 p-md-5">
              <Form onSubmit={handleSave}>
                
                {/* TAB 1: PERSONAL */}
                {activeTab === 'personal' && (
                  <div className="animate-fade-in">
                    <div className="avatar-section text-center mb-5">
                      <div className="avatar-wrapper mx-auto">
                        <img src={basicInfo.avatarUrl || 'https://ui-avatars.com/api/?name=User'} alt="Avatar" className="avatar-img shadow-lg" />
                        <label className="upload-icon-btn">
                          <Camera size={18} onClick={() => {
                              const url = prompt("Nhập link ảnh mới:", basicInfo.avatarUrl);
                              if(url) handleAvatarUpdate(url);
                          }} />
                        </label>
                      </div>
                      <p className="x-small mt-2">Tài khoản: {basicInfo.fullName || 'Chưa đặt tên'}</p>
                    </div>
                    <Row>
                      <Col md={6}><Form.Group className="mb-4"><Form.Label className="small fw-bold">HỌ VÀ TÊN</Form.Label><Form.Control className="settings-input" value={basicInfo.fullName} onChange={e => setBasicInfo({...basicInfo, fullName: e.target.value})} /></Form.Group></Col>
                      <Col md={6}><Form.Group className="mb-4"><Form.Label className="small fw-bold">SỐ ĐIỆN THOẠI</Form.Label><Form.Control className="settings-input" value={basicInfo.phoneNumber} onChange={e => setBasicInfo({...basicInfo, phoneNumber: e.target.value})} /></Form.Group></Col>
                      <Col md={6}><Form.Group className="mb-4"><Form.Label className="small fw-bold">NGÀY SINH</Form.Label><Form.Control type="date" className="settings-input" value={basicInfo.birthday?.split('T')[0] || ''} onChange={e => setBasicInfo({...basicInfo, birthday: e.target.value})} /></Form.Group></Col>
                      <Col md={6}><Form.Group className="mb-4"><Form.Label className="small fw-bold">GIỚI TÍNH</Form.Label><Form.Select className="settings-input" value={String(basicInfo.gender)} onChange={e => setBasicInfo({...basicInfo, gender: e.target.value === 'true'})}><option value="true">Nam</option><option value="false">Nữ</option></Form.Select></Form.Group></Col>
                      <Col md={12}><Form.Group className="mb-4"><Form.Label className="small fw-bold">TIỂU SỬ</Form.Label><Form.Control as="textarea" rows={3} className="settings-input" value={basicInfo.bio} onChange={e => setBasicInfo({...basicInfo, bio: e.target.value})} /></Form.Group></Col>
                    </Row>
                  </div>
                )}

                {/* TAB 2: EDUCATION & SKILLS */}
                {activeTab === 'edu' && (
                  <div className="animate-fade-in">
                    <h5 className="text-white fw-bold mb-4 border-start border-primary border-4 ps-3">Thông tin sinh viên</h5>
                    <Row>
                      <Col md={6}><Form.Group className="mb-4"><Form.Label className="small fw-bold"><Hash size={14}/> MSSV</Form.Label><Form.Control className="settings-input" value={studentInfo.studentCode} onChange={e => setStudentInfo({...studentInfo, studentCode: e.target.value})} /></Form.Group></Col>
                      <Col md={6}><Form.Group className="mb-4"><Form.Label className="small fw-bold"><BookOpen size={14}/> TRƯỜNG</Form.Label><Form.Control className="settings-input" value={studentInfo.school} onChange={e => setStudentInfo({...studentInfo, school: e.target.value})} /></Form.Group></Col>
                      <Col md={8}><Form.Group className="mb-4"><Form.Label className="small fw-bold">CHUYÊN NGÀNH</Form.Label><Form.Control className="settings-input" value={studentInfo.major} onChange={e => setStudentInfo({...studentInfo, major: e.target.value})} /></Form.Group></Col>
                      <Col md={4}><Form.Group className="mb-4"><Form.Label className="small fw-bold">GPA</Form.Label><Form.Control type="number" step="0.1" className="settings-input" value={studentInfo.gpa} onChange={e => setStudentInfo({...studentInfo, gpa: e.target.value})} /></Form.Group></Col>
                    </Row>

                    <h5 className="text-white fw-bold mt-4 mb-4 border-start border-primary border-4 ps-3">Kỹ năng năng lực</h5>
                    {/* BADGE LIST (MỤC 4.1) */}
                    <div className="d-flex flex-wrap gap-2 mb-4 p-3 border-dashed-blue rounded">
                      {mySkills.map(s => (
                        <Badge key={s.skillId} pill className={`px-3 py-2 d-flex align-items-center gap-2 
                          ${s.status === 'APPROVED' ? 'bg-primary' : s.status === 'PENDING' ? 'bg-warning text-dark' : 'bg-danger'}`}>
                          {s.skillName} {s.status === 'PENDING' && <small className="opacity-75">(Đang duyệt)</small>}
                          <XCircle size={14} className="ms-2 pointer" onClick={() => removeSkill(s.skillId)} />
                        </Badge>
                      ))}
                    </div>

                    {/* SEARCH & SUGGEST (MỤC 4.3) */}
                    <div className="position-relative w-md-50" ref={dropdownRef}>
                      <InputGroup className="bg-dark-input rounded">
                        <InputGroup.Text className="bg-transparent border-0 text-muted"><Search size={18}/></InputGroup.Text>
                        <Form.Control className="bg-transparent border-0 text-white" placeholder="Tìm kỹ năng..." value={searchTerm} onChange={e => {setSearchTerm(e.target.value); setShowDropdown(true)}} onFocus={() => setShowDropdown(true)} />
                      </InputGroup>
                      {showDropdown && searchTerm && (
                        <ListGroup className="suggestion-dropdown shadow-lg mt-1">
                          {filteredSuggestions.map(s => (
                            <ListGroup.Item key={s.skillId} action className="bg-dark text-white border-secondary" onClick={() => handleSelectSkill(s)}>{s.skillName}</ListGroup.Item>
                          ))}
                          <ListGroup.Item action className="bg-dark text-info fw-bold border-secondary" onClick={handleSuggestSkill}>+ Đề xuất: "{searchTerm}"</ListGroup.Item>
                        </ListGroup>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 3: SECURITY */}
                {activeTab === 'security' && (
                  <div className="animate-fade-in">
                    <h5 className="text-white fw-bold mb-4 border-start border-warning border-4 ps-3">Bảo mật tài khoản</h5>
                    <Form.Group className="mb-4"><Form.Label className="small fw-bold">MẬT KHẨU HIỆN TẠI</Form.Label><Form.Control type="password" underline className="settings-input" value={passwordData.currentPassword} onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})} /></Form.Group>
                    <Form.Group className="mb-4"><Form.Label className="small fw-bold">MẬT KHẨU MỚI</Form.Label><Form.Control type="password" underline className="settings-input" value={passwordData.newPassword} onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})} /></Form.Group>
                    <Form.Group className="mb-4"><Form.Label className="small fw-bold">XÁC NHẬN MẬT KHẨU MỚI</Form.Label><Form.Control type="password" underline className="settings-input" value={passwordData.confirmNewPassword} onChange={e => setPasswordData({...passwordData, confirmNewPassword: e.target.value})} /></Form.Group>
                  </div>
                )}

                <div className="d-flex justify-content-end gap-3 mt-5 pt-4 border-top border-white-10">
                  <Button variant="primary" type="submit" className="px-5 py-2 fw-bold shadow-glow" disabled={isSaving}>
                    {isSaving ? <Loader2 className="spinner me-2" size={18} /> : <Save className="me-2" size={18} />}
                    {activeTab === 'security' ? 'CẬP NHẬT MẬT KHẨU' : 'LƯU THAY ĐỔI'}
                  </Button>
                </div>
              </Form>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ProfileSettings;