import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Badge, Spinner } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import { Star, Clock, RefreshCcw, Check, ChevronLeft, ShieldCheck, MessageCircle, Share2, MapPin, Eye, Heart, Bookmark, Sparkles, ShieldAlert } from 'lucide-react';
import { studentServiceService } from '../../services/studentserviceservice';
import { recommendationService } from '../../services/recommendationservice';
import { unwrapList } from '../../services/responseUtils';
import ReportModal from '../../components/ReportModal';
import '../../CSS/ServiceDetail.css';

const ServiceDetail = () => {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [similarServices, setSimilarServices] = useState([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const currentUserId = localStorage.getItem('userId');
  const isOwnService = service && String(service.studentId) === String(currentUserId);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await studentServiceService.getDetail(id);
        setService(res.data);
        fetchSimilar(res.data?.category, res.data?.serviceId);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchDetail();
    window.scrollTo(0, 0);
  }, [id]);

  const fetchSimilar = async (category, currentId) => {
    try {
      const res = await studentServiceService.getAllPublic({ category, pageSize: 6 });
      const list = unwrapList(res).filter(s => s.serviceId !== currentId);
      setSimilarServices(list.slice(0, 4));
    } catch { }
  };

  if (loading) return <div className="vh-100 d-flex justify-content-center align-items-center bg-dark"><Spinner animation="border" variant="primary" /></div>;
  if (!service) return <div className="text-white text-center py-5">Không tìm thấy dịch vụ.</div>;

  const avgRating = service.averageRating || 0;
  const reviewCount = service.reviewCount || 0;

  return (
    <div className="service-detail-wrapper py-4 text-white">
      <Container>
        <div className="mb-4">
          <Link to="/services" className="text-decoration-none text-primary d-flex align-items-center gap-2 small fw-bold">
            <ChevronLeft size={18} /> QUAY LẠI DANH SÁCH
          </Link>
        </div>

        <Row className="g-4">
          <Col lg={8}>
            <div className="glass-card p-4 mb-4">
              <div className="d-flex align-items-center gap-2 mb-2">
                {service.category && <Badge bg="primary" className="mb-2">{service.category}</Badge>}
                {service.isVerified && <Badge bg="success" className="mb-2"><ShieldCheck size={10}/> Verified</Badge>}
              </div>
              <h1 className="fw-bold h3 mb-4">{service.title}</h1>

              <div className="d-flex align-items-center gap-3 mb-4 border-bottom border-secondary pb-4">
                <Link to={`/portfolio/${service.studentId}`}>
                   <img src={service.studentAvatar || "https://ui-avatars.com/api/?name=S"} alt="avatar" className="detail-avatar" />
                </Link>
                <div className="flex-fill">
                  <div className="d-flex align-items-center gap-2">
                    <Link to={`/portfolio/${service.studentId}`} className="text-white fw-bold text-decoration-none hover-primary">
                        {service.studentName}
                    </Link>
                    <ShieldCheck size={16} className="text-primary" />
                  </div>
                  <div className="d-flex align-items-center gap-3 mt-1">
                    <div className="text-warning small d-flex align-items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={13} className={i < Math.round(avgRating) ? 'text-warning' : 'text-white-50'} fill={i < Math.round(avgRating) ? '#f59e0b' : 'none'} />
                      ))}
                      <span className="fw-bold ms-1">{avgRating > 0 ? avgRating.toFixed(1) : 'Chưa có'}</span>
                      {reviewCount > 0 && <span className="text-white-50">({reviewCount} đánh giá)</span>}
                    </div>
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <button className="btn btn-outline-light btn-sm rounded-pill px-3"><Share2 size={14}/> Chia sẻ</button>
                  {!isOwnService && (
                    <button className="btn btn-outline-danger btn-sm rounded-pill px-3" onClick={() => setShowReportModal(true)}><ShieldAlert size={14}/> Tố cáo</button>
                  )}
                </div>
              </div>

              <div className="main-image-box mb-4">
                <img src={service.sampleImageUrl || "https://via.placeholder.com/800x450"} className="w-100 rounded-4 shadow-lg" />
              </div>

              <h4 className="text-primary-glow h5 mb-3">Giới thiệu về dịch vụ</h4>
              <p className="text-white-80 mb-4" style={{ whiteSpace: 'pre-line' }}>{service.description}</p>

              {service.tags && service.tags.length > 0 && (
                <div className="mb-4">
                  <h5 className="small fw-bold text-white-50 mb-2">Tags</h5>
                  <div className="d-flex flex-wrap gap-2">
                    {service.tags.map((tag, i) => (
                      <Badge key={i} bg="dark" className="border border-secondary px-3 py-2">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ĐÁNH GIÁ */}
            <div className="glass-card p-4 mb-4">
              <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                <Star size={20} className="text-warning" fill="#f59e0b"/> Đánh giá từ khách hàng
              </h5>
              <div className="d-flex align-items-center gap-4 mb-4 p-3 rounded-4" style={{background: 'rgba(255,255,255,0.03)'}}>
                <div className="text-center">
                  <div className="display-4 fw-bold text-warning">{avgRating > 0 ? avgRating.toFixed(1) : '-'}</div>
                  <div className="d-flex align-items-center gap-1 justify-content-center mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} className={i < Math.round(avgRating) ? 'text-warning' : 'text-white-50'} fill={i < Math.round(avgRating) ? '#f59e0b' : 'none'} />
                    ))}
                  </div>
                  <div className="x-small text-white-50">{reviewCount} đánh giá</div>
                </div>
                <div className="flex-fill">
                  {[5,4,3,2,1].map(star => {
                    const count = reviewCount > 0 ? Math.round((service.ratingDistribution?.[star] || 0) * reviewCount) : 0;
                    const pct = reviewCount > 0 ? Math.round((count / reviewCount) * 100) : 0;
                    return (
                      <div key={star} className="d-flex align-items-center gap-2 mb-1">
                        <span className="x-small text-white-50" style={{width: 12}}>{star}</span>
                        <Star size={10} className="text-warning" fill="#f59e0b"/>
                        <div className="flex-fill rounded-pill" style={{height: 6, background: 'rgba(255,255,255,0.08)'}}>
                          <div className="rounded-pill" style={{width: `${pct}%`, height: '100%', background: '#f59e0b', transition: 'width 0.3s'}}/>
                        </div>
                        <span className="x-small text-white-50" style={{width: 30}}>{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <p className="text-center text-white-50 small py-3">Chưa có đánh giá chi tiết. Hãy là người đầu tiên đánh giá!</p>
            </div>

            {/* DỊCH VỤ TƯƠNG TỰ */}
            {similarServices.length > 0 && (
              <div className="glass-card p-4">
                <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                  <Sparkles size={20} className="text-primary"/> Dịch vụ tương tự
                </h5>
                <Row className="g-3">
                  {similarServices.map(s => (
                    <Col sm={6} key={s.serviceId}>
                      <Link to={`/service-detail/${s.serviceId}`} className="text-decoration-none">
                        <div className="similar-service-card">
                          <img src={s.sampleImageUrl || 'https://via.placeholder.com/400x200'} alt={s.title} className="similar-service-img"/>
                          <div className="p-3">
                            <h6 className="fw-bold text-white mb-1 line-clamp-1" style={{fontSize: '0.85rem'}}>{s.title}</h6>
                            <div className="d-flex align-items-center gap-1 mb-2">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} size={10} className={i < (s.averageRating || 0) ? 'text-warning' : 'text-white-50'} fill={i < (s.averageRating || 0) ? '#f59e0b' : 'none'} />
                              ))}
                              {s.averageRating > 0 && <span className="x-small fw-bold text-warning">{s.averageRating}</span>}
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                              <span className="fw-bold text-success">{s.price?.toLocaleString()}đ</span>
                              <span className="x-small text-white-50"><Clock size={10}/> {s.deliveryDays} ngày</span>
                            </div>
                            <div className="d-flex align-items-center gap-2 mt-2 pt-2" style={{borderTop: '1px solid rgba(255,255,255,0.06)'}}>
                              <img src={s.studentAvatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.studentName||'S')}&background=0D8ABC&color=fff`} alt="" style={{width: 20, height: 20, borderRadius: '50%', objectFit: 'cover'}}/>
                              <span className="x-small text-white-50">{s.studentName}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </Col>
                  ))}
                </Row>
              </div>
            )}
          </Col>

          <Col lg={4}>
            <div className="sticky-sidebar">
              <div className="glass-card p-4 mb-3">
                <h2 className="fw-bold mb-3">{service.price?.toLocaleString()}đ</h2>
                <div className="d-flex gap-4 mb-4 small text-info fw-bold">
                  <span className="d-flex align-items-center gap-1"><Clock size={16}/> {service.deliveryDays} ngày</span>
                  <span className="d-flex align-items-center gap-1"><RefreshCcw size={16}/> {service.revisionCount || 3} lần sửa</span>
                </div>

                <Button as={Link}
                  to="/service-invoice"
                  state={{ service }}
                  variant="primary" className="w-100 py-3 fw-bold hub-btn-pink shadow-glow mb-3"
                  disabled={service.status === 'BLOCKED' || service.status === 'HIDDEN'}
                >
                  {service.status === 'BLOCKED' ? 'DỊCH VỤ ĐÃ BỊ KHÓA' : 
                   service.status === 'HIDDEN' ? 'DỊCH VỤ KHÔNG KHẢ DỤNG' :
                   'TIẾP TỤC THANH TOÁN'}
                </Button>

                <div className="d-flex gap-2">
                  <button className="btn btn-outline-light btn-sm flex-fill rounded-pill"><Heart size={14}/> Yêu thích</button>
                  <button className="btn btn-outline-light btn-sm flex-fill rounded-pill"><Bookmark size={14}/> Lưu lại</button>
                </div>
              </div>

              {/* THÔNG TIN BỔ SUNG */}
              <div className="glass-card p-4">
                <h6 className="fw-bold mb-3">Thông tin dịch vụ</h6>
                <div className="d-flex flex-column gap-3">
                  <div className="d-flex justify-content-between">
                    <span className="x-small text-white-50">Danh mục</span>
                    <span className="x-small fw-bold">{service.category || 'Chưa phân loại'}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="x-small text-white-50">Thời gian giao</span>
                    <span className="x-small fw-bold">{service.deliveryDays} ngày</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="x-small text-white-50">Sửa đổi</span>
                    <span className="x-small fw-bold">{service.revisionCount || 3} lần</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="x-small text-white-50">Lượt xem</span>
                    <span className="x-small fw-bold">{service.viewsCount || 0}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="x-small text-white-50">Đã bán</span>
                    <span className="x-small fw-bold">{service.totalOrders || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      <ReportModal
        show={showReportModal}
        onHide={() => setShowReportModal(false)}
        targetType="STUDENT_SERVICE"
        targetId={id}
        targetName={service?.title}
      />
    </div>
  );
};

export default ServiceDetail;