import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Badge, Form, InputGroup } from 'react-bootstrap';
import { 
  Search, GraduationCap, ShieldCheck, Eye, Filter, Users, Loader2, RefreshCw, 
  Briefcase
} from 'lucide-react';
import { studentServiceService } from '../../services/studentserviceservice';
import { Link } from 'react-router-dom';
import '../../CSS/Businesses.css';

const FindStudents = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSkill, setFilterSkill] = useState('');

    useEffect(() => { fetchStudents(); }, []);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const res = await studentServiceService.getAllPublic();
            if (res.success && res.data) {
                const studentMap = new Map();
                res.data.forEach(svc => {
                    if (svc.studentId && !studentMap.has(svc.studentId)) {
                        studentMap.set(svc.studentId, {
                            studentId: svc.studentId,
                            fullName: svc.studentName || 'Chưa cập nhật',
                            avatarUrl: svc.studentAvatarUrl || null,
                            school: svc.studentSchool || 'Chưa cập nhật',
                            major: svc.studentMajor || 'Chưa cập nhật',
                            skills: svc.skills || [],
                            isVerified: svc.isStudentVerified || false,
                            serviceCount: 0
                        });
                    }
                    if (svc.studentId && studentMap.has(svc.studentId)) {
                        studentMap.get(svc.studentId).serviceCount++;
                    }
                });
                setStudents(Array.from(studentMap.values()));
            }
        } catch (err) {
            console.error("Lỗi tải danh sách sinh viên:", err);
        } finally {
            setLoading(false);
        }
    };

    const allSkills = [...new Set(students.flatMap(s => s.skills || []).map(sk => sk.skillName || sk))].filter(Boolean);

    const filtered = students.filter(s => {
        const matchSearch = (s.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (s.school || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (s.major || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchSkill = !filterSkill || (s.skills || []).some(sk => (sk.skillName || sk) === filterSkill);
        return matchSearch && matchSkill;
    });

    return (
        <div className="businesses-page py-5 animate-fade-in">
            <Container>
                <div className="text-center mb-5">
                    <div className="section-badge mb-2 mx-auto"><Users size={14}/> TÌM ỨNG VIÊN</div>
                    <h1 className="fw-bold text-white display-5">
                        Tìm kiếm <span className="text-primary-glow">Sinh viên</span> tài năng
                    </h1>
                    <p className="text-white-50 mx-auto mt-3" style={{ maxWidth: '700px' }}>
                        Khám phá {students.length}+ sinh viên đang cung cấp dịch vụ trên hệ thống.
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
                                            {stu.avatarUrl ? (
                                                <img src={stu.avatarUrl} alt={stu.fullName} className="stu-avatar-img" />
                                            ) : (
                                                <div className="stu-avatar-placeholder">
                                                    {(stu.fullName || 'S').charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            {stu.isVerified && (
                                                <div className="stu-verified-badge">
                                                    <ShieldCheck size={12} fill="#10b981" color="white" />
                                                </div>
                                            )}
                                        </div>
                                        
                                        <h5 className="text-white fw-bold mb-1">{stu.fullName}</h5>
                                        <p className="x-small text-primary fw-bold mb-2 uppercase-tracking">
                                            {stu.major || 'Chưa cập nhật'}
                                        </p>
                                        <p className="x-small text-white-50 mb-3">
                                            <GraduationCap size={12} className="me-1"/> {stu.school || 'Chưa cập nhật'}
                                        </p>

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
                                            <p className="x-small text-white-50 mb-2">
                                                <Briefcase size={12} className="me-1"/> {stu.serviceCount} dịch vụ
                                            </p>
                                            <Button 
                                                as={Link} 
                                                to={`/portfolio/${stu.studentId}`} 
                                                variant="primary" 
                                                className="w-100 rounded-pill fw-bold"
                                            >
                                                <Eye size={14} className="me-1"/> Xem Portfolio
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
        </div>
    );
};

export default FindStudents;
