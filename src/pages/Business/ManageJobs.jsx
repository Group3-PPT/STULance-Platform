import React, { useState, useEffect } from 'react';
import { Container, Table, Badge, Button, Row, Col, Card, Modal, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Users, Edit3, Trash2, Plus, Loader2, BarChart3, Clock, CheckCircle, AlertTriangle, RefreshCw, Check, X, User, Mail, Calendar, DollarSign } from 'lucide-react';
import { jobService } from "../../services/jobservice";
import { bidService } from "../../services/bidservice";
import '../../CSS/ManageJobs.css';

const ManageJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showBidsModal, setShowBidsModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [bids, setBids] = useState([]);
  const [bidsLoading, setBidsLoading] = useState(false);
  const [actingBidId, setActingBidId] = useState(null);

  const fetchMyJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await jobService.getMyJobs();
      if (res.success) {
        setJobs(res.data || []);
      }
    } catch (err) {
      console.error("Lỗi tải danh sách bài đăng cá nhân:", err);
      if (err.response?.status === 404) {
        setError("Chức năng này chưa sẵn sàng. Vui lòng thử lại sau.");
      } else {
        setError("Không thể tải danh sách bài đăng. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMyJobs(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài tuyển dụng này?')) return;
    try {
      await jobService.deleteJob(id);
      setJobs(jobs.filter(j => j.jobId !== id));
      alert("Đã xóa tin tuyển dụng.");
    } catch (err) {
      alert("Lỗi khi xóa.");
    }
  };

  const handleViewBids = async (job) => {
    setSelectedJob(job);
    setShowBidsModal(true);
    setBidsLoading(true);
    try {
      const res = await bidService.getJobBids(job.jobId);
      setBids(res.data || []);
    } catch (err) {
      console.error("Lỗi tải danh sách ứng viên:", err);
      setBids([]);
    } finally {
      setBidsLoading(false);
    }
  };

  const handleAcceptBid = async (bidId) => {
    setActingBidId(bidId);
    try {
      await bidService.acceptBid(bidId);
      setBids(bids.map(b => b.bidId === bidId ? { ...b, status: 'ACCEPTED' } : b));
    } catch (err) {
      alert("Lỗi chấp nhận ứng viên: " + (err.response?.data?.message || "Không xác định"));
    } finally {
      setActingBidId(null);
    }
  };

  const handleRejectBid = async (bidId) => {
    if (!window.confirm('Bạn có chắc muốn từ chối ứng viên này?')) return;
    setActingBidId(bidId);
    try {
      await bidService.rejectBid(bidId);
      setBids(bids.map(b => b.bidId === bidId ? { ...b, status: 'REJECTED' } : b));
    } catch (err) {
      alert("Lỗi từ chối ứng viên: " + (err.response?.data?.message || "Không xác định"));
    } finally {
      setActingBidId(null);
    }
  };

  const getBidStatusBadge = (status) => {
    switch (status) {
      case 'ACCEPTED': return <Badge bg="success" className="status-pill">Đã chấp nhận</Badge>;
      case 'PENDING': return <Badge bg="warning" className="status-pill text-dark">Chờ duyệt</Badge>;
      case 'REJECTED': return <Badge bg="danger" className="status-pill">Đã từ chối</Badge>;
      case 'WITHDRAWN': return <Badge bg="secondary" className="status-pill">Đã rút</Badge>;
      default: return <Badge bg="info">{status}</Badge>;
    }
  };

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
                            <h4 className="fw-bold mb-0 text-success">{jobs.filter(j => j.status === 'OPEN').length}</h4>
                        </div>
                    </div>
                </Card>
            </Col>
        </Row>

        <div className="glass-card overflow-hidden shadow-lg border-0">
          {loading ? (
            <div className="text-center py-5"><Loader2 className="spinner text-primary" size={40} /></div>
          ) : error ? (
            <div className="text-center py-5">
              <div className="text-warning mb-3">
                <AlertTriangle size={48} className="mx-auto" />
              </div>
              <p className="text-white-50 mb-3">{error}</p>
              <Button variant="outline-primary" onClick={fetchMyJobs} className="d-inline-flex align-items-center gap-2">
                <RefreshCw size={16} /> Thử lại
              </Button>
            </div>
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
                        <button className="action-icon-btn" title="Xem ứng viên" onClick={() => handleViewBids(job)}><Users size={16} /></button>
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

      {/* MODAL DANH SÁCH ỨNG VIÊN */}
      <Modal show={showBidsModal} onHide={() => setShowBidsModal(false)} size="lg" centered className="bids-modal" dialogClassName="modal-dark">
        <Modal.Header closeButton className="border-bottom border-white-10">
          <Modal.Title className="fw-bold">
            <Users size={20} className="me-2 text-primary-glow" />
            Ứng viên: <span className="text-primary-glow">{selectedJob?.title}</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark">
          {bidsLoading ? (
            <div className="text-center py-5"><Loader2 className="spinner text-primary" size={36} /></div>
          ) : bids.length === 0 ? (
            <div className="text-center py-5">
              <Users size={48} className="text-white-50 mb-3 mx-auto d-block" />
              <p className="text-white-50 mb-0">Chưa có ứng viên nào ứng tuyển</p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {bids.map((bid) => (
                <div key={bid.bidId} className="bid-card glass-card p-4">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="d-flex gap-3">
                      <div className="bid-avatar">
                        <User size={24} className="text-primary-glow" />
                      </div>
                      <div>
                        <h6 className="fw-bold mb-1 text-white">{bid.studentName || bid.student?.fullName || 'Ứng viên'}</h6>
                        <div className="d-flex flex-wrap gap-3 x-small text-white-50 mb-2">
                          <span className="d-flex align-items-center gap-1"><DollarSign size={13} /> {bid.bidAmount ? bid.bidAmount.toLocaleString('vi-VN') + ' VND' : 'Thỏa thuận'}</span>
                          <span className="d-flex align-items-center gap-1"><Calendar size={13} /> {bid.expectedDays || '?'} ngày</span>
                          {bid.createdAt && <span className="d-flex align-items-center gap-1"><Clock size={13} /> {new Date(bid.createdAt).toLocaleDateString('vi-VN')}</span>}
                        </div>
                        {bid.message && <p className="text-white-50 small mb-2 fst-italic">"{bid.message}"</p>}
                        <div>{getBidStatusBadge(bid.status)}</div>
                      </div>
                    </div>
                    <div className="d-flex gap-2">
                      {bid.status === 'PENDING' && (
                        <>
                          <Button
                            variant="success" size="sm" className="d-flex align-items-center gap-1 fw-bold"
                            disabled={actingBidId === bid.bidId}
                            onClick={() => handleAcceptBid(bid.bidId)}
                          >
                            {actingBidId === bid.bidId ? <Spinner size="sm" animation="border" /> : <Check size={14} />}
                            Chấp nhận
                          </Button>
                          <Button
                            variant="outline-danger" size="sm" className="d-flex align-items-center gap-1"
                            disabled={actingBidId === bid.bidId}
                            onClick={() => handleRejectBid(bid.bidId)}
                          >
                            <X size={14} /> Từ chối
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ManageJobs;
