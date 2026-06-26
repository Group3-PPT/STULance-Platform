import React, { useState, useEffect } from 'react';
import { Table, Badge, Row, Col, Spinner } from 'react-bootstrap';
import { 
  ShieldAlert, Eye, CheckCircle, 
  AlertOctagon, UserX, MessageSquare, Filter, Search, Loader2, RefreshCw,
  FileText, Briefcase
} from 'lucide-react';
import { adminService } from '../../services/adminservice';
import '../../CSS/ManageReports.css'; 

const ManageReports = () => {
  const [contracts, setContracts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Tất cả");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [contractsRes, ordersRes] = await Promise.all([
        adminService.getAllContracts(),
        adminService.getAllServiceOrders()
      ]);
      if (contractsRes.success) setContracts(contractsRes.data || []);
      if (ordersRes.success) setOrders(ordersRes.data || []);
    } catch (err) {
      console.error("Lỗi tải dữ liệu:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const disputes = [
    ...contracts.filter(c => c.status === 'DISPUTED' || c.status === 'CANCELLED').map(c => ({
      id: c.contractId?.substring(0, 8),
      reporter: c.studentName || 'N/A',
      reported: c.enterpriseName || 'N/A',
      reason: c.status === 'DISPUTED' ? 'Tranh chấp hợp đồng' : 'Hủy hợp đồng',
      priority: c.status === 'DISPUTED' ? 'Cao' : 'Trung bình',
      status: c.status === 'DISPUTED' ? 'Mới' : 'Đang xử lý',
      date: new Date(c.createdAt).toLocaleDateString('vi-VN'),
      type: 'Hợp đồng'
    })),
    ...orders.filter(o => o.status === 'CANCELLED' || o.status === 'DISPUTED').map(o => ({
      id: o.orderId?.substring(0, 8),
      reporter: o.buyerName || 'N/A',
      reported: o.sellerName || 'N/A',
      reason: o.status === 'DISPUTED' ? 'Tranh chấp đơn hàng' : 'Hủy đơn hàng',
      priority: o.status === 'DISPUTED' ? 'Cao' : 'Trung bình',
      status: o.status === 'DISPUTED' ? 'Mới' : 'Đang xử lý',
      date: new Date(o.createdAt).toLocaleDateString('vi-VN'),
      type: 'Đơn hàng DV'
    }))
  ];

  const filteredDisputes = disputes.filter(r => {
    const statusMatch = filter === "Tất cả" || r.status === filter;
    const searchMatch = r.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.reporter.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.reported.toLowerCase().includes(searchTerm.toLowerCase());
    return statusMatch && searchMatch;
  });

  const newCount = disputes.filter(d => d.status === 'Mới').length;
  const processingCount = disputes.filter(d => d.status === 'Đang xử lý').length;

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
              <div className="fw-bold text-warning">{processingCount}</div>
            </div>
          </div>
          <div style={{ width: '250px', position: 'relative' }}>
            <Search size={16} className="text-white-50" style={{ position:'absolute', left:'12px', top:'11px', zIndex: 5 }}/>
            <input 
              type="text" 
              placeholder="Tìm ID hoặc người dùng..." 
              className="w-100 bg-dark-input text-white border-0 rounded-3 ps-4 py-2"
              style={{fontSize: '13px'}}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn-icon-table text-white-50" title="Làm mới" onClick={fetchData}><RefreshCw size={16}/></button>
        </div>
      </div>

      <div className="glass-card p-2 mb-4 d-flex gap-2">
        {["Tất cả", "Mới", "Đang xử lý", "Đã giải quyết"].map(st => (
          <button 
            key={st}
            className={`report-tab-btn ${filter === st ? 'active' : ''}`}
            onClick={() => setFilter(st)}
          >
            {st}
          </button>
        ))}
      </div>

      <div className="report-table-glass shadow-lg">
        {loading ? (
          <div className="text-center py-5"><Loader2 className="spinner text-primary" size={40}/></div>
        ) : (
          <Table responsive variant="dark" className="mb-0 report-custom-table align-middle">
            <thead>
              <tr>
                <th className="ps-4">Mã đơn</th>
                <th>Người tố cáo</th>
                <th>Đối tượng bị tố</th>
                <th>Lý do</th>
                <th>Loại</th>
                <th>Mức độ</th>
                <th className="text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredDisputes.map((report, idx) => (
                <tr key={report.id || idx} className="report-row">
                  <td className="ps-4">
                    <span className="report-id-text">#{report.id}</span>
                    <div className="x-small text-white-50">{report.date}</div>
                  </td>
                  <td className="small fw-bold text-white-80">{report.reporter}</td>
                  <td className="small fw-bold text-danger">{report.reported}</td>
                  <td className="small text-white-50" style={{maxWidth: '200px'}}>{report.reason}</td>
                  <td><Badge bg="info" style={{fontSize: '10px'}}>{report.type}</Badge></td>
                  <td>
                    <span className={`priority-tag ${
                      report.priority === 'Khẩn cấp' ? 'pri-critical' : 
                      report.priority === 'Cao' ? 'pri-high' : 'pri-normal'
                    }`}>
                      {report.priority}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex justify-content-center gap-2">
                      <button className="report-action-btn view" title="Xem chi tiết"><Eye size={16}/></button>
                      <button className="report-action-btn resolve" title="Đánh dấu đã giải quyết"><CheckCircle size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredDisputes.length === 0 && (
                <tr><td colSpan="7" className="text-center py-5 text-white-50">Không có khiếu nại nào.</td></tr>
              )}
            </tbody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default ManageReports;
