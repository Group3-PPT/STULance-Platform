import React from 'react';
import { Button, Badge, Row, Col } from 'react-bootstrap';
import { Bookmark, Send, Laptop, Clock, ShieldCheck } from 'lucide-react';

const JobDetailView = ({ job }) => {
    return (
        <div className="hub-detail-card glass-card animate-fade-in">
            <div className="p-4 border-bottom border-secondary">
                <h2 className="hub-detail-title mb-4">{job.title}</h2>
                <div className="d-flex gap-3 mb-4 text-info small">
                    <span><Laptop size={16}/> {job.remote}</span>
                    <span><ShieldCheck size={16}/> Đã xác thực doanh nghiệp</span>
                </div>
                <Row className="align-items-center">
                    <Col md={7}>
                        <div className="hub-detail-price">{job.salary} <small>{job.unit}</small></div>
                        <div className="text-muted small mt-1">{job.location} | {job.station}</div>
                    </Col>
                    <Col md={5} className="text-end">
                        <div className="d-flex gap-2 justify-content-end">
                            <Button variant="light" className="hub-btn-save"><Bookmark size={18}/> Lưu</Button>
                            <Button className="hub-btn-pink">TÔI MUỐN THẢO LUẬN VIỆC NÀY</Button>
                        </div>
                    </Col>
                </Row>
            </div>

            <div className="p-4">
                <div className="hub-info-table">
                    <div className="hub-info-row">
                        <div className="hub-info-label">Vị trí công việc</div>
                        <div className="hub-info-value">
                            {job.tags.map(t => <Badge key={t} bg="primary" className="me-2">{t}</Badge>)}
                        </div>
                    </div>
                    <div className="hub-info-row">
                        <div className="hub-info-label">Chi tiết công việc</div>
                        <div className="hub-info-value">{job.desc}</div>
                    </div>
                    <div className="hub-info-row">
                        <div className="hub-info-label">Kỹ năng yêu cầu</div>
                        <div className="hub-info-value">
                            • Có kinh nghiệm thực tế • Tiếng Anh giao tiếp • Tinh thần trách nhiệm cao
                        </div>
                    </div>
                    <div className="hub-info-row">
                        <div className="hub-info-label">Cập nhật lần cuối</div>
                        <div className="hub-info-value">Ngày 22 tháng 5 năm 2026</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobDetailView;