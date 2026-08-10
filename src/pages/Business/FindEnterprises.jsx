import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Button, Badge, Form, InputGroup, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import {
  Search, Building2, ShieldCheck, Eye, Filter, Loader2, RefreshCw,
  MapPin, X, Mail, Globe, Hash, Users, User, Star
} from 'lucide-react';
import { enterpriseService } from '../../services/enterprise.service';
import PaginationBar from '../../components/PaginationBar';
import '../../CSS/Businesses.css';

const FindEnterprises = () => {
    // ============================================================
    // STATE
    // ============================================================

    // Danh sách doanh nghiệp
    const [enterprises, setEnterprises] = useState([]);

    // Loading trang
    const [loading, setLoading] = useState(true);

    // Từ khóa tìm kiếm
    const [searchTerm, setSearchTerm] = useState('');

    // Doanh nghiệp đang xem chi tiết
    const [selectedEnterprise, setSelectedEnterprise] = useState(null);

    // Hiện modal chi tiết
    const [showModal, setShowModal] = useState(false);

    // ============================================================
    // PHÂN TRANG
    // ============================================================
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const pageSize = 12;

    // ============================================================
    // HÀM TẢI DỮ LIỆU
    // ============================================================
    const fetchEnterprises = useCallback(async function (page, keyword) {
        if (!page) page = 1;
        if (!keyword) keyword = '';

        setLoading(true);

        try {
            var res = await enterpriseService.getAllPublicEnterprises({
                page: page,
                pageSize: pageSize,
                keyword: keyword || undefined
            });

            if (res.success && res.data) {
                var data = res.data;

                setEnterprises(data.items || []);
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

    // ============================================================
    // EFFECT: Tải dữ liệu khi mount
    // ============================================================
    useEffect(function () {
        fetchEnterprises(1);
    }, [fetchEnterprises]);

    // ============================================================
    // HÀM TÌM KIẾM
    // ============================================================
    const handleSearch = function () {
        setCurrentPage(1);
        fetchEnterprises(1, searchTerm);
    };

    // ============================================================
    // HÀM CHUYỂN TRANG
    // ============================================================
    const handlePageChange = function (page) {
        fetchEnterprises(page, searchTerm);
    };

    // ============================================================
    // HÀM LẤY LOGO
    // ============================================================
    const getLogo = function (ent) {
        if (ent.logoUrl) return ent.logoUrl;
        var name = ent.companyName || 'D';
        return "https://ui-avatars.com/api/?name=" + encodeURIComponent(name) + "&background=10b981&color=fff&size=120";
    };

    return (
        <div className="businesses-page py-5 animate-fade-in">
            <Container>
                <div className="text-center mb-5">
                    <div className="section-badge mb-2 mx-auto"><Building2 size={14}/> TÌM DOANH NGHIỆP</div>
                    <h1 className="fw-bold text-white display-5">
                        Kết nối với <span className="text-primary-glow">Doanh nghiệp</span>
                    </h1>
                    <p className="text-white-50 mx-auto mt-3" style={{ maxWidth: '700px' }}>
                        Khám phá {totalItems}+ doanh nghiệp trên hệ thống.
                    </p>
                </div>

                <div className="glass-card p-3 mb-5 mx-auto shadow-lg" style={{maxWidth: '800px', borderRadius: '16px'}}>
                    <Row className="g-2 align-items-center">
                        <Col md={8}>
                            <InputGroup className="bg-dark-input rounded-pill overflow-hidden border-0">
                                <InputGroup.Text className="bg-transparent border-0 text-primary"><Search size={18}/></InputGroup.Text>
                                <Form.Control
                                    placeholder="Tìm theo tên công ty, mô tả, địa điểm..."
                                    className="bg-transparent border-0 text-white shadow-none py-2"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                />
                            </InputGroup>
                        </Col>
                        <Col md={4}>
                            <Button variant="primary" className="w-100 rounded-pill fw-bold py-2" onClick={handleSearch}>
                                <Filter size={16} className="me-1"/> Tìm kiếm
                            </Button>
                        </Col>
                    </Row>
                </div>

                {loading ? (
                    <div className="text-center py-5">
                        <Loader2 className="spinner text-primary" size={40}/>
                        <p className="text-white-50 mt-3">Đang tải danh sách doanh nghiệp...</p>
                    </div>
                ) : (
                    <>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <p className="text-white-50 mb-0">Tìm thấy <strong className="text-white">{totalItems}</strong> doanh nghiệp</p>
                            <button className="btn-icon-table text-white-50" title="Làm mới" onClick={() => fetchEnterprises(currentPage, searchTerm)}><RefreshCw size={16}/></button>
                        </div>
                        <Row className="g-4">
                            {enterprises.map((ent, idx) => (
                                <Col lg={4} md={6} key={ent.enterpriseId || idx}>
                                    <div className="glass-card biz-card p-4 text-center h-100 d-flex flex-column">
                                        <div className="stu-avatar-wrap mb-3 mx-auto">
                                            <img src={getLogo(ent)} alt={ent.companyName} className="stu-avatar-img" loading="lazy" />
                                            {ent.verificationStatus === 'VERIFIED' && (
                                                <div className="stu-verified-badge">
                                                    <ShieldCheck size={12} fill="#10b981" color="white" />
                                                </div>
                                            )}
                                        </div>

                                        <h5 className="text-white fw-bold mb-1">{ent.companyName}</h5>
                                        {ent.description && (
                                            <p className="x-small text-white-50 mb-3 line-clamp-2">{ent.description}</p>
                                        )}
                                        {ent.address && (
                                            <p className="x-small text-white-50 mb-3">
                                                <MapPin size={12} className="me-1"/> {ent.address}
                                            </p>
                                        )}
                                        {ent.averageRating > 0 && (
                                            <div className="d-flex align-items-center justify-content-center gap-1 mb-2">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={11} className={i < Math.round(ent.averageRating) ? 'text-warning' : 'text-white-50'} fill={i < Math.round(ent.averageRating) ? '#f59e0b' : 'none'} />
                                                ))}
                                                <span className="x-small fw-bold text-warning ms-1">{ent.averageRating}</span>
                                                {ent.reviewCount > 0 && <span className="x-small text-white-50">({ent.reviewCount})</span>}
                                            </div>
                                        )}

                                        <div className="mt-auto pt-3 border-top border-white border-opacity-10">
                                            <div className="mb-2">
                                                {ent.verificationStatus === 'VERIFIED' ? (
                                                    <Badge bg="success" className="x-small-badge">Đã xác thực</Badge>
                                                ) : (
                                                    <Badge bg="secondary" className="x-small-badge">Chưa xác thực</Badge>
                                                )}
                                            </div>
                                            <Button
                                                variant="outline-primary"
                                                className="w-100 rounded-pill fw-bold btn-view-school"
                                                onClick={() => setSelectedEnterprise(ent) || setShowModal(true)}
                                            >
                                                <Eye size={14} className="me-1"/> Xem chi tiết
                                            </Button>
                                        </div>
                                    </div>
                                </Col>
                            ))}
                            {enterprises.length === 0 && (
                                <Col xs={12} className="text-center py-5">
                                    <p className="text-white-50">Không tìm thấy doanh nghiệp phù hợp.</p>
                                </Col>
                            )}
                        </Row>

                        <PaginationBar
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    </>
                )}
            </Container>

            {/* MODAL CHI TIẾT DOANH NGHIỆP */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg" contentClassName="glass-card text-white border-0 shadow-lg">
                <Modal.Body className="p-4">
                    {selectedEnterprise && (
                        <>
                            <div className="d-flex justify-content-between align-items-start mb-4">
                                <div className="d-flex align-items-center gap-3">
                                    <img
                                        src={getLogo(selectedEnterprise)}
                                        alt={selectedEnterprise.companyName}
                                        loading="lazy"
                                        style={{ width: 72, height: 72, borderRadius: 12, objectFit: 'cover', border: '3px solid rgba(255,255,255,0.1)' }}
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
                                            Trạng thái: {selectedEnterprise.verificationStatus === 'VERIFIED' ? (
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
                                <Button as={Link} to={`/businesses/business-profile/${selectedEnterprise.enterpriseId}`} variant="outline-primary" className="fw-bold px-4">
                                    <Eye size={16} className="me-1"/> Xem Profile
                                </Button>
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

export default FindEnterprises;
