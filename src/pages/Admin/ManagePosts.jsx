import React, { useState } from 'react';
import { Table, Badge, Button, Form, InputGroup, Row, Col } from 'react-bootstrap';
import { Search, Filter, CheckCircle, XCircle, Eye, Trash2, Calendar, Briefcase, FileText } from 'lucide-react';
import '../../CSS/ManagePosts.css'; // Sử dụng chung cấu trúc CSS Layout

const ManagePosts = () => {
  // Dữ liệu mẫu bài đăng (Gồm cả Việc làm và Gói dịch vụ)
  const [posts, setPosts] = useState([
    { id: "PJ-201", title: "Thực tập sinh ReactJS", author: "TechNova Corp", type: "Việc làm", budget: "8.000.000đ", status: "Chờ duyệt", date: "28/05/2026" },
    { id: "SV-505", title: "Thiết kế bộ nhận diện thương hiệu", author: "Linh Nguyễn", type: "Dịch vụ", budget: "1.500.000đ", status: "Đang hiển thị", date: "27/05/2026" },
    { id: "PJ-202", title: "Fix lỗi CSS đồ án", author: "HUST Team", type: "Việc làm", budget: "500.000đ", status: "Vi phạm", date: "26/05/2026" },
    { id: "SV-508", title: "Lập trình Landing Page 3D", author: "Hoàng Dev", type: "Dịch vụ", budget: "2.500.000đ", status: "Đang hiển thị", date: "25/05/2026" },
  ]);

  const [filter, setFilter] = useState("Tất cả");

  const handleAction = (id, newStatus) => {
    alert(`Đã cập nhật bài đăng ${id} sang: ${newStatus}`);
    setPosts(posts.map(p => p.id === id ? { ...p, status: newStatus } : p));
  };

  return (
    <div className="adm-page-content animate-fade-in">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h2 className="text-white fw-bold mb-1">Quản lý <span className="text-primary-glow">Bài đăng</span></h2>
          <p className="text-muted small mb-0">Kiểm duyệt nội dung tin tuyển dụng và dịch vụ sinh viên.</p>
        </div>
        
        <div className="d-flex gap-2">
            <div className="adm-search-wrapper" style={{ width: '280px', height: '45px' }}>
                <Search size={18} className="text-muted" />
                <input type="text" placeholder="Tìm tiêu đề, tác giả hoặc ID..." />
            </div>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="post-filter-tabs glass-card p-2 mb-4 d-flex gap-2 ">
        {["Tất cả", "Chờ duyệt", "Đang hiển thị", "Vi phạm"].map(status => (
          <button 
            key={status}
            className={`post-tab-btn ${filter === status ? 'active' : ''}`}
            onClick={() => setFilter(status)}
          >
            {status}
          </button>
        ))}
      </div>

      {/* DATA TABLE */}
      <div className="glass-card overflow-hidden shadow-lg border-0">
        <Table responsive variant="dark" className="mb-0 adm-custom-table align-middle">
          <thead>
            <tr>
              <th className="ps-4">Mã ID / Loại</th>
              <th>Tiêu đề bài đăng</th>
              <th>Người đăng</th>
              <th>Ngân sách</th>
              <th>Trạng thái</th>
              <th className="text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {posts.filter(p => filter === "Tất cả" || p.status === filter).map((post) => (
              <tr key={post.id} className="adm-table-row">
                <td className="ps-4">
                  <div className="text-primary-glow fw-bold small">{post.id}</div>
                  <Badge bg={post.type === 'Việc làm' ? 'primary' : 'info'} className="x-small mt-1">{post.type}</Badge>
                </td>
                <td>
                  <div className="fw-bold text-white small line-clamp-1" style={{maxWidth: '250px'}}>{post.title}</div>
                  <div className="x-small text-muted"><Calendar size={10} className="me-1"/>{post.date}</div>
                </td>
                <td>
                  <div className="small d-flex align-items-center gap-2">
                    <div className="avatar-mini-adm"></div>
                    {post.author}
                  </div>
                </td>
                <td className="fw-bold text-warning small">{post.budget}</td>
                <td>
                  <Badge 
                    className={`adm-status-pill ${
                      post.status === 'Đang hiển thị' ? 'bg-success' : 
                      post.status === 'Vi phạm' ? 'bg-danger' : 'bg-warning text-dark'
                    }`}
                  >
                    {post.status}
                  </Badge>
                </td>
                <td>
                  <div className="d-flex justify-content-center gap-2">
                    <button className="adm-btn-action text-info" title="Xem nội dung"><Eye size={16}/></button>
                    <button className="adm-btn-action text-success" title="Duyệt bài" onClick={() => handleAction(post.id, "Đang hiển thị")}><CheckCircle size={16}/></button>
                    <button className="adm-btn-action text-danger" title="Đánh dấu vi phạm" onClick={() => handleAction(post.id, "Vi phạm")}><XCircle size={16}/></button>
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

export default ManagePosts;