import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { ShieldAlert, Loader2, AlertTriangle } from 'lucide-react';
import { reportService } from '../services/reportService';

const targetTypeMap = {
  'JOB': 'Bài đăng việc làm',
  'STUDENT_SERVICE': 'Dịch vụ sinh viên',
  'STUDENT': 'Sinh viên',
  'ENTERPRISE': 'Doanh nghiệp',
  'CONTRACT': 'Hợp đồng',
};

const ReportModal = ({ show, onHide, targetType, targetId, targetName }) => {
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) {
      alert("Vui lòng nhập nội dung báo cáo!");
      return;
    }
    setSubmitting(true);
    try {
      await reportService.createReport({
        targetType,
        targetId,
        content: content.trim(),
      });
      alert("Gửi báo cáo thành công! Admin sẽ xem xét và xử lý.");
      setContent('');
      onHide();
    } catch (err) {
      const msg = err.response?.data?.message || "Không thể gửi báo cáo";
      alert("Lỗi: " + msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered dialogClassName="modal-dark" size="md">
      <Modal.Header closeButton className="border-bottom border-white-10">
        <Modal.Title className="fw-bold">
          <ShieldAlert size={20} className="me-2 text-danger" />
          Tố cáo {targetTypeMap[targetType] || targetType}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="bg-dark">
        <div className="glass-card p-3 mb-3">
          <div className="x-small text-white-50 uppercase-tracking mb-1">Đối tượng bị tố cáo</div>
          <div className="fw-bold text-white">{targetName || targetId}</div>
          <div className="x-small text-white-50 mt-1">Loại: {targetTypeMap[targetType] || targetType}</div>
        </div>

        <div className="glass-card p-3 mb-3 border border-danger border-opacity-25">
          <div className="d-flex align-items-start gap-2">
            <AlertTriangle size={16} className="text-danger mt-1 flex-shrink-0" />
            <div className="x-small text-white-50">
              Bạn không được tự báo cáo chính mình hoặc nội dung thuộc quyền sở hữu của mình.
              Một đối tượng chỉ có một báo cáo đang hoạt động từ cùng một người.
            </div>
          </div>
        </div>

        <Form.Group>
          <Form.Label className="text-white-50 fw-bold small">Nội dung báo cáo <span className="text-danger">*</span></Form.Label>
          <Form.Control
            as="textarea"
            rows={4}
            placeholder="Mô tả chi tiết lý do tố cáo..."
            className="bg-dark-input text-white border-0"
            style={{ fontSize: '13px' }}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer className="border-top border-white-10">
        <Button variant="secondary" onClick={onHide} disabled={submitting}>Hủy</Button>
        <Button variant="danger" className="fw-bold" onClick={handleSubmit} disabled={submitting || !content.trim()}>
          {submitting ? <Loader2 className="spinner me-2" size={16} /> : <ShieldAlert size={16} className="me-2" />}
          Gửi báo cáo
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ReportModal;
