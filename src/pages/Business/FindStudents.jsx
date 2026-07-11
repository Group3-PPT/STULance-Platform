import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Badge, Form, InputGroup, Modal } from 'react-bootstrap';
import {
  Search, GraduationCap, ShieldCheck, Eye, Filter, Users, Loader2, RefreshCw,
  Briefcase, X, Mail, Star, BookOpen, Calendar
} from 'lucide-react';
import { studentService } from '../../services/studentservice';
import { Link } from 'react-router-dom';
import '../../CSS/Businesses.css';

const FindStudents = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSkill, setFilterSkill] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => { fetchStudents(); }, []);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const res = await studentService.getAllPublicStudents();
            const data = res?.data || res || [];
            setStudents(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Lỗi tải danh sách sinh viên:", err);
        } finally {
            setLoading(false);
        }
    };

    const allSkills = [...new Set(
        students.flatMap(s => (s.skills || []).map(sk => sk.skillName || sk))
    )].filter(Boolean);

    const filtered = students.filter(s => {
        const matchSearch = (s.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (s.school || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (s.major || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchSkill = !filterSkill || (s.skills || []).some(sk => (sk.skillName || sk) === filterSkill);
        return matchSearch && matchSkill;
    });

    const getAvatar = (stu) => {
        if (stu.avatarUrl) return stu.avatarUrl;
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(stu.fullName || 'S')}&background=3b82f6&color=fff&size=120`;
    };

    return (
        <div className="businesses-page py-5 animate-fade-in">
            <Container>
                <div className="text-center mb-5">
                    <div className="section-badge mb-2 mx-auto"><Users size={14}/> TÌM ỨNG VIÊN</div>
                    <h1 className="fw-bold text-white display-5">
                        Tìm kiếm <span className="text-primary-glow">Sinh viên</span> tài năng
                    </h1>
                    <p className="text-white-50 mx-auto mt-3" style={{ maxWidth: '700px' }}>
                        Khám phá {students.length}+ sinh viên đang trên hệ thống.
                    </p>
                </div>

                <div className="glass-card p-3 mb-5 mx-auto shadow-lg" style={{maxWidth: '800px', borderRadius: '16px'}}>
                    <Row className="g-2 align-items-center">
                        <Col md={5}>
                            <InputGroup className="bg-dark-input rounded-pill overflow-hidden border-0">
                                <InputGroup.Text className="bg-transparent border-0 text-primary"><Search size={18}/></InputGroup.Text>
                                <Form.Control
                                    placeholder="Tìm theo tên, trường, chuyên ngành..."
                                    className="bg-transparent border-0 text-white shadow-none py-2"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </InputGroup>
                        </Col>
                        <Col md={4}>
                            <Form.Select
                                className="bg-dark-input text-white border-0 py-2 rounded-pill"
                                value={filterSkill}
                                onChange={(e) => setFilterSkill(e.target.value)}
                            >
                                <option value="">Tất cả kỹ năng</option>
                                {allSkills.map((skill, idx) => (
                                    <option key={idx} value={skill}>{skill}</option>
                                ))}
                            </Form.Select>
                        </Col>
                        <Col md={3}>
                            <Button variant="primary" className="w-100 rounded-pill fw-bold py-2" onClick={fetchStudents}>
                                <Filter size={16} className="me-1"/> Làm mới
                            </Button>
                        </Col>
                    </Row>
                </div>

                {loading ? (
                    <div className="text-center py-5">
                        <Loader2 className="spinner text-primary" size={40}/>
                        <p className="text-white-50 mt-3">Đang tải danh sách sinh viên...</p>
                    </div>
                ) : (
                    <>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <p className="text-white-50 mb-0">Tìm thấy <strong className="text-white">{filtered.length}</strong> sinh viên</p>
                            <button className="btn-icon-table text-white-50" title="Làm mới" onClick={fetchStudents}><RefreshCw size={16}/></button>
                        </div>
                        <Row className="g-4">
                            {filtered.map((stu, idx) => (
                                <Col lg={4} md={6} key={stu.studentId || idx}>
                                    <div className="glass-card biz-card p-4 text-center h-100 d-flex flex-column">
                                        <div className="stu-avatar-wrap mb-3 mx-auto">
                                            <img src={getAvatar(stu)} alt={stu.fullName} className="stu-avatar-img" />
                                            {stu.verificationStatus === 'VERIFIED' && (
                                                <div className="stu-verified-badge">
                                                    <ShieldCheck size={12} fill="#10b981" color="white" />
                                                </div>
                                            )}
                                        </div>

                                        <h5 className="text-white fw-bold mb-1">{stu.fullName}</h5>
                                        <p className="x-small text-primary fw-bold mb-2 uppercase-tracking">
                                            {stu.major || 'Chưa cập nhật'}
                                        </p>
                                        <p className="x-small text-white-50 mb-2">
                                            <GraduationCap size={12} className="me-1"/> {stu.school || 'Chưa cập nhật'}
                                        </p>
                                        {stu.gpa > 0 && (
                                            <p className="x-small text-white-50 mb-2">
                                                <Star size={12} className="me-1"/> GPA: {stu.gpa.toFixed(2)}
                                            </p>
                                        )}

                                        {stu.skills && stu.skills.length > 0 && (
                                            <div className="d-flex flex-wrap justify-content-center gap-1 mb-3">
                                                {stu.skills.slice(0, 3).map((sk, i) => (
                                                    <Badge key={i} bg="primary" className="x-small-badge">{sk.skillName || sk}</Badge>
                                                ))}
                                                {stu.skills.length > 3 && (
                                                    <Badge bg="secondary" className="x-small-badge">+{stu.skills.length - 3}</Badge>
                                                )}
                                            </div>
                                        )}

                                        <div className="mt-auto pt-3 border-top border-white border-opacity-10">
                                            <Button
                                                variant="outline-primary"
                                                className="w-100 rounded-pill fw-bold btn-view-school"
                                                onClick={() => setSelectedStudent(stu) || setShowModal(true)}
                                            >
                                                <Eye size={14} className="me-1"/> Xem chi tiết
                                            </Button>
                                        </div>
                                    </div>
                                </Col>
                            ))}
                            {filtered.length === 0 && (
                                <Col xs={12} className="text-center py-5">
                                    <p className="text-white-50">Không tìm thấy sinh viên phù hợp.</p>
                                </Col>
                            )}
                        </Row>
                    </>
                )}
            </Container>

            {/* MODAL CHI TIẾT SINH VIÊN */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg" contentClassName="glass-card text-white border-0 shadow-lg">
                <Modal.Body className="p-4">
                    {selectedStudent && (
                        <>
                            <div className="d-flex justify-content-between align-items-start mb-4">
                                <div className="d-flex align-items-center gap-3">
                                    <img
                                        src={getAvatar(selectedStudent)}
                                        alt={selectedStudent.fullName}
                                        style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.1)' }}
                                    />
                                    <div>
                                        <h4 className="fw-bold text-white mb-1">{selectedStudent.fullName}</h4>
                                        <p className="text-primary mb-0 fw-bold">{selectedStudent.major || 'Chưa cập nhật'}</p>
                                        <p className="x-small text-white-50 mb-0">
                                            <GraduationCap size={12} className="me-1"/>{selectedStudent.school || 'Chưa cập nhật'}
                                        </p>
                                    </div>
                                </div>
                                <button className="btn-icon-table text-white-50" onClick={() => setShowModal(false)}><X size={20}/></button>
                            </div>

                            <Row className="g-4 mb-4">
                                <Col md={6}>
                                    <div className="p-3 rounded-3" style={{background: 'rgba(255,255,255,0.04)'}}>
                                        <p className="x-small text-white-50 mb-2 uppercase-tracking fw-bold">Thông tin học vấn</p>
                                        <p className="small text-white mb-1"><BookOpen size={14} className="me-2 text-primary"/>Chuyên ngành: {selectedStudent.major || 'Chưa cập nhật'}</p>
                                        <p className="small text-white mb-1"><Star size={14} className="me-2 text-primary"/>GPA: {selectedStudent.gpa?.toFixed(2) || 'Chưa cập nhật'}</p>
                                        <p className="small text-white mb-0"><Calendar size={14} className="me-2 text-primary"/>Tốt nghiệp: {selectedStudent.graduationYear || 'Chưa cập nhật'}</p>
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="p-3 rounded-3" style={{background: 'rgba(255,255,255,0.04)'}}>
                                        <p className="x-small text-white-50 mb-2 uppercase-tracking fw-bold">Xác thực</p>
                                        <p className="small text-white mb-0">
                                            <ShieldCheck size={14} className="me-2 text-primary"/>
                                            Trạng thái: {selectedStudent.verificationStatus === 'VERIFIED' ? (
                                                <Badge bg="success" className="x-small-badge">Đã xác thực</Badge>
                                            ) : (
                                                <Badge bg="secondary" className="x-small-badge">Chưa xác thực</Badge>
                                            )}
                                        </p>
                                    </div>
                                </Col>
                            </Row>

                            {selectedStudent.skills && selectedStudent.skills.length > 0 && (
                                <div className="mb-4">
                                    <p className="x-small text-white-50 mb-2 uppercase-tracking fw-bold">Kỹ năng</p>
                                    <div className="d-flex flex-wrap gap-1">
                                        {selectedStudent.skills.map((sk, i) => (
                                            <Badge key={i} bg="primary" className="x-small-badge">{sk.skillName || sk}</Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="d-flex gap-2 justify-content-end">
                                <Button as={Link} to={`/portfolio/${selectedStudent.studentId}`} variant="primary" className="fw-bold px-4">
                                    <Eye size={16} className="me-1"/> Xem Portfolio
                                </Button>
                            </div>
                        </>
                    )}
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default FindStudents;
