import { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Heart, Loader2, ShoppingBag, Search, AlertTriangle, Trash2 } from 'lucide-react';
import { savedItemsService } from '../../services/saveditemsservice';
import { unwrapList } from '../../services/responseUtils';
import '../../CSS/SavedServices.css';

const SavedServices = () => {
  const [savedServices, setSavedServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [clearing, setClearing] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [confirmId, setConfirmId] = useState(null);

  const formatMoney = (val) => new Intl.NumberFormat('vi-VN').format(val || 0);

  const fetchSaved = async () => {
    setLoading(true);
    try {
      const res = await savedItemsService.getMySavedServices();
      setSavedServices(unwrapList(res));
    } catch (err) {
      console.error("Lỗi tải dịch vụ đã lưu:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSaved(); }, []);

  const handleRemove = async (e, serviceId) => {
    e.preventDefault();
    e.stopPropagation();
    setRemovingId(serviceId);
    try {
      await savedItemsService.unsaveService(serviceId);
      setSavedServices(prev => prev.filter(s => s.serviceId !== serviceId));
    } catch (err) {
      console.error("Lỗi bỏ lưu:", err);
    } finally {
      setRemovingId(null);
      setConfirmId(null);
    }
  };

  const handleClearUnavailable = async () => {
    setClearing(true);
    try {
      await savedItemsService.clearUnavailableItems();
      fetchSaved();
    } catch (err) {
      console.error("Lỗi dọn danh sách:", err);
    } finally {
      setClearing(false);
    }
  };

  const categories = useMemo(() => {
    const cats = new Set(savedServices.filter(s => s.category).map(s => s.category));
    return ['all', ...cats];
  }, [savedServices]);

  const filtered = useMemo(() => {
    let list = savedServices;
    if (filterCat !== 'all') list = list.filter(s => s.category === filterCat);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        s.title?.toLowerCase().includes(q) ||
        s.studentName?.toLowerCase().includes(q) ||
        s.category?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [savedServices, search, filterCat]);

  const unavailableCount = savedServices.filter(s => s.isAvailable === false).length;

  if (loading) {
    return (
      <div className="saved-page d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="text-center">
          <Loader2 className="spin text-primary" size={36} />
          <p className="text-white-50 mt-3" style={{ fontSize: '0.8rem' }}>Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="saved-page py-4 text-white">
      <Container>
        {/* HEADER */}
        <div className="saved-header mb-4">
          <div className="saved-header-left">
            <Heart size={20} className="text-danger" fill="#ef4444" />
            <div>
              <h4 className="saved-header-title">Dịch vụ đã lưu</h4>
              <p className="saved-header-sub">{savedServices.length} mục quan tâm</p>
            </div>
          </div>
          <div className="d-flex gap-2 align-items-center">
            {unavailableCount > 0 && (
              <Button variant="outline-danger" size="sm" className="fw-bold" disabled={clearing} onClick={handleClearUnavailable} style={{ fontSize: '0.7rem' }}>
                {clearing ? <Loader2 size={11} className="spin me-1" /> : <Trash2 size={11} className="me-1" />}
                Xóa {unavailableCount} không khả dụng
              </Button>
            )}
            <Button as={Link} to="/services" variant="primary" size="sm" className="fw-bold" style={{ fontSize: '0.7rem' }}>
              + Thêm dịch vụ
            </Button>
          </div>
        </div>

        {/* SEARCH + FILTER */}
        {savedServices.length > 0 && (
          <div className="saved-toolbar mb-4">
            <div className="saved-search">
              <Search size={14} className="saved-search-icon" />
              <input type="text" placeholder="Tìm tên dịch vụ, tác giả..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="saved-filters">
              {categories.map(cat => (
                <button key={cat} className={`saved-filter-chip ${filterCat === cat ? 'active' : ''}`} onClick={() => setFilterCat(cat)}>
                  {cat === 'all' ? 'Tất cả' : cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* EMPTY STATE */}
        {savedServices.length === 0 ? (
          <div className="saved-empty">
            <div className="saved-empty-icon"><ShoppingBag size={48} /></div>
            <h5 className="saved-empty-title">Chưa lưu dịch vụ nào</h5>
            <p className="saved-empty-desc">Khám phá và lưu các dịch vụ bạn quan tâm</p>
            <Button as={Link} to="/services" variant="primary" className="saved-btn-primary">Khám phá dịch vụ</Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="saved-empty">
            <Search size={32} className="text-white-50 mb-2" />
            <p className="text-white-50" style={{ fontSize: '0.85rem' }}>Không tìm thấy dịch vụ phù hợp</p>
          </div>
        ) : (
          <Row xs={1} sm={2} md={3} lg={4} xl={5} className="g-3">
            {filtered.map((svc, index) => {
              const isUnavail = svc.isAvailable === false;
              const isRemoving = removingId === svc.serviceId;
              const isConfirm = confirmId === svc.serviceId;

              return (
                <Col key={svc.serviceId}>
                  <div className={`tiktok-card glass-card shadow-lg animate-fade-in ${isUnavail ? 'unavailable-card' : ''}`} style={{ animationDelay: `${index * 0.05}s` }}>
                    <Link to={`/service-detail/${svc.serviceId}`}>
                      <img
                        src={svc.sampleImageUrl || 'https://placehold.co/300x500/020617/white?text=STULance'}
                        alt={svc.title}
                        className="tiktok-bg-img"
                        loading="lazy"
                      />
                      {isUnavail && (
                        <div className="tiktok-unavail-overlay">
                          <AlertTriangle size={20} />
                          <span>Không khả dụng</span>
                        </div>
                      )}
                    </Link>

                    <div className="tiktok-side-actions">
                      <div className="action-circle" onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (isConfirm) { handleRemove(e, svc.serviceId); } else { setConfirmId(svc.serviceId); } }}>
                        {isRemoving ? (
                          <Loader2 size={18} className="spin" />
                        ) : isConfirm ? (
                          <div className="confirm-mini">
                            <span className="confirm-mini-yes" onClick={(e) => { e.stopPropagation(); handleRemove(e, svc.serviceId); }}>Có</span>
                            <span className="confirm-mini-no" onClick={(e) => { e.stopPropagation(); setConfirmId(null); }}>Không</span>
                          </div>
                        ) : (
                          <Heart size={22} fill="#ef4444" color="#ef4444" />
                        )}
                        {!isConfirm && !isRemoving && <span>{isUnavail ? 'Xóa' : 'Đã lưu'}</span>}
                      </div>
                    </div>

                    <div className="tiktok-overlay-content">
                      <Link to={`/service-detail/${svc.serviceId}`} className="text-decoration-none text-white fw-bold x-small-text">
                        @{svc.studentName}
                      </Link>
                      <h6 className="service-card-title text-white line-clamp-2 mt-1">{svc.title}</h6>
                      <div className="d-flex justify-content-between align-items-center mt-2">
                        <div className="service-price-tag text-white fw-bold">{formatMoney(svc.price)}đ</div>
                        <Link to={`/service-detail/${svc.serviceId}`} className="btn-buy-now-sm text-decoration-none">XEM</Link>
                      </div>
                    </div>
                  </div>
                </Col>
              );
            })}
          </Row>
        )}
      </Container>
    </div>
  );
};

export default SavedServices;
