import React, { useState, useEffect } from 'react';
import { Container, Badge, Button, Row, Col, Modal, Spinner, Tabs, Tab, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import {
  Users, Plus, Loader2, Clock, CheckCircle, AlertTriangle, RefreshCw,
  Check, X, User, Calendar, DollarSign, Handshake, Eye, PenTool,
  Briefcase, Search, MapPin, TrendingUp, MoreVertical, ExternalLink,
  FileText, ArrowUpRight, Star
} from 'lucide-react';
import { jobService } from "../../services/jobservice";
import { bidService } from "../../services/bidservice";
import { contractService } from "../../services/contractservice";
import { serviceOrderService } from "../../services/serviceorderservice";
import { dashboardService } from "../../services/dashboardService";
import { unwrapList } from '../../services/responseUtils';
import '../../CSS/ManageJobs.css';

const ManageJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('jobs');
  const [searchTerm, setSearchTerm] = useState('');

  const [showBidsModal, setShowBidsModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [bids, setBids] = useState([]);
  const [bidsLoading, setBidsLoading] = useState(false);
  const [actingBidId, setActingBidId] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editJob, setEditJob] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', salary: '', description: '', requirements: '' });
  const [dashboardStats, setDashboardStats] = useState(null);

  const [serviceOrders, setServiceOrders] = useState([]);
  const [creatingContract, setCreatingContract] = useState(null);

  const [showCreateContractModal, setShowCreateContractModal] = useState(false);
  const [createContractType, setCreateContractType] = useState(null);
  const [createContractId, setCreateContractId] = useState(null);
  const [createForm, setCreateForm] = useState({ workContent: '', startDate: '', endDate: '', acceptanceCriteria: '' });
  const [creatingSubmit, setCreatingSubmit] = useState(false);

  const fetchMyJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await jobService.getMyJobs();
      if (res.success) {
        const jobList = Array.isArray(res.data) ? res.data : (res.data?.items || []);
        const enriched = await Promise.allSettled(
          jobList.map(async (job) => {
            try {
              const bidRes = await bidService.getJobBids(job.jobId);
              const bidArr = Array.isArray(bidRes?.data) ? bidRes.data : (bidRes?.data?.items || []);
              const bidCount = bidArr.length || (job.bidCount || 0);
              return { ...job, bidCount };
            } catch {
              return { ...job, bidCount: job.bidCount || 0 };
            }
          })
        );
        setJobs(enriched.map(r => r.status === 'fulfilled' ? r.value : r.reason).filter(Boolean));
      }
    } catch (err) {
      if (err.response?.status === 404) setError("Chức năng này chưa sẵn sàng.");
      else setError("Không thể tải danh sách bài đăng.");
    } finally {
      setLoading(false);
    }
  };

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const res = await contractService.getMyContracts();
      const contractList = Array.isArray(res?.data) ? res.data : (res?.data?.items || unwrapList(res));
      if (contractList.length > 0 || res?.success !== false) {
        const enriched = contractList.map(c => {
          const isLocked = Boolean(c.isContentLocked || c.contentLockedAt);
          return {
            ...c,
            hasStudentSigned: isLocked || c.hasStudentSigned || c.studentSignedAt || false,
            hasEnterpriseSigned: isLocked || c.hasEnterpriseSigned || c.enterpriseSignedAt || false,
            progressPercent: c.status === 'COMPLETED' ? 100 : (c.progressPercent || 0),
          };
        });

        const progressPromises = enriched
          .filter(c => c.status === 'IN_PROGRESS' || c.status === 'DELIVERED')
          .map(c => contractService.getProgress(c.contractId).then(res => {
            const progressData = unwrapList(res).length > 0 ? unwrapList(res)[0] : (res?.data || null);
            if (progressData) c.progressPercent = progressData.progressPercent || 0;
          }).catch(() => {}));

        await Promise.allSettled(progressPromises);
        setContracts(enriched);
      }
    } catch (err) {
      console.error("Lỗi tải hợp đồng:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'jobs') fetchMyJobs();
    else if (activeTab === 'contracts') fetchContracts();
    else if (activeTab === 'orders') fetchServiceOrders();
  }, [activeTab]);

  useEffect(() => {
    dashboardService.getEnterpriseDashboard()
      .then(res => setDashboardStats(res.data))
      .catch(() => {});
  }, []);

  const fetchServiceOrders = async () => {
    setLoading(true);
    try {
      const res = await serviceOrderService.getEnterpriseOrders();
      setServiceOrders(Array.isArray(res.data) ? res.data : (res.data?.items || []));
    } catch (err) {
      console.error("Lỗi tải đơn dịch vụ:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'orders') fetchServiceOrders();
  }, [activeTab]);

  const handleCreateContractFromBid = (bidId) => {
    setCreateContractType('bid');
    setCreateContractId(bidId);
    setCreateForm({ workContent: '', startDate: '', endDate: '', acceptanceCriteria: '' });
    setShowCreateContractModal(true);
  };

  const handleCreateContractFromOrder = (orderId) => {
    setCreateContractType('order');
    setCreateContractId(orderId);
    setCreateForm({ workContent: '', startDate: '', endDate: '', acceptanceCriteria: '' });
    setShowCreateContractModal(true);
  };

  const handleSubmitCreateContract = async () => {
    if (!createForm.workContent.trim()) return alert("Vui lòng nhập nội dung công việc");
    if (!createForm.startDate) return alert("Vui lòng chọn ngày bắt đầu");
    if (!createForm.endDate) return alert("Vui lòng chọn ngày kết thúc");

    setCreatingSubmit(true);
    try {
      if (createContractType === 'bid') {
        await contractService.createFromBid(createContractId, createForm);
      } else {
        await contractService.createFromServiceOrder(createContractId, createForm);
      }
      alert("Tạo hợp đồng thành công!");
      setShowCreateContractModal(false);
      fetchMyJobs();
      fetchContracts();
      fetchServiceOrders();
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || "Không thể tạo hợp đồng"));
    } finally {
      setCreatingSubmit(false);
    }
  };

  const handleAcceptOrder = async (orderId) => {
    setCreatingContract(orderId);
    try {
      await serviceOrderService.acceptOrder(orderId);
      setServiceOrders(serviceOrders.map(o => o.orderId === orderId ? { ...o, status: 'ACCEPTED' } : o));
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || "Không thể chấp nhận"));
    } finally {
      setCreatingContract(null);
    }
  };

  const handleRejectOrder = async (orderId) => {
    if (!window.confirm('Từ chối đơn dịch vụ này?')) return;
    setCreatingContract(orderId);
    try {
      await serviceOrderService.rejectOrder(orderId);
      setServiceOrders(serviceOrders.map(o => o.orderId === orderId ? { ...o, status: 'REJECTED' } : o));
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || "Không thể từ chối"));
    } finally {
      setCreatingContract(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa bài tuyển dụng này?')) return;
    try {
      await jobService.deleteJob(id);
      setJobs(jobs.filter(j => j.jobId !== id));
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
      setBids(unwrapList(res));
    } catch (err) {
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
      alert("Lỗi: " + (err.response?.data?.message || "Không xác định"));
    } finally {
      setActingBidId(null);
    }
  };

  const handleRejectBid = async (bidId) => {
    if (!window.confirm('Từ chối ứng viên này?')) return;
    setActingBidId(bidId);
    try {
      await bidService.rejectBid(bidId);
      setBids(bids.map(b => b.bidId === bidId ? { ...b, status: 'REJECTED' } : b));
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || "Không xác định"));
    } finally {
      setActingBidId(null);
    }
  };

  const handleEditJob = (job) => {
    setEditJob(job);
    setEditForm({
      title: job.title || '',
      salary: job.salary || '',
      description: job.description || '',
      requirements: job.requirements || ''
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editForm.title.trim()) {
      alert("Vui lòng nhập tiêu đề");
      return;
    }
    try {
      await jobService.updateJob(editJob.jobId, {
        ...editForm,
        salary: Number(editForm.salary) || 0
      });
      alert("Cập nhật thành công!");
      setShowEditModal(false);
      fetchMyJobs();
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || "Không thể cập nhật"));
    }
  };

  const getStatusConfig = (status) => {
    const map = {
      'APPROVED': { label: 'Đang hiển thị', color: '#10b981', bg: 'rgba(16,185,129,0.12)', icon: <CheckCircle size={12} /> },
      'OPEN': { label: 'Đang hiển thị', color: '#10b981', bg: 'rgba(16,185,129,0.12)', icon: <CheckCircle size={12} /> },
      'PENDING': { label: 'Chờ duyệt', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: <Clock size={12} /> },
      'REJECTED': { label: 'Bị từ chối', color: '#ef4444', bg: 'rgba(239,68,68,0.12)', icon: <X size={12} /> },
      'CLOSED': { label: 'Đã đóng', color: '#6b7280', bg: 'rgba(107,114,128,0.12)', icon: <X size={12} /> },
    };
    return map[status] || { label: status, color: '#60a5fa', bg: 'rgba(96,165,250,0.12)', icon: <Briefcase size={12} /> };
  };

  const getContractStatusConfig = (status) => {
    const map = {
      'SIGNING': { label: 'Chờ ký', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
      'AWAITING_PAYMENT': { label: 'Chờ thanh toán', color: '#60a5fa', bg: 'rgba(96,165,250,0.12)' },
      'IN_PROGRESS': { label: 'Đang thực hiện', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
      'DELIVERED': { label: 'Đã bàn giao', color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
      'CANCEL_REQUESTED': { label: 'Yêu cầu hủy', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
      'COMPLETED': { label: 'Hoàn thành', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
      'DISPUTED': { label: 'Tranh chấp', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
      'CANCELLED': { label: 'Đã hủy', color: '#6b7280', bg: 'rgba(107,114,128,0.12)' },
      'EXPIRED': { label: 'Hết hạn', color: '#6b7280', bg: 'rgba(107,114,128,0.12)' },
    };
    return map[status] || { label: status, color: '#60a5fa', bg: 'rgba(96,165,250,0.12)' };
  };

  const getBidStatusConfig = (status) => {
    const map = {
      'ACCEPTED': { label: 'Chấp nhận', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
      'PENDING': { label: 'Chờ duyệt', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
      'REJECTED': { label: 'Từ chối', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
      'WITHDRAWN': { label: 'Đã rút', color: '#6b7280', bg: 'rgba(107,114,128,0.12)' },
    };
    return map[status] || { label: status, color: '#60a5fa', bg: 'rgba(96,165,250,0.12)' };
  };

  const getOrderStatusConfig = (status) => {
    const map = {
      'PENDING': { label: 'Chờ xử lý', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
      'ACCEPTED': { label: 'Đã chấp nhận', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
      'REJECTED': { label: 'Từ chối', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
      'IN_PROGRESS': { label: 'Đang thực hiện', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
      'COMPLETED': { label: 'Hoàn thành', color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
      'CANCELLED': { label: 'Đã hủy', color: '#6b7280', bg: 'rgba(107,114,128,0.12)' },
    };
    return map[status] || { label: status, color: '#60a5fa', bg: 'rgba(96,165,250,0.12)' };
  };

  const formatMoney = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

  const filteredJobs = jobs.filter(j => (j.title || '').toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredContracts = contracts.filter(c => {
    const partnerName = c.studentName || c.providerName || c.clientName || '';
    return (c.contractName || partnerName || '').toLowerCase().includes(searchTerm.toLowerCase());
  });
  const filteredOrders = serviceOrders.filter(o => (o.serviceName || o.studentName || o.description || '').toLowerCase().includes(searchTerm.toLowerCase()));

  const totalBids = jobs.reduce((sum, j) => sum + (j.bidCount || 0), 0);

  return (
    <div className="mj-page py-5 text-white animate-fade-in">
      <Container fluid className="px-lg-5">
        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-5">
          <div>
            <h1 className="fw-bold display-6 mb-1">
              Quản lý <span className="text-primary-glow">Dự án</span>
            </h1>
            <p className="text-white-50 mb-0">Theo dõi bài đăng tuyển dụng và hợp đồng</p>
          </div>
          <Link to="/post-job" className="mj-btn-create text-decoration-none">
            <Plus size={18} /> ĐĂNG TIN MỚI
          </Link>
        </div>

        {/* STATS CARDS */}
        <Row className="g-3 mb-4">
          <Col xl={3} md={6}>
            <div className="mj-stat-card">
              <div className="mj-stat-icon" style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}>
                <Briefcase size={22} />
              </div>
              <div className="flex-fill">
                <p className="mj-stat-label">Tổng bài đăng</p>
                <h3 className="mj-stat-value">{jobs.length}</h3>
              </div>
              <TrendingUp size={16} className="text-success opacity-50" />
            </div>
          </Col>
          <Col xl={3} md={6}>
            <div className="mj-stat-card">
              <div className="mj-stat-icon" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
                <CheckCircle size={22} />
              </div>
              <div className="flex-fill">
                <p className="mj-stat-label">Đang hiển thị</p>
                <h3 className="mj-stat-value text-success">{jobs.filter(j => j.status === 'APPROVED' || j.status === 'OPEN').length}</h3>
              </div>
              <ArrowUpRight size={16} className="text-success opacity-50" />
            </div>
          </Col>
          <Col xl={3} md={6}>
            <div className="mj-stat-card">
              <div className="mj-stat-icon" style={{ background: 'rgba(168,85,247,0.1)', color: '#a855f7' }}>
                <Users size={22} />
              </div>
              <div className="flex-fill">
                <p className="mj-stat-label">Tổng ứng viên</p>
                <h3 className="mj-stat-value" style={{ color: '#a855f7' }}>{totalBids}</h3>
              </div>
              <Star size={16} className="text-warning opacity-50" />
            </div>
          </Col>
          <Col xl={3} md={6}>
            <div className="mj-stat-card">
              <div className="mj-stat-icon" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>
                <Handshake size={22} />
              </div>
              <div className="flex-fill">
                <p className="mj-stat-label">Hợp đồng</p>
                <h3 className="mj-stat-value text-warning">{contracts.length}</h3>
              </div>
              <FileText size={16} className="text-info opacity-50" />
            </div>
          </Col>
        </Row>

        {/* TABS + SEARCH */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <Tabs activeKey={activeTab} onSelect={(k) => { setActiveTab(k); setSearchTerm(''); }} className="mj-tabs">
            <Tab eventKey="jobs" title={<span><Briefcase size={14} className="me-1" /> Bài đăng ({jobs.length})</span>} />
            <Tab eventKey="orders" title={<span><FileText size={14} className="me-1" /> Đơn dịch vụ ({serviceOrders.length})</span>} />
            <Tab eventKey="contracts" title={<span><Handshake size={14} className="me-1" /> Hợp đồng ({contracts.length})</span>} />
          </Tabs>
          <div className="mj-search">
            <Search size={16} className="text-white-50" />
            <input
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* CONTENT */}
        {loading ? (
          <div className="text-center py-5">
            <Loader2 className="spinner text-primary" size={40} />
          </div>
        ) : error ? (
          <div className="mj-empty-state">
            <AlertTriangle size={48} className="text-warning mb-3" />
            <p className="text-white-50 mb-3">{error}</p>
            <Button variant="outline-primary" onClick={activeTab === 'jobs' ? fetchMyJobs : activeTab === 'orders' ? fetchServiceOrders : fetchContracts}>
              <RefreshCw size={16} className="me-1" /> Thử lại
            </Button>
          </div>
        ) : activeTab === 'jobs' ? (
          <>
            {filteredJobs.length === 0 ? (
              <div className="mj-empty-state">
                <Briefcase size={48} className="text-white-50 mb-3" />
                <p className="text-white-50">Chưa có bài đăng nào</p>
                <Link to="/post-job" className="btn btn-primary fw-bold px-4">Đăng tin ngay</Link>
              </div>
            ) : (
              <Row className="g-3">
                {filteredJobs.map((job) => {
                  const st = getStatusConfig(job.status);
                  return (
                    <Col xl={4} md={6} key={job.jobId}>
                      <div className="mj-job-card">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <span className="mj-status-badge" style={{ background: st.bg, color: st.color }}>
                            {st.icon} {st.label}
                          </span>
                          <span className="mj-date">{new Date(job.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <h6 className="mj-job-title">{job.title}</h6>
                        <p className="mj-job-type">{job.jobType}</p>
                        <div className="d-flex align-items-center gap-2 mb-3">
                          <MapPin size={12} className="text-white-50" />
                          <span className="mj-job-meta">{job.location || 'Remote'}</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <span className="mj-job-price">{job.salary > 0 ? formatMoney(job.salary) : 'Thỏa thuận'}</span>
                          <span className="mj-job-meta">
                            <Users size={12} className="me-1" /> {job.bidCount || 0} ứng viên
                          </span>
                        </div>
                        <div className="d-flex gap-2">
                          <button className="mj-action-btn primary" onClick={() => handleViewBids(job)}>
                            <Users size={14} /> Ứng viên
                          </button>
                          <button className="mj-action-btn primary" onClick={() => handleEditJob(job)}>
                            <PenTool size={14} /> Chỉnh sửa
                          </button>
                          <button className="mj-action-btn danger" onClick={() => handleDelete(job.jobId)}>
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    </Col>
                  );
                })}
              </Row>
            )}
          </>
        ) : activeTab === 'orders' ? (
          <>
            {filteredOrders.length === 0 ? (
              <div className="mj-empty-state">
                <FileText size={48} className="text-white-50 mb-3" />
                <p className="text-white-50">Chưa có đơn dịch vụ nào</p>
              </div>
            ) : (
              <div className="mj-contract-list">
                {filteredOrders.map((order) => {
                  const st = getOrderStatusConfig(order.status);
                  return (
                    <div key={order.orderId} className="mj-contract-card">
                      <div className="d-flex align-items-center gap-4 flex-fill">
                        <div className="mj-contract-avatar">
                          <User size={22} />
                        </div>
                        <div className="flex-fill">
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <h6 className="mj-contract-name mb-0">{order.serviceName || 'Dịch vụ'}</h6>
                            <span className="mj-contract-id">#{order.orderId?.substring(0, 8)}</span>
                          </div>
                          <p className="mj-contract-student mb-0">
                            <User size={12} className="me-1" /> {order.studentName || order.buyerName || 'N/A'}
                          </p>
                          {order.description && <p className="text-white-50 x-small mb-0 mt-1">{order.description}</p>}
                        </div>
                      </div>

                      <div className="mj-contract-info">
                        <span className="mj-contract-amount">{formatMoney(order.totalAmount || order.price)}</span>
                        <span className="mj-status-badge" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                      </div>

                      <div className="d-flex gap-2">
                        {order.status === 'PENDING' && (
                          <>
                            <button
                              className="mj-btn-sm success"
                              disabled={creatingContract === order.orderId}
                              onClick={() => handleAcceptOrder(order.orderId)}
                            >
                              <Check size={14} /> Chấp nhận
                            </button>
                            <button
                              className="mj-btn-sm danger"
                              disabled={creatingContract === order.orderId}
                              onClick={() => handleRejectOrder(order.orderId)}
                            >
                              <X size={14} /> Từ chối
                            </button>
                          </>
                        )}
                        {order.status === 'ACCEPTED' && (
                          <button
                            className="mj-btn-sm success"
                            disabled={creatingContract === order.orderId}
                            onClick={() => handleCreateContractFromOrder(order.orderId)}
                          >
                            {creatingContract === order.orderId ? <Spinner size="sm" animation="border" /> : <FileText size={14} />}
                            Tạo hợp đồng
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <>
            {filteredContracts.length === 0 ? (
              <div className="mj-empty-state">
                <Handshake size={48} className="text-white-50 mb-3" />
                <p className="text-white-50">Chưa có hợp đồng nào</p>
              </div>
            ) : (
              <div className="mj-contract-list">
                {filteredContracts.map((c) => {
                  const st = getContractStatusConfig(c.status);
                  const hasStudentSigned = c.hasStudentSigned || c.studentSignedAt;
                  const hasEnterpriseSigned = c.hasEnterpriseSigned || c.enterpriseSignedAt;
                  const partnerName = c.studentName || c.providerName || c.clientName || 'N/A';
                  const progress = c.progressPercent || 0;
                  const isBothSigned = hasStudentSigned && hasEnterpriseSigned;
                  return (
                    <div key={c.contractId} className="mj-contract-card">
                      <div className="d-flex align-items-center gap-4 flex-fill">
                        <div className="mj-contract-avatar">
                          <User size={22} />
                        </div>
                        <div className="flex-fill">
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <h6 className="mj-contract-name mb-0">{c.contractName || 'Hợp đồng'}</h6>
                            <span className="mj-contract-id">#{c.contractId?.substring(0, 8)}</span>
                          </div>
                          <p className="mj-contract-student mb-0">
                            <User size={12} className="me-1" /> {partnerName}
                          </p>
                          <div className="mt-2" style={{maxWidth: 200}}>
                            <div className="d-flex justify-content-between mb-1">
                              <span className="x-small text-white-50">Tiến độ</span>
                              <span className="x-small fw-bold" style={{color: progress >= 100 ? '#10b981' : '#3b82f6'}}>{progress}%</span>
                            </div>
                            <div className="w-100" style={{height: 4, borderRadius: 4, background: 'rgba(255,255,255,0.08)'}}>
                              <div style={{width: `${progress}%`, height: '100%', borderRadius: 4, background: progress >= 100 ? '#10b981' : progress > 0 ? '#3b82f6' : 'rgba(255,255,255,0.15)', transition: 'width 0.3s'}} />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mj-contract-info">
                        <span className="mj-contract-amount">{formatMoney(c.totalBudget || c.totalAmount)}</span>
                        <span className="mj-status-badge" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                      </div>

                      <div className="mj-contract-sign">
                        <div className={`mj-sign-dot ${hasEnterpriseSigned ? 'signed' : ''}`}>
                          {hasEnterpriseSigned ? <CheckCircle size={10} /> : <Clock size={10} />}
                          <span>DN</span>
                        </div>
                        <div className={`mj-sign-dot ${hasStudentSigned ? 'signed' : ''}`}>
                          {hasStudentSigned ? <CheckCircle size={10} /> : <Clock size={10} />}
                          <span>SV</span>
                        </div>
                      </div>

                      <div className="d-flex gap-2">
                        <Button as={Link} to={`/contract/${c.contractId}`} variant="outline-light" size="sm" className="mj-btn-sm">
                          <Eye size={13} /> Xem
                        </Button>
                        {c.status === 'SIGNING' && !hasEnterpriseSigned && (
                          <Button as={Link} to={`/contract/sign/${c.contractId}`} variant="primary" size="sm" className="mj-btn-sm">
                            <PenTool size={13} /> Ký
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </Container>

      {/* MODAL ỨNG VIÊN */}
      <Modal show={showBidsModal} onHide={() => setShowBidsModal(false)} size="lg" centered dialogClassName="modal-dark">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold d-flex align-items-center gap-2">
            <div className="mj-stat-icon" style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6', width: 40, height: 40 }}>
              <Users size={18} />
            </div>
            <div>
              <span className="text-white">Ứng viên</span>
              <p className="x-small text-white-50 mb-0">{selectedJob?.title}</p>
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-3">
          {bidsLoading ? (
            <div className="text-center py-5"><Loader2 className="spinner text-primary" size={36} /></div>
          ) : bids.length === 0 ? (
            <div className="mj-empty-state py-4">
              <Users size={40} className="text-white-50 mb-2" />
              <p className="text-white-50 mb-0 small">Chưa có ứng viên nào</p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {bids.map((bid) => {
                const bs = getBidStatusConfig(bid.status);
                const studentId = bid.studentId || bid.student?.studentId || bid.student?.userId;
                return (
                  <div key={bid.bidId} className="mj-bid-card">
                    <div className="d-flex gap-3 flex-fill">
                      <div className="mj-bid-avatar">
                        <User size={20} />
                      </div>
                      <div className="flex-fill">
                        <h6 className="fw-bold text-white mb-1">{bid.studentName || bid.student?.fullName || 'Ứng viên'}</h6>
                        <div className="d-flex flex-wrap gap-3 x-small text-white-50 mb-2">
                          <span className="d-flex align-items-center gap-1">
                            <DollarSign size={12} /> {bid.bidAmount ? formatMoney(bid.bidAmount) : 'Thỏa thuận'}
                          </span>
                          <span className="d-flex align-items-center gap-1">
                            <Calendar size={12} /> {bid.expectedDays || '?'} ngày
                          </span>
                          {bid.createdAt && (
                            <span className="d-flex align-items-center gap-1">
                              <Clock size={12} /> {new Date(bid.createdAt).toLocaleDateString('vi-VN')}
                            </span>
                          )}
                        </div>
                        {bid.message && <p className="text-white-50 small mb-2 fst-italic">"{bid.message}"</p>}
                        <span className="mj-status-badge" style={{ background: bs.bg, color: bs.color }}>{bs.label}</span>
                      </div>
                    </div>
                    <div className="d-flex gap-2 mt-2">
                      {studentId && (
                        <Link to={`/portfolio/${studentId}`} target="_blank" className="mj-btn-sm primary text-decoration-none">
                          <ExternalLink size={13} /> Profile
                        </Link>
                      )}
                      {bid.status === 'PENDING' && (
                        <>
                          <button
                            className="mj-btn-sm success"
                            disabled={actingBidId === bid.bidId}
                            onClick={() => handleAcceptBid(bid.bidId)}
                          >
                            {actingBidId === bid.bidId ? <Spinner size="sm" animation="border" /> : <Check size={14} />}
                            Chấp nhận
                          </button>
                          <button
                            className="mj-btn-sm danger"
                            disabled={actingBidId === bid.bidId}
                            onClick={() => handleRejectBid(bid.bidId)}
                          >
                            <X size={14} /> Từ chối
                          </button>
                        </>
                      )}
                      {bid.status === 'ACCEPTED' && (
                        <button
                          className="mj-btn-sm success"
                          disabled={creatingContract === bid.bidId}
                          onClick={() => handleCreateContractFromBid(bid.bidId)}
                        >
                          {creatingContract === bid.bidId ? <Spinner size="sm" animation="border" /> : <FileText size={14} />}
                          Tạo hợp đồng
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* MODAL CHỈNH SỬA CÔNG VIỆC */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered dialogClassName="modal-dark">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold d-flex align-items-center gap-2">
            <div className="mj-stat-icon" style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6', width: 40, height: 40 }}>
              <PenTool size={18} />
            </div>
            <div>
              <span className="text-white">Chỉnh sửa công việc</span>
              <p className="x-small text-white-50 mb-0">{editJob?.title}</p>
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-3">
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="x-small fw-bold text-white-50">TIÊU ĐỀ</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nhập tiêu đề..."
                className="bg-dark-input text-white border-0"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="x-small fw-bold text-white-50">MỨC LƯƠNG (VND)</Form.Label>
              <Form.Control
                type="number"
                placeholder="Nhập mức lương..."
                className="bg-dark-input text-white border-0"
                value={editForm.salary}
                onChange={(e) => setEditForm({ ...editForm, salary: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="x-small fw-bold text-white-50">MÔ TẢ</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Nhập mô tả..."
                className="bg-dark-input text-white border-0"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="x-small fw-bold text-white-50">YÊU CẦU</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Nhập yêu cầu..."
                className="bg-dark-input text-white border-0"
                value={editForm.requirements}
                onChange={(e) => setEditForm({ ...editForm, requirements: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="outline-light" onClick={() => setShowEditModal(false)}>Hủy</Button>
          <Button variant="primary" onClick={handleSaveEdit}>Lưu thay đổi</Button>
        </Modal.Footer>
      </Modal>

      {/* MODAL TẠO HỢP ĐỒNG */}
      <Modal show={showCreateContractModal} onHide={() => setShowCreateContractModal(false)} centered dialogClassName="modal-dark">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold d-flex align-items-center gap-2">
            <div className="mj-stat-icon" style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', width: 40, height: 40 }}>
              <FileText size={18} />
            </div>
            <div>
              <span className="text-white">Tạo hợp đồng mới</span>
              <p className="x-small text-white-50 mb-0">{createContractType === 'bid' ? 'Từ đơn ứng tuyển' : 'Từ đơn dịch vụ'}</p>
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-3">
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="x-small fw-bold text-white-50">NỘI DUNG CÔNG VIỆC *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Mô tả chi tiết nội dung công việc cần thực hiện..."
                className="bg-dark-input text-white border-0"
                value={createForm.workContent}
                onChange={(e) => setCreateForm({ ...createForm, workContent: e.target.value })}
              />
            </Form.Group>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="x-small fw-bold text-white-50">NGÀY BẮT ĐẦU *</Form.Label>
                  <Form.Control
                    type="date"
                    className="bg-dark-input text-white border-0"
                    value={createForm.startDate}
                    onChange={(e) => setCreateForm({ ...createForm, startDate: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="x-small fw-bold text-white-50">NGÀY KẾT THÚC *</Form.Label>
                  <Form.Control
                    type="date"
                    className="bg-dark-input text-white border-0"
                    value={createForm.endDate}
                    onChange={(e) => setCreateForm({ ...createForm, endDate: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label className="x-small fw-bold text-white-50">TIÊU CHÍ NGHIỆM THU</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Các tiêu chí để nghiệm thu kết quả..."
                className="bg-dark-input text-white border-0"
                value={createForm.acceptanceCriteria}
                onChange={(e) => setCreateForm({ ...createForm, acceptanceCriteria: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="outline-light" onClick={() => setShowCreateContractModal(false)}>Hủy</Button>
          <Button variant="success" onClick={handleSubmitCreateContract} disabled={creatingSubmit}>
            {creatingSubmit ? <><Loader2 className="spinner me-1" size={14} /> Đang tạo...</> : <><FileText size={14} className="me-1" /> Tạo hợp đồng</>}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ManageJobs;
