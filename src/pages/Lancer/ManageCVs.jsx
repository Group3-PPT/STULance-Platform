import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, Modal, Spinner } from 'react-bootstrap';
import {
  FileText, Plus, Trash2, Eye, EyeOff, Star, StarOff,
  Loader2, ExternalLink, Edit3, Copy, Globe, Lock, Check
} from 'lucide-react';
import { cvService } from '../../services/cvservice';
import '../../CSS/ManageCVs.css';

const TEMPLATES = [
  { code: 'modern', name: 'Hiện đại', color: '#3b82f6' },
  { code: 'classic', name: 'Cổ điển', color: '#8b5cf6' },
  { code: 'minimal', name: 'Tối giản', color: '#10b981' },
  { code: 'creative', name: 'Sáng tạo', color: '#f59e0b' },
];

const ManageCVs = () => {
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(true);
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
      const res = await cvService.getMyCvs({ pageSize: 50 });
      if (res.success && res.data) {
        setCvs(res.data.items || []);
      }
    } catch (err) {
      console.error("Lỗi tải danh sách CV:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCvs(); }, [fetchCvs]);

  const resetForm = () => {
    setFormData({
      title: '',
      desiredPosition: '',
      professionalSummary: '',
      templateCode: 'modern',
      isPublic: false,
      showEmail: true,
      showPhone: true,
      isDefault: false,
    });
  };

  const handleCreate = async () => {
    if (!formData.title.trim()) {
      alert("Vui lòng nhập tên CV!");
      return;
    }
    setSaving(true);
    try {
      await cvService.createCv(formData);
      alert("Tạo CV thành công!");
      setShowCreateModal(false);
      resetForm();
      fetchCvs();
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || "Không thể tạo CV"));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!formData.title.trim() || !selectedCv) return;
    setSaving(true);
    try {
      await cvService.updateCv(selectedCv.cvId, formData);
      alert("Cập nhật CV thành công!");
      setShowEditModal(false);
      setSelectedCv(null);
      resetForm();
      fetchCvs();
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || "Không thể cập nhật CV"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cvId) => {
    if (!window.confirm("Bạn có chắc muốn xóa CV này?")) return;
    try {
      await cvService.deleteCv(cvId);
      alert("Đã xóa CV!");
      fetchCvs();
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || "Không thể xóa CV"));
    }
  };

  const handleSetDefault = async (cvId) => {
    try {
      await cvService.setDefaultCv(cvId);
      fetchCvs();
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || "Không thể đặt mặc định"));
    }
  };

  const handleToggleVisibility = async (cvId, currentPublic) => {
    try {
      await cvService.updateVisibility(cvId, { isPublic: !currentPublic });
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

  const FormContent = ({ isEdit }) => (
    <>
      <Form.Group className="mb-3">
        <Form.Label className="text-white-50 fw-bold small">Tên CV *</Form.Label>
        <Form.Control
          placeholder="VD: CV前端开发 - Nguyễn Văn A"
          className="bg-dark-input text-white border-0"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label className="text-white-50 fw-bold small">Vị trí mong muốn</Form.Label>
        <Form.Control
          placeholder="VD: Frontend Developer, UI/UX Designer..."
          className="bg-dark-input text-white border-0"
          value={formData.desiredPosition}
          onChange={(e) => setFormData({ ...formData, desiredPosition: e.target.value })}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label className="text-white-50 fw-bold small">Giới thiệu bản thân</Form.Label>
        <Form.Control
          as="textarea" rows={4}
          placeholder="Mô tả ngắn gọn về bản thân, kinh nghiệm và mục tiêu nghề nghiệp..."
          className="bg-dark-input text-white border-0"
          value={formData.professionalSummary}
          onChange={(e) => setFormData({ ...formData, professionalSummary: e.target.value })}
        />
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
                {formData.templateCode === t.code && (
                  <Check size={14} className="text-primary ms-1" />
                )}
              </div>
            </Col>
          ))}
        </Row>
      </Form.Group>

      <hr className="border-secondary" />

      <div className="d-grid gap-2">
        <Form.Check
          type="switch"
          id="isPublic"
          label={<span className="small text-white-80"><Globe size={14} className="me-1" /> Cho phép hiển thị công khai</span>}
          checked={formData.isPublic}
          onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
        />
        <Form.Check
          type="switch"
          id="showEmail"
          label={<span className="small text-white-80">Hiển thị email</span>}
          checked={formData.showEmail}
          onChange={(e) => setFormData({ ...formData, showEmail: e.target.checked })}
        />
        <Form.Check
          type="switch"
          id="showPhone"
          label={<span className="small text-white-80">Hiển thị số điện thoại</span>}
          checked={formData.showPhone}
          onChange={(e) => setFormData({ ...formData, showPhone: e.target.checked })}
        />
      </div>
    </>
  );

  if (loading) {
    return (
      <div className="text-center py-5"><Loader2 className="spinner text-primary" size={40} /></div>
    );
  }

  return (
    <div className="manage-cvs-page animate-fade-in">
      <Container className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="text-white fw-bold mb-1">Quản lý CV</h2>
            <p className="text-white-50 small mb-0">Tạo và quản lý các CV xin việc của bạn</p>
          </div>
          <Button variant="primary" className="fw-bold px-4" onClick={() => { resetForm(); setShowCreateModal(true); }}>
            <Plus size={18} className="me-2" /> Tạo CV mới
          </Button>
        </div>

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
          <Row className="g-3">
            {cvs.map(cv => (
              <Col md={6} lg={4} key={cv.cvId}>
                <div className="cv-card glass-card p-4 h-100 d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="flex-fill">
                      <h5 className="text-white fw-bold mb-1 text-truncate">{cv.title}</h5>
                      {cv.desiredPosition && (
                        <p className="x-small text-primary mb-1">{cv.desiredPosition}</p>
                      )}
                    </div>
                    {cv.isDefault && (
                      <Badge bg="primary" className="px-2 py-1">Mặc định</Badge>
                    )}
                  </div>

                  {cv.professionalSummary && (
                    <p className="x-small text-white-50 mb-3 flex-fill" style={{
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                    }}>
                      {cv.professionalSummary}
                    </p>
                  )}

                  <div className="d-flex gap-2 mb-3 flex-wrap">
                    <Badge bg="dark" className="border border-secondary">
                      {TEMPLATES.find(t => t.code === cv.templateCode)?.name || cv.templateCode}
                    </Badge>
                    <Badge bg={cv.isPublic ? 'success' : 'secondary'}>
                      {cv.isPublic ? <Globe size={10} className="me-1" /> : <Lock size={10} className="me-1" />}
                      {cv.isPublic ? 'Công khai' : 'Riêng tư'}
                    </Badge>
                  </div>

                  <div className="d-flex gap-2 mt-auto pt-3 border-top border-secondary">
                    <Button
                      variant={cv.isDefault ? "outline-primary" : "outline-secondary"}
                      size="sm"
                      className="flex-fill fw-bold x-small"
                      onClick={() => handleSetDefault(cv.cvId)}
                      disabled={cv.isDefault}
                    >
                      {cv.isDefault ? <Star size={12} className="me-1" fill="currentColor" /> : <StarOff size={12} className="me-1" />}
                      {cv.isDefault ? 'Mặc định' : 'Đặt mặc định'}
                    </Button>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      className="fw-bold x-small"
                      onClick={() => handleToggleVisibility(cv.cvId, cv.isPublic)}
                      title={cv.isPublic ? 'Chuyển riêng tư' : 'Chuyển công khai'}
                    >
                      {cv.isPublic ? <EyeOff size={14} /> : <Eye size={14} />}
                    </Button>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      className="fw-bold x-small"
                      onClick={() => openEditModal(cv)}
                    >
                      <Edit3 size={14} />
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      className="fw-bold x-small"
                      onClick={() => handleDelete(cv.cvId)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>

                  {cv.isPublic && (
                    <a
                      href={`/cv/${cv.cvId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 text-center x-small text-primary text-decoration-none fw-bold"
                    >
                      <ExternalLink size={12} className="me-1" /> Xem CV công khai
                    </a>
                  )}
                </div>
              </Col>
            ))}
          </Row>
        )}
      </Container>

      {/* CREATE MODAL */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg" centered dialogClassName="modal-dark">
        <Modal.Header closeButton className="border-bottom border-white-10">
          <Modal.Title className="fw-bold"><Plus size={20} className="me-2 text-primary" /> Tạo CV mới</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark">
          <FormContent />
        </Modal.Body>
        <Modal.Footer className="border-top border-white-10">
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Hủy</Button>
          <Button variant="primary" className="fw-bold" onClick={handleCreate} disabled={saving}>
            {saving ? <Loader2 className="spinner me-2" size={16} /> : <FileText size={16} className="me-2" />}
            Tạo CV
          </Button>
        </Modal.Footer>
      </Modal>

      {/* EDIT MODAL */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg" centered dialogClassName="modal-dark">
        <Modal.Header closeButton className="border-bottom border-white-10">
          <Modal.Title className="fw-bold"><Edit3 size={20} className="me-2 text-primary" /> Chỉnh sửa CV</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark">
          <FormContent isEdit />
        </Modal.Body>
        <Modal.Footer className="border-top border-white-10">
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>Hủy</Button>
          <Button variant="primary" className="fw-bold" onClick={handleEdit} disabled={saving}>
            {saving ? <Loader2 className="spinner me-2" size={16} /> : <Check size={16} className="me-2" />}
            Lưu thay đổi
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ManageCVs;
