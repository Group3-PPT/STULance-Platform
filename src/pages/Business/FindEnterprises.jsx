import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Badge, Form, InputGroup, Modal } from 'react-bootstrap';
import {
  Search, Building2, ShieldCheck, Eye, Filter, Briefcase, Loader2, RefreshCw,
  MapPin, Star, X, Mail, Globe, Hash, Users
} from 'lucide-react';
import { enterpriseService } from '../../services/enterprise.service';
import '../../CSS/Businesses.css';

const FindEnterprises = () => {
    const [enterprises, setEnterprises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEnterprise, setSelectedEnterprise] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [loadingDetail, setLoadingDetail] = useState(null);

    useEffect(() => { fetchEnterprises(); }, []);

    const fetchEnterprises = async () => {
        setLoading(true);
        try {
            const res = await enterpriseService.getAllEnterprises();
            const data = res.data || res || [];
            const list = Array.isArray(data) ? data : data.items || [];
            setEnterprises(list);
        } catch (err) {
            console.error("Lỗi tải danh sách doanh nghiệp:", err);
            // Fallback: try from jobs
            try {
                const jobRes = await import('../../services/jobservice').then(m => m.jobService.getAllPublicJobs());
                if (jobRes.success && jobRes.data) {
                    const enterpriseMap = new Map();
                    jobRes.data.forEach(job => {
                        if (job.enterpriseId && !enterpriseMap.has(job.enterpriseId)) {
                            enterpriseMap.set(job.enterpriseId, {
                                enterpriseId: job.enterpriseId,
                                companyName: job.enterpriseName || 'Chưa cập nhật',
                                logoUrl: job.enterpriseLogoUrl || null,
                                industry: job.enterpriseIndustry || 'Chưa cập nhật',
                                location: job.location || 'Chưa cập nhật',
                                description: job.enterpriseDescription || '',
                                isVerified: job.isEnterpriseVerified || false,
                                email: job.enterpriseEmail || '',
                                companySize: '',
                                website: '',
                                companyTaxCode: '',
                                jobCount: 0
                            });
                        }
                        if (job.enterpriseId && enterpriseMap.has(job.enterpriseId)) {
                            enterpriseMap.get(job.enterpriseId).jobCount++;
                        }
                    });
                    setEnterprises(Array.from(enterpriseMap.values()));
                }
            } catch (fallbackErr) {
                console.error("Fallback cũng lỗi:", fallbackErr);
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchEnterpriseDetail = async (enterpriseId) => {
        setLoadingDetail(enterpriseId);
        setSelectedEnterprise(null);
        try {
            const res = await enterpriseService.getPublicProfile(enterpriseId);
            if (res.success && res.data) {
                setSelectedEnterprise(res.data);
                setShowModal(true);
            }
        } catch (err) {
            console.error("Lỗi tải chi tiết doanh nghiệp:", err);
        } finally {
            setLoadingDetail(null);
        }
    };

    const filtered = enterprises.filter(e => {
        return (e.companyName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
               (e.industry || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
               (e.location || '').toLowerCase().includes(searchTerm.toLowerCase());
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
                        Khám phá {enterprises.length}+ doanh nghiệp đang tuyển dụng trên hệ thống.
                    </p>
                </div>

                <div className="glass-card p-3 mb-5 mx-auto shadow-lg" style={{maxWidth: '800px', borderRadius: '16px'}}>
                    <Row className="g-2 align-items-center">
                        <Col md={8}>
                            <InputGroup className="bg-dark-input rounded-pill overflow-hidden border-0">
                                <InputGroup.Text className="bg-transparent border-0 text-primary"><Search size={18}/></InputGroup.Text>
                                <Form.Control
                                    placeholder="Tìm theo tên công ty, ngành nghề, địa điểm..."
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
                                            <img src={getLogo(ent)} alt={ent.companyName} className="stu-avatar-img" />
                                            {ent.isVerified && (
                                                <div className="stu-verified-badge">
                                                    <ShieldCheck size={12} fill="#10b981" color="white" />
                                                </div>
                                            )}
                                        </div>

                                        <h5 className="text-white fw-bold mb-1">{ent.companyName || 'Chưa cập nhật'}</h5>
                                        <p className="x-small text-primary fw-bold mb-2 uppercase-tracking">
                                            {ent.industry || 'Chưa cập nhật'}
                                        </p>
                                        {ent.location && (
                                            <p className="x-small text-white-50 mb-3">
                                                <MapPin size={12} className="me-1"/> {ent.location}
                                            </p>
                                        )}

                                        {ent.description && (
                                            <p className="x-small text-white-50 mb-3 line-clamp-2">{ent.description}</p>
                                        )}

                                        <div className="mt-auto pt-3 border-top border-white border-opacity-10">
                                            <p className="x-small text-white-50 mb-2">
                                                <Briefcase size={12} className="me-1"/> {ent.jobCount || 0} việc làm
                                            </p>
                                            <Button
                                                variant="outline-primary"
                                                className="w-100 rounded-pill fw-bold btn-view-school"
                                                onClick={() => fetchEnterpriseDetail(ent.enterpriseId)}
                                                disabled={loadingDetail === ent.enterpriseId}
                                            >
                                                {loadingDetail === ent.enterpriseId ? (
                                                    <><Loader2 size={14} className="me-1 spinner"/> Đang tải...</>
                                                ) : (
                                                    <><Eye size={14} className="me-1"/> Xem chi tiết</>
                                                )}
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
                                        style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.1)' }}
                                    />
                                    <div>
                                        <h4 className="fw-bold text-white mb-1">{selectedEnterprise.companyName}</h4>
                                        <p className="text-primary mb-0">{selectedEnterprise.industry || 'Chưa cập nhật'}</p>
                                        {selectedEnterprise.location && (
                                            <p className="x-small text-white-50"><MapPin size={12} className="me-1"/>{selectedEnterprise.location}</p>
                                        )}
                                    </div>
                                </div>
                                <button className="btn-icon-table text-white-50" onClick={() => setShowModal(false)}><X size={20}/></button>
                            </div>

                            <Row className="g-4 mb-4">
                                <Col md={6}>
                                    <div className="p-3 rounded-3" style={{background: 'rgba(255,255,255,0.04)'}}>
                                        <p className="x-small text-white-50 mb-2 uppercase-tracking fw-bold">Thông tin liên hệ</p>
                                        <p className="small text-white mb-1"><Mail size={14} className="me-2 text-primary"/>{selectedEnterprise.email || 'Chưa cập nhật'}</p>
                                        <p className="small text-white mb-1"><Globe size={14} className="me-2 text-primary"/>{selectedEnterprise.website || 'Chưa cập nhật'}</p>
                                        <p className="small text-white mb-0"><Hash size={14} className="me-2 text-primary"/>MST: {selectedEnterprise.companyTaxCode || 'Chưa cập nhật'}</p>
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="p-3 rounded-3" style={{background: 'rgba(255,255,255,0.04)'}}>
                                        <p className="x-small text-white-50 mb-2 uppercase-tracking fw-bold">Quy mô & Đánh giá</p>
                                        <p className="small text-white mb-1"><Users size={14} className="me-2 text-primary"/>Quy mô: {selectedEnterprise.companySize || 'Chưa cập nhật'}</p>
                                        <p className="small text-white mb-0"><Star size={14} className="me-2 text-warning"/>Đánh giá: {selectedEnterprise.rating || '4.8'}/5.0</p>
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
                    {loadingDetail && !selectedEnterprise && (
                        <div className="text-center py-4">
                            <Loader2 className="spinner text-primary" size={30}/>
                        </div>
                    )}
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default FindEnterprises;
