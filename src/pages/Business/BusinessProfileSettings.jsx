import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Spinner, InputGroup } from 'react-bootstrap';
import { 
  Building2, Globe, MapPin, Camera, Save, 
  UserCheck, CreditCard, Loader2, Link as LinkIcon 
} from 'lucide-react';
import { enterpriseService } from '../../services/enterprise.service';
import '../../CSS/BusinessProfileSettings.css';

const BusinessProfileSettings = () => {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // State khớp 100% với Swagger
  const [bizData, setBizData] = useState({
    companyName: '',
    companyTaxCode: '',
    representName: '',
    address: '',
    website: ''
  });

  // State riêng cho File và Preview
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');

  // 1. Tải dữ liệu ban đầu
  useEffect(() => {
    const fetchBiz = async () => {
      try {
        const res = await enterpriseService.getMe();
        if (res.success && res.data) {
          setBizData({
            companyName: res.data.companyName || '',
            companyTaxCode: res.data.companyTaxCode || '',
            representName: res.data.representName || '',
            address: res.data.address || '',
            website: res.data.website || ''
          });
          setLogoPreview(res.data.logoUrl); // Giả sử backend trả về logoUrl để hiển thị
        }
      } catch (err) {
        console.error("Lỗi tải thông tin doanh nghiệp");
      } finally {
        setLoading(false);
      }
    };
    fetchBiz();
  }, []);

  // 2. Xử lý thay đổi Input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setBizData({ ...bizData, [name]: value });
  };

  // 3. Xử lý chọn File Logo
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file)); // Tạo link tạm để xem trước
    }
  };

  // 4. Xử lý Lưu (Gửi FormData)
  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    const formData = new FormData();
    formData.append('CompanyName', bizData.companyName);
    formData.append('CompanyTaxCode', bizData.companyTaxCode);
    formData.append('RepresentName', bizData.representName);
    formData.append('Address', bizData.address);
    formData.append('Website', bizData.website);
    
    if (logoFile) {
      formData.append('LogoFile', logoFile);
    }

    try {
      await enterpriseService.updateMe(formData);
      alert("🎉 Cập nhật hồ sơ doanh nghiệp thành công!");
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || "Không thể lưu dữ liệu"));
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="vh-100 d-flex justify-content-center align-items-center bg-dark"><Spinner animation="border" variant="primary" /></div>;

  return (
    <div className="biz-settings-page py-5 text-white animate-fade-in">
      <Container>
        <div className="mb-5">
          <h1 className="fw-bold">Thiết lập <span className="text-primary-glow">Doanh nghiệp</span></h1>
          <p className="text-muted">Cung cấp thông tin chính xác để tăng độ uy tín với sinh viên.</p>
        </div>

        <Row className="g-4">
          <Col lg={4}>
            <div className="glass-card p-4 text-center">
              <div className="avatar-wrapper mx-auto mb-4" style={{ width: '150px', height: '150px', position: 'relative' }}>
                <img 
                   src={logoPreview || 'https://via.placeholder.com/150?text=LOGO'} 
                   alt="Logo" 
                   className="avatar-img w-100 h-100 object-fit-contain bg-white rounded-3 p-2" 
                />
                <label htmlFor="logo-up" className="upload-icon-btn shadow-glow" style={{ position: 'absolute', bottom: '0', right: '0' }}>
                  <Camera size={20} />
                </label>
                <input type="file" id="logo-up" hidden accept="image/*" onChange={handleFileChange} />
              </div>
              <h5 className="fw-bold">{bizData.companyName || "Tên Công Ty"}</h5>
              <p className="small text-muted mb-0">MST: {bizData.companyTaxCode || "Chưa cập nhật"}</p>
            </div>
          </Col>

          <Col lg={8}>
            <div className="glass-card p-4 p-md-5">
              <Form onSubmit={handleSave}>
                <h5 className="text-white fw-bold mb-4 border-start border-primary border-4 ps-3 uppercase-tracking">Hồ sơ pháp lý</h5>
                
                <Form.Group className="mb-4">
                  <Form.Label className="small text-muted fw-bold">TÊN DOANH NGHIỆP</Form.Label>
                  <Form.Control 
                    name="companyName"
                    value={bizData.companyName}
                    onChange={handleChange}
                    className="biz-input" 
                    placeholder="VD: Công ty TNHH Công Nghệ ABC"
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="small text-muted fw-bold"><CreditCard size={14} className="me-2"/>MÃ SỐ THUẾ</Form.Label>
                      <Form.Control 
                        name="companyTaxCode"
                        value={bizData.companyTaxCode}
                        onChange={handleChange}
                        className="biz-input"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="small text-muted fw-bold"><UserCheck size={14} className="me-2"/>NGƯỜI ĐẠI DIỆN</Form.Label>
                      <Form.Control 
                        name="representName"
                        value={bizData.representName}
                        onChange={handleChange}
                        className="biz-input"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <h5 className="text-white fw-bold mt-4 mb-4 border-start border-primary border-4 ps-3 uppercase-tracking">Thông tin liên lạc</h5>
                
                <Form.Group className="mb-4">
                  <Form.Label className="small text-muted fw-bold"><Globe size={14} className="me-2"/>WEBSITE</Form.Label>
                  <Form.Control 
                    name="website"
                    value={bizData.website}
                    onChange={handleChange}
                    className="biz-input" 
                    placeholder="https://example.com"
                  />
                </Form.Group>

                <Form.Group className="mb-5">
                  <Form.Label className="small text-muted fw-bold"><MapPin size={14} className="me-2"/>ĐỊA CHỈ TRỤ SỞ</Form.Label>
                  <Form.Control 
                    name="address"
                    value={bizData.address}
                    onChange={handleChange}
                    className="biz-input" 
                  />
                </Form.Group>

                <div className="d-flex justify-content-end gap-3 pt-4 border-top border-white-10">
                  <Button variant="outline-light" className="px-4 fw-bold">HỦY BỎ</Button>
                  <Button variant="primary" type="submit" className="px-5 fw-bold shadow-glow" disabled={isSaving}>
                    {isSaving ? <Loader2 className="spinner me-2" /> : <Save className="me-2" />} LƯU HỒ SƠ
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