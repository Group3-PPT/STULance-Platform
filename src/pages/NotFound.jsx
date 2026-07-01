import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search, MapPin } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="d-flex flex-column align-items-center justify-content-center text-center px-4" style={{ minHeight: '60vh' }}>
      <div className="mb-4" style={{ fontSize: '120px', fontWeight: 900, lineHeight: 1, background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        404
      </div>

      <div className="position-relative mb-4">
        <Search size={48} className="text-white-50" style={{ opacity: 0.3 }} />
        <MapPin size={24} className="text-primary position-absolute" style={{ top: -5, right: -10 }} />
      </div>

      <h2 className="text-white fw-bold mb-3">Oops! Trang không tồn tại</h2>
      <p className="text-white-50 mb-4" style={{ maxWidth: 450 }}>
        Có vẻ trang bạn tìm kiếm đã bị xóa, đổi tên hoặc không bao giờ tồn tại.
      </p>

      <div className="d-flex gap-3 flex-wrap justify-content-center">
        <button className="btn btn-primary px-4 py-2 fw-bold d-flex align-items-center gap-2" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> Quay lại
        </button>
        <Link to="/" className="btn btn-outline-light px-4 py-2 fw-bold d-flex align-items-center gap-2 text-decoration-none">
          <Home size={18} /> Về trang chủ
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
