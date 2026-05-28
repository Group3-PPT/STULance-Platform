import React, { useState } from 'react';
import { Table, Badge, Button, Form, InputGroup } from 'react-bootstrap';
import { 
  ShieldAlert, Eye, CheckCircle, 
  AlertOctagon, UserX, MessageSquare, Filter, Search 
} from 'lucide-react';
import '../../CSS/ManageReports.css'; // CSS riêng biệt

const ManageReports = () => {
  // Dữ liệu mẫu các đơn tố cáo
  const [reports, setReports] = useState([
    { 
      id: "RP-8801", 
      reporter: "Nguyễn Văn A", 
      reported: "TechNova Corp", 
      reason: "Chậm thanh toán > 7 ngày", 
      priority: "Cao",
      status: "Đang xử lý",
      date: "28/05/2026"
    },
    { 
      id: "RP-8802", 
      reporter: "Creative Lab", 
      reported: "Lê Hoàng Nam", 
      reason: "Giao sản phẩm không đúng yêu cầu", 
      priority: "Trung bình",
      status: "Mới",
      date: "27/05/2026"
    },
    { 
      id: "RP-8803", 
      reporter: "Trần Minh Tâm", 
      reported: "Coconala Tech", 
      reason: "Hành vi lừa đảo chiếm đoạt sản phẩm", 
      priority: "Khẩn cấp",
      status: "Mới",
      date: "26/05/2026"
    }
  ]);

  const [filter, setFilter] = useState("Tất cả");

  return (
    <div className="report-manage-container animate-fade-in">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h2 className="report-title text-white fw-bold">Quản lý <span className="text-danger-glow">Tố cáo & Khiếu nại</span></h2>
          <p className="text-muted small mb-0">Xử lý các báo cáo vi phạm từ cộng đồng StudentLance.</p>
        </div>
        
        <InputGroup style={{ width: '300px' }}>
          <Form.Control className="adm-search-input" placeholder="Tìm ID hoặc người dùng..." />
          <Button variant="danger"><Search size={18} /></Button>
        </InputGroup>
      </div>

      {/* FILTER TABS */}
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

      {/* TABLE DATA */}
      <div className="report-table-glass shadow-lg">
        <Table responsive variant="dark" className="mb-0 report-custom-table align-middle">
          <thead>
            <tr>
              <th className="ps-4">Mã đơn</th>
              <th>Người tố cáo</th>
              <th>Đối tượng bị tố</th>
              <th>Lý do</th>
              <th>Mức độ</th>
              <th>Trạng thái</th>
              <th className="text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {reports.filter(r => filter === "Tất cả" || r.status === filter).map((report) => (
              <tr key={report.id} className="report-row">
                <td className="ps-4">
                  <span className="report-id-text">#{report.id}</span>
                  <div className="x-small text-muted">{report.date}</div>
                </td>
                <td className="small fw-bold text-white-80">{report.reporter}</td>
                <td className="small fw-bold text-danger">{report.reported}</td>
                <td className="small italic text-muted" style={{maxWidth: '200px'}}>{report.reason}</td>
                <td>
                  <span className={`priority-tag ${
                    report.priority === 'Khẩn cấp' ? 'pri-critical' : 
                    report.priority === 'Cao' ? 'pri-high' : 'pri-normal'
                  }`}>
                    {report.priority}
                  </span>
                </td>
                <td>
                   <Badge bg={report.status === 'Mới' ? 'primary' : 'warning'} className="x-small">
                     {report.status}
                   </Badge>
                </td>
                <td>
                  <div className="d-flex justify-content-center gap-2">
                    <button className="report-action-btn view" title="Xem bằng chứng"><Eye size={16}/></button>
                    <button className="report-action-btn ban" title="Khóa tài khoản bị tố"><UserX size={16}/></button>
                    <button className="report-action-btn resolve" title="Đánh dấu đã giải quyết"><CheckCircle size={16}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default ManageReports;