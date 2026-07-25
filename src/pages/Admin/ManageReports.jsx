import React, { useState, useEffect, useCallback } from 'react';
import { Table, Badge, Row, Col, Modal, Button } from 'react-bootstrap';
import {
  ShieldAlert, Eye, CheckCircle,
  AlertTriangle, MessageSquare, Search, Loader2, RefreshCw,
  Clock, User, ExternalLink
} from 'lucide-react';
import { reportService } from '../../services/reportService';
import PaginationBar from '../../components/PaginationBar';
import '../../CSS/ManageReports.css';

const targetTypeLabels = {
  'JOB': { label: 'Việc làm', color: '#8b5cf6' },
  'STUDENT_SERVICE': { label: 'Dịch vụ SV', color: '#3b82f6' },
  'ENTERPRISE': { label: 'Doanh nghiệp', color: '#f59e0b' },
  'STUDENT': { label: 'Sinh viên', color: '#10b981' },
  'CONTRACT': { label: 'Hợp đồng', color: '#ef4444' },
  'SERVICE_ORDER': { label: 'Đơn hàng DV', color: '#ec4899' },
};

const statusMap = {
  'PENDING': { label: 'Mới', bg: 'danger' },
  'REVIEWING': { label: 'Đang xử lý', bg: 'warning' },
  'RESOLVED': { label: 'Đã giải quyết', bg: 'success' },
  'REJECTED': { label: 'Đã từ chối', bg: 'secondary' },
};

const ManageReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Tất cả");
  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 20;

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [resolving, setResolving] = useState(false);

  const fetchData = useCallback(async (page = 1, keyword = '', status = '') => {
    setLoading(true);
    try {
      const params = { page, pageSize };
      if (keyword) params.keyword = keyword;
      if (status) params.status = status;

      const res = await reportService.adminGetAllReports(params);
      if (res.success && res.data) {
        setReports(res.data.items || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalItems(res.data.totalItems || 0);
        setCurrentPage(res.data.page || 1);
      }
    } catch (err) {
      console.error("Lỗi tải báo cáo:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(1); }, [fetchData]);

  const mapReport = (r) => ({
    id: r.reportId,
    shortId: r.reportId?.substring(0, 8),
    reporter: r.reporterName || r.reporterUserId || 'N/A',
    targetType: r.targetType || 'Khác',
    targetTypeLabel: targetTypeLabels[r.targetType]?.label || r.targetType,
    targetTypeColor: targetTypeLabels[r.targetType]?.color || '#64748b',
    targetId: r.targetId,
    content: r.content || 'Không có nội dung',
    status: r.status,
    statusLabel: statusMap[r.status]?.label || r.status,
    statusBg: statusMap[r.status]?.bg || 'secondary',
    date: r.createdAt ? new Date(r.createdAt).toLocaleDateString('vi-VN') : 'N/A',
    createdAt: new Date(r.createdAt || 0),
    resolvedByName: r.resolvedByName,
    resolvedAt: r.resolvedAt ? new Date(r.resolvedAt).toLocaleDateString('vi-VN') : null,
    resolutionNote: r.resolutionNote,
  });

  const allReports = reports.map(mapReport);

  const filteredReports = allReports.filter(r => {
    if (filter === "Tất cả") return true;
    if (filter === "Mới") return r.status === 'PENDING';
    if (filter === "Đang xử lý") return r.status === 'REVIEWING';
    if (filter === "Đã giải quyết") return r.status === 'RESOLVED';
    return true;
  });

  const newCount = allReports.filter(r => r.status === 'PENDING').length;
  const reviewingCount = allReports.filter(r => r.status === 'REVIEWING').length;
  const resolvedCount = allReports.filter(r => r.status === 'RESOLVED').length;

  const handleViewDetail = (report) => {
    setSelectedReport(report);
    setShowDetailModal(true);
  };

  const handleResolve = async (report, action) => {
    const actionLabel = action === 'RESOLVED' ? 'Giải quyết' : 'Từ chối';
    if (!window.confirm(`Xác nhận "${actionLabel}" cho báo cáo này?`)) return;
    setResolving(true);
    try {
      await reportService.adminUpdateStatus(report.id, {
        status: action,
        resolutionNote: actionLabel
      });
      alert("Đã xử lý báo cáo thành công!");
      setShowDetailModal(false);
      fetchData(currentPage, searchTerm);
    } catch (err) {
      alert("Lỗi xử lý: " + (err.response?.data?.message || "Không xác định"));
    } finally {
      setResolving(false);
    }
  };

  const getTargetLink = (report) => {
    switch (report.targetType) {
      case 'JOB': return `/jobs/${report.targetId}`;
      case 'STUDENT_SERVICE': return `/services/${report.targetId}`;
      case 'ENTERPRISE': return `/businesses/business-profile/${report.targetId}`;
      case 'STUDENT': return `/students/${report.targetId}`;
      case 'CONTRACT': return `/contracts/${report.targetId}`;
      default: return null;
    }
  };

  return (
    <div className="report-manage-container animate-fade-in">
      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h2 className="report-title text-white fw-bold">Quản lý <span className="text-danger-glow">Tố cáo & Khiếu nại</span></h2>
          <p className="text-white-50 small mb-0">Xử lý các báo cáo vi phạm từ cộng đồng StudentLance.</p>
        </div>
        <div className="d-flex gap-3 align-items-center">
          <div className="d-flex gap-3">
            <div className="glass-card px-3 py-2 text-center">
              <div className="x-small text-white-50 uppercase-tracking">Mới</div>
              <div className="fw-bold text-danger">{newCount}</div>
            </div>
            <div className="glass-card px-3 py-2 text-center">
              <div className="x-small text-white-50 uppercase-tracking">Đang xử lý</div>
              <div className="fw-bold text-warning">{reviewingCount}</div>
            </div>
            <div className="glass-card px-3 py-2 text-center">
              <div className="x-small text-white-50 uppercase-tracking">Đã giải quyết</div>
              <div className="fw-bold text-success">{resolvedCount}</div>
            </div>
          </div>
          <div style={{ width: '250px', position: 'relative' }}>
            <Search size={16} className="text-white-50" style={{ position:'absolute', left:'12px', top:'11px', zIndex: 5 }}/>
            <input
              type="text"
              placeholder="Tìm ID hoặc nội dung..."
              className="w-100 bg-dark-input text-white border-0 rounded-3 ps-4 py-2"
              style={{fontSize: '13px'}}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchData(1, searchTerm)}
            />
          </div>
          <button className="btn-icon-table text-white-50" title="Làm mới" onClick={() => fetchData(currentPage, searchTerm)}><RefreshCw size={16}/></button>
        </div>
      </div>

      <div className="glass-card p-2 mb-4 d-flex gap-2">
        {[
          { label: "Tất cả", count: allReports.length },
          { label: "Mới", count: newCount },
          { label: "Đang xử lý", count: reviewingCount },
          { label: "Đã giải quyết", count: resolvedCount },
        ].map(tab => (
          <button
            key={tab.label}
            className={`report-tab-btn ${filter === tab.label ? 'active' : ''}`}
            onClick={() => setFilter(tab.label)}
          >
            {tab.label}
            {tab.count > 0 && <span className="ms-1 badge-count">{tab.count}</span>}
          </button>
        ))}
      </div>

      <div className="report-table-glass shadow-lg">
        {loading ? (
          <div className="text-center py-5"><Loader2 className="spinner text-primary" size={40}/></div>
        ) : (
          <>
          <Table responsive variant="dark" className="mb-0 report-custom-table align-middle">
            <thead>
              <tr>
                <th className="ps-4">Mã đơn</th>
                <th>Người tố cáo</th>
                <th>Đối tượng bị tố</th>
                <th>Nội dung báo cáo</th>
                <th>Loại</th>
                <th>Trạng thái</th>
                <th className="text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report) => (
                <tr key={report.id} className="report-row">
                  <td className="ps-4">
                    <span className="report-id-text">#{report.shortId}</span>
                    <div className="x-small text-white-50">{report.date}</div>
                  </td>
                  <td className="small fw-bold text-white-80">
                    <div className="d-flex align-items-center gap-1">
                      <User size={12} className="text-white-50" />
                      {report.reporter}
                    </div>
                  </td>
                  <td>
                    <div className="small fw-bold" style={{ color: report.targetTypeColor }}>
                      {report.targetTypeLabel}
                    </div>
                    <div className="x-small text-white-50">ID: {report.targetId?.substring(0, 8)}</div>
                  </td>
                  <td className="small text-white-80" style={{ maxWidth: '250px' }}>
                    {report.content}
                  </td>
                  <td>
                    <Badge style={{ fontSize: '10px', backgroundColor: report.targetTypeColor }}>
                      {report.targetType}
                    </Badge>
                  </td>
                  <td>
                    <Badge bg={report.statusBg} className="status-badge-sm">{report.statusLabel}</Badge>
                  </td>
                  <td>
                    <div className="d-flex justify-content-center gap-2">
                      <button className="report-action-btn view" title="Xem chi tiết" onClick={() => handleViewDetail(report)}><Eye size={16}/></button>
                      {report.status === 'PENDING' && (
                        <>
                          <button className="report-action-btn resolve" title="Giải quyết" onClick={() => handleResolve(report, 'RESOLVED')}><CheckCircle size={16}/></button>
                          <button className="report-action-btn" title="Từ chối" style={{ color: '#ef4444' }} onClick={() => handleResolve(report, 'REJECTED')}><AlertTriangle size={16}/></button>
                        </>
                      )}
                      {report.status === 'REVIEWING' && (
                        <button className="report-action-btn resolve" title="Giải quyết" onClick={() => handleResolve(report, 'RESOLVED')}><CheckCircle size={16}/></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredReports.length === 0 && (
                <tr><td colSpan="7" className="text-center py-5 text-white-50">Không có báo cáo nào.</td></tr>
              )}
            </tbody>
          </Table>

          <div className="p-3 border-top" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <PaginationBar
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => fetchData(page, searchTerm)}
            />
          </div>
          </>
        )}
      </div>

      {/* MODAL CHI TIẾT BÁO CÁO */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg" centered dialogClassName="modal-dark">
        <Modal.Header closeButton className="border-bottom border-white-10">
          <Modal.Title className="fw-bold">
            <ShieldAlert size={20} className="me-2 text-danger" />
            Chi tiết báo cáo <span className="text-primary-glow">#{selectedReport?.shortId}</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark">
          {selectedReport && (
            <div>
              <Row className="g-4 mb-4">
                <Col md={6}>
                  <div className="glass-card p-3">
                    <div className="x-small text-white-50 uppercase-tracking mb-1"><User size={12} className="me-1"/> Người tố cáo</div>
                    <div className="fw-bold text-white">{selectedReport.reporter}</div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="glass-card p-3">
                    <div className="x-small text-white-50 uppercase-tracking mb-1"><AlertTriangle size={12} className="me-1"/> Đối tượng bị tố</div>
                    <div className="fw-bold" style={{ color: selectedReport.targetTypeColor }}>
                      {selectedReport.targetTypeLabel}
                    </div>
                    <div className="x-small text-white-50 mt-1">ID: {selectedReport.targetId}</div>
                  </div>
                </Col>
                <Col md={12}>
                  <div className="glass-card p-3">
                    <div className="x-small text-white-50 uppercase-tracking mb-1"><MessageSquare size={12} className="me-1"/> Nội dung báo cáo</div>
                    <div className="text-white-80 fw-bold">{selectedReport.content}</div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="glass-card p-3">
                    <div className="x-small text-white-50 uppercase-tracking mb-1"><Clock size={12} className="me-1"/> Ngày tạo</div>
                    <div className="fw-bold text-white">{selectedReport.date}</div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="glass-card p-3">
                    <div className="x-small text-white-50 uppercase-tracking mb-1">Trạng thái</div>
                    <Badge bg={selectedReport.statusBg} className="px-3 py-2">{selectedReport.statusLabel}</Badge>
                  </div>
                </Col>
                {selectedReport.resolvedByName && (
                  <Col md={6}>
                    <div className="glass-card p-3">
                      <div className="x-small text-white-50 uppercase-tracking mb-1"><CheckCircle size={12} className="me-1"/> Xử lý bởi</div>
                      <div className="fw-bold text-white">{selectedReport.resolvedByName}</div>
                      {selectedReport.resolvedAt && <div className="x-small text-white-50 mt-1">Ngày: {selectedReport.resolvedAt}</div>}
                    </div>
                  </Col>
                )}
                {selectedReport.resolutionNote && (
                  <Col md={6}>
                    <div className="glass-card p-3">
                      <div className="x-small text-white-50 uppercase-tracking mb-1">Ghi chú xử lý</div>
                      <div className="text-white-80">{selectedReport.resolutionNote}</div>
                    </div>
                  </Col>
                )}
              </Row>

              {selectedReport.status !== 'RESOLVED' && selectedReport.status !== 'REJECTED' && (
                <div className="d-flex gap-3 justify-content-end border-top border-white-10 pt-4">
                  {getTargetLink(selectedReport) && (
                    <Button as="a" href={getTargetLink(selectedReport)} target="_blank" variant="outline-info" className="fw-bold px-4">
                      <ExternalLink size={16} className="me-2" /> Xem đối tượng
                    </Button>
                  )}
                  <Button variant="outline-danger" className="fw-bold px-4" disabled={resolving} onClick={() => handleResolve(selectedReport, 'RESOLVED')}>
                    <CheckCircle size={16} className="me-2" /> Giải quyết
                  </Button>
                  <Button variant="outline-warning" className="fw-bold px-4" disabled={resolving} onClick={() => handleResolve(selectedReport, 'REJECTED')}>
                    <AlertTriangle size={16} className="me-2" /> Từ chối
                  </Button>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ManageReports;
