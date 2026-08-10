import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Table, Badge, Form, Modal, InputGroup } from 'react-bootstrap';
import { CheckCircle, XCircle, Trash2, Edit, Plus, Search, Layers, Clock, Check, Settings, Loader2, GitMerge, RefreshCw } from 'lucide-react';
import { skillService } from '../../services/skillservice';
import PaginationBar from '../../components/PaginationBar';
import '../../CSS/AdminSkillManagement.css';

const AdminSkillManager = () => {
    // ============================================================
    // STATE
    // ============================================================

    // Danh sách kỹ năng chờ duyệt
    const [pendingSkills, setPendingSkills] = useState([]);

    // Danh sách kỹ năng đã duyệt (tất cả)
    const [allSkills, setAllSkills] = useState([]);

    // Từ khóa tìm kiếm
    const [searchTerm, setSearchTerm] = useState('');

    // Chế độ hiển thị: true = chờ duyệt, false = danh mục
    const [isPendingMode, setIsPendingMode] = useState(true);

    // Loading trang
    const [loading, setLoading] = useState(false);

    // ============================================================
    // PHÂN TRANG - CHỜ DUYỆT
    // ============================================================
    const [pendingPage, setPendingPage] = useState(1);
    const [pendingTotalPages, setPendingTotalPages] = useState(1);
    const [pendingTotalItems, setPendingTotalItems] = useState(0);

    // ============================================================
    // PHÂN TRANG - DANH MỤC
    // ============================================================
    const [allPage, setAllPage] = useState(1);
    const [allTotalPages, setAllTotalPages] = useState(1);
    const [allTotalItems, setAllTotalItems] = useState(0);

    const pageSize = 20;

    // ============================================================
    // STATE MODAL
    // ============================================================

    // Modal thêm/sửa kỹ năng
    const [showSkillModal, setShowSkillModal] = useState(false);

    // Modal gộp kỹ năng
    const [showMergeModal, setShowMergeModal] = useState(false);

    // Kỹ năng đang chỉnh sửa
    const [currentSkill, setCurrentSkill] = useState({ skillId: '', skillName: '' });

    // Kỹ năng nguồn (gộp)
    const [sourceSkill, setSourceSkill] = useState(null);

    // Kỹ năng đích (gộp)
    const [targetSkillId, setTargetSkillId] = useState('');

    // ============================================================
    // HÀM TẢI KỸ NĂNG CHỜ DUYỆT
    // ============================================================
    const fetchPending = useCallback(async function (page, keyword) {
        if (!page) page = 1;
        if (!keyword) keyword = '';

        try {
            var params = { page: page, pageSize: pageSize };
            if (keyword) params.keyword = keyword;

            var res = await skillService.getPendingSkills(params);

            if (res.success && res.data) {
                setPendingSkills(res.data.items || []);
                setPendingTotalPages(res.data.totalPages || 1);
                setPendingTotalItems(res.data.totalItems || 0);
                setPendingPage(res.data.page || 1);
            }

        } catch (err) {
            console.error("Lỗi tải chờ duyệt:", err);
        }
    }, []);

    // ============================================================
    // HÀM TẢI KỸ NĂNG ĐÃ DUYỆT
    // ============================================================
    const fetchAll = useCallback(async function (page, keyword) {
        if (!page) page = 1;
        if (!keyword) keyword = '';

        try {
            var params = { page: page, pageSize: pageSize };
            if (keyword) params.keyword = keyword;

            var res = await skillService.getApprovedSkills(params);

            if (res.success && res.data) {
                setAllSkills(res.data.items || []);
                setAllTotalPages(res.data.totalPages || 1);
                setAllTotalItems(res.data.totalItems || 0);
                setAllPage(res.data.page || 1);
            }

        } catch (err) {
            console.error("Lỗi tải danh mục:", err);
        }
    }, []);

    // ============================================================
    // HÀM TẢI TẤT CẢ DỮ LIỆU
    // ============================================================
    const fetchData = useCallback(async function () {
        setLoading(true);
        await Promise.all([fetchPending(1, searchTerm), fetchAll(1, searchTerm)]);
        setLoading(false);
    }, [fetchPending, fetchAll, searchTerm]);

    // ============================================================
    // EFFECT: Tải dữ liệu khi mount
    // ============================================================
    useEffect(function () {
        fetchData();
    }, []);

    // ============================================================
    // HÀM DUYỆT KỸ NĂNG
    // ============================================================
    const handleApprove = async function (id) {
        var confirmed = window.confirm("Xác nhận đưa kỹ năng này vào danh mục chính thức?");
        if (!confirmed) return;

        try {
            await skillService.approveSkill(id);
            fetchPending(pendingPage, searchTerm);
        } catch (err) {
            alert("Lỗi khi duyệt kỹ năng.");
        }
    };

    // ============================================================
    // HÀM TỪ CHỐI KỸ NĂNG
    // ============================================================
    const handleReject = async function (id) {
        var confirmed = window.confirm("Bạn có chắc muốn từ chối đề xuất này?");
        if (!confirmed) return;

        try {
            await skillService.rejectSkill(id);
            fetchPending(pendingPage, searchTerm);
        } catch (err) {
            alert("Lỗi khi từ chối.");
        }
    };

    // ============================================================
    // HÀM GỘP KỸ NĂNG
    // ============================================================
    const handleMerge = async function () {
        if (!targetSkillId) {
            alert("Vui lòng chọn một kỹ năng đích chuẩn!");
            return;
        }

        try {
            await skillService.mergeSkill(sourceSkill.skillId, targetSkillId);
            setShowMergeModal(false);
            setTargetSkillId('');
            fetchData();
        } catch (err) {
            alert("Lỗi khi gộp kỹ năng.");
        }
    };

    // ============================================================
    // HÀM LƯU KỸ NĂNG (THÊM/SỬA)
    // ============================================================
    const handleSave = async function () {
        if (!currentSkill.skillName.trim()) {
            alert("Tên kỹ năng không được để trống");
            return;
        }

        try {
            if (currentSkill.skillId) {
                // Cập nhật
                await skillService.updateSkill(currentSkill.skillId, currentSkill.skillName);
            } else {
                // Thêm mới
                await skillService.adminCreateSkill(currentSkill.skillName);
            }

            setShowSkillModal(false);
            fetchAll(allPage, searchTerm);

        } catch (err) {
            alert("Lỗi khi lưu dữ liệu.");
        }
    };

    // ============================================================
    // HÀM XÓA KỸ NĂNG
    // ============================================================
    const handleDelete = async function (id) {
        var confirmed = window.confirm("Xóa vĩnh viễn kỹ năng này?");
        if (!confirmed) return;

        try {
            await skillService.deleteSkill(id);
            fetchAll(allPage, searchTerm);
        } catch (err) {
            alert("Không thể xóa kỹ năng đang được sử dụng.");
        }
    };

    // ============================================================
    // HÀM TÌM KIẾM
    // ============================================================
    const handleSearch = function () {
        fetchPending(1, searchTerm);
        fetchAll(1, searchTerm);
    };

    // ============================================================
    // HÀM CHUYỂN TRANG
    // ============================================================
    const handlePendingPageChange = function (page) {
        fetchPending(page, searchTerm);
    };

    const handleAllPageChange = function (page) {
        fetchAll(page, searchTerm);
    };

    // Danh sách hiển thị tùy chế độ
    var filtered = isPendingMode ? pendingSkills : allSkills;

    return (
        <div className="adm-dashboard-content py-4 animate-fade-in text-white">
            <Container fluid>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h4 className="fw-bold mb-0">Quản lý Kỹ năng</h4>
                        <span className="x-small text-white-50 uppercase-tracking">Hệ thống & Đề xuất Sinh viên</span>
                    </div>
                    <div className="d-flex gap-2">
                        <button className="btn-icon-table text-white-50" title="Làm mới" onClick={fetchData}><RefreshCw size={16}/></button>
                    </div>
                </div>

                <Row className="g-3 mb-4">
                    <Col md={4}>
                        <Card className="glass-card border-0 p-3">
                            <div className="d-flex align-items-center">
                                <div className="adm-icon-box bg-primary bg-opacity-10 text-primary me-3"><Layers size={22}/></div>
                                <div><p className="x-small text-white-50 mb-0 uppercase-tracking">Hệ thống</p><h3 className="mb-0 fw-bold">{allTotalItems}</h3></div>
                            </div>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card className="glass-card border-0 p-3">
                            <div className="d-flex align-items-center">
                                <div className="adm-icon-box bg-warning bg-opacity-10 text-warning me-3"><Clock size={22}/></div>
                                <div><p className="x-small text-white-50 mb-0 uppercase-tracking">Chờ duyệt</p><h3 className="mb-0 text-warning fw-bold">{pendingTotalItems}</h3></div>
                            </div>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card className="glass-card border-0 p-3">
                            <div className="d-flex align-items-center">
                                <div className="adm-icon-box bg-success bg-opacity-10 text-success me-3"><Check size={22}/></div>
                                <div><p className="x-small text-white-50 mb-0 uppercase-tracking">Tổng cộng</p><h3 className="text-primary-glow mb-0 fw-bold">{allTotalItems + pendingTotalItems}</h3></div>
                            </div>
                        </Card>
                    </Col>
                </Row>

                <Card className="glass-card border-0 overflow-hidden shadow-lg">
                    <div className="p-3 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-3" style={{borderColor: 'rgba(255,255,255,0.06)'}}>
                        <div className="d-flex gap-2 bg-dark bg-opacity-50 p-1 rounded-3">
                            <button 
                                className={`post-tab-btn ${isPendingMode ? 'active' : ''}`}
                                onClick={()=>{setIsPendingMode(true); fetchPending(1, searchTerm);}}
                            >CHỜ DUYỆT ({pendingTotalItems})</button>
                            <button 
                                className={`post-tab-btn ${!isPendingMode ? 'active' : ''}`}
                                onClick={()=>{setIsPendingMode(false); fetchAll(1, searchTerm);}}
                            >DANH MỤC ({allTotalItems})</button>
                        </div>
                        <div className="d-flex gap-2">
                            <InputGroup size="sm" className="rounded" style={{width: '200px'}}>
                                <InputGroup.Text className="bg-transparent border-0 text-white-50"><Search size={14}/></InputGroup.Text>
                                <Form.Control className="bg-dark-input border-0 text-white" placeholder="Tìm..." value={searchTerm}
                                    onChange={e=>setSearchTerm(e.target.value)}
                                    onKeyDown={e=>e.key==='Enter' && handleSearch()}
                                />
                            </InputGroup>
                            <button className="btn-icon-table text-primary" title="Thêm mới" onClick={()=>{setCurrentSkill({skillId: '', skillName:''}); setShowSkillModal(true)}}><Plus size={18}/></button>
                        </div>
                    </div>

                    <div className="p-2">
                        {loading ? (
                            <div className="text-center py-5"><Loader2 className="spinner text-primary" size={40}/></div>
                        ) : (
                            <>
                            <Table responsive variant="dark" className="admin-table-clean mb-0">
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
                                                <div className="x-small text-white-50">ID: {skill.skillId?.substring(0, 8)}</div>
                                            </td>
                                            <td>
                                                <Badge className={`status-badge-sm ${skill.status==='PENDING'?'bg-warning text-dark':'bg-success'}`}>
                                                    {skill.status === 'PENDING' ? 'Chờ duyệt' : 'Đã duyệt'}
                                                </Badge>
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center gap-2">
                                                    <div className="img-placeholder-sm d-flex align-items-center justify-content-center text-primary x-small fw-bold border border-primary border-opacity-25">
                                                        {skill.createdByStudentId?.substring(0,2).toUpperCase() || 'AD'}
                                                    </div>
                                                    <span className="x-small text-white-50">{skill.createdByStudentId || 'Hệ thống'}</span>
                                                </div>
                                            </td>
                                            <td className="text-end pe-4">
                                                {isPendingMode ? (
                                                    <div className="d-flex justify-content-end gap-2">
                                                        <button className="btn-icon-table text-success" title="Duyệt" onClick={()=>handleApprove(skill.skillId)}><CheckCircle size={16}/></button>
                                                        <button className="btn-icon-table text-info" title="Gộp" onClick={()=>{setSourceSkill(skill); setShowMergeModal(true)}}><GitMerge size={16}/></button>
                                                        <button className="btn-icon-table text-danger" title="Từ chối" onClick={()=>handleReject(skill.skillId)}><XCircle size={16}/></button>
                                                    </div>
                                                ) : (
                                                    <div className="d-flex justify-content-end gap-2">
                                                        <button className="btn-icon-table text-info" title="Sửa" onClick={()=>{setCurrentSkill(skill); setShowSkillModal(true)}}><Edit size={16}/></button>
                                                        <button className="btn-icon-table text-danger" title="Xóa" onClick={()=>handleDelete(skill.skillId)}><Trash2 size={16}/></button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {!loading && filtered.length === 0 && (
                                        <tr><td colSpan="4" className="text-center py-5 text-white-50">Không tìm thấy kỹ năng nào.</td></tr>
                                    )}
                                </tbody>
                            </Table>

                            <div className="p-3 border-top" style={{borderColor: 'rgba(255,255,255,0.06)'}}>
                                <PaginationBar
                                    currentPage={isPendingMode ? pendingPage : allPage}
                                    totalPages={isPendingMode ? pendingTotalPages : allTotalPages}
                                    onPageChange={isPendingMode ? handlePendingPageChange : handleAllPageChange}
                                />
                            </div>
                            </>
                        )}
                    </div>
                </Card>
            </Container>

            <Modal show={showSkillModal} onHide={()=>setShowSkillModal(false)} centered contentClassName="glass-card text-white border-0 shadow-lg">
                <Modal.Body className="p-4">
                    <div className="d-flex align-items-center gap-2 mb-4">
                        <div className="adm-icon-box bg-primary bg-opacity-10 text-primary" style={{width: '32px', height: '32px'}}><Layers size={18}/></div>
                        <h5 className="fw-bold mb-0">{currentSkill.skillId ? 'Cập nhật kỹ năng' : 'Thêm kỹ năng mới'}</h5>
                    </div>
                    <Form.Group className="mb-4">
                        <Form.Label className="x-small text-white-50 uppercase-tracking">Tên hiển thị</Form.Label>
                        <Form.Control 
                            className="bg-dark-input text-white border-0 py-2 shadow-none" 
                            placeholder="Ví dụ: React Native, Docker..."
                            value={currentSkill.skillName} 
                            onChange={e=>setCurrentSkill({...currentSkill, skillName:e.target.value})}
                        />
                    </Form.Group>
                    <div className="d-flex justify-content-end gap-2 pt-2">
                        <button className="btn btn-link text-white text-decoration-none" onClick={()=>setShowSkillModal(false)}>HỦY</button>
                        <button className="btn btn-primary px-4 fw-bold" onClick={handleSave}>LƯU</button>
                    </div>
                </Modal.Body>
            </Modal>

            <Modal show={showMergeModal} onHide={()=>setShowMergeModal(false)} centered contentClassName="glass-card text-white border-0 shadow-lg">
                <Modal.Body className="p-4">
                    <div className="d-flex align-items-center gap-2 mb-2 text-info">
                        <GitMerge size={20}/>
                        <h5 className="fw-bold mb-0">Gộp kỹ năng trùng</h5>
                    </div>
                    <p className="x-small text-white-50 mb-4">Chuyển toàn bộ sinh viên đang dùng "{sourceSkill?.skillName}" sang kỹ năng đích.</p>
                    
                    <Form.Group className="mb-4">
                        <Form.Label className="x-small text-white-50 uppercase-tracking">Kỹ năng đích (Đã duyệt)</Form.Label>
                        <Form.Select className="bg-dark-input text-white border-0 py-2 shadow-none" onChange={e=>setTargetSkillId(e.target.value)}>
                            <option value="">-- Chọn kỹ năng chuẩn --</option>
                            {allSkills.filter(s => s.skillId !== sourceSkill?.skillId).map(s => (
                                <option key={s.skillId} value={s.skillId}>{s.skillName}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                    <div className="d-flex justify-content-end gap-2 pt-2">
                        <button className="btn btn-link text-white text-decoration-none" onClick={()=>setShowMergeModal(false)}>HỦY</button>
                        <button className="btn btn-info text-white px-4 fw-bold" onClick={handleMerge}>GỘP</button>
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default AdminSkillManager;
