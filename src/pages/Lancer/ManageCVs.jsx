import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Form, Button, Badge, Modal, Spinner } from 'react-bootstrap';
import {
  FileText, Plus, Trash2, Eye, EyeOff, Star, StarOff,
  Loader2, ExternalLink, Edit3, Globe, Lock, Check,
  Mail, Phone, MapPin, GraduationCap, Code2, Layers, Award,
  Printer, ChevronLeft, X
} from 'lucide-react';
import { cvService as cvApi } from '../../services/cvApiService';
import '../../CSS/ManageCVs.css';
import '../../CSS/CVMaker.css';

const TEMPLATES = [
  { code: 'modern', name: 'Hiện đại', color: '#3b82f6' },
  { code: 'classic', name: 'Cổ điển', color: '#8b5cf6' },
  { code: 'minimal', name: 'Tối giản', color: '#10b981' },
  { code: 'creative', name: 'Sáng tạo', color: '#f59e0b' },
];

const ManageCVs = () => {
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCvId, setSelectedCvId] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCv, setSelectedCv] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    desiredPosition: '',
    professionalSummary: '',
    templateCode: 'modern',
    isPublic: false,
    showEmail: true,
    showPhone: true,
    isDefault: false,
  });

  const fetchCvs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await cvApi.getMyCvs({ pageSize: 50 });
      if (res.success && res.data) {
        const items = res.data.items || [];
        setCvs(items);
        if (items.length > 0 && !selectedCvId) {
          setSelectedCvId(items[0].cvId);
        }
      }
    } catch (err) {
      console.error("Lỗi tải danh sách CV:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCvs(); }, [fetchCvs]);

  useEffect(() => {
    if (!selectedCvId) { setPreviewData(null); return; }
    const fetchPreview = async () => {
      setLoadingPreview(true);
      try {
        const res = await cvApi.getCvDetail(selectedCvId);
        setPreviewData(res.data || res);
      } catch {
        try {
          const res2 = await cvApi.getPublicCv(selectedCvId);
          setPreviewData(res2.data || res2);
        } catch { setPreviewData(null); }
      } finally { setLoadingPreview(false); }
    };
    fetchPreview();
  }, [selectedCvId]);

  const resetForm = () => {
    setFormData({
      title: '', desiredPosition: '', professionalSummary: '',
      templateCode: 'modern', isPublic: false, showEmail: true, showPhone: true, isDefault: false,
    });
  };

  const handleCreate = async () => {
    if (!formData.title.trim()) { alert("Vui lòng nhập tên CV!"); return; }
    setSaving(true);
    try {
      await cvApi.create(formData);
      alert("Tạo CV thành công!");
      setShowCreateModal(false);
      resetForm();
      fetchCvs();
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || "Không thể tạo CV"));
    } finally { setSaving(false); }
  };

  const handleEdit = async () => {
    if (!formData.title.trim() || !selectedCv) return;
    setSaving(true);
    try {
      await cvApi.updateCv(selectedCv.cvId, formData);
      alert("Cập nhật CV thành công!");
      setShowEditModal(false);
      setSelectedCv(null);
      resetForm();
      fetchCvs();
      if (selectedCvId === selectedCv.cvId) {
        setLoadingPreview(true);
        const res = await cvApi.getCvDetail(selectedCv.cvId);
        setPreviewData(res.data || res);
        setLoadingPreview(false);
      }
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || "Không thể cập nhật CV"));
    } finally { setSaving(false); }
  };

  const handleDelete = async (cvId) => {
    if (!window.confirm("Bạn có chắc muốn xóa CV này?")) return;
    try {
      await cvApi.deleteCv(cvId);
      alert("Đã xóa CV!");
      if (selectedCvId === cvId) {
        setSelectedCvId(null);
        setPreviewData(null);
      }
      fetchCvs();
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || "Không thể xóa CV"));
    }
  };

  const handleSetDefault = async (cvId) => {
    try {
      await cvApi.setDefault(cvId);
      fetchCvs();
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || "Không thể đặt mặc định"));
    }
  };

  const handleToggleVisibility = async (cvId, currentPublic) => {
    try {
      await cvApi.updateVisibility(cvId, { isPublic: !currentPublic });
      fetchCvs();
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || "Không thể thay đổi"));
    }
  };

  const openEditModal = (cv) => {
    setSelectedCv(cv);
    setFormData({
      title: cv.title || '',
      desiredPosition: cv.desiredPosition || '',
      professionalSummary: cv.professionalSummary || '',
      templateCode: cv.templateCode || 'modern',
      isPublic: cv.isPublic || false,
      showEmail: cv.showEmail !== false,
      showPhone: cv.showPhone !== false,
      isDefault: cv.isDefault || false,
    });
    setShowEditModal(true);
  };

  const handlePrint = () => window.print();

  const FormContent = ({ isEdit }) => (
    <>
      <Form.Group className="mb-3">
        <Form.Label className="text-white-50 fw-bold small">Tên CV *</Form.Label>
        <Form.Control placeholder="VD: CV - Nguyễn Văn A" className="bg-dark-input text-white border-0" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label className="text-white-50 fw-bold small">Vị trí mong muốn</Form.Label>
        <Form.Control placeholder="VD: Frontend Developer, UI/UX Designer..." className="bg-dark-input text-white border-0" value={formData.desiredPosition} onChange={(e) => setFormData({ ...formData, desiredPosition: e.target.value })} />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label className="text-white-50 fw-bold small">Giới thiệu bản thân</Form.Label>
        <Form.Control as="textarea" rows={4} placeholder="Mô tả ngắn gọn về bản thân, kinh nghiệm và mục tiêu nghề nghiệp..." className="bg-dark-input text-white border-0" value={formData.professionalSummary} onChange={(e) => setFormData({ ...formData, professionalSummary: e.target.value })} />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label className="text-white-50 fw-bold small">Mẫu CV</Form.Label>
        <Row className="g-2">
          {TEMPLATES.map(t => (
            <Col xs={6} key={t.code}>
              <div
                className={`p-3 rounded-3 text-center pointer transition-all ${formData.templateCode === t.code ? 'border border-primary' : ''}`}
                style={{
                  background: formData.templateCode === t.code ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.03)',
                  border: formData.templateCode === t.code ? '1px solid rgba(59,130,246,0.5)' : '1px solid rgba(255,255,255,0.06)'
                }}
                onClick={() => setFormData({ ...formData, templateCode: t.code })}
              >
                <div style={{ width: 32, height: 40, borderRadius: 4, background: t.color, margin: '0 auto 6px' }} />
                <span className="x-small fw-bold text-white">{t.name}</span>
                {formData.templateCode === t.code && <Check size={14} className="text-primary ms-1" />}
              </div>
            </Col>
          ))}
        </Row>
      </Form.Group>
      <hr className="border-secondary" />
      <div className="d-grid gap-2">
        <Form.Check type="switch" id="isPublic" label={<span className="small text-white-80"><Globe size={14} className="me-1" /> Cho phép hiển thị công khai</span>} checked={formData.isPublic} onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })} />
        <Form.Check type="switch" id="showEmail" label={<span className="small text-white-80">Hiển thị email</span>} checked={formData.showEmail} onChange={(e) => setFormData({ ...formData, showEmail: e.target.checked })} />
        <Form.Check type="switch" id="showPhone" label={<span className="small text-white-80">Hiển thị số điện thoại</span>} checked={formData.showPhone} onChange={(e) => setFormData({ ...formData, showPhone: e.target.checked })} />
      </div>
    </>
  );

  if (loading) {
    return <div className="text-center py-5"><Loader2 className="spinner text-primary" size={40} /></div>;
  }

  const templateCode = previewData?.templateCode || 'modern';
  const skills = previewData?.skills || [];
  const portfolios = previewData?.portfolios || [];

  return (
    <div className="manage-cvs-page animate-fade-in">
      <Container fluid className="py-3 px-3 px-md-4">
        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-4 no-print">
          <div>
            <h2 className="text-white fw-bold mb-1">Quản lý CV</h2>
            <p className="text-white-50 small mb-0">Chọn CV để xem trước, tạo và quản lý CV xin việc</p>
          </div>
          <Button variant="primary" className="fw-bold px-4" onClick={() => { resetForm(); setShowCreateModal(true); }}>
            <Plus size={18} className="me-2" /> Tạo CV mới
          </Button>
        </div>

        <Row className="g-4">
          {/* LEFT: CV LIST */}
          <Col lg={4} xl={3} className="no-print">
            <div className="cv-list-panel">
              {cvs.length === 0 ? (
                <div className="text-center py-5 glass-card">
                  <FileText size={48} className="text-white-50 mb-3 opacity-25" />
                  <h5 className="text-white-50">Chưa có CV nào</h5>
                  <p className="text-white-50 small">Tạo CV đầu tiên để bắt đầu ứng tuyển</p>
                  <Button variant="primary" className="fw-bold" onClick={() => { resetForm(); setShowCreateModal(true); }}>
                    <Plus size={16} className="me-2" /> Tạo CV ngay
                  </Button>
                </div>
              ) : (
                <div className="cv-list-scroll">
                  {cvs.map(cv => (
                    <div
                      key={cv.cvId}
                      className={`cv-list-item glass-card p-3 mb-2 ${selectedCvId === cv.cvId ? 'cv-list-item-active' : ''}`}
                      onClick={() => setSelectedCvId(cv.cvId)}
                    >
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <h6 className="text-white fw-bold mb-0 text-truncate flex-fill me-2">{cv.title}</h6>
                        {cv.isDefault && <Badge bg="primary" className="px-2 py-1 flex-shrink-0">Mặc định</Badge>}
                      </div>
                      {cv.desiredPosition && <p className="x-small text-primary mb-1">{cv.desiredPosition}</p>}
                      <div className="d-flex gap-1 flex-wrap mt-2">
                        <Badge bg="dark" className="border border-secondary x-small">
                          {TEMPLATES.find(t => t.code === cv.templateCode)?.name || cv.templateCode}
                        </Badge>
                        <Badge bg={cv.isPublic ? 'success' : 'secondary'} className="x-small">
                          {cv.isPublic ? <Globe size={8} className="me-1" /> : <Lock size={8} className="me-1" />}
                          {cv.isPublic ? 'Công khai' : 'Riêng tư'}
                        </Badge>
                      </div>
                      <div className="d-flex gap-1 mt-2 pt-2 border-top border-secondary">
                        <Button variant={cv.isDefault ? "outline-primary" : "outline-secondary"} size="sm" className="x-small fw-bold flex-fill" onClick={(e) => { e.stopPropagation(); handleSetDefault(cv.cvId); }} disabled={cv.isDefault}>
                          {cv.isDefault ? <Star size={10} fill="currentColor" /> : <StarOff size={10} />}
                        </Button>
                        <Button variant="outline-secondary" size="sm" className="x-small fw-bold" onClick={(e) => { e.stopPropagation(); handleToggleVisibility(cv.cvId, cv.isPublic); }}>
                          {cv.isPublic ? <EyeOff size={12} /> : <Eye size={12} />}
                        </Button>
                        <Button variant="outline-secondary" size="sm" className="x-small fw-bold" onClick={(e) => { e.stopPropagation(); openEditModal(cv); }}>
                          <Edit3 size={12} />
                        </Button>
                        <Button variant="outline-danger" size="sm" className="x-small fw-bold" onClick={(e) => { e.stopPropagation(); handleDelete(cv.cvId); }}>
                          <Trash2 size={12} />
                        </Button>
                      </div>
                      {cv.isPublic && (
                        <a href={`/cv/${cv.cvId}`} target="_blank" rel="noopener noreferrer" className="mt-2 text-center x-small text-primary text-decoration-none fw-bold d-block" onClick={(e) => e.stopPropagation()}>
                          <ExternalLink size={10} className="me-1" /> Xem công khai
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Col>

          {/* RIGHT: A4 PREVIEW */}
          <Col lg={8} xl={9}>
            <div className="cv-preview-area">
              {!selectedCvId ? (
                <div className="text-center py-5 glass-card">
                  <FileText size={64} className="text-white-50 mb-3 opacity-15" />
                  <h4 className="text-white-50">Chọn CV từ danh sách bên trái</h4>
                  <p className="text-white-50 small">Hoặc tạo CV mới để bắt đầu</p>
                </div>
              ) : loadingPreview ? (
                <div className="text-center py-5 glass-card">
                  <Spinner animation="border" variant="primary" />
                  <p className="text-white-50 mt-3 small">Đang tải CV...</p>
                </div>
              ) : previewData ? (
                <div className="cv-print-actions no-print mb-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="text-white fw-bold mb-0">
                      <FileText size={18} className="me-2 text-primary" />
                      {previewData.title || 'CV Preview'}
                    </h5>
                    <Button variant="primary" size="sm" className="fw-bold px-3" onClick={handlePrint}>
                      <Printer size={14} className="me-2" /> In CV
                    </Button>
                  </div>
                </div>
              ) : null}

              {previewData && (
                <div className={`manage-cv-preview template-${templateCode}`}>
                  <div className="a4-document shadow-2xl">
                    <div className="cv-sidebar-box">
                      <div className="cv-avatar-circle">
                        <span className="avatar-initials">
                          {previewData.fullName ? previewData.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '?'}
                        </span>
                      </div>
                      <h1 className="cv-name-text">{previewData.fullName || 'Tên sinh viên'}</h1>
                      <p className="cv-role-text">{previewData.desiredPosition || 'Vị trí ứng tuyển'}</p>
                      <div className="cv-contact-section">
                        {previewData.showEmail && previewData.email && (
                          <div className="cv-contact-item"><Mail size={11} /> <span>{previewData.email}</span></div>
                        )}
                        {previewData.showPhone && previewData.phoneNumber && (
                          <div className="cv-contact-item"><Phone size={11} /> <span>{previewData.phoneNumber}</span></div>
                        )}
                        {previewData.location && (
                          <div className="cv-contact-item"><MapPin size={11} /> <span>{previewData.location}</span></div>
                        )}
                        {previewData.school && (
                          <div className="cv-contact-item"><GraduationCap size={11} /> <span>{previewData.school}</span></div>
                        )}
                      </div>
                      {skills.length > 0 && (
                        <div className="cv-sidebar-section">
                          <h3 className="sidebar-pill">KỸ NĂNG</h3>
                          <ul className="sidebar-list">
                            {skills.map((s, i) => <li key={i}>{s.skillName || s.name || s}</li>)}
                          </ul>
                        </div>
                      )}
                      {previewData.major && (
                        <div className="cv-sidebar-section">
                          <h3 className="sidebar-pill">CHUYÊN NGÀNH</h3>
                          <ul className="sidebar-list">
                            <li>{previewData.major}</li>
                            {previewData.graduationYear && <li>Năm TN: {previewData.graduationYear}</li>}
                            {previewData.gpa > 0 && <li>GPA: {previewData.gpa}</li>}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="cv-main-box">
                      {previewData.professionalSummary && (
                        <div className="cv-main-section">
                          <div className="main-pill-header"><span>GIỚI THIỆU</span><div className="pill-line"></div></div>
                          <p className="main-text-content" style={{ whiteSpace: 'pre-line' }}>{previewData.professionalSummary}</p>
                        </div>
                      )}
                      {portfolios.length > 0 && (
                        <div className="cv-main-section">
                          <div className="main-pill-header"><span>DỰ ÁN</span><div className="pill-line"></div></div>
                          {portfolios.map((p, i) => (
                            <div key={i} className="exp-item-box">
                              <div className="d-flex justify-content-between">
                                <strong>{p.projectName || p.title}</strong>
                              </div>
                              {p.description && <p className="main-text-content x-small" style={{ whiteSpace: 'pre-wrap' }}>{p.description}</p>}
                              {p.technologies && (
                                <div className="d-flex flex-wrap gap-1 mt-2">
                                  {(Array.isArray(p.technologies) ? p.technologies : p.technologies.split(',')).map((t, j) => (
                                    <Badge key={j} bg="dark" className="border border-secondary x-small">{t.trim()}</Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      {!previewData.professionalSummary && portfolios.length === 0 && (
                        <div className="text-center py-5">
                          <p className="text-white-50 small">CV chưa có nội dung chi tiết.</p>
                          <p className="text-white-50 small">Hãy chỉnh sửa CV để thêm thông tin.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Col>
        </Row>
      </Container>

      {/* CREATE MODAL */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg" centered dialogClassName="modal-dark">
        <Modal.Header closeButton className="border-bottom border-white-10">
          <Modal.Title className="fw-bold"><Plus size={20} className="me-2 text-primary" /> Tạo CV mới</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark"><FormContent /></Modal.Body>
        <Modal.Footer className="border-top border-white-10">
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Hủy</Button>
          <Button variant="primary" className="fw-bold" onClick={handleCreate} disabled={saving}>
            {saving ? <Loader2 className="spinner me-2" size={16} /> : <FileText size={16} className="me-2" />} Tạo CV
          </Button>
        </Modal.Footer>
      </Modal>

      {/* EDIT MODAL */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg" centered dialogClassName="modal-dark">
        <Modal.Header closeButton className="border-bottom border-white-10">
          <Modal.Title className="fw-bold"><Edit3 size={20} className="me-2 text-primary" /> Chỉnh sửa CV</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark"><FormContent isEdit /></Modal.Body>
        <Modal.Footer className="border-top border-white-10">
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>Hủy</Button>
          <Button variant="primary" className="fw-bold" onClick={handleEdit} disabled={saving}>
            {saving ? <Loader2 className="spinner me-2" size={16} /> : <Check size={16} className="me-2" />} Lưu thay đổi
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ManageCVs;
