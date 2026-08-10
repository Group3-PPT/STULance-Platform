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

  const updateField = function (field, value) {
    setFormData(function (prev) {
      var next = {};
      for (var key in prev) {
        if (prev.hasOwnProperty(key)) {
          next[key] = prev[key];
        }
      }
      next[field] = value;
      return next;
    });
  };

  /* --- HELPER: initials --- */
  function getInitials(name) {
    if (!name) return '?';
    var parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return parts[0].charAt(0) + parts[parts.length - 1].charAt(0);
  }

  /* --- HELPER: avatar circle --- */
  function renderAvatarCircle(extraStyle) {
    var baseStyle = { width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' };
    var merged = extraStyle ? Object.assign({}, baseStyle, extraStyle) : baseStyle;
    if (cvAvatar) {
      return <img src={cvAvatar} alt="avatar" style={merged} />;
    }
    return <span className="avatar-initials">{getInitials(cvFullName)}</span>;
  }

  /* --- HELPER: sidebar contact --- */
  function renderSidebarContact() {
    return (
      <div className="cv-contact-section">
        {previewData.showEmail && cvEmail && (
          <div className="cv-contact-item"><Mail size={11} /> <span>{cvEmail}</span></div>
        )}
        {previewData.showPhone && cvPhone && (
          <div className="cv-contact-item"><Phone size={11} /> <span>{cvPhone}</span></div>
        )}
        {cvLocation && (
          <div className="cv-contact-item"><MapPin size={11} /> <span>{cvLocation}</span></div>
        )}
        {cvSchool && (
          <div className="cv-contact-item"><GraduationCap size={11} /> <span>{cvSchool}</span></div>
        )}
      </div>
    );
  }

  /* --- HELPER: sidebar skills --- */
  function renderSidebarSkills() {
    if (skills.length === 0) return null;
    return (
      <div className="cv-sidebar-section">
        <h3 className="sidebar-pill">KỸ NĂNG</h3>
        <ul className="sidebar-list">
          {skills.map(function (s, i) { return <li key={i}>{s.skillName || s.name || s}</li>; })}
        </ul>
      </div>
    );
  }

  /* --- HELPER: sidebar education --- */
  function renderSidebarEducation() {
    if (!cvMajor && !cvGpa) return null;
    return (
      <div className="cv-sidebar-section">
        <h3 className="sidebar-pill">CHUYÊN NGÀNH</h3>
        <ul className="sidebar-list">
          {cvMajor && <li>{cvMajor}</li>}
          {cvGpa > 0 && <li>GPA: {cvGpa}</li>}
        </ul>
      </div>
    );
  }

  /* --- HELPER: main summary --- */
  function renderMainSummary() {
    if (!previewData.professionalSummary) return null;
    return (
      <div className="cv-main-section">
        <div className="main-pill-header"><span>GIỚI THIỆU</span><div className="pill-line"></div></div>
        <p className="main-text-content" style={{ whiteSpace: 'pre-line' }}>{previewData.professionalSummary}</p>
      </div>
    );
  }

  /* --- HELPER: main portfolios --- */
  /* --- HELPER: render main portfolios section ---
     Hiển thị danh sách dự án trong phần main của CV preview.
     Mỗi dự án có: tên, mô tả, công nghệ, link, ngày tạo. */
  function renderMainPortfolios() {
    if (portfolios.length === 0) {
      return null;
    }

    /* --- Map qua từng portfolio --- */
    var portfolioItems = portfolios.map(function renderOnePortfolio(portfolio, index) {

      /* --- Parse technologies: có thể là array hoặc string phân cách bằng dấu phẩy --- */
      var rawTechnologies = portfolio.technologies || '';
      var technologyArray = [];

      if (Array.isArray(rawTechnologies)) {
        technologyArray = rawTechnologies;
      } else if (typeof rawTechnologies === 'string' && rawTechnologies.length > 0) {
        technologyArray = rawTechnologies.split(',');
      }

      /* --- Format ngày tạo: MM/YYYY --- */
      var createdAtText = '';
      if (portfolio.createdAt) {
        var createdDate = new Date(portfolio.createdAt);
        createdAtText = createdDate.toLocaleDateString('vi-VN', {
          month: '2-digit',
          year: 'numeric'
        });
      }

      /* --- Tên dự án: ưu tiên projectName, fallback title --- */
      var projectTitle = portfolio.projectName || portfolio.title || '';

      /* --- Render tech tags --- */
      var technologyTags = null;
      if (technologyArray.length > 0) {
        technologyTags = (
          <div className="d-flex flex-wrap gap-1 mt-2">
            {technologyArray.map(function renderTechTag(techText, tagIndex) {
              var trimmedTech = techText.trim();
              return (
                <Badge key={tagIndex} bg="dark" className="border border-secondary x-small">
                  {trimmedTech}
                </Badge>
              );
            })}
          </div>
        );
      }

      /* --- Render link URL --- */
      var projectLink = null;
      if (portfolio.url) {
        projectLink = (
          <div className="x-small mt-1" style={{ color: '#446872' }}>
            <a
              href={portfolio.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#446872', textDecoration: 'none' }}
            >
              {portfolio.url}
            </a>
          </div>
        );
      }

      /* --- Render 1 portfolio item --- */
      return (
        <div key={index} className="exp-item-box">
          {/* Header: tên dự án + ngày tạo */}
          <div className="d-flex justify-content-between align-items-start">
            <strong>{projectTitle}</strong>
            {createdAtText && (
              <span className="x-small" style={{ color: '#999', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                {createdAtText}
              </span>
            )}
          </div>

          {/* Mô tả */}
          {portfolio.description && (
            <p className="main-text-content x-small" style={{ whiteSpace: 'pre-wrap' }}>
              {portfolio.description}
            </p>
          )}

          {/* Tech tags */}
          {technologyTags}

          {/* Link URL */}
          {projectLink}
        </div>
      );
    });

    /* --- Render section --- */
    return (
      <div className="cv-main-section">
        <div className="main-pill-header">
          <span>DỰ ÁN</span>
          <div className="pill-line"></div>
        </div>
        {portfolioItems}
      </div>
    );
  }

  /* --- HELPER: empty state --- */
  function renderEmptyState() {
    return (
      <div className="text-center py-5">
        <p className="text-white-50 small">CV chưa có nội dung chi tiết.</p>
        <p className="text-white-50 small">Hãy chỉnh sửa CV để thêm thông tin.</p>
      </div>
    );
  }

  /* ================================================================
     MODERN: Sidebar TRÁI bold gradient + Main phải, avatar glow, tech chips
     ================================================================ */
  function renderModern() {
    return (
      <>
        <div className="cv-sidebar-box">
          <div className="cv-avatar-circle">{renderAvatarCircle()}</div>
          <h1 className="cv-name-text">{cvFullName || 'Tên sinh viên'}</h1>
          <p className="cv-role-text">{previewData.desiredPosition || 'Vị trí ứng tuyển'}</p>
          <div className="sidebar-divider"></div>
          {renderSidebarContact()}
          {renderSidebarSkills()}
          {renderSidebarEducation()}
        </div>
        <div className="cv-main-box">
          {renderMainSummary()}
          {renderMainPortfolios()}
          {!previewData.professionalSummary && portfolios.length === 0 && renderEmptyState()}
        </div>
      </>
    );
  }

  /* ================================================================
     CLASSIC: Main trái + Sidebar phải, viền double
     ================================================================ */
  function renderClassic() {
    return (
      <>
        <div className="cv-sidebar-box">
          <div className="cv-avatar-circle">{renderAvatarCircle()}</div>
          {renderSidebarContact()}
          {renderSidebarSkills()}
          {renderSidebarEducation()}
        </div>
        <div className="cv-main-box">
          <div style={{ marginBottom: '24px' }}>
            <h1 className="cv-name-text">{cvFullName || 'Tên sinh viên'}</h1>
            <p className="cv-role-text">{previewData.desiredPosition || 'Vị trí ứng tuyển'}</p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '11px', opacity: 0.7 }}>
              {previewData.showEmail && cvEmail && <span>{cvEmail}</span>}
              {previewData.showPhone && cvPhone && <span>{cvPhone}</span>}
              {cvLocation && <span>{cvLocation}</span>}
            </div>
          </div>
          {renderMainSummary()}
          {renderMainPortfolios()}
          {!previewData.professionalSummary && portfolios.length === 0 && renderEmptyState()}
        </div>
      </>
    );
  }

  /* ================================================================
     MINIMAL: Top header centered + body 2 columns, NO sidebar box
     ================================================================ */
  function renderMinimal() {
    return (
      <>
        <div className="cv-top-header">
          <div className="cv-top-avatar">{renderAvatarCircle()}</div>
          <div className="cv-top-info">
            <h1 className="cv-name-text">{cvFullName || 'Tên sinh viên'}</h1>
            <p className="cv-role-text">{previewData.desiredPosition || 'Vị trí ứng tuyển'}</p>
          </div>
          <div className="cv-top-contact">
            {previewData.showEmail && cvEmail && (
              <span className="cv-contact-inline"><Mail size={10} /> {cvEmail}</span>
            )}
            {previewData.showPhone && cvPhone && (
              <span className="cv-contact-inline"><Phone size={10} /> {cvPhone}</span>
            )}
            {cvLocation && (
              <span className="cv-contact-inline"><MapPin size={10} /> {cvLocation}</span>
            )}
            {cvSchool && (
              <span className="cv-contact-inline"><GraduationCap size={10} /> {cvSchool}</span>
            )}
          </div>
        </div>
        <div className="cv-minimal-body">
          <div className="cv-minimal-main">
            {renderMainSummary()}
            {renderMainPortfolios()}
            {!previewData.professionalSummary && portfolios.length === 0 && renderEmptyState()}
          </div>
          <div className="cv-minimal-side">
            {skills.length > 0 && (
              <div className="cv-minimal-section">
                <h3 className="minimal-section-title">KỸ NĂNG</h3>
                <div className="minimal-skill-list">
                  {skills.map(function (s, i) {
                    return <div key={i} className="minimal-skill-tag">{s.skillName || s.name || s}</div>;
                  })}
                </div>
              </div>
            )}
            {(cvMajor || cvGpa > 0) && (
              <div className="cv-minimal-section">
                <h3 className="minimal-section-title">HỌC VẤN</h3>
                {cvSchool && <div className="minimal-edu-item"><strong>{cvSchool}</strong></div>}
                {cvMajor && <div className="minimal-edu-item">{cvMajor}</div>}
                {cvGpa > 0 && <div className="minimal-edu-item">GPA: {cvGpa}</div>}
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  /* ================================================================
     CREATIVE: Sidebar trái gradient + Main phải
     ================================================================ */
  function renderCreative() {
    return (
      <>
        <div className="cv-sidebar-box">
          <div className="cv-avatar-circle">{renderAvatarCircle({ borderRadius: '17px' })}</div>
          <h1 className="cv-name-text">{cvFullName || 'Tên sinh viên'}</h1>
          <p className="cv-role-text">{previewData.desiredPosition || 'Vị trí ứng tuyển'}</p>
          {renderSidebarContact()}
          {renderSidebarSkills()}
          {renderSidebarEducation()}
        </div>
        <div className="cv-main-box">
          {renderMainSummary()}
          {renderMainPortfolios()}
          {!previewData.professionalSummary && portfolios.length === 0 && renderEmptyState()}
        </div>
      </>
    );
  }

  function renderPreviewByTemplate() {
    switch (templateCode) {
      case 'classic': return renderClassic();
      case 'minimal': return renderMinimal();
      case 'creative': return renderCreative();
      case 'modern':
      default: return renderModern();
    }
  }

  if (loading) {
    return <div className="text-center py-5"><Loader2 className="spinner text-primary" size={40} /></div>;
  }

  const templateCode = previewData?.templateCode || 'modern';
  const skills = previewData?.skills || [];
  const portfolios = previewData?.portfolios || [];
  const owner = previewData?.owner || {};
  const cvFullName = owner.fullName || previewData?.fullName || '';
  const cvEmail = owner.email || previewData?.email || '';
  const cvPhone = owner.phoneNumber || previewData?.phone || '';
  const cvLocation = owner.location || previewData?.location || '';
  const cvSchool = owner.school || previewData?.school || '';
  const cvMajor = owner.major || previewData?.major || '';
  const cvGpa = owner.gpa || previewData?.gpa || 0;
  const cvAvatar = owner.avatarUrl || previewData?.avatarUrl || '';
  const cvVerification = owner.verificationStatus || '';

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
                    {renderPreviewByTemplate()}
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
        <Modal.Body className="bg-dark">
          <Form.Group className="mb-3">
            <Form.Label className="text-white-50 fw-bold small">Tên CV *</Form.Label>
            <Form.Control placeholder="VD: CV - Nguyễn Văn A" className="bg-dark-input text-white border-0" value={formData.title} onChange={function (e) { updateField('title', e.target.value); }} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="text-white-50 fw-bold small">Vị trí mong muốn</Form.Label>
            <Form.Control placeholder="VD: Frontend Developer, UI/UX Designer..." className="bg-dark-input text-white border-0" value={formData.desiredPosition} onChange={function (e) { updateField('desiredPosition', e.target.value); }} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="text-white-50 fw-bold small">Giới thiệu bản thân</Form.Label>
            <Form.Control as="textarea" rows={4} placeholder="Mô tả ngắn gọn về bản thân, kinh nghiệm và mục tiêu nghề nghiệp..." className="bg-dark-input text-white border-0" value={formData.professionalSummary} onChange={function (e) { updateField('professionalSummary', e.target.value); }} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="text-white-50 fw-bold small">Mẫu CV</Form.Label>
            <Row className="g-2">
              {TEMPLATES.map(function (t) {
                return (
                  <Col xs={6} key={t.code}>
                    <div
                      className={'p-3 rounded-3 text-center pointer transition-all' + (formData.templateCode === t.code ? ' border border-primary' : '')}
                      style={{
                        background: formData.templateCode === t.code ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.03)',
                        border: formData.templateCode === t.code ? '1px solid rgba(59,130,246,0.5)' : '1px solid rgba(255,255,255,0.06)'
                      }}
                      onClick={function () { updateField('templateCode', t.code); }}
                    >
                      <div style={{ width: 32, height: 40, borderRadius: 4, background: t.color, margin: '0 auto 6px' }} />
                      <span className="x-small fw-bold text-white">{t.name}</span>
                      {formData.templateCode === t.code && <Check size={14} className="text-primary ms-1" />}
                    </div>
                  </Col>
                );
              })}
            </Row>
          </Form.Group>
          <hr className="border-secondary" />
          <div className="d-grid gap-2">
            <Form.Check type="switch" id="cPublic" label={<span className="small text-white-80"><Globe size={14} className="me-1" /> Cho phép hiển thị công khai</span>} checked={formData.isPublic} onChange={function (e) { updateField('isPublic', e.target.checked); }} />
            <Form.Check type="switch" id="cShowEmail" label={<span className="small text-white-80">Hiển thị email</span>} checked={formData.showEmail} onChange={function (e) { updateField('showEmail', e.target.checked); }} />
            <Form.Check type="switch" id="cShowPhone" label={<span className="small text-white-80">Hiển thị số điện thoại</span>} checked={formData.showPhone} onChange={function (e) { updateField('showPhone', e.target.checked); }} />
          </div>
        </Modal.Body>
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
        <Modal.Body className="bg-dark">
          <Form.Group className="mb-3">
            <Form.Label className="text-white-50 fw-bold small">Tên CV *</Form.Label>
            <Form.Control placeholder="VD: CV - Nguyễn Văn A" className="bg-dark-input text-white border-0" value={formData.title} onChange={function (e) { updateField('title', e.target.value); }} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="text-white-50 fw-bold small">Vị trí mong muốn</Form.Label>
            <Form.Control placeholder="VD: Frontend Developer, UI/UX Designer..." className="bg-dark-input text-white border-0" value={formData.desiredPosition} onChange={function (e) { updateField('desiredPosition', e.target.value); }} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="text-white-50 fw-bold small">Giới thiệu bản thân</Form.Label>
            <Form.Control as="textarea" rows={4} placeholder="Mô tả ngắn gọn về bản thân, kinh nghiệm và mục tiêu nghề nghiệp..." className="bg-dark-input text-white border-0" value={formData.professionalSummary} onChange={function (e) { updateField('professionalSummary', e.target.value); }} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="text-white-50 fw-bold small">Mẫu CV</Form.Label>
            <Row className="g-2">
              {TEMPLATES.map(function (t) {
                return (
                  <Col xs={6} key={t.code}>
                    <div
                      className={'p-3 rounded-3 text-center pointer transition-all' + (formData.templateCode === t.code ? ' border border-primary' : '')}
                      style={{
                        background: formData.templateCode === t.code ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.03)',
                        border: formData.templateCode === t.code ? '1px solid rgba(59,130,246,0.5)' : '1px solid rgba(255,255,255,0.06)'
                      }}
                      onClick={function () { updateField('templateCode', t.code); }}
                    >
                      <div style={{ width: 32, height: 40, borderRadius: 4, background: t.color, margin: '0 auto 6px' }} />
                      <span className="x-small fw-bold text-white">{t.name}</span>
                      {formData.templateCode === t.code && <Check size={14} className="text-primary ms-1" />}
                    </div>
                  </Col>
                );
              })}
            </Row>
          </Form.Group>
          <hr className="border-secondary" />
          <div className="d-grid gap-2">
            <Form.Check type="switch" id="ePublic" label={<span className="small text-white-80"><Globe size={14} className="me-1" /> Cho phép hiển thị công khai</span>} checked={formData.isPublic} onChange={function (e) { updateField('isPublic', e.target.checked); }} />
            <Form.Check type="switch" id="eShowEmail" label={<span className="small text-white-80">Hiển thị email</span>} checked={formData.showEmail} onChange={function (e) { updateField('showEmail', e.target.checked); }} />
            <Form.Check type="switch" id="eShowPhone" label={<span className="small text-white-80">Hiển thị số điện thoại</span>} checked={formData.showPhone} onChange={function (e) { updateField('showPhone', e.target.checked); }} />
          </div>
        </Modal.Body>
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
