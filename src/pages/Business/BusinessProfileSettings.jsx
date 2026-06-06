import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Image } from 'react-bootstrap';
import { 
  Building2, Globe, Mail, Phone, MapPin, 
  Camera, Save, ShieldCheck, Bell, Users, 
  Info, Layout 
} from 'lucide-react';
import '../../CSS/BusinessProfileSettings.css';

const BusinessProfileSettings = () => {
  const [activeTab, setActiveTab] = useState('general');

  // State quản lý thông tin doanh nghiệp
  const [bizData, setBizData] = useState({
    companyName: 'TechNova Solutions',
    industry: 'AI & Phần mềm',
    email: 'hr@technova.vn',
    phone: '024 3333 8888',
    website: 'www.technova.vn',
    address: 'Tầng 12, Tòa nhà Lotte, Liễu Giai, Hà Nội',
    size: '100-200',
    bio: 'Chúng tôi là công ty dẫn đầu trong lĩnh vực giải pháp Trí tuệ nhân tạo tại Việt Nam...',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg',
    banner: 'https://images.unsplash.com/photo-1497366216548-37526070297c'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBizData({ ...bizData, [name]: value });
  };

  const handleUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setBizData({ ...bizData, [type]: event.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    alert("Đã cập nhật hồ sơ doanh nghiệp thành công!");
  };

  return (
    <div className="biz-settings-page py-5">
      <Container>
        <div className="mb-5 animate-fade-in">
          <h1 className="fw-bold text-white">Thiết lập <span className="text-primary-glow">Doanh nghiệp</span></h1>
          <p className="text-muted">Cập nhật thông tin thương hiệu để tăng tỷ lệ thu hút nhân tài.</p>
        </div>

        <Row className="g-4">
          {/* SIDEBAR ĐIỀU HƯỚNG */}
          <Col lg={3}>
            <div className="glass-card p-3 sticky-top" style={{ top: '100px' }}>
              <div 
                className={`biz-nav-item ${activeTab === 'general' ? 'active' : ''}`}
                onClick={() => setActiveTab('general')}
              >
                <Building2 size={20} /> <span>Thông tin chung</span>
              </div>
              <div 
                className={`biz-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <Layout size={20} /> <span>Trang cá nhân</span>
              </div>
              <div 
                className={`biz-nav-item ${activeTab === 'security' ? 'active' : ''}`}
                onClick={() => setActiveTab('security')}
              >
                <ShieldCheck size={20} /> <span>Bảo mật</span>
              </div>
              <div 
                className={`biz-nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
                onClick={() => setActiveTab('notifications')}
              >
                <Bell size={20} /> <span>Thông báo</span>
              </div>
            </div>
          </Col>

          {/* NỘI DUNG CHÍNH */}
          <Col lg={9}>
            <div className="glass-card p-0 overflow-hidden">
              {/* PHẦN BANNER & LOGO UPLOAD */}
              <div className="settings-banner-area">
                <img src={bizData.banner} alt="Banner" className="settings-banner-img" />
                <label className="btn-change-banner" htmlFor="banner-up">
                  <Camera size={18} className="me-2" /> Đổi ảnh bìa
                </label>
                <input type="file" id="banner-up" hidden onChange={(e) => handleUpload(e, 'banner')} />
                
                <div className="settings-logo-overlap glass-card">
                  <img src={bizData.logo} alt="Logo" />
                  <label className="btn-change-logo" htmlFor="logo-up">
                    <Camera size={14} />
                  </label>
                  <input type="file" id="logo-up" hidden onChange={(e) => handleUpload(e, 'logo')} />
                </div>
              </div>

              <div className="p-4 p-md-5 pt-5">
                <Form onSubmit={handleSave}>
                  <h5 className="text-white fw-bold mb-4 border-start border-primary border-4 ps-3">Thông tin cơ bản</h5>
                  
                  <Form.Group className="mb-4">
                    <Form.Label className="biz-label">TÊN DOANH NGHIỆP / TỔ CHỨC</Form.Label>
                    <Form.Control 
                      name="companyName"
                      value={bizData.companyName}
                      onChange={handleInputChange}
                      className="biz-input" 
                    />
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label className="biz-label">NGÀNH NGHỀ CHÍNH</Form.Label>
                        <Form.Select 
                          name="industry"
                          value={bizData.industry}
                          onChange={handleInputChange}
                          className="biz-input"
                        >
                          <option>AI & Phần mềm</option>
                          <option>Thương mại điện tử</option>
                          <option>Marketing Agency</option>
                          <option>Giáo dục</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label className="biz-label">QUY MÔ NHÂN SỰ</Form.Label>
                        <Form.Select 
                          name="size"
                          value={bizData.size}
                          onChange={handleInputChange}
                          className="biz-input"
                        >
                          <option value="1-50">1 - 50 nhân viên</option>
                          <option value="100-200">100 - 200 nhân viên</option>
                          <option value="500+">Trên 500 nhân viên</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <h5 className="text-white fw-bold mt-4 mb-4 border-start border-primary border-4 ps-3">Thông tin liên hệ</h5>
                  
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label className="biz-label"><Globe size={14} className="me-2"/>WEBSITE</Form.Label>
                        <Form.Control 
                          name="website"
                          value={bizData.website}
                          onChange={handleInputChange}
                          className="biz-input" 
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label className="biz-label"><Mail size={14} className="me-2"/>EMAIL TUYỂN DỤNG</Form.Label>
                        <Form.Control 
                          name="email"
                          value={bizData.email}
                          onChange={handleInputChange}
                          className="biz-input" 
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-4">
                    <Form.Label className="biz-label"><MapPin size={14} className="me-2"/>ĐỊA CHỈ TRỤ SỞ</Form.Label>
                    <Form.Control 
                      name="address"
                      value={bizData.address}
                      onChange={handleInputChange}
                      className="biz-input" 
                    />
                  </Form.Group>

                  <Form.Group className="mb-5">
                    <Form.Label className="biz-label">GIỚI THIỆU CÔNG TY</Form.Label>
                    <Form.Control 
                      as="textarea" 
                      rows={5}
                      name="bio"
                      value={bizData.bio}
                      onChange={handleInputChange}
                      className="biz-input" 
                    />
                  </Form.Group>

                  <div className="d-flex justify-content-end gap-3">
                    <Button variant="outline-light" className="px-4 py-2 fw-bold x-small">HỦY BỎ</Button>
                    <Button variant="primary" type="submit" className="px-5 py-2 fw-bold shadow-glow">
                      LƯU HỒ SƠ <Save size={18} className="ms-2" />
                    </Button>
                  </div>
                </Form>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default BusinessProfileSettings;