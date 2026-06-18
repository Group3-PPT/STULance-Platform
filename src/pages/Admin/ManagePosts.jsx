import React, { useState, useEffect } from 'react';
import { Table, Badge, Spinner } from 'react-bootstrap';
import { Search, CheckCircle, XCircle, Eye, Calendar, Loader2, Building2 } from 'lucide-react';
import { jobservice } from '../../services/jobservice-temp';
import '../../CSS/ManagePosts.css';

const ManagePosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Tất cả");
  const [searchTerm, setSearchTerm] = useState("");

  // 1. Tải dữ liệu từ API Admin
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await jobservice.adminGetAllJobs();
      if (res.success) {
        setPosts(res.data || []);
      }
    } catch (err) {
      console.error("Lỗi tải bài đăng:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // 2. Xử lý Duyệt hoặc Từ chối bài đăng
  const handleAction = async (id, newStatus) => {
    const actionText = newStatus === 'APPROVED' ? "duyệt" : "từ chối/đánh dấu vi phạm";
    if (!window.confirm(`Bạn có chắc chắn muốn ${actionText} bài đăng này?`)) return;

    try {
      await jobservice.adminUpdateStatus(id, newStatus);
      alert("Cập nhật thành công!");
      fetchPosts(); // Tải lại danh sách sau khi cập nhật
    } catch (err) {
      alert("Lỗi khi cập nhật trạng thái bài đăng.");
    }
  };

  // 3. Logic lọc dữ liệu
  const filteredPosts = posts.filter(p => {
    const statusMatch = 
        filter === "Tất cả" || 
        (filter === "Chờ duyệt" && p.status === "PENDING") ||
        (filter === "Đang hiển thị" && p.status === "APPROVED") ||
        (filter === "Vi phạm" && p.status === "REJECTED");
    
    const searchMatch = 
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.jobId.toLowerCase().includes(searchTerm.toLowerCase());

    return statusMatch && searchMatch;
  });

  return (
    <div className="adm-page-content animate-fade-in text-white py-4">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h2 className="text-white fw-bold mb-1">Quản lý <span className="text-primary-glow">Bài đăng</span></h2>
          <p className="text-muted small mb-0">Hệ thống kiểm duyệt nội dung tin tuyển dụng toàn sàn.</p>
        </div>
        
        <div className="d-flex gap-2">
            <div className="adm-search-wrapper" style={{ width: '320px', height: '45px', position: 'relative' }}>
                <Search size={18} className="text-muted" style={{ position:'absolute', left:'15px', top:'13px' }}/>
                <input 
                    type="text" 
                    placeholder="Tìm tiêu đề hoặc Mã ID..." 
                    className="w-100 h-100 bg-dark-input text-white border-0 rounded-3 ps-5"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="post-filter-tabs glass-card p-2 mb-4 d-flex gap-2">
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
      <div className="glass-card overflow-hidden shadow-lg border-0 min-vh-50">
        {loading ? (
            <div className="text-center py-5"><Loader2 className="spinner text-primary" size={40}/></div>
        ) : (
            <Table responsive variant="dark" className="mb-0 adm-custom-table align-middle">
            <thead>
                <tr>
                <th className="ps-4">Mã bài đăng</th>
                <th>Tiêu đề bài đăng</th>
                <th>Doanh nghiệp</th>
                <th>Lương</th>
                <th>Trạng thái</th>
                <th className="text-center">Thao tác</th>
                </tr>
            </thead>
            <tbody>
                {filteredPosts.map((post) => (
                <tr key={post.jobId} className="adm-table-row">
                    <td className="ps-4">
                        <div className="text-primary-glow fw-bold small">{post.jobId.substring(0, 8)}</div>
                        <Badge bg="primary" className="x-small mt-1">Việc làm</Badge>
                    </td>
                    <td>
                        <div className="fw-bold text-white small line-clamp-1" title={post.title}>{post.title}</div>
                        <div className="x-small text-muted">
                            <Calendar size={10} className="me-1"/>
                            {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                        </div>
                    </td>
                    <td>
                        <div className="small d-flex align-items-center gap-2">
                            <Building2 size={14} className="text-info"/>
                            {post.enterpriseName || 'N/A'}
                        </div>
                    </td>
                    <td className="fw-bold text-warning small">
                        {post.salary > 0 ? `${post.salary.toLocaleString()}đ` : 'Thỏa thuận'}
                    </td>
                    <td>
                    <Badge 
                        className={`adm-status-pill ${
                        post.status === 'APPROVED' ? 'bg-success' : 
                        post.status === 'REJECTED' ? 'bg-danger' : 'bg-warning text-dark'
                        }`}
                    >
                        {post.status === 'APPROVED' ? 'Đang hiển thị' : post.status === 'PENDING' ? 'Chờ duyệt' : 'Vi phạm'}
                    </Badge>
                    </td>
                    <td>
                    <div className="d-flex justify-content-center gap-2">
                        <button className="adm-btn-action text-info" title="Xem chi tiết"><Eye size={18}/></button>
                        
                        {post.status === 'PENDING' && (
                            <>
                                <button 
                                    className="adm-btn-action text-success" 
                                    title="Duyệt bài" 
                                    onClick={() => handleAction(post.jobId, "APPROVED")}
                                >
                                    <CheckCircle size={18}/>
                                </button>
                                <button 
                                    className="adm-btn-action text-danger" 
                                    title="Đánh dấu vi phạm" 
                                    onClick={() => handleAction(post.jobId, "REJECTED")}
                                >
                                    <XCircle size={18}/>
                                </button>
                            </>
                        )}
                    </div>
                    </td>
                </tr>
                ))}
            </tbody>
            </Table>
        )}
        {!loading && filteredPosts.length === 0 && (
            <div className="text-center py-5 text-muted italic">Không tìm thấy bài đăng nào khớp với bộ lọc.</div>
        )}
      </div>
    </div>
  );
};

export default ManagePosts;