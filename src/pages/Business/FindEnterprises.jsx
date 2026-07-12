import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Badge, Form, InputGroup, Modal } from 'react-bootstrap';
import {
  Search, Building2, ShieldCheck, Eye, Filter, Loader2, RefreshCw,
  MapPin, X, Mail, Globe, Hash, Users, User
} from 'lucide-react';
import { enterpriseService } from '../../services/enterprise.service';
import { unwrapList } from '../../services/responseUtils';
import '../../CSS/Businesses.css';

const FindEnterprises = () => {
    const [enterprises, setEnterprises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEnterprise, setSelectedEnterprise] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => { fetchEnterprises(); }, []);

    const fetchEnterprises = async () => {
        setLoading(true);
        try {
            const res = await enterpriseService.getAllPublicEnterprises();
            const data = unwrapList(res);
            setEnterprises(data);
        } catch (err) {
            console.error("Lỗi tải danh sách doanh nghiệp:", err);
        } finally {
            setLoading(false);
        }
    };

    const filtered = enterprises.filter(e => {
        return (e.companyName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
               (e.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
               (e.address || '').toLowerCase().includes(searchTerm.toLowerCase());
    });

    const getLogo = (ent) => {
        if (ent.logoUrl) return ent.logoUrl;
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(ent.companyName || 'D')}&background=10b981&color=fff&size=120`;
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
                        Khám phá {enterprises.length}+ doanh nghiệp trên hệ thống.
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
                                />
                            </InputGroup>
                        </Col>
                        <Col md={4}>
                            <Button variant="primary" className="w-100 rounded-pill fw-bold py-2" onClick={fetchEnterprises}>
                                <Filter size={16} className="me-1"/> Làm mới
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
                            <p className="text-white-50 mb-0">Tìm thấy <strong className="text-white">{filtered.length}</strong> doanh nghiệp</p>
                            <button className="btn-icon-table text-white-50" title="Làm mới" onClick={fetchEnterprises}><RefreshCw size={16}/></button>
                        </div>
                        <Row className="g-4">
                            {filtered.map((ent, idx) => (
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
                            {filtered.length === 0 && (
                                <Col xs={12} className="text-center py-5">
                                    <p className="text-white-50">Không tìm thấy doanh nghiệp phù hợp.</p>
                                </Col>
                            )}
                        </Row>
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
