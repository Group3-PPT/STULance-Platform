import React, { useState } from 'react';
import { Container, Table, Badge, Button, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Users, Edit3, Trash2, Plus, Filter, LayoutGrid } from 'lucide-react';
import '../../CSS/ManageJobs.css'; // Tuân thủ cấu trúc import bạn yêu cầu

const ManageJobs = () => {
  // Quản lý danh sách bài đăng bằng State
  const [jobs, setJobs] = useState([
    {
      id: 1,
      title: 'Thiết kế Mobile App UI/UX',
      category: 'Thiết kế / Sáng tạo',
      postDate: '15/05/2026',
      expiryDate: '15/06/2026',
      candidates: 12,
      status: 'Đang hiển thị'
    },
    {
      id: 2,
      title: 'Lập trình Landing Page 3D',
      category: 'IT / Phần mềm',
      postDate: '10/05/2026',
      expiryDate: '30/05/2026',
      candidates: 8,
      status: 'Đang hiển thị'
    },
    {
      id: 3,
      title: 'Viết nội dung Fanpage Công nghệ',
      category: 'Marketing / Truyền thông',
      postDate: '19/05/2026',
      expiryDate: '19/06/2026',
      candidates: 3,
      status: 'Chờ duyệt'
    },
    {
      id: 4,
      title: 'Dịch thuật tài liệu kỹ thuật Anh-Việt',
      category: 'Viết lách / Dịch thuật',
      postDate: '01/04/2026',
      expiryDate: '01/05/2026',
      candidates: 25,
      status: 'Hết hạn'
    }
  ]);

  const deleteJob = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn gỡ bài đăng này không?')) {
      setJobs(jobs.filter(job => job.id !== id));
    }
  };

  return (
    <div className="manage-jobs-page py-5">
      <Container>
        {/* HEADER DASHBOARD */}
        <div className="d-flex justify-content-between align-items-end mb-5 animate-fade-in">
          <div>
            <h1 className="fw-bold text-white display-6">Quản lý <span className="text-primary-glow">Bài đăng</span></h1>
            <p className="text-muted mt-2 mb-0">Bạn đang có <strong className="text-white">{jobs.filter(j => j.status === 'Đang hiển thị').length}</strong> tin tuyển dụng đang hoạt động.</p>
          </div>
          <Link to="/post-job" className="btn-post-job shadow-glow">
            <Plus size={20} className="me-2" /> ĐĂNG TIN MỚI
          </Link>
        </div>

        {/* BỘ LỌC NHANH (SỬ DỤNG STYLE BTN-AUTH CỦA BẠN) */}
        <div className="glass-card p-2 mb-4 d-flex gap-2 flex-wrap filter-tabs">
          <button className="btn-auth active">Tất cả ({jobs.length})</button>
          <button className="btn-auth">Đang hiển thị</button>
          <button className="btn-auth">Chờ duyệt</button>
          <button className="btn-auth">Đã hết hạn</button>
        </div>

        {/* BẢNG QUẢN LÝ DỰ ÁN */}
        <div className="glass-card overflow-hidden shadow-lg border-0">
          <Table responsive variant="dark" className="job-management-table mb-0 align-middle">
            <thead>
              <tr>
                <th>Tên dự án / Công việc</th>
                <th>Ngày đăng</th>
                <th>Hạn chót</th>
                <th className="text-center">Ứng viên</th>
                <th>Trạng thái</th>
                <th className="text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id} className="job-row">
                  <td className="ps-4">
                    <div className="fw-bold text-white h6 mb-1">{job.title}</div>
                    <div className="x-small text-primary-glow">{job.category}</div>
                  </td>
                  <td className="small text-muted">{job.postDate}</td>
                  <td className="small text-muted">{job.expiryDate}</td>
                  <td className="text-center">
                    <div className="candidate-badge mx-auto">
                      <span className="count-num">{job.candidates}</span>
                      <small className="x-small d-block text-muted">Hồ sơ</small>
                    </div>
                  </td>
                  <td>
                    <Badge 
                      className={`status-pill-badge ${
                        job.status === 'Đang hiển thị' ? 'status-active' : 
                        job.status === 'Chờ duyệt' ? 'status-pending' : 'status-expired'
                      }`}
                    >
                      {job.status}
                    </Badge>
                  </td>
                  <td className="text-center pe-4">
                    <div className="d-flex justify-content-center gap-2">
                      <button className="action-icon-btn" title="Xem ứng viên"><Users size={16} /></button>
                      <button className="action-icon-btn" title="Chỉnh sửa"><Edit3 size={16} /></button>
                      <button className="action-icon-btn delete" title="Xóa" onClick={() => deleteJob(job.id)}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Container>
    </div>
  );
};

export default ManageJobs;