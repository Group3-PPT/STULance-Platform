import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Badge, Spinner } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import { Star, Clock, RefreshCcw, Check, ChevronLeft, ShieldCheck, MessageCircle, Share2 } from 'lucide-react';
import { studentServiceService } from '../../services/studentserviceservice';
import '../../CSS/ServiceDetail.css';

const ServiceDetail = () => {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await studentServiceService.getDetail(id);
        setService(res.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchDetail();
  }, [id]);

  if (loading) return <div className="vh-100 d-flex justify-content-center align-items-center bg-dark"><Spinner animation="border" variant="primary" /></div>;
  if (!service) return <div className="text-white text-center py-5">Không tìm thấy dịch vụ.</div>;

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
              <h1 className="fw-bold h3 mb-4">{service.title}</h1>
              
              {/* Profile người bán */}
              <div className="d-flex align-items-center gap-3 mb-4 border-bottom border-secondary pb-4">
                {/* CLICK VÀO ẢNH ĐỂ XEM PORTFOLIO */}
                <Link to={`/portfolio/${service.studentId}`}>
                   <img src={service.studentAvatar || "https://ui-avatars.com/api/?name=S"} alt="avatar" className="detail-avatar" />
                </Link>
                <div>
                  <div className="d-flex align-items-center gap-2">
                    {/* CLICK VÀO TÊN ĐỂ XEM PORTFOLIO */}
                    <Link to={`/portfolio/${service.studentId}`} className="text-white fw-bold text-decoration-none hover-primary">
                        {service.studentName}
                    </Link>
                    <ShieldCheck size={16} className="text-primary" />
                  </div>
                  <div className="text-warning small d-flex align-items-center gap-1">
                    <Star size={14} fill="currentColor" /> <span className="fw-bold">5.0</span>
                  </div>
                </div>
              </div>

              <div className="main-image-box mb-4">
                <img src={service.sampleImageUrl || "https://via.placeholder.com/800x450"} className="w-100 rounded-4 shadow-lg" />
              </div>

              <h4 className="text-primary-glow h5 mb-3">Giới thiệu về dịch vụ</h4>
              <p className="text-white-80 mb-5" style={{ whiteSpace: 'pre-line' }}>{service.description}</p>
            </div>
          </Col>

          <Col lg={4}>
            <div className="sticky-sidebar">
              <div className="glass-card p-4">
                <h2 className="fw-bold mb-3">{service.price?.toLocaleString()}đ</h2>
                <div className="d-flex gap-4 mb-4 small text-info fw-bold">
                  <span className="d-flex align-items-center gap-1"><Clock size={16}/> {service.deliveryDays} ngày</span>
                  <span className="d-flex align-items-center gap-1"><RefreshCcw size={16}/> 3 lần sửa</span>
                </div>
                
                <Button as={Link} 
                  to="/service-invoice" 
                  state={{ service }} // Truyền dữ liệu sang trang hóa đơn
                  variant="primary" className="w-100 py-3 fw-bold hub-btn-pink shadow-glow mb-2"
                >
                  TIẾP TỤC THANH TOÁN
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ServiceDetail;