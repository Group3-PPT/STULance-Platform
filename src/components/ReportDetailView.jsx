import React from 'react';
import { Button, Badge, Card } from 'react-bootstrap';
import { 
  FileText, Image as ImageIcon, MessageSquare, 
  ShieldAlert, UserX, CheckCircle, AlertTriangle 
} from 'lucide-react';

const ReportDetailView = ({ report }) => {
  if (!report) return <div className="glass-card p-5 text-center text-muted">Chọn một đơn tố cáo để xem chi tiết</div>;

  return (
    <div className="glass-card report-detail-card p-4 animate-fade-in">
      {/* Header chi tiết */}
      <div className="d-flex justify-content-between align-items-center mb-4 border-bottom border-secondary pb-3">
        <h4 className="text-white fw-bold mb-0 d-flex align-items-center gap-2">
          <ShieldAlert className="text-danger" /> Chi tiết khiếu nại #{report.id}
        </h4>
        <Badge bg="primary">{report.status}</Badge>
      </div>

      <Row className="mb-4 g-3">
        <Col md={6}>
          <div className="info-box-adm">
            <small className="text-muted d-block mb-1">NGƯỜI TỐ CÁO</small>
            <strong className="text-white">{report.reporter}</strong>
            <span className="d-block x-small text-info">Vai trò: Sinh viên</span>
          </div>
        </Col>
        <Col md={6}>
          <div className="info-box-adm border-danger-subtle">
            <small className="text-muted d-block mb-1">ĐỐI TƯỢNG BỊ TỐ</small>
            <strong className="text-danger">{report.reported}</strong>
            <span className="d-block x-small text-muted">Vai trò: Doanh nghiệp</span>
          </div>
        </Col>
      </Row>

      <div className="evidence-section mb-4">
        <h6 className="text-white fw-bold mb-3 d-flex align-items-center gap-2">
          <AlertTriangle size={16} className="text-warning" /> Nội dung tố cáo
        </h6>
        <div className="p-3 rounded-4 bg-white-5 text-white-80 small line-height-lg">
          {report.evidence}
        </div>
      </div>

      <div className="files-section mb-5">
        <h6 className="text-white fw-bold mb-3">Tệp tin đính kèm (Bằng chứng)</h6>
        <div className="d-flex gap-2 flex-wrap">
          {report.files.map((file, i) => (
            <div key={i} className="evidence-file-card glass-card p-2 d-flex align-items-center gap-2">
              {file.endsWith('.pdf') ? <FileText size={16}/> : <ImageIcon size={16}/>}
              <span className="x-small">{file}</span>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="d-flex gap-3 mt-auto pt-4 border-top border-secondary">
        <Button variant="outline-light" className="flex-grow-1 py-2 fw-bold small">
           HỦY ĐƠN (SAI SỰ THẬT)
        </Button>
        <Button variant="warning" className="flex-grow-1 py-2 fw-bold small text-dark">
           GỬI CẢNH BÁO
        </Button>
        <Button variant="danger" className="flex-grow-1 py-2 fw-bold small">
           <UserX size={16} className="me-2"/> KHÓA TÀI KHOẢN
        </Button>
      </div>
    </div>
  );
};

export default ReportDetailView;
