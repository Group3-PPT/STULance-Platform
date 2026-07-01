import React, { useState } from 'react';
import { Button, Badge, Row, Col, Spinner } from 'react-bootstrap';
import { Bookmark, Send, Laptop, ShieldCheck, MessageSquare } from 'lucide-react';
import { savedItemsService } from '../services/saveditemsservice';

const JobDetailView = ({ job }) => {
  const [isSaved, setIsSaved] = useState(job?.isSaved || false);
  const [saveLoading, setSaveLoading] = useState(false);
  const token = localStorage.getItem('accessToken');

  const handleSave = async () => {
    if (!token) {
      alert("Vui lòng đăng nhập để lưu việc làm!");
      return;
    }
    setSaveLoading(true);
    try {
      if (isSaved) {
        await savedItemsService.unsaveJob(job.jobId);
        setIsSaved(false);
      } else {
        await savedItemsService.saveJob(job.jobId);
        setIsSaved(true);
      }
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || "Không thể lưu"));
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDiscuss = () => {
    if (!token) {
      alert("Vui lòng đăng nhập để thảo luận!");
      return;
    }
    alert("Tính năng thảo luận đang được phát triển. Vui lòng thử lại sau!");
  };

  return (
    <div className="hub-detail-card glass-card animate-fade-in">
      <div className="p-4 border-bottom border-secondary">
        <h2 className="hub-detail-title mb-4">{job.title}</h2>
        <div className="d-flex gap-3 mb-4 text-info small">
          <span><Laptop size={16}/> {job.remote || 'Remote'}</span>
          <span><ShieldCheck size={16}/> Đã xác thực doanh nghiệp</span>
        </div>
        <Row className="align-items-center">
          <Col md={7}>
              <div className="hub-detail-price">{job.salary ? job.salary.toLocaleString('vi-VN') + ' VND' : 'Thỏa thuận'}</div>
              <div className="text-muted small mt-1">{job.location || 'Đà Nẵng'} | {job.jobType || 'Freelance'}</div>
          </Col>
          <Col md={5} className="text-end">
              <div className="d-flex gap-2 justify-content-end">
                <Button 
                  variant={isSaved ? "primary" : "light"} 
                  className="hub-btn-save d-flex align-items-center gap-2"
                  onClick={handleSave}
                  disabled={saveLoading}
                >
                  {saveLoading ? <Spinner size="sm" animation="border" /> : <Bookmark size={18} fill={isSaved ? "currentColor" : "none"} />}
                  {isSaved ? 'Đã lưu' : 'Lưu'}
                </Button>
                <Button className="hub-btn-pink d-flex align-items-center gap-2" onClick={handleDiscuss}>
                  <MessageSquare size={18} /> THẢO LUẬN
                </Button>
              </div>
          </Col>
        </Row>
      </div>

      <div className="p-4">
          <div className="hub-info-table">
              <div className="hub-info-row">
                  <div className="hub-info-label">Vị trí công việc</div>
                  <div className="hub-info-value">
                      {job.tags?.map(t => <Badge key={t} bg="primary" className="me-2">{t}</Badge>) || <Badge bg="primary">{job.jobType}</Badge>}
                  </div>
              </div>
              <div className="hub-info-row">
                  <div className="hub-info-label">Chi tiết công việc</div>
                  <div className="hub-info-value">{job.description || job.title}</div>
              </div>
              <div className="hub-info-row">
                  <div className="hub-info-label">Yêu cầu</div>
                  <div className="hub-info-value">
                      {job.requirements || '• Có kinh nghiệm thực tế • Tiếng Anh giao tiếp • Tinh thần trách nhiệm cao'}
                  </div>
              </div>
              <div className="hub-info-row">
                  <div className="hub-info-label">Hạn chót nộp hồ sơ</div>
                  <div className="hub-info-value">{job.deadline ? new Date(job.deadline).toLocaleDateString('vi-VN') : 'Liên hệ'}</div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default JobDetailView;
