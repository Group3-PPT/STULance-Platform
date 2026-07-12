import { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Spinner } from 'react-bootstrap';
import { 
  Building2, Globe, MapPin, Camera, Save, Lock,
  CreditCard, Loader2
} from 'lucide-react';
import { enterpriseService } from '../../services/enterprise.service';
import { authService } from '../../services/authService';
import '../../CSS/ProfileSettings.css';
import '../../CSS/BusinessProfileSettings.css';

const BusinessProfileSettings = () => {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  const [bizData, setBizData] = useState({
    companyName: '',
    companyTaxCode: '',
    representName: '',
    address: '',
    website: '',
    description: ''
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  const fetchBiz = async () => {
    try {
      const res = await enterpriseService.getMe();
      if (res.success && res.data) {
        setBizData({
          companyName: res.data.companyName || '',
          companyTaxCode: res.data.companyTaxCode || '',
          representName: res.data.representName || '',
          address: res.data.address || '',
          website: res.data.website || '',
          description: res.data.description || ''
        });
        setLogoPreview(res.data.logoUrl);
      }
    } catch (err) {
      console.error("Lỗi tải thông tin doanh nghiệp");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBiz(); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBizData({ ...bizData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    if (activeTab === 'security') {
      if (!passwordData.currentPassword || !passwordData.newPassword) {
        alert("Vui lòng nhập đầy đủ thông tin!");
        setIsSaving(false);
        return;
      }
      if (passwordData.newPassword !== passwordData.confirmNewPassword) {
        alert("Mật khẩu mới không khớp!");
        setIsSaving(false);
        return;
      }
      if (passwordData.newPassword.length < 6) {
        alert("Mật khẩu mới phải có ít nhất 6 ký tự!");
        setIsSaving(false);
        return;
      }
      try {
        await authService.changePassword({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        });
        alert("Đổi mật khẩu thành công!");
        setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      } catch (err) {
        alert("Lỗi: " + (err.response?.data?.message || "Không thể đổi mật khẩu"));
      } finally {
        setIsSaving(false);
      }
      return;
    }

    const formData = new FormData();
    formData.append('CompanyName', bizData.companyName);
    formData.append('CompanyTaxCode', bizData.companyTaxCode);
    formData.append('RepresentName', bizData.representName);
    formData.append('Address', bizData.address);
    formData.append('Website', bizData.website);
    formData.append('Description', bizData.description);
    if (logoFile) formData.append('LogoFile', logoFile);

    try {
      await enterpriseService.updateMe(formData);
      alert("Cập nhật hồ sơ doanh nghiệp thành công!");
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || "Không thể lưu dữ liệu"));
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="vh-100 d-flex justify-content-center align-items-center bg-dark"><Spinner animation="border" variant="primary" /></div>;

  return (
    <div className="settings-page py-5 text-white animate-fade-in">
      <Container>
        <h1 className="fw-bold mb-5">Thiết lập <span className="text-primary-glow">Doanh nghiệp</span></h1>
        
        <Row className="g-4">
          <Col lg={3}>
            <aside className="settings-sidebar glass-card p-3 sticky-top" style={{ top: '100px' }}>
              <div className={`settings-nav-item ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>
                <Building2 size={20} /> <span>Thông tin doanh nghiệp</span>
              </div>
              <div className={`settings-nav-item ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>
                <Lock size={20} /> <span>Bảo mật & Mật khẩu</span>
              </div>
            </aside>
          </Col>

          <Col lg={9}>
            <div className="glass-card p-4 p-md-5">
              <Form onSubmit={handleSave}>

                {/* TAB 1: COMPANY INFO */}
                {activeTab === 'info' && (
                  <div className="animate-fade-in">
                    <div className="avatar-section text-center mb-5">
                      <div className="avatar-wrapper mx-auto">
                        <img
                          src={logoPreview || 'https://ui-avatars.com/api/?name=E&background=0D8ABC&color=fff&size=150'}
                          alt="Logo"
                          className="avatar-img shadow-lg"
                        />
                        <label className="upload-icon-btn">
                          <Camera size={18} onClick={() => document.getElementById('logo-upload').click()} />
                        </label>
                        <input type="file" id="logo-upload" hidden accept="image/*" onChange={handleFileChange} />
                      </div>
                      <p className="x-small mt-2">Tài khoản: {bizData.companyName || 'Tên công ty'}</p>
                    </div>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-4">
                          <Form.Label className="small fw-bold">TÊN DOANH NGHIỆP</Form.Label>
                          <Form.Control className="settings-input" name="companyName" value={bizData.companyName} onChange={handleChange} />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-4">
                          <Form.Label className="small fw-bold">NGƯỜI ĐẠI DIỆN</Form.Label>
                          <Form.Control className="settings-input" name="representName" value={bizData.representName} onChange={handleChange} />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-4">
                          <Form.Label className="small fw-bold"><CreditCard size={14} /> MÃ SỐ THUẾ</Form.Label>
                          <Form.Control className="settings-input" name="companyTaxCode" value={bizData.companyTaxCode} onChange={handleChange} />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-4">
                          <Form.Label className="small fw-bold"><Globe size={14} /> WEBSITE</Form.Label>
                          <Form.Control className="settings-input" name="website" value={bizData.website} onChange={handleChange} placeholder="https://example.com" />
                        </Form.Group>
                      </Col>
                      <Col md={12}>
                        <Form.Group className="mb-4">
                          <Form.Label className="small fw-bold"><MapPin size={14} /> ĐỊA CHỈ TRỤ SỞ</Form.Label>
                          <Form.Control className="settings-input" name="address" value={bizData.address} onChange={handleChange} />
                        </Form.Group>
                      </Col>
                      <Col md={12}>
                        <Form.Group className="mb-4">
                          <Form.Label className="small fw-bold">MÔ TẢ DOANH NGHIỆP</Form.Label>
                          <Form.Control as="textarea" rows={3} className="settings-input" name="description" value={bizData.description} onChange={handleChange} placeholder="Giới thiệu về công ty, lĩnh vực hoạt động..." />
                        </Form.Group>
                      </Col>
                    </Row>
                  </div>
                )}

                {/* TAB 2: SECURITY */}
                {activeTab === 'security' && (
                  <div className="animate-fade-in">
                    <h5 className="text-white fw-bold mb-4 border-start border-warning border-4 ps-3">Bảo mật tài khoản</h5>
                    <Form.Group className="mb-4">
                      <Form.Label className="small fw-bold">MẬT KHẨU HIỆN TẠI</Form.Label>
                      <Form.Control type="password" className="settings-input" value={passwordData.currentPassword} onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})} />
                    </Form.Group>
                    <Form.Group className="mb-4">
                      <Form.Label className="small fw-bold">MẬT KHẨU MỚI</Form.Label>
                      <Form.Control type="password" className="settings-input" value={passwordData.newPassword} onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})} />
                    </Form.Group>
                    <Form.Group className="mb-4">
                      <Form.Label className="small fw-bold">XÁC NHẬN MẬT KHẨU MỚI</Form.Label>
                      <Form.Control type="password" className="settings-input" value={passwordData.confirmNewPassword} onChange={e => setPasswordData({...passwordData, confirmNewPassword: e.target.value})} />
                    </Form.Group>
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

export default BusinessProfileSettings;
