import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Badge, Spinner } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { 
  MapPin, Globe, Mail, Phone, Users, 
  CheckCircle, ShieldCheck, Info, Heart, Loader2 
} from 'lucide-react';
import { enterpriseService } from '../../services/enterprise.service';
import '../../CSS/BusinessProfile.css';

const BusinessProfile = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // 1. Tải dữ liệu từ Backend
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        let res;
        if (id) {
          // Nếu có ID trên URL -> Xem hồ sơ công khai
          res = await enterpriseService.getPublicProfile(id);
        } else {
          // Nếu không có ID -> Xem hồ sơ của chính mình
          res = await enterpriseService.getMe();
        }

        if (res.success) {
          setCompany(res.data);
        }
      } catch (err) {
        console.error("Lỗi tải hồ sơ doanh nghiệp:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  const handleFollow = async () => {
    setFollowLoading(true);
    try {
      setIsFollowing(!isFollowing);
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || "Không thể thực hiện"));
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) return (
    <div className="vh-100 d-flex justify-content-center align-items-center bg-dark">
      <Spinner animation="border" variant="primary" />
    </div>
  );

  if (!company) return <div className="text-white text-center py-5">Không tìm thấy thông tin doanh nghiệp.</div>;

  return (
    <div className="biz-profile-page animate-fade-in">
      {/* HEADER: Banner & Logo */}
      <section className="biz-hero">
        <div className="biz-banner-wrap">
          {/* Banner hiện tại lấy tạm ảnh mẫu vì trong API chưa có trường Banner riêng */}
          <img src="https://images.unsplash.com/photo-1497366216548-37526070297c" alt="Banner" className="biz-banner-img" />
        </div>
        <Container>
          <div className="biz-main-info-row">
            <div className="biz-logo-large glass-card p-2 bg-white">
              <img 
                src={company.logoUrl || 'https://via.placeholder.com/150?text=LOGO'} 
                alt="Logo" 
                className="w-100 h-100 object-fit-contain"
              />
            </div>
            <div className="biz-title-area">
              <h1 className="fw-bold text-white d-flex align-items-center gap-2">
                {company.companyName} 
                {company.verificationStatus === 'VERIFIED' && <CheckCircle className="text-primary-glow" size={24} />}
              </h1>
              <p className="text-white-50 mb-2"><MapPin size={16} className="me-1" /> {company.address || 'Chưa cập nhật địa chỉ'}</p>
              <div className="d-flex gap-2">
                <Badge bg="primary" className="px-3">Doanh nghiệp</Badge>
                <Badge bg={company.verificationStatus === 'VERIFIED' ? "success" : "secondary"} className="px-3">
                    {company.verificationStatus}
                </Badge>
              </div>
            </div>
            <div className="biz-action-area">
              <Button 
                variant={isFollowing ? "outline-danger" : "primary"} 
                className="fw-bold px-4 py-2 shadow-glow"
                onClick={handleFollow}
                disabled={followLoading}
              >
                {followLoading ? <Loader2 className="spinner me-2" size={16} /> : <Heart size={16} className="me-2" fill={isFollowing ? "currentColor" : "none"} />}
                {isFollowing ? 'BỎ THEO DÕI' : 'THEO DÕI CÔNG TY'}
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <Container className="pb-5 mt-5">
        <Row className="g-4">
          {/* CỘT TRÁI: GIỚI THIỆU */}
          <Col lg={8}>
            <div className="glass-card p-4 mb-4 shadow-sm">
              <h4 className="text-white fw-bold mb-3 border-start border-primary border-4 ps-3">Về chúng tôi</h4>
              <p className="text-secondary-cv" style={{ whiteSpace: 'pre-line' }}>
                {company.bio || `${company.companyName} chưa cập nhật thông tin giới thiệu.`}
              </p>
            </div>

            {/* Phần việc làm (Cần API Job riêng để map vào đây) */}
            <div className="glass-card p-4 shadow-sm">
               <h4 className="text-white fw-bold mb-4 border-start border-primary border-4 ps-3">Vị trí đang tuyển</h4>
               <p className="text-muted italic small text-center py-4">Chưa có vị trí tuyển dụng nào được đăng.</p>
            </div>
          </Col>

          {/* CỘT PHẢI: THÔNG TIN CHI TIẾT */}
          <Col lg={4}>
            <div className="glass-card p-4 mb-4 shadow-sm sticky-top" style={{ top: '100px' }}>
              <h5 className="text-white fw-bold mb-4 d-flex align-items-center gap-2">
                <Info size={18} className="text-primary" /> Thông tin liên hệ
              </h5>
              <ul className="list-unstyled d-grid gap-4 small">
                <li className="d-flex align-items-start gap-3">
                  <div className="contact-icon-bg"><Globe size={16} /></div>
                  <div>
                    <strong className="d-block text-white">Website</strong>
                    <a href={company.website} target="_blank" rel="noreferrer" className="text-decoration-none text-primary">
                        {company.website || 'N/A'}
                    </a>
                  </div>
                </li>
                <li className="d-flex align-items-start gap-3">
                  <div className="contact-icon-bg"><Mail size={16} /></div>
                  <div>
                    <strong className="d-block text-white">Mã số thuế</strong>
                    <span className="text-white-50">{company.companyTaxCode}</span>
                  </div>
                </li>
                <li className="d-flex align-items-start gap-3">
                  <div className="contact-icon-bg"><Users size={16} /></div>
                  <div>
                    <strong className="d-block text-white">Người đại diện</strong>
                    <span className="text-white-50">{company.representName}</span>
                  </div>
                </li>
              </ul>
              
              <div className="mt-4 pt-4 border-top border-secondary">
                <div className={`d-flex align-items-center gap-2 small fw-bold ${company.verificationStatus === 'VERIFIED' ? 'text-primary' : 'text-muted'}`}>
                  <ShieldCheck size={16} /> 
                  {company.verificationStatus === 'VERIFIED' ? 'Doanh nghiệp đã được xác thực' : 'Đang chờ xác thực hồ sơ'}
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default BusinessProfile;