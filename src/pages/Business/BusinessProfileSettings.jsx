import { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Spinner } from 'react-bootstrap';
import { 
  Globe, MapPin, Camera, Save, Lock, Building2,
  UserCheck, CreditCard, Loader2, X 
} from 'lucide-react';
import { enterpriseService } from '../../services/enterprise.service';
import { authService } from '../../services/authService';
import '../../CSS/BusinessProfileSettings.css';

const BusinessProfileSettings = () => {
  // ============================================================
  // STATE
  // ============================================================

  // Loading trang
  const [loading, setLoading] = useState(true);

  // Đang lưu
  const [isSaving, setIsSaving] = useState(false);

  // Tab đang xem
  const [activeTab, setActiveTab] = useState('profile');

  // ============================================================
  // STATE DỮ LIỆU DOANH NGHIỆP
  // ============================================================
  const [bizData, setBizData] = useState({
    companyName: '',
    companyTaxCode: '',
    representName: '',
    address: '',
    website: '',
    description: ''
  });

  // File logo
  const [logoFile, setLogoFile] = useState(null);

  // Preview logo
  const [logoPreview, setLogoPreview] = useState('');

  // ============================================================
  // STATE MẬT KHẨU
  // ============================================================
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  // ============================================================
  // HÀM TẢI DỮ LIỆU
  // ============================================================
  const fetchBiz = async function () {
    try {
      var res = await enterpriseService.getMe();

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

  // ============================================================
  // EFFECT: Tải dữ liệu khi mount
  // ============================================================
  useEffect(function () {
    fetchBiz();
  }, []);

  // ============================================================
  // HÀM XỬ LÝ THAY ĐỔI FORM
  // ============================================================
  const handleChange = function (e) {
    var name = e.target.name;
    var value = e.target.value;
    setBizData({ ...bizData, [name]: value });
  };

  // ============================================================
  // HÀM CHỌN FILE LOGO
  // ============================================================
  const handleFileChange = function (e) {
    var file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  // ============================================================
  // HÀM HỦY
  // ============================================================
  const handleCancel = function () {
    var confirmed = window.confirm('Bạn có chắc muốn hủy? Các thay đổi chưa lưu sẽ bị mất.');
    if (confirmed) {
      fetchBiz();
    }
  };

  // ============================================================
  // HÀM LƯU HỒ SƠ
  // ============================================================
  const handleSave = async function (e) {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Tạo FormData để upload file
      var formData = new FormData();
      formData.append('CompanyName', bizData.companyName);
      formData.append('CompanyTaxCode', bizData.companyTaxCode);
      formData.append('RepresentName', bizData.representName);
      formData.append('Address', bizData.address);
      formData.append('Website', bizData.website);
      formData.append('Description', bizData.description);

      if (logoFile) {
        formData.append('LogoFile', logoFile);
      }

      await enterpriseService.updateMe(formData);
      alert("Cập nhật hồ sơ doanh nghiệp thành công!");

    } catch (err) {
      var msg = "Không thể lưu dữ liệu";
      if (err.response && err.response.data && err.response.data.message) {
        msg = err.response.data.message;
      }
      alert("Lỗi: " + msg);

    } finally {
      setIsSaving(false);
    }
  };

  // ============================================================
  // HÀM ĐỔI MẬT KHẨU
  // ============================================================
  const handleChangePassword = async function (e) {
    e.preventDefault();

    // Validate
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      alert("Mật khẩu mới không khớp!");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert("Mật khẩu mới phải có ít nhất 6 ký tự!");
      return;
    }

    setIsSaving(true);

    try {
      await authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      alert("Đổi mật khẩu thành công!");
      setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });

    } catch (err) {
      var msg = "Không thể đổi mật khẩu";
      if (err.response && err.response.data && err.response.data.message) {
        msg = err.response.data.message;
      }
      alert("Lỗi: " + msg);

    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="vh-100 d-flex justify-content-center align-items-center bg-dark"><Spinner animation="border" variant="primary" /></div>;

  return (
    <div className="biz-settings-page py-5 text-white animate-fade-in">
      <Container>
        <h1 className="fw-bold mb-5">Thiết lập <span className="text-primary-glow">Doanh nghiệp</span></h1>

        <Row className="g-4">
          {/* SIDEBAR */}
          <Col lg={3}>
            <aside className="settings-sidebar glass-card p-3 sticky-top" style={{ top: '100px' }}>
              <div className={`settings-nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
                <Building2 size={20} /> <span>Hồ sơ doanh nghiệp</span>
              </div>
              <div className={`settings-nav-item ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>
                <Lock size={20} /> <span>Bảo mật & Mật khẩu</span>
              </div>
            </aside>
          </Col>

          {/* CONTENT */}
          <Col lg={9}>
            <div className="glass-card p-4 p-md-5">
              <Form onSubmit={activeTab === 'profile' ? handleSave : handleChangePassword}>

                {/* TAB 1: PROFILE */}
                {activeTab === 'profile' && (
                  <div className="animate-fade-in">
                    <div className="text-center mb-5">
                      <div className="avatar-wrapper mx-auto mb-3" style={{ width: '120px', height: '120px', position: 'relative' }}>
                        <img 
                           src={logoPreview || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' fill='%23e2e8f0'%3E%3Crect width='120' height='120' rx='12'/%3E%3Ctext x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' fill='%2364748b' font-size='14'%3ELOGO%3C/text%3E%3C/svg%3E"} 
                           alt="Logo" 
                           className="w-100 h-100 object-fit-contain bg-white rounded-3 p-2" 
                        />
                        <label htmlFor="logo-up" className="upload-icon-btn shadow-glow" style={{ position: 'absolute', bottom: '0', right: '0' }}>
                          <Camera size={18} />
                        </label>
                        <input type="file" id="logo-up" hidden accept="image/*" onChange={handleFileChange} />
                      </div>
                      <h5 className="fw-bold mb-0">{bizData.companyName || "Tên Công Ty"}</h5>
                      <p className="x-small text-muted mb-0">MST: {bizData.companyTaxCode || "Chưa cập nhật"}</p>
                    </div>

                    <h5 className="text-white fw-bold mb-4 border-start border-primary border-4 ps-3">Hồ sơ pháp lý</h5>
                    
                    <Form.Group className="mb-4">
                      <Form.Label className="small fw-bold">TÊN DOANH NGHIỆP</Form.Label>
                      <Form.Control name="companyName" value={bizData.companyName} onChange={handleChange} className="settings-input" placeholder="VD: Công ty TNHH Công Nghệ ABC" />
                    </Form.Group>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-4">
                          <Form.Label className="small fw-bold"><CreditCard size={14} className="me-1"/>MÃ SỐ THUẾ</Form.Label>
                          <Form.Control name="companyTaxCode" value={bizData.companyTaxCode} onChange={handleChange} className="settings-input" />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-4">
                          <Form.Label className="small fw-bold"><UserCheck size={14} className="me-1"/>NGƯỜI ĐẠI DIỆN</Form.Label>
                          <Form.Control name="representName" value={bizData.representName} onChange={handleChange} className="settings-input" />
                        </Form.Group>
                      </Col>
                    </Row>

                    <h5 className="text-white fw-bold mt-4 mb-4 border-start border-primary border-4 ps-3">Thông tin liên lạc</h5>
                    
                    <Form.Group className="mb-4">
                      <Form.Label className="small fw-bold"><Globe size={14} className="me-1"/>WEBSITE</Form.Label>
                      <Form.Control name="website" value={bizData.website} onChange={handleChange} className="settings-input" placeholder="https://example.com" />
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label className="small fw-bold"><MapPin size={14} className="me-1"/>ĐỊA CHỈ TRỤ SỞ</Form.Label>
                      <Form.Control name="address" value={bizData.address} onChange={handleChange} className="settings-input" />
                    </Form.Group>

                    <h5 className="text-white fw-bold mt-4 mb-4 border-start border-primary border-4 ps-3">Giới thiệu công ty</h5>

                    <Form.Group className="mb-4">
                      <Form.Label className="small fw-bold">MÔ TẢ DOANH NGHIỆP</Form.Label>
                      <Form.Control as="textarea" rows={4} name="description" value={bizData.description} onChange={handleChange} className="settings-input" placeholder="Giới thiệu về công ty, lĩnh vực hoạt động, quy mô..." />
                    </Form.Group>
                  </div>
                )}

                {/* TAB 2: SECURITY */}
                {activeTab === 'security' && (
                  <div className="animate-fade-in">
                    <h5 className="text-white fw-bold mb-4 border-start border-warning border-4 ps-3">Bảo mật tài khoản</h5>
                    <Form.Group className="mb-4">
                      <Form.Label className="small fw-bold">MẬT KHẨU HIỆN TẠI</Form.Label>
                      <Form.Control type="password" underline className="settings-input" value={passwordData.currentPassword} onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})} />
                    </Form.Group>
                    <Form.Group className="mb-4">
                      <Form.Label className="small fw-bold">MẬT KHẨU MỚI</Form.Label>
                      <Form.Control type="password" underline className="settings-input" value={passwordData.newPassword} onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})} />
                    </Form.Group>
                    <Form.Group className="mb-4">
                      <Form.Label className="small fw-bold">XÁC NHẬN MẬT KHẨU MỚI</Form.Label>
                      <Form.Control type="password" underline className="settings-input" value={passwordData.confirmNewPassword} onChange={e => setPasswordData({...passwordData, confirmNewPassword: e.target.value})} />
                    </Form.Group>
                  </div>
                )}

                <div className="d-flex justify-content-end gap-3 mt-5 pt-4 border-top border-white-10">
                  <Button variant="outline-light" className="px-4 fw-bold" onClick={handleCancel}>
                    <X size={16} className="me-1" /> HỦY BỎ
                  </Button>
                  <Button variant="primary" type="submit" className="px-5 py-2 fw-bold shadow-glow" disabled={isSaving}>
                    {isSaving ? <Loader2 className="spinner me-2" size={18} /> : <Save className="me-2" size={18} />}
                    {activeTab === 'security' ? 'CẬP NHẬT MẬT KHẨU' : 'LƯU HỒ SƠ'}
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
