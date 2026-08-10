import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Button, Badge, Modal, Form, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Building2, ShieldCheck, Eye, Loader2, MapPin, Globe, User, X, Star, Search, RefreshCw } from 'lucide-react';
import { enterpriseService } from '../../services/enterprise.service';
import PaginationBar from '../../components/PaginationBar';
import '../../CSS/Businesses.css';

// ============================================================
// TRANG DANH SACH DOANH NGHIPE (PUBLIC)
// Hien thi danh sach doanh nghiep tren he thong, cho phep tim kiem
// va xem chi tiet trong modal.
// ============================================================
const Businesses = function () {

    // ============================================================
    // STATE
    // ============================================================

    // Danh sach doanh nghiep
    const [companies, setCompanies] = useState([]);

    // Trang thai dang tai du lieu
    const [loading, setLoading] = useState(true);

    // Doanh nghiep dang xem chi tiet (trong modal)
    const [selectedEnterprise, setSelectedEnterprise] = useState(null);

    // Trang thai hien thi modal chi tiet
    const [showModal, setShowModal] = useState(false);

    // Tu khoa tim kiem
    const [searchTerm, setSearchTerm] = useState('');

    // ============================================================
    // PHAN TRANG
    // ============================================================
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    var pageSize = 12;

    // ============================================================
    // HAM TAI DU LIEU TU SERVER
    // ============================================================
    var fetchEnterprises = useCallback(async function (page, keyword) {
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

                setCompanies(data.items || []);
                setTotalPages(data.totalPages || 1);
                setTotalItems(data.totalItems || 0);
                setCurrentPage(data.page || 1);
            }

        } catch (err) {
            console.error("Loi tai danh sach doanh nghiep:", err);

        } finally {
            setLoading(false);
        }
    }, []);

    // ============================================================
    // EFFECT: Tai du lieu khi component mount
    // ============================================================
    useEffect(function () {
        fetchEnterprises(1);
    }, [fetchEnterprises]);

    // ============================================================
    // HAM TIM KIEM
    // ============================================================
    var handleSearch = function () {
        setCurrentPage(1);
        fetchEnterprises(1, searchTerm);
    };

    // ============================================================
    // HAM CHUYEN TRANG
    // ============================================================
    var handlePageChange = function (page) {
        fetchEnterprises(page, searchTerm);
    };

    // ============================================================
    // HAM LAY LOGO (MAC DINH LA UI-AVATARS)
    // ============================================================
    var getLogo = function (ent) {
        if (ent.logoUrl) {
            return ent.logoUrl;
        }

        var name = ent.companyName || 'D';
        var encoded = encodeURIComponent(name);
        return "https://ui-avatars.com/api/?name=" + encoded + "&background=10b981&color=fff&size=120";
    };

    // ============================================================
    // HIEN THI LOADING NEU DANG TAI
    // ============================================================
    if (loading) {
        return (
            <div className="vh-100 d-flex justify-content-center align-items-center bg-dark">
                <Loader2 className="spinner text-primary" size={40} />
            </div>
        );
    }

    // ============================================================
    // RENDER
    // ============================================================
    return (
        <div className="businesses-page py-5">
            <Container>

                {/* HEADER + MO TA */}
                <div className="text-center mb-5 animate-fade-in">
                    <div className="section-badge mb-2 mx-auto">
                        <Building2 size={14} /> DOI TAC DOANH NGHIEP
                    </div>
                    <h1 className="fw-bold text-white display-5">
                        Ket noi voi <span className="text-primary-glow">Doanh nghiep</span>
                    </h1>
                    <p className="text-white-50 mx-auto mt-3" style={{ maxWidth: '700px' }}>
                        Kham pha {totalItems}+ doanh nghiep uy tin dang tim kiem nhan su tren he thong.
                    </p>
                </div>

                {/* THANH TIM KIEM */}
                <div className="glass-card p-3 mb-5 mx-auto shadow-lg" style={{ maxWidth: '600px', borderRadius: '16px' }}>
                    <Row className="g-2 align-items-center">
                        <Col md={9}>
                            <InputGroup className="bg-dark-input rounded-pill overflow-hidden border-0">
                                <InputGroup.Text className="bg-transparent border-0 text-primary">
                                    <Search size={18} />
                                </InputGroup.Text>
                                <Form.Control
                                    placeholder="Tim theo ten cong ty, dia chi..."
                                    className="bg-transparent border-0 text-white shadow-none py-2"
                                    value={searchTerm}
                                    onChange={function (e) { setSearchTerm(e.target.value); }}
                                    onKeyDown={function (e) { if (e.key === 'Enter') { handleSearch(); } }}
                                />
                            </InputGroup>
                        </Col>
                        <Col md={3}>
                            <Button variant="primary" className="w-100 rounded-pill fw-bold py-2" onClick={handleSearch}>
                                <Search size={16} className="me-1" /> Tim
                            </Button>
                        </Col>
                    </Row>
                </div>

                {/* SO LUONG + NUT LAM MOI */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <p className="text-white-50 mb-0">
                        Tim thay <strong className="text-white">{totalItems}</strong> doanh nghiep
                    </p>
                    <button
                        className="btn-icon-table text-white-50"
                        title="Lam moi"
                        onClick={function () { fetchEnterprises(currentPage, searchTerm); }}
                    >
                        <RefreshCw size={16} />
                    </button>
                </div>

                {/* DANH SACH CARD */}
                <Row className="g-4">
                    {companies.map(function (biz, idx) {
                        return (
                            <Col lg={4} md={6} key={biz.enterpriseId || idx}>
                                <div className="glass-card biz-card p-4 text-center h-100 d-flex flex-column">

                                    {/* ANH LOGO + BADGE XAC THUC */}
                                    <div className="stu-avatar-wrap mb-3 mx-auto">
                                        <img
                                            src={getLogo(biz)}
                                            alt={biz.companyName}
                                            className="stu-avatar-img"
                                            loading="lazy"
                                        />
                                        {biz.verificationStatus === 'VERIFIED' && (
                                            <div className="stu-verified-badge">
                                                <ShieldCheck size={12} fill="#10b981" color="white" />
                                            </div>
                                        )}
                                    </div>

                                    {/* TEN + MO TA + DIA CHI */}
                                    <h5 className="text-white fw-bold mb-1">{biz.companyName}</h5>
                                    {biz.description && (
                                        <p className="x-small text-white-50 mb-2 line-clamp-2">{biz.description}</p>
                                    )}
                                    {biz.address && (
                                        <p className="x-small text-white-50 mb-3">
                                            <MapPin size={12} className="me-1" /> {biz.address}
                                        </p>
                                    )}

                                    {/* SAO DANH GIA */}
                                    {biz.averageRating > 0 && (
                                        <div className="d-flex align-items-center justify-content-center gap-1 mb-2">
                                            {[0, 1, 2, 3, 4].map(function (i) {
                                                var isFilled = i < Math.round(biz.averageRating);
                                                return (
                                                    <Star
                                                        key={i}
                                                        size={11}
                                                        className={isFilled ? 'text-warning' : 'text-white-50'}
                                                        fill={isFilled ? '#f59e0b' : 'none'}
                                                    />
                                                );
                                            })}
                                            <span className="x-small fw-bold text-warning ms-1">{biz.averageRating}</span>
                                            {biz.reviewCount > 0 && (
                                                <span className="x-small text-white-50">({biz.reviewCount})</span>
                                            )}
                                        </div>
                                    )}

                                    {/* FOOTER: BADGE + NUT XEM */}
                                    <div className="mt-auto pt-3 border-top border-white border-opacity-10">
                                        <div className="mb-2">
                                            {biz.verificationStatus === 'VERIFIED' ? (
                                                <Badge bg="success" className="x-small-badge">Da xac thuc</Badge>
                                            ) : (
                                                <Badge bg="secondary" className="x-small-badge">Chua xac thuc</Badge>
                                            )}
                                        </div>
                                        <Button
                                            variant="outline-primary"
                                            className="w-100 rounded-pill fw-bold btn-view-school"
                                            onClick={function () {
                                                setSelectedEnterprise(biz);
                                                setShowModal(true);
                                            }}
                                        >
                                            <Eye size={14} className="me-1" /> Xem chi tiet
                                        </Button>
                                    </div>
                                </div>
                            </Col>
                        );
                    })}
                </Row>

                {/* TRONG RONG */}
                {companies.length === 0 && (
                    <div className="text-center py-5 text-white-50">
                        Chua co doanh nghiep nao tren he thong.
                    </div>
                )}

                {/* PHAN TRANG */}
                <PaginationBar
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            </Container>

            {/* ============================================================
                MODAL CHI TIET DOANH NGHIEP
                ============================================================ */}
            <Modal
                show={showModal}
                onHide={function () { setShowModal(false); }}
                centered
                size="lg"
                contentClassName="glass-card text-white border-0 shadow-lg"
            >
                <Modal.Body className="p-4">
                    {selectedEnterprise && (
                        <div>

                            {/* HEADER: LOGO + TEN + NUT DONG */}
                            <div className="d-flex justify-content-between align-items-start mb-4">
                                <div className="d-flex align-items-center gap-3">
                                    <img
                                        src={getLogo(selectedEnterprise)}
                                        alt={selectedEnterprise.companyName}
                                        style={{
                                            width: 72,
                                            height: 72,
                                            borderRadius: 12,
                                            objectFit: 'cover',
                                            border: '3px solid rgba(255,255,255,0.1)'
                                        }}
                                        loading="lazy"
                                    />
                                    <div>
                                        <h4 className="fw-bold text-white mb-1">{selectedEnterprise.companyName}</h4>
                                        {selectedEnterprise.verificationStatus === 'VERIFIED' ? (
                                            <Badge bg="success" className="x-small-badge">Da xac thuc</Badge>
                                        ) : (
                                            <Badge bg="secondary" className="x-small-badge">Chua xac thuc</Badge>
                                        )}
                                    </div>
                                </div>
                                <button
                                    className="btn-icon-table text-white-50"
                                    onClick={function () { setShowModal(false); }}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* THONG TIN LIEN HE + XAC THUC */}
                            <Row className="g-4 mb-4">
                                <Col md={6}>
                                    <div className="p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.04)' }}>
                                        <p className="x-small text-white-50 mb-2 uppercase-tracking fw-bold">Thong tin lien he</p>
                                        {selectedEnterprise.representName && (
                                            <p className="small text-white mb-1">
                                                <User size={14} className="me-2 text-primary" />
                                                Nguoi dai dien: {selectedEnterprise.representName}
                                            </p>
                                        )}
                                        <p className="small text-white mb-1">
                                            <MapPin size={14} className="me-2 text-primary" />
                                            {selectedEnterprise.address || 'Chua cap nhat'}
                                        </p>
                                        {selectedEnterprise.website && (
                                            <p className="small text-white mb-0">
                                                <Globe size={14} className="me-2 text-primary" />
                                                {selectedEnterprise.website}
                                            </p>
                                        )}
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.04)' }}>
                                        <p className="x-small text-white-50 mb-2 uppercase-tracking fw-bold">Xac thuc</p>
                                        <p className="small text-white mb-0">
                                            <ShieldCheck size={14} className="me-2 text-primary" />
                                            {selectedEnterprise.verificationStatus === 'VERIFIED' ? (
                                                <span className="text-success fw-bold">Da xac thuc</span>
                                            ) : (
                                                <span className="text-secondary">Chua xac thuc</span>
                                            )}
                                        </p>
                                    </div>
                                </Col>
                            </Row>

                            {/* MO TA CONG TY */}
                            {selectedEnterprise.description && (
                                <div className="mb-4">
                                    <p className="x-small text-white-50 mb-2 uppercase-tracking fw-bold">Gioi thieu cong ty</p>
                                    <p className="small text-white-80">{selectedEnterprise.description}</p>
                                </div>
                            )}

                            {/* NUT HANH DONG */}
                            <div className="d-flex gap-2 justify-content-end">
                                <Button
                                    as={Link}
                                    to={'/businesses/business-profile/' + selectedEnterprise.enterpriseId}
                                    variant="outline-primary"
                                    className="fw-bold px-4"
                                >
                                    <Eye size={16} className="me-1" /> Xem Profile
                                </Button>
                                {selectedEnterprise.website && (
                                    <Button
                                        variant="primary"
                                        className="fw-bold px-4"
                                        onClick={function () {
                                            window.open(selectedEnterprise.website, '_blank');
                                        }}
                                    >
                                        <Globe size={16} className="me-1" /> Website
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default Businesses;
