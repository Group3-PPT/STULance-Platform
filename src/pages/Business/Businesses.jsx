import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Button, Badge, Modal, Form, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Building2, ShieldCheck, Eye, Loader2, MapPin, Globe, User, X, Star, Search, RefreshCw } from 'lucide-react';
import { enterpriseService } from '../../services/enterprise.service';
import PaginationBar from '../../components/PaginationBar';
import '../../CSS/Businesses.css';

const Businesses = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEnterprise, setSelectedEnterprise] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const pageSize = 12;

    const fetchEnterprises = useCallback(async (page = 1, keyword = '') => {
        setLoading(true);
        try {
            const res = await enterpriseService.getAllPublicEnterprises({
                page,
                pageSize,
                keyword: keyword || undefined
            });
            if (res.success && res.data) {
                const data = res.data;
                setCompanies(data.items || []);
                setTotalPages(data.totalPages || 1);
                setTotalItems(data.totalItems || 0);
                setCurrentPage(data.page || 1);
            }
        } catch (err) {
            console.error("Lỗi tải danh sách doanh nghiệp:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchEnterprises(1); }, [fetchEnterprises]);

    const handleSearch = () => {
        setCurrentPage(1);
        fetchEnterprises(1, searchTerm);
    };

    const handlePageChange = (page) => {
        fetchEnterprises(page, searchTerm);
    };

    const getLogo = (ent) => {
        if (ent.logoUrl) return ent.logoUrl;
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(ent.companyName || 'D')}&background=10b981&color=fff&size=120`;
    };

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
                    <div className="section-badge mb-2 mx-auto"><Building2 size={14}/> ĐỐI TÁC DOANH NGHIỆP</div>
                    <h1 className="fw-bold text-white display-5">
                        Kết nối với <span className="text-primary-glow">Doanh nghiệp</span>
                    </h1>
                    <p className="text-white-50 mx-auto mt-3" style={{ maxWidth: '700px' }}>
                        Khám phá {totalItems}+ doanh nghiệp uy tín đang tìm kiếm nhân sự trên hệ thống.
                    </p>
                </div>

                <div className="glass-card p-3 mb-5 mx-auto shadow-lg" style={{maxWidth: '600px', borderRadius: '16px'}}>
                    <Row className="g-2 align-items-center">
                        <Col md={9}>
                            <InputGroup className="bg-dark-input rounded-pill overflow-hidden border-0">
                                <InputGroup.Text className="bg-transparent border-0 text-primary"><Search size={18}/></InputGroup.Text>
                                <Form.Control
                                    placeholder="Tìm theo tên công ty, địa chỉ..."
                                    className="bg-transparent border-0 text-white shadow-none py-2"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                />
                            </InputGroup>
                        </Col>
                        <Col md={3}>
                            <Button variant="primary" className="w-100 rounded-pill fw-bold py-2" onClick={handleSearch}>
                                <Search size={16} className="me-1"/> Tìm
                            </Button>
                        </Col>
                    </Row>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-4">
                    <p className="text-white-50 mb-0">Tìm thấy <strong className="text-white">{totalItems}</strong> doanh nghiệp</p>
                    <button className="btn-icon-table text-white-50" title="Làm mới" onClick={() => fetchEnterprises(currentPage, searchTerm)}><RefreshCw size={16}/></button>
                </div>

                <Row className="g-4">
                    {companies.map((biz, idx) => (
                        <Col lg={4} md={6} key={biz.enterpriseId || idx}>
                            <div className="glass-card biz-card p-4 text-center h-100 d-flex flex-column">
                                <div className="stu-avatar-wrap mb-3 mx-auto">
                                    <img src={getLogo(biz)} alt={biz.companyName} className="stu-avatar-img" loading="lazy" />
                                    {biz.verificationStatus === 'VERIFIED' && (
                                        <div className="stu-verified-badge">
                                            <ShieldCheck size={12} fill="#10b981" color="white" />
                                        </div>
                                    )}
                                </div>

                                <h5 className="text-white fw-bold mb-1">{biz.companyName}</h5>
                                {biz.description && (
                                    <p className="x-small text-white-50 mb-2 line-clamp-2">{biz.description}</p>
                                )}
                                {biz.address && (
                                    <p className="x-small text-white-50 mb-3">
                                        <MapPin size={12} className="me-1"/> {biz.address}
                                    </p>
                                )}
                                {biz.averageRating > 0 && (
                                    <div className="d-flex align-items-center justify-content-center gap-1 mb-2">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={11} className={i < Math.round(biz.averageRating) ? 'text-warning' : 'text-white-50'} fill={i < Math.round(biz.averageRating) ? '#f59e0b' : 'none'} />
                                        ))}
                                        <span className="x-small fw-bold text-warning ms-1">{biz.averageRating}</span>
                                        {biz.reviewCount > 0 && <span className="x-small text-white-50">({biz.reviewCount})</span>}
                                    </div>
                                )}

                                <div className="mt-auto pt-3 border-top border-white border-opacity-10">
                                    <div className="mb-2">
                                        {biz.verificationStatus === 'VERIFIED' ? (
                                            <Badge bg="success" className="x-small-badge">Đã xác thực</Badge>
                                        ) : (
                                            <Badge bg="secondary" className="x-small-badge">Chưa xác thực</Badge>
                                        )}
                                    </div>
                                    <Button
                                        variant="outline-primary"
                                        className="w-100 rounded-pill fw-bold btn-view-school"
                                        onClick={() => setSelectedEnterprise(biz) || setShowModal(true)}
                                    >
                                        <Eye size={14} className="me-1"/> Xem chi tiết
                                    </Button>
                                </div>
                            </div>
                        </Col>
                    ))}
                </Row>

                {companies.length === 0 && (
                    <div className="text-center py-5 text-white-50">
                        Chưa có doanh nghiệp nào trên hệ thống.
                    </div>
                )}

                <PaginationBar
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            </Container>

            {/* MODAL CHI TIẾT */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg" contentClassName="glass-card text-white border-0 shadow-lg">
                <Modal.Body className="p-4">
                    {selectedEnterprise && (
                        <>
                            <div className="d-flex justify-content-between align-items-start mb-4">
                                <div className="d-flex align-items-center gap-3">
                                    <img
                                        src={getLogo(selectedEnterprise)}
                                        alt={selectedEnterprise.companyName}
                                        style={{ width: 72, height: 72, borderRadius: 12, objectFit: 'cover', border: '3px solid rgba(255,255,255,0.1)' }}
                                        loading="lazy"
                                    />
                                    <div>
                                        <h4 className="fw-bold text-white mb-1">{selectedEnterprise.companyName}</h4>
                                        {selectedEnterprise.verificationStatus === 'VERIFIED' ? (
                                            <Badge bg="success" className="x-small-badge">Đã xác thực</Badge>
                                        ) : (
                                            <Badge bg="secondary" className="x-small-badge">Chưa xác thực</Badge>
                                        )}
                                    </div>
                                </div>
                                <button className="btn-icon-table text-white-50" onClick={() => setShowModal(false)}><X size={20}/></button>
                            </div>

                            <Row className="g-4 mb-4">
                                <Col md={6}>
                                    <div className="p-3 rounded-3" style={{background: 'rgba(255,255,255,0.04)'}}>
                                        <p className="x-small text-white-50 mb-2 uppercase-tracking fw-bold">Thông tin liên hệ</p>
                                        {selectedEnterprise.representName && (
                                            <p className="small text-white mb-1"><User size={14} className="me-2 text-primary"/>Người đại diện: {selectedEnterprise.representName}</p>
                                        )}
                                        <p className="small text-white mb-1"><MapPin size={14} className="me-2 text-primary"/>{selectedEnterprise.address || 'Chưa cập nhật'}</p>
                                        {selectedEnterprise.website && (
                                            <p className="small text-white mb-0"><Globe size={14} className="me-2 text-primary"/>{selectedEnterprise.website}</p>
                                        )}
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="p-3 rounded-3" style={{background: 'rgba(255,255,255,0.04)'}}>
                                        <p className="x-small text-white-50 mb-2 uppercase-tracking fw-bold">Xác thực</p>
                                        <p className="small text-white mb-0">
                                            <ShieldCheck size={14} className="me-2 text-primary"/>
                                            {selectedEnterprise.verificationStatus === 'VERIFIED' ? (
                                                <span className="text-success fw-bold">Đã xác thực</span>
                                            ) : (
                                                <span className="text-secondary">Chưa xác thực</span>
                                            )}
                                        </p>
                                    </div>
                                </Col>
                            </Row>

                            {selectedEnterprise.description && (
                                <div className="mb-4">
                                    <p className="x-small text-white-50 mb-2 uppercase-tracking fw-bold">Giới thiệu công ty</p>
                                    <p className="small text-white-80">{selectedEnterprise.description}</p>
                                </div>
                            )}

                            <div className="d-flex gap-2 justify-content-end">
                                {selectedEnterprise.website && (
                                    <Button variant="primary" className="fw-bold px-4" onClick={() => window.open(selectedEnterprise.website, '_blank')}>
                                        <Globe size={16} className="me-1"/> Website
                                    </Button>
                                )}
                            </div>
                        </>
                    )}
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default Businesses;
