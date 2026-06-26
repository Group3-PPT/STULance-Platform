import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Building2, Star, Briefcase, ChevronRight } from 'lucide-react';
import '../../CSS/Businesses.css';

const Businesses = () => {
    const companies = [
        {
            id: 1,
            name: "TechNova Solutions",
            desc: "Chuyên cung cấp giải pháp chuyển đổi số và AI cho doanh nghiệp vừa và nhỏ.",
            logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg",
            jobs: 12,
            rating: 4.8
        },
        {
            id: 2,
            name: "Creative Lab VN",
            desc: "Agency hàng đầu về Branding và Marketing sáng tạo tại khu vực phía Nam.",
            logo: "https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg",
            jobs: 5,
            rating: 5.0
        },
        {
            id: 3,
            name: "FPT Software",
            desc: "Tập đoàn công nghệ hàng đầu, cung cấp dịch vụ xuất khẩu phần mềm toàn cầu.",
            logo: "https://upload.wikimedia.org/wikipedia/commons/1/11/FPT_logo.svg",
            jobs: 45,
            rating: 4.7
        },
        {
            id: 4,
            name: "VinAI Research",
            desc: "Viện nghiên cứu Trí tuệ nhân tạo hàng đầu Việt Nam thuộc tập đoàn Vingroup.",
            logo: "https://upload.wikimedia.org/wikipedia/commons/a/af/Vingroup_logo.svg",
            jobs: 8,
            rating: 4.9
        }
    ];

    return (
        <div className="businesses-page py-5">
            <Container>
                <div className="text-center mb-5 animate-fade-in">
                    <h1 className="fw-bold text-white display-5">
                        Kết nối với <span className="text-primary-glow">Doanh nghiệp</span>
                    </h1>
                    <p className=" mx-auto mt-3" style={{ maxWidth: '700px' }}>
                        Hơn 500+ doanh nghiệp đang tìm kiếm nhân sự trẻ, sáng tạo từ các trường đại học hàng đầu Việt Nam.
                    </p>
                </div>

                <Row className="g-4">
                    {companies.map(biz => (
                        <Col lg={4} md={6} key={biz.id}>
                            <div className="glass-card biz-card p-4 text-center h-100 d-flex flex-column">
                                <div className="biz-logo-wrapper mb-4">
                                    <img src={biz.logo} alt={biz.name} />
                                </div>
                                
                                <h3 className="text-white h5 fw-bold mb-3">{biz.name}</h3>
                                <p className=" small mb-4 flex-grow-1">
                                    {biz.desc}
                                </p>

                                <div className="biz-stats d-flex justify-content-center gap-4 py-3 border-top border-secondary">
                                    <div className="stat-item text-center">
                                        <span className="d-block fw-bold text-primary">{biz.jobs}</span>
                                        <small className="">Công việc</small>
                                    </div>
                                    <div className="stat-item text-center">
                                        <span className="d-block fw-bold text-warning">{biz.rating}</span>
                                        <small className="">Đánh giá</small>
                                    </div>
                                </div>

                                <Button as={Link} to="/businesses/business-profile" variant="primary" className="w-100 mt-3 fw-bold py-2 shadow-glow">
                                    XEM CHI TIẾT <ChevronRight size={16} className="ms-1" />
                                </Button>
                            </div>
                        </Col>
                    ))}
                </Row>
            </Container>
        </div>
    );
};

export default Businesses;
