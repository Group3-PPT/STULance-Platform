import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Building2, Star, Briefcase, ChevronRight, Loader2 } from 'lucide-react';
import { enterpriseService } from '../../services/enterprise.service';
import '../../CSS/Businesses.css';

const Businesses = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEnterprises = async () => {
            try {
                const res = await enterpriseService.getAllEnterprises();
                const data = res?.data || res || [];
                setCompanies(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Lỗi tải danh sách doanh nghiệp:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchEnterprises();
    }, []);

    if (loading) {
        return (
            <div className="vh-100 d-flex justify-content-center align-items-center bg-dark">
                <Loader2 className="spinner text-primary" size={40} />
            </div>
        );
    }

    return (
        <div className="businesses-page py-5">
            <Container>
                <div className="text-center mb-5 animate-fade-in">
                    <h1 className="fw-bold text-white display-5">
                        Kết nối với <span className="text-primary-glow">Doanh nghiệp</span>
                    </h1>
                    <p className="mx-auto mt-3" style={{ maxWidth: '700px' }}>
                        Hơn 500+ doanh nghiệp đang tìm kiếm nhân sự trẻ, sáng tạo từ các trường đại học hàng đầu Việt Nam.
                    </p>
                </div>

                <Row className="g-4">
                    {companies.map(biz => (
                        <Col lg={4} md={6} key={biz.enterpriseId || biz.id}>
                            <div className="glass-card biz-card p-4 text-center h-100 d-flex flex-column">
                                <div className="biz-logo-wrapper mb-4">
                                    <img 
                                        src={biz.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(biz.companyName || 'D')}&background=0d6efd&color=fff&size=120`} 
                                        alt={biz.companyName}
                                        onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(biz.companyName || 'D')}&background=0d6efd&color=fff&size=120`; }}
                                    />
                                </div>
                                
                                <h3 className="text-white h5 fw-bold mb-3">{biz.companyName || biz.name}</h3>
                                <p className="small mb-4 flex-grow-1">
                                    {biz.description || biz.bio || 'Chưa có thông tin giới thiệu'}
                                </p>

                                <div className="biz-stats d-flex justify-content-center gap-4 py-3 border-top border-secondary">
                                    <div className="stat-item text-center">
                                        <span className="d-block fw-bold text-primary">{biz.totalJobs || biz.jobs || 0}</span>
                                        <small>Công việc</small>
                                    </div>
                                    <div className="stat-item text-center">
                                        <span className="d-block fw-bold text-warning">{biz.rating || 'N/A'}</span>
                                        <small>Đánh giá</small>
                                    </div>
                                </div>

                                <Button 
                                    as={Link} 
                                    to={`/businesses/business-profile/${biz.enterpriseId || biz.id}`} 
                                    variant="primary" 
                                    className="w-100 mt-3 fw-bold py-2 shadow-glow"
                                >
                                    XEM CHI TIẾT <ChevronRight size={16} className="ms-1" />
                                </Button>
                            </div>
                        </Col>
                    ))}
                </Row>

                {companies.length === 0 && (
                    <div className="text-center py-5 text-white-50">
                        Chưa có doanh nghiệp nào trên hệ thống.
                    </div>
                )}
            </Container>
        </div>
    );
};

export default Businesses;
