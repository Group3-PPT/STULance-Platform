import React, { useState, useEffect, useRef } from 'react';
import { Badge, Form, ListGroup, InputGroup, Button, Spinner } from 'react-bootstrap';
import { Search, Plus, XCircle, Loader2, Info } from 'lucide-react';
import { studentService } from '../../services/studentservice';
import { skillService } from '../../services/skillservice';
import { unwrapList } from '../services/responseUtils';

const SkillManager = () => {
  const [mySkills, setMySkills] = useState([]); // Kỹ năng hiện tại của SV
  const [systemSkills, setSystemSkills] = useState([]); // Danh mục kỹ năng hệ thống (Approved)
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const dropdownRef = useRef(null);

  // 1. Tải dữ liệu ban đầu
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [myRes, sysRes] = await Promise.all([
          studentService.getMySkills(),
          skillService.getApprovedSkills()
        ]);
        setMySkills(unwrapList(myRes));
        setSystemSkills(unwrapList(sysRes));
      } catch (err) {
        console.error("Lỗi tải kỹ năng");
      }
    };
    fetchData();
  }, []);

  // 2. Xử lý Thêm Skill từ danh mục hệ thống (Chỉ ở Local)
  const handleSelectSkill = (skill) => {
    if (!mySkills.find(s => s.skillId === skill.skillId)) {
      setMySkills([...mySkills, skill]);
    }
    setSearchTerm('');
    setShowDropdown(false);
  };

  // 3. Xử lý Đề xuất Skill mới (Gọi API POST ngay lập tức)
  const handleSuggest = async () => {
    if (!searchTerm.trim()) return;
    try {
      const res = await studentService.suggestSkill(searchTerm.trim());
      // Backend tự động gắn skill PENDING vào SV, nên ta cập nhật UI luôn
      setMySkills([...mySkills, res.data]);
      setSearchTerm('');
      setShowDropdown(false);
      alert("Đã đề xuất kỹ năng mới thành công!");
    } catch (err) {
      alert("Kỹ năng này đã tồn tại hoặc bị từ chối.");
    }
  };

  // 4. Xóa Skill khỏi danh sách local
  const removeSkill = (skillId) => {
    setMySkills(mySkills.filter(s => s.skillId !== skillId));
  };

  // 5. LƯU TỔNG THỂ (Lưu các skill APPROVED đã chọn)
  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      // THEO QUY TẮC 4.2: Chỉ gửi mảng ID của các skill APPROVED
      const approvedSkillIds = mySkills
        .filter(s => s.status === 'APPROVED')
        .map(s => s.skillId);

      await studentService.updateMySkills(approvedSkillIds);
      alert("Đã cập nhật danh sách kỹ năng!");
    } catch (err) {
      alert("Lỗi khi lưu: " + (err.response?.data?.message || "Yêu cầu không hợp lệ"));
    } finally {
      setIsSaving(false);
    }
  };

  // Lọc gợi ý từ hệ thống
  const suggestions = systemSkills.filter(s => 
    s.skillName.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !mySkills.find(ms => ms.skillId === s.skillId)
  );

  return (
    <div className="skill-manager-box p-4 glass-card shadow-lg">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="fw-bold text-white mb-0">KỸ NĂNG CỦA TÔI</h5>
        <Button variant="primary" size="sm" onClick={handleSaveAll} disabled={isSaving}>
          {isSaving ? <Loader2 className="spinner" size={16}/> : <Save size={16} className="me-2"/>}
          LƯU KỸ NĂNG
        </Button>
      </div>

      {/* HIỂN THỊ DANH SÁCH BADGE THEO STATUS (MỤC 4.1) */}
      <div className="d-flex flex-wrap gap-2 mb-4 p-3 border-dashed-blue rounded-3 min-vh-10">
        {mySkills.length === 0 && <small className="text-muted italic">Chưa có kỹ năng nào được chọn.</small>}
        {mySkills.map((skill) => (
          <Badge 
            key={skill.skillId} 
            pill 
            className={`px-3 py-2 d-flex align-items-center gap-2 skill-badge-item 
              ${skill.status === 'APPROVED' ? 'bg-primary' : 
                skill.status === 'PENDING' ? 'bg-warning text-dark' : 
                skill.status === 'REJECTED' ? 'bg-danger' : 'bg-secondary'}`}
          >
            {skill.skillName}
            {/* Gắn nhãn trạng thái */}
            {skill.status === 'PENDING' && <span style={{fontSize: '10px'}}>(Chờ duyệt)</span>}
            {skill.status === 'REJECTED' && <span style={{fontSize: '10px'}}>(Bị từ chối)</span>}
            {skill.status === 'MERGED' && <span style={{fontSize: '10px'}}>(Đã gộp)</span>}

            {/* Chỉ cho phép xóa Skill Approved hoặc Pending ở Local */}
            <XCircle 
              size={14} 
              className="pointer hover-scale" 
              onClick={() => removeSkill(skill.skillId)} 
            />
          </Badge>
        ))}
      </div>

      {/* DROPDOWN CHỌN KỸ NĂNG (MỤC 3.1 & 4.3) */}
      <div className="position-relative" ref={dropdownRef}>
        <InputGroup className="bg-dark-input rounded overflow-hidden">
          <InputGroup.Text className="bg-transparent border-0 text-muted"><Search size={18}/></InputGroup.Text>
          <Form.Control 
            className="bg-transparent border-0 text-white x-small"
            placeholder="Tìm kỹ năng hoặc gõ để đề xuất mới..."
            value={searchTerm}
            onChange={(e) => {setSearchTerm(e.target.value); setShowDropdown(true)}}
            onFocus={() => setShowDropdown(true)}
          />
        </InputGroup>

        {showDropdown && searchTerm && (
          <ListGroup className="suggestion-dropdown shadow-lg mt-1 animate-fade-in">
            {/* Danh sách APPROVED từ hệ thống */}
            {suggestions.map(s => (
              <ListGroup.Item 
                key={s.skillId} 
                action 
                className="bg-dark text-white border-secondary small"
                onClick={() => handleSelectSkill(s)}
              >
                {s.skillName}
              </ListGroup.Item>
            ))}

            {/* Nút Đề xuất (Mục 4.3) */}
            {suggestions.length === 0 && (
              <ListGroup.Item 
                action 
                className="bg-dark text-primary fw-bold border-secondary small"
                onClick={handleSuggest}
              >
                <Plus size={16} className="me-2"/> Không tìm thấy? Đề xuất: "{searchTerm}"
              </ListGroup.Item>
            )}
          </ListGroup>
        )}
      </div>
      
      <div className="mt-3">
        <p className="x-small text-muted italic">
          <Info size={12} className="me-1"/> 
          Lưu ý: Chỉ những kỹ năng đã duyệt (Approved) mới hiển thị trên hồ sơ công khai.
        </p>
      </div>
    </div>
  );
};

export default SkillManager;