import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Card, Table, Badge, Form, Modal, InputGroup } from 'react-bootstrap';
import { CheckCircle, XCircle, Trash2, Edit, Plus, Search, Layers, Clock, Check, Settings, Loader2, GitMerge, RefreshCw } from 'lucide-react';
import { skillService } from '../../services/skillservice';
import '../../CSS/AdminSkillManagement.css';

const AdminSkillManager = () => {
    const [pendingSkills, setPendingSkills] = useState([]);
    const [allSkills, setAllSkills] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isPendingMode, setIsPendingMode] = useState(true);
    const [loading, setLoading] = useState(false);

    // Modals state
    const [showSkillModal, setShowSkillModal] = useState(false);
    const [showMergeModal, setShowMergeModal] = useState(false);
    
    const [currentSkill, setCurrentSkill] = useState({ skillId: '', skillName: '' });
    const [sourceSkill, setSourceSkill] = useState(null);
    const [targetSkillId, setTargetSkillId] = useState('');

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [pRes, aRes] = await Promise.all([
                skillService.getPendingSkills(), 
                skillService.getApprovedSkills()
            ]);
            setPendingSkills(pRes.data || []);
            setAllSkills(aRes.data || []);
        } catch (err) { 
            console.error("Lỗi tải danh sách:", err); 
        } finally { setLoading(false); }
    };

    // Duyệt Skill
    const handleApprove = async (id) => {
        if (!window.confirm("Xác nhận đưa kỹ năng này vào danh mục chính thức?")) return;
        try {
            await skillService.approveSkill(id);
            fetchData();
        } catch (err) { alert("Lỗi khi duyệt kỹ năng."); }
    };

    // Từ chối Skill
    const handleReject = async (id) => {
        if (!window.confirm("Bạn có chắc muốn từ chối đề xuất này?")) return;
        try {
            await skillService.rejectSkill(id);
            fetchData();
        } catch (err) { alert("Lỗi khi từ chối."); }
    };

    // Gộp Skill
    const handleMerge = async () => {
        if (!targetSkillId) return alert("Vui lòng chọn một kỹ năng đích chuẩn!");
        try {
            await skillService.mergeSkill(sourceSkill.skillId, targetSkillId);
            setShowMergeModal(false);
            setTargetSkillId('');
            fetchData();
            alert("Gộp thành công!");
        } catch (err) { alert("Lỗi khi gộp kỹ năng."); }
    };

    // Thêm hoặc Sửa
    const handleSave = async () => {
        if (!currentSkill.skillName.trim()) return alert("Tên kỹ năng không được để trống");
        try {
            currentSkill.skillId 
                ? await skillService.updateSkill(currentSkill.skillId, currentSkill.skillName)
                : await skillService.adminCreateSkill(currentSkill.skillName);
            setShowSkillModal(false);
            fetchData();
        } catch (err) { alert("Lỗi khi lưu dữ liệu."); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Xóa vĩnh viễn kỹ năng này? Hành động này không thể hoàn tác.")) return;
        try {
            await skillService.deleteSkill(id);
            fetchData();
        } catch (err) { alert("Không thể xóa kỹ năng đang được sử dụng."); }
    };

    const filtered = (isPendingMode ? pendingSkills : allSkills).filter(s => 
        s.skillName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="adm-dashboard-content py-4 animate-fade-in text-white">
            <Container>
                {/* 1. HEADER & STATS */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h4 className="fw-bold mb-0">Quản lý Kỹ năng</h4>
                        <span className="x-small  uppercase-tracking">Hệ thống & Đề xuất Sinh viên</span>
                    </div>
                    <div className="d-flex gap-2">
                        <Button variant="outline-light" size="sm" onClick={fetchData}><RefreshCw size={16}/></Button>
                        <Button className="adm-fab-settings shadow-none" style={{position:'static', width: '40px', height: '40px'}}><Settings size={18}/></Button>
                    </div>
                </div>

                <Row className="g-3 mb-4">
                    <Col md={4}>
                        <Card className="glass-card border-0 p-3 shadow-sm">
                            <div className="d-flex align-items-center">
                                <div className="adm-icon-box bg-primary bg-opacity-10 text-primary me-3"><Layers size={22}/></div>
                                <div><p className="x-small  mb-0 uppercase-tracking">Hệ thống</p><h3 className="mb-0 fw-bold">{allSkills.length}</h3></div>
                            </div>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card className="glass-card border-0 p-3 shadow-sm">
                            <div className="d-flex align-items-center">
                                <div className="adm-icon-box bg-warning bg-opacity-10 text-warning me-3"><Clock size={22}/></div>
                                <div><p className="x-small  mb-0 uppercase-tracking">Chờ duyệt</p><h3 className="mb-0 text-warning fw-bold">{pendingSkills.length}</h3></div>
                            </div>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card className="glass-card border-0 p-3 shadow-sm">
                            <div className="d-flex align-items-center">
                                <div className="adm-icon-box bg-success bg-opacity-10 text-success me-3"><Check size={22}/></div>
                                <div><p className="x-small  mb-0 uppercase-tracking">Hợp lệ</p><h3 className="text-primary-glow mb-0 fw-bold">100%</h3></div>
                            </div>
                        </Card>
                    </Col>
                </Row>

                {/* 2. MAIN TABLE */}
                <Card className="glass-card border-0 overflow-hidden shadow-lg">
                    <div className="p-3 border-bottom border-white border-opacity-10 d-flex justify-content-between align-items-center flex-wrap gap-3">
                        <div className="d-flex gap-2 bg-dark bg-opacity-50 p-1 rounded-3">
                            <Button 
                                variant={isPendingMode ? "primary" : "link"} 
                                className={`x-small fw-bold text-decoration-none px-3 ${!isPendingMode && ''}`} 
                                onClick={()=>setIsPendingMode(true)}
                            >CHỜ DUYỆT</Button>
                            <Button 
                                variant={!isPendingMode ? "primary" : "link"} 
                                className={`x-small fw-bold text-decoration-none px-3 ${isPendingMode && ''}`} 
                                onClick={()=>setIsPendingMode(false)}
                            >DANH MỤC CHUNG</Button>
                        </div>
                        <div className="d-flex gap-2">
                            <InputGroup size="sm" className="bg-dark-input rounded shadow-none" style={{width: '200px'}}>
                                <InputGroup.Text className="bg-transparent border-0 "><Search size={14}/></InputGroup.Text>
                                <Form.Control className="bg-transparent border-0 text-white" placeholder="Tìm..." onChange={e=>setSearchTerm(e.target.value)}/>
                            </InputGroup>
                            <Button variant="primary" size="sm" className="px-3" onClick={()=>{setCurrentSkill({skillId: '', skillName:''}); setShowSkillModal(true)}}><Plus size={18}/></Button>
                        </div>
                    </div>

                    <div className="p-2">
                        {loading ? (
                            <div className="text-center py-5"><Loader2 className="spinner text-primary" size={40}/></div>
                        ) : (
                            <Table responsive className="admin-table-clean mb-0 text-white">
                                <thead>
                                    <tr>
                                        <th className="ps-4">Tên kỹ năng</th>
                                        <th>Trạng thái</th>
                                        <th>Người đề xuất</th>
                                        <th className="text-end pe-4">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map(skill => (
                                        <tr key={skill.skillId}>
                                            <td className="ps-4">
                                                <div className="fw-bold">{skill.skillName}</div>
                                                <div className="x-small  opacity-50">ID: {skill.skillId}</div>
                                            </td>
                                            <td>
                                                <Badge className={`status-badge-sm ${skill.status==='PENDING'?'bg-warning text-dark':'bg-success'}`}>
                                                    {skill.status}
                                                </Badge>
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center gap-2">
                                                    <div className="img-placeholder-sm d-flex align-items-center justify-content-center text-primary x-small fw-bold border border-primary border-opacity-25">
                                                        {skill.createdByStudentId?.substring(0,2).toUpperCase() || 'AD'}
                                                    </div>
                                                    <span className="x-small ">{skill.createdByStudentId || 'Hệ thống'}</span>
                                                </div>
                                            </td>
                                            <td className="text-end pe-4">
                                                {isPendingMode ? (
                                                    <div className="d-flex justify-content-end gap-2">
                                                        <button className="btn-icon-table text-success" title="Duyệt" onClick={()=>handleApprove(skill.skillId)}><CheckCircle size={18}/></button>
                                                        <button className="btn-icon-table text-primary" title="Gộp" onClick={()=>{setSourceSkill(skill); setShowMergeModal(true)}}><GitMerge size={18}/></button>
                                                        <button className="btn-icon-table text-danger" title="Từ chối" onClick={()=>handleReject(skill.skillId)}><XCircle size={18}/></button>
                                                    </div>
                                                ) : (
                                                    <div className="d-flex justify-content-end gap-2">
                                                        <button className="btn-icon-table text-info" title="Sửa" onClick={()=>{setCurrentSkill(skill); setShowSkillModal(true)}}><Edit size={18}/></button>
                                                        <button className="btn-icon-table text-danger" title="Xóa" onClick={()=>handleDelete(skill.skillId)}><Trash2 size={18}/></button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {!loading && filtered.length === 0 && (
                                        <tr><td colSpan="4" className="text-center py-5  italic">Không tìm thấy kỹ năng nào.</td></tr>
                                    )}
                                </tbody>
                            </Table>
                        )}
                    </div>
                </Card>
            </Container>

            {/* 3. MODAL: ADD/EDIT */}
            <Modal show={showSkillModal} onHide={()=>setShowSkillModal(false)} centered contentClassName="glass-card text-white border-0 shadow-lg">
                <Modal.Body className="p-4">
                    <div className="d-flex align-items-center gap-2 mb-4">
                        <div className="adm-icon-box bg-primary bg-opacity-10 text-primary" style={{width: '32px', height: '32px'}}><Layers size={18}/></div>
                        <h5 className="fw-bold mb-0">{currentSkill.skillId ? 'Cập nhật kỹ năng' : 'Thêm kỹ năng mới'}</h5>
                    </div>
                    <Form.Group className="mb-4">
                        <Form.Label className="x-small  uppercase-tracking">Tên hiển thị</Form.Label>
                        <Form.Control 
                            className="bg-dark-input text-white border-0 py-2 shadow-none" 
                            placeholder="Ví dụ: React Native, Docker..."
                            value={currentSkill.skillName} 
                            onChange={e=>setCurrentSkill({...currentSkill, skillName:e.target.value})}
                        />
                    </Form.Group>
                    <div className="d-flex justify-content-end gap-2 pt-2">
                        <Button variant="link" className="text-white x-small text-decoration-none" onClick={()=>setShowSkillModal(false)}>HỦY BỎ</Button>
                        <Button variant="primary" className="x-small px-4 fw-bold rounded-3 shadow-glow" onClick={handleSave}>LƯU DỮ LIỆU</Button>
                    </div>
                </Modal.Body>
            </Modal>

            {/* 4. MODAL: MERGE */}
            <Modal show={showMergeModal} onHide={()=>setShowMergeModal(false)} centered contentClassName="glass-card text-white border-0 shadow-lg">
                <Modal.Body className="p-4">
                    <div className="d-flex align-items-center gap-2 mb-2 text-info">
                        <GitMerge size={20}/>
                        <h5 className="fw-bold mb-0">Gộp kỹ năng trùng</h5>
                    </div>
                    <p className="x-small  mb-4 italic">Hệ thống sẽ chuyển toàn bộ sinh viên đang dùng "{sourceSkill?.skillName}" sang kỹ năng đích bên dưới.</p>
                    
                    <Form.Group className="mb-4">
                        <Form.Label className="x-small  uppercase-tracking">Chọn kỹ năng đích (Đã Approved)</Form.Label>
                        <Form.Select className="adm-select-sm w-100 shadow-none border-0 py-2" onChange={e=>setTargetSkillId(e.target.value)}>
                            <option value="">-- Chọn kỹ năng chuẩn --</option>
                            {allSkills.filter(s => s.skillId !== sourceSkill?.skillId).map(s => (
                                <option key={s.skillId} value={s.skillId}>{s.skillName}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                    <div className="d-flex justify-content-end gap-2 pt-2">
                        <Button variant="link" className="text-white x-small text-decoration-none" onClick={()=>setShowMergeModal(false)}>HỦY BỎ</Button>
                        <Button variant="info" className="text-white x-small px-4 fw-bold rounded-3" onClick={handleMerge}>XÁC NHẬN GỘP</Button>
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default AdminSkillManager;