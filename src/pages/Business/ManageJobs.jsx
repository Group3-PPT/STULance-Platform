import React, { useState, useEffect } from 'react';
import { Container, Table, Badge, Button, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Users, Edit3, Trash2, Plus, Loader2, BarChart3, Clock, CheckCircle } from 'lucide-react';
import { jobService } from '../../services/jobservice';
import '../../CSS/ManageJobs.css';

const ManageJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Tải danh sách tin tuyển dụng của tôi
  const fetchMyJobs = async () => {
    setLoading(true);
    try {
      const res = await jobservice.getMyJobs();
      if (res.success) {
        setJobs(res.data || []);
      }
    } catch (err) {
      console.error("Lỗi tải danh sách bài đăng cá nhân");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMyJobs(); }, []);

  // 2. Xóa bài đăng
  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài tuyển dụng này?')) return;
    try {
      await jobservice.deleteJob(id);
      setJobs(jobs.filter(j => j.jobId !== id));
      alert("Đã xóa tin tuyển dụng.");
    } catch (err) {
      alert("Lỗi khi xóa.");
    }
  };

  // Helper: Màu sắc trạng thái từ Admin duyệt
  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED': return <Badge bg="success" className="status-pill">Đang hiển thị</Badge>;
      case 'PENDING': return <Badge bg="warning" className="status-pill text-dark">Chờ Admin duyệt</Badge>;
      case 'REJECTED': return <Badge bg="danger" className="status-pill">Bị từ chối</Badge>;
      case 'DRAFT': return <Badge bg="secondary" className="status-pill">Bản nháp</Badge>;
      default: return <Badge bg="info">{status}</Badge>;
    }
  };

  return (
    <div className="manage-jobs-page py-5 text-white animate-fade-in">
      <Container>
        {/* HEADER & THỐNG KÊ NHANH */}
        <div className="d-flex justify-content-between align-items-center mb-5">
          <div>
            <h1 className="fw-bold display-6 mb-1">Quản lý <span className="text-primary-glow">Dự án</span></h1>
            <p className="text-muted">Theo dõi và quản lý các tin tuyển dụng của bạn</p>
          </div>
          <Link to="/post-job" className="btn-post-job shadow-glow text-decoration-none">
            <Plus size={20} className="me-2" /> ĐĂNG TIN MỚI
          </Link>
        </div>

        <Row className="g-3 mb-5">
            <Col md={4}>
                <Card className="glass-card p-3 border-0">
                    <div className="d-flex align-items-center gap-3">
                        <div className="adm-icon-box bg-primary bg-opacity-10 text-primary"><BarChart3/></div>
                        <div>
                            <p className="x-small text-muted mb-0">TỔNG BÀI ĐĂNG</p>
                            <h4 className="fw-bold mb-0">{jobs.length}</h4>
                        </div>
                    </div>
                </Card>
            </Col>
            <Col md={4}>
                <Card className="glass-card p-3 border-0">
                    <div className="d-flex align-items-center gap-3">
                        <div className="adm-icon-box bg-warning bg-opacity-10 text-warning"><Clock/></div>
                        <div>
                            <p className="x-small text-muted mb-0">ĐANG CHỜ DUYỆT</p>
                            <h4 className="fw-bold mb-0 text-warning">{jobs.filter(j => j.status === 'PENDING').length}</h4>
                        </div>
                    </div>
                </Card>
            </Col>
            <Col md={4}>
                <Card className="glass-card p-3 border-0">
                    <div className="d-flex align-items-center gap-3">
                        <div className="adm-icon-box bg-success bg-opacity-10 text-success"><CheckCircle/></div>
                        <div>
                            <p className="x-small text-muted mb-0">ĐÃ ĐƯỢC DUYỆT</p>
                            <h4 className="fw-bold mb-0 text-success">{jobs.filter(j => j.status === 'APPROVED').length}</h4>
                        </div>
                    </div>
                </Card>
            </Col>
        </Row>

        {/* BẢNG QUẢN LÝ */}
        <div className="glass-card overflow-hidden shadow-lg border-0">
          {loading ? (
            <div className="text-center py-5"><Loader2 className="spinner text-primary" size={40} /></div>
          ) : (
            <Table responsive variant="dark" className="job-management-table mb-0 align-middle">
              <thead>
                <tr>
                  <th className="ps-4">Tên công việc</th>
                  <th>Ngày đăng</th>
                  <th className="text-center">Số lượng</th>
                  <th>Trạng thái</th>
                  <th className="text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.jobId} className="job-row">
                    <td className="ps-4">
                      <div className="fw-bold text-white h6 mb-0">{job.title}</div>
                      <small className="text-primary-glow x-small">{job.jobType}</small>
                    </td>
                    <td className="small text-muted">{new Date(job.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td className="text-center fw-bold">{job.quantity}</td>
                    <td>{getStatusBadge(job.status)}</td>
                    <td className="text-center pe-4">
                      <div className="d-flex justify-content-center gap-2">
                        <button className="action-icon-btn" title="Xem ứng viên"><Users size={16} /></button>
                        <button className="action-icon-btn" title="Chỉnh sửa"><Edit3 size={16} /></button>
                        <button className="action-icon-btn delete" title="Xóa" onClick={() => handleDelete(job.jobId)}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {jobs.length === 0 && (
                  <tr><td colSpan="5" className="text-center py-5 text-muted italic">Bạn chưa đăng tin tuyển dụng nào.</td></tr>
                )}
              </tbody>
            </Table>
          )}
        </div>
      </Container>
    </div>
  );
};

export default ManageJobs;