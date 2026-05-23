import React, { useState } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { 
  UserCircle, GraduationCap, ShieldCheck, Bell, 
  Camera, Save, X, Smartphone, Calendar, Mail, MapPin 
} from 'lucide-react';
import '../../CSS/ProfileSettings.css'; // Tuân thủ cấu trúc import bạn yêu cầu

const ProfileSettings = () => {
  // State quản lý thông tin người dùng
  const [user, setUser] = useState({
    fullName: 'Nguyễn Văn A',
    role: 'Web Developer',
    phone: '0901234567',
    birthday: '2002-05-20',
    school: 'Đại học Bách Khoa',
    gradYear: 2024,
    bio: 'Em là sinh viên năm cuối chuyên ngành CNTT, có đam mê với Javascript và các nền tảng 3D trên web.',
    avatar: 'https://ui-avatars.com/api/?name=Nguyen+Van+A&size=120&background=0D8ABC&color=fff'
  });

  const [activeTab, setActiveTab] = useState('personal');

  // Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  // Xử lý upload ảnh đại diện (Preview)
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUser({ ...user, avatar: event.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    alert("Đã lưu thay đổi thông tin cá nhân!");
    console.log("Dữ liệu cập nhật:", user);
  };

  return (
    <div className="settings-page py-5">
      <Container>
        <div className="mb-5 animate-fade-in">
          <h1 className="fw-bold text-white">Thiết lập <span className="text-primary-glow">Tài khoản</span></h1>
          <p className="text-muted">Quản lý thông tin định danh và tùy chỉnh trải nghiệm của bạn.</p>
        </div>

        <Row className="g-4">
          {/* CỘT TRÁI: MENU ĐIỀU HƯỚNG */}
          <Col lg={3}>
            <aside className="settings-sidebar glass-card p-3 sticky-top" style={{ top: '100px' }}>
              <div 
                className={`settings-nav-item ${activeTab === 'personal' ? 'active' : ''}`}
                onClick={() => setActiveTab('personal')}
              >
                <UserCircle size={20} /> <span>Thông tin cá nhân</span>
              </div>
              <div 
                className={`settings-nav-item ${activeTab === 'edu' ? 'active' : ''}`}
                onClick={() => setActiveTab('edu')}
              >
                <GraduationCap size={20} /> <span>Học vấn & Kỹ năng</span>
              </div>
              <div 
                className={`settings-nav-item ${activeTab === 'security' ? 'active' : ''}`}
                onClick={() => setActiveTab('security')}
              >
                <ShieldCheck size={20} /> <span>Bảo mật</span>
              </div>
              <div 
                className={`settings-nav-item ${activeTab === 'notif' ? 'active' : ''}`}
                onClick={() => setActiveTab('notif')}
              >
                <Bell size={20} /> <span>Thông báo</span>
              </div>
            </aside>
          </Col>

          {/* CỘT PHẢI: FORM NHẬP LIỆU */}
          <Col lg={9}>
            <div className="glass-card p-4 p-md-5">
              <Form onSubmit={handleSave}>
                {/* Upload Avatar */}
                <div className="avatar-section text-center mb-5">
                  <div className="avatar-wrapper mx-auto">
                    <img src={user.avatar} alt="Avatar Preview" className="avatar-img shadow-lg" />
                    <label htmlFor="avatar-upload" className="upload-icon-btn shadow">
                      <Camera size={18} />
                    </label>
                    <input 
                      type="file" 
                      id="avatar-upload" 
                      hidden 
                      accept="image/*" 
                      onChange={handleAvatarChange} 
                    />
                  </div>
                  <p className="small text-muted mt-3">Nhấn vào biểu tượng camera để đổi ảnh</p>
                </div>

                <h5 className="text-white fw-bold mb-4 border-start border-primary border-4 ps-3">Thông tin định danh</h5>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="small text-muted fw-bold text-uppercase">Họ và Tên</Form.Label>
                      <Form.Control 
                        type="text" 
                        name="fullName"
                        value={user.fullName}
                        onChange={handleChange}
                        className="settings-input"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="small text-muted fw-bold text-uppercase">Vị trí chuyên môn</Form.Label>
                      <Form.Control 
                        type="text" 
                        name="role"
                        value={user.role}
                        onChange={handleChange}
                        className="settings-input"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="small text-muted fw-bold text-uppercase">Số điện thoại</Form.Label>
                      <Form.Control 
                        type="text" 
                        name="phone"
                        value={user.phone}
                        onChange={handleChange}
                        className="settings-input"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="small text-muted fw-bold text-uppercase">Ngày sinh</Form.Label>
                      <Form.Control 
                        type="date" 
                        name="birthday"
                        value={user.birthday}
                        onChange={handleChange}
                        className="settings-input"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <h5 className="text-white fw-bold mt-4 mb-4 border-start border-primary border-4 ps-3">Học vấn</h5>
                <Row>
                  <Col md={8}>
                    <Form.Group className="mb-4">
                      <Form.Label className="small text-muted fw-bold text-uppercase">Trường đại học</Form.Label>
                      <Form.Select 
                        name="school" 
                        value={user.school} 
                        onChange={handleChange}
                        className="settings-input"
                      >
                        <option>Đại học Bách Khoa</option>
                        <option>Đại học Kinh tế Quốc dân</option>
                        <option>Đại học FPT</option>
                        <option>Đại học Ngoại thương</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-4">
                      <Form.Label className="small text-muted fw-bold text-uppercase">Năm tốt nghiệp</Form.Label>
                      <Form.Control 
                        type="number" 
                        name="gradYear"
                        value={user.gradYear}
                        onChange={handleChange}
                        className="settings-input"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-5">
                  <Form.Label className="small text-muted fw-bold text-uppercase">Giới thiệu bản thân</Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={4} 
                    name="bio"
                    value={user.bio}
                    onChange={handleChange}
                    className="settings-input"
                  />
                </Form.Group>

                <div className="d-flex justify-content-end gap-3">
                  <Button variant="outline-light" className="px-4 py-2 fw-bold">HỦY BỎ</Button>
                  <Button variant="primary" type="submit" className="px-5 py-2 fw-bold shadow-glow">
                    LƯU THAY ĐỔI
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