import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, InputGroup, Modal } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import {
  Mail, Phone, MapPin, Plus, Trash2, Printer,
  Wand2, Calendar, CheckCircle, GraduationCap, Briefcase, Star, Save, Edit2, ChevronLeft,
  Brain, Sparkles, FileText, Target, Lightbulb, Loader2, Copy, Check, X, History, Award, Heart
} from 'lucide-react';
import { scoreMyCV, improveMyCV, suggestImprovements, generateObjective, getCvHistory, saveCvHistory } from '../services/cvService';
import '../CSS/CVMaker.css';

const EMPTY_CV = {
  id: null,
  cvTitle: '',
  name: '',
  title: '',
  phone: '',
  birthday: '',
  email: '',
  address: '',
  objective: '',
  skills: '',
  hobbies: '',
  education: { school: '', time: '', major: '', detail: '' },
  experience: [],
  certificates: [],
  projects: []
};

const CVMaker = () => {
  const navigate = useNavigate();

  const [cv, setCv] = useState(() => {
    const saved = localStorage.getItem('stulance_cv_current');
    return saved ? JSON.parse(saved) : EMPTY_CV;
  });

  const [aiModal, setAiModal] = useState({ show: false, title: '', content: '', loading: false, type: '' });
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    localStorage.setItem('stulance_cv_current', JSON.stringify(cv));
  }, [cv]);

  const handleSaveCV = () => {
    if (!cv.name.trim()) {
      alert("Vui lòng nhập họ tên!");
      return;
    }
    const toSave = { ...cv, id: cv.id || Date.now(), savedAt: new Date().toISOString() };
    saveCvHistory(toSave);
    setCv(prev => ({ ...prev, id: toSave.id }));
    alert(`Đã lưu CV: "${cv.cvTitle || cv.name}"`);
  };

  const handleLoadFromHistory = (item) => {
    setCv(item);
    setShowHistory(false);
  };

  const handleNewCV = () => {
    if (window.confirm('Tạo CV mới? CV hiện tại sẽ được lưu vào lịch sử.')) {
      if (cv.name) saveCvHistory(cv);
      setCv(EMPTY_CV);
    }
  };

  const openAiModal = async (type) => {
    const loadingTitles = {
      score: '🔍 Đang phân tích CV...',
      improve: '✨ Đang tối ưu CV...',
      suggest: '💡 Đang tạo gợi ý...',
      objective: '🎯 Đang viết mục tiêu...'
    };

    setAiModal({ show: true, title: loadingTitles[type], content: '', loading: true, type });

    try {
      let result;
      switch (type) {
        case 'score':
          result = await scoreMyCV(cv);
          break;
        case 'improve':
          result = await improveMyCV(cv);
          if (result.success && result.data) {
            setAiModal(prev => ({ ...prev, content: result.raw, loading: false, title: '✨ CV đã tối ưu - Áp dụng?', type: 'improve-result', improveData: result.data }));
            return;
          }
          break;
        case 'suggest':
          result = await suggestImprovements(cv);
          break;
        case 'objective':
          result = await generateObjective(cv);
          if (result.success && result.data) {
            setAiModal(prev => ({ ...prev, content: result.raw, loading: false, title: '🎯 Chọn mục tiêu', type: 'objective-result', objectiveData: result.data }));
            return;
          }
          break;
        default: return;
      }
      setAiModal(prev => ({ ...prev, content: result.raw || result, loading: false }));
    } catch (err) {
      setAiModal(prev => ({ ...prev, content: `❌ Lỗi: ${err.message}\n\nVui lòng thử lại.`, loading: false }));
    }
  };

  const applyImprovements = (data) => {
    setCv(prev => ({
      ...prev,
      objective: data.objective || prev.objective,
      skills: Array.isArray(data.skills) ? data.skills.join('\n') : (data.skills || prev.skills),
      experience: data.experience || prev.experience,
      projects: data.projects || prev.projects
    }));
    setAiModal({ show: false, title: '', content: '', loading: false, type: '' });
  };

  const applyObjective = (text) => {
    setCv(prev => ({ ...prev, objective: text }));
    setAiModal({ show: false, title: '', content: '', loading: false, type: '' });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(aiModal.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateList = (key, index, field, value) => {
    let newArr = [...cv[key]];
    newArr[index][field] = value;
    setCv({ ...cv, [key]: newArr });
  };

  const addListItem = (key, defaultObj) => {
    setCv({ ...cv, [key]: [...cv[key], { ...defaultObj, id: Date.now() }] });
  };

  const removeListItem = (key, id) => {
    setCv({ ...cv, [key]: cv[key].filter(item => item.id !== id) });
  };

  return (
    <Container className="cv-maker-page py-4">
      {/* TOOLBAR */}
      <div className="glass-card p-3 mb-4 border-primary-glow animate-fade-in">
        <Row className="align-items-center">
          <Col md={1}>
            <Link to="/dashboardlancer" className="text-white-50"><ChevronLeft size={24} /></Link>
          </Col>
          <Col md={4}>
            <InputGroup className="cv-name-input-group">
              <InputGroup.Text className="bg-transparent border-0 text-primary"><Edit2 size={16} /></InputGroup.Text>
              <Form.Control
                className="bg-transparent border-0 text-white fw-bold h5 mb-0"
                placeholder="Tên CV..."
                value={cv.cvTitle}
                onChange={(e) => setCv({ ...cv, cvTitle: e.target.value })}
              />
            </InputGroup>
          </Col>
          <Col md={7} className="text-md-end mt-3 mt-md-0">
            <div className="d-flex gap-2 justify-content-md-end flex-wrap">
              <Button variant="outline-info" size="sm" onClick={() => { setHistory(getCvHistory()); setShowHistory(true); }}>
                <History size={15} className="me-1" /> Lịch sử
              </Button>
              <Button variant="outline-warning" size="sm" onClick={handleNewCV}>
                <Plus size={15} className="me-1" /> Mới
              </Button>
              <Button variant="outline-primary" size="sm" onClick={handleSaveCV}>
                <Save size={15} className="me-1" /> Lưu
              </Button>
              <Button variant="primary" size="sm" onClick={() => window.print()}>
                <Printer size={15} className="me-1" /> PDF
              </Button>
            </div>
          </Col>
        </Row>
      </div>

      <Row className="g-4">
        {/* EDITOR */}
        <Col lg={5} className="editor-column custom-scrollbar">
          <div className="glass-card p-4">
            <h5 className="text-primary mb-3 border-bottom border-secondary pb-2">1. Thông tin cá nhân</h5>
            <Row>
              <Col md={6}><Form.Group className="mb-3"><Form.Label className="x-small fw-bold">HỌ VÀ TÊN</Form.Label><input type="text" className="form-control bg-dark-input text-white" value={cv.name} onChange={(e) => setCv({ ...cv, name: e.target.value })} /></Form.Group></Col>
              <Col md={6}><Form.Group className="mb-3"><Form.Label className="x-small fw-bold">VỊ TRÍ ỨNG TUYỂN</Form.Label><input type="text" className="form-control bg-dark-input text-white" value={cv.title} onChange={(e) => setCv({ ...cv, title: e.target.value })} /></Form.Group></Col>
            </Row>
            <Row>
              <Col md={6}><Form.Group className="mb-3"><Form.Label className="x-small fw-bold">EMAIL</Form.Label><input type="email" className="form-control bg-dark-input text-white" value={cv.email} onChange={(e) => setCv({ ...cv, email: e.target.value })} /></Form.Group></Col>
              <Col md={6}><Form.Group className="mb-3"><Form.Label className="x-small fw-bold">SỐ ĐIỆN THOẠI</Form.Label><input type="text" className="form-control bg-dark-input text-white" value={cv.phone} onChange={(e) => setCv({ ...cv, phone: e.target.value })} /></Form.Group></Col>
            </Row>
            <Row>
              <Col md={6}><Form.Group className="mb-3"><Form.Label className="x-small fw-bold">NGÀY SINH</Form.Label><input type="text" className="form-control bg-dark-input text-white" value={cv.birthday} onChange={(e) => setCv({ ...cv, birthday: e.target.value })} /></Form.Group></Col>
              <Col md={6}><Form.Group className="mb-3"><Form.Label className="x-small fw-bold">ĐỊA CHỈ</Form.Label><input type="text" className="form-control bg-dark-input text-white" value={cv.address} onChange={(e) => setCv({ ...cv, address: e.target.value })} /></Form.Group></Col>
            </Row>

            <h5 className="text-primary mt-4 mb-3 border-bottom border-secondary pb-2 d-flex justify-content-between align-items-center">
              2. Mục tiêu nghề nghiệp
              <Button variant="link" className="p-0 text-warning" onClick={() => openAiModal('objective')} title="AI Viết mục tiêu">
                <Wand2 size={16} />
              </Button>
            </h5>
            <textarea className="form-control bg-dark-input text-white" rows={3} value={cv.objective} onChange={(e) => setCv({ ...cv, objective: e.target.value })} />

            <h5 className="text-primary mt-4 mb-3 border-bottom border-secondary pb-2 d-flex justify-content-between">
              3. Học vấn
            </h5>
            <Row>
              <Col md={8}><input className="form-control bg-dark-input text-white mb-2" placeholder="Trường" value={cv.education.school} onChange={(e) => setCv({ ...cv, education: { ...cv.education, school: e.target.value } })} /></Col>
              <Col md={4}><input className="form-control bg-dark-input text-white mb-2" placeholder="Năm" value={cv.education.time} onChange={(e) => setCv({ ...cv, education: { ...cv.education, time: e.target.value } })} /></Col>
            </Row>
            <input className="form-control bg-dark-input text-white mb-2" placeholder="Chuyên ngành" value={cv.education.major} onChange={(e) => setCv({ ...cv, education: { ...cv.education, major: e.target.value } })} />
            <input className="form-control bg-dark-input text-white mb-2" placeholder="Thành tích" value={cv.education.detail} onChange={(e) => setCv({ ...cv, education: { ...cv.education, detail: e.target.value } })} />

            <h5 className="text-primary mt-4 mb-3 border-bottom border-secondary pb-2 d-flex justify-content-between">
              4. Kinh nghiệm
              <Button variant="link" className="p-0" onClick={() => addListItem('experience', { role: '', company: '', time: '', desc: '' })}><Plus size={18} /></Button>
            </h5>
            {cv.experience.map((exp, i) => (
              <div key={exp.id} className="border border-secondary p-3 rounded mb-2 position-relative bg-white-5">
                <Trash2 size={14} className="text-danger position-absolute top-0 end-0 m-2 pointer" onClick={() => removeListItem('experience', exp.id)} />
                <input className="bg-transparent text-white border-0 w-100 fw-bold mb-1" placeholder="Vị trí" value={exp.role} onChange={(e) => updateList('experience', i, 'role', e.target.value)} />
                <input className="bg-transparent text-white-50 border-0 w-100 x-small mb-1" placeholder="Công ty" value={exp.company} onChange={(e) => updateList('experience', i, 'company', e.target.value)} />
                <input className="bg-transparent text-white-50 border-0 w-100 x-small mb-1" placeholder="Thời gian" value={exp.time} onChange={(e) => updateList('experience', i, 'time', e.target.value)} />
                <textarea className="bg-transparent text-white-50 border-0 w-100 x-small" placeholder="Mô tả công việc" rows={2} value={exp.desc} onChange={(e) => updateList('experience', i, 'desc', e.target.value)} />
              </div>
            ))}

            <h5 className="text-primary mt-4 mb-3 border-bottom border-secondary pb-2 d-flex justify-content-between">
              5. Dự án
              <Button variant="link" className="p-0" onClick={() => addListItem('projects', { name: '', role: '', time: '', desc: '' })}><Plus size={18} /></Button>
            </h5>
            {cv.projects.map((p, i) => (
              <div key={p.id} className="border border-secondary p-3 rounded mb-2 position-relative bg-white-5">
                <Trash2 size={14} className="text-danger position-absolute top-0 end-0 m-2 pointer" onClick={() => removeListItem('projects', p.id)} />
                <input className="bg-transparent text-white border-0 w-100 fw-bold mb-1" placeholder="Tên dự án" value={p.name} onChange={(e) => updateList('projects', i, 'name', e.target.value)} />
                <Row>
                  <Col md={6}><input className="bg-transparent text-white-50 border-0 w-100 x-small" placeholder="Vai trò" value={p.role} onChange={(e) => updateList('projects', i, 'role', e.target.value)} /></Col>
                  <Col md={6}><input className="bg-transparent text-white-50 border-0 w-100 x-small" placeholder="Thời gian" value={p.time} onChange={(e) => updateList('projects', i, 'time', e.target.value)} /></Col>
                </Row>
                <textarea className="bg-transparent text-white-50 border-0 w-100 x-small" placeholder="Mô tả" rows={2} value={p.desc} onChange={(e) => updateList('projects', i, 'desc', e.target.value)} />
              </div>
            ))}

            <h5 className="text-primary mt-4 mb-3 border-bottom border-secondary pb-2">6. Kỹ năng (mỗi dòng 1 mục)</h5>
            <textarea className="form-control bg-dark-input text-white" rows={4} placeholder="React.js\nNode.js\nFigma\nGit..." value={cv.skills} onChange={(e) => setCv({ ...cv, skills: e.target.value })} />

            <h5 className="text-primary mt-4 mb-3 border-bottom border-secondary pb-2">7. Chứng chỉ</h5>
            {cv.certificates.map((c, i) => (
              <div key={c.id} className="border border-secondary p-2 rounded mb-2 position-relative bg-white-5 d-flex gap-2">
                <Trash2 size={14} className="text-danger position-absolute top-0 end-0 m-2 pointer" onClick={() => removeListItem('certificates', c.id)} />
                <input className="bg-transparent text-white border-0 flex-grow-1 x-small" placeholder="Tên chứng chỉ" value={c.name} onChange={(e) => updateList('certificates', i, 'name', e.target.value)} />
                <input className="bg-transparent text-white-50 border-0 x-small" style={{ width: 80 }} placeholder="Năm" value={c.time} onChange={(e) => updateList('certificates', i, 'time', e.target.value)} />
              </div>
            ))}
            <Button variant="link" className="p-0 x-small" onClick={() => addListItem('certificates', { name: '', time: '' })}><Plus size={14} /> Thêm chứng chỉ</Button>

            <h5 className="text-primary mt-4 mb-3 border-bottom border-secondary pb-2">8. Sở thích</h5>
            <textarea className="form-control bg-dark-input text-white" rows={2} placeholder="Đọc sách\nChạy bộ..." value={cv.hobbies} onChange={(e) => setCv({ ...cv, hobbies: e.target.value })} />
          </div>
        </Col>

        {/* PREVIEW + AI PANEL */}
        <Col lg={7}>
          {/* AI TOOLS - Compact horizontal bar */}
          <div className="ai-compact-bar mb-3">
            <div className="d-flex align-items-center gap-2 me-3">
              <Brain size={18} className="text-primary-glow" />
              <span className="fw-bold text-white small d-none d-sm-inline">STU AI</span>
            </div>
            <div className="d-flex gap-2 flex-wrap">
              <button className="ai-pill" onClick={() => openAiModal('score')} disabled={aiModal.loading}>
                <FileText size={13} /> Chấm điểm
              </button>
              <button className="ai-pill ai-pill-improve" onClick={() => openAiModal('improve')} disabled={aiModal.loading}>
                <Wand2 size={13} /> Tối ưu CV
              </button>
              <button className="ai-pill ai-pill-suggest" onClick={() => openAiModal('suggest')} disabled={aiModal.loading}>
                <Lightbulb size={13} /> Gợi ý
              </button>
              <button className="ai-pill ai-pill-objective" onClick={() => openAiModal('objective')} disabled={aiModal.loading}>
                <Target size={13} /> Mục tiêu
              </button>
            </div>
          </div>

          {/* CV PREVIEW */}
          <div className="a4-document shadow-2xl" id="cv-print">
            <div className="cv-sidebar-box">
              <div className="cv-avatar-circle">
                <span className="avatar-initials">{cv.name ? cv.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '?'}</span>
              </div>
              <h1 className="cv-name-text">{cv.name || 'Họ và tên'}</h1>
              <p className="cv-role-text">{cv.title || 'Vị trí ứng tuyển'}</p>
              <div className="cv-contact-section">
                {cv.phone && <div className="cv-contact-item"><Phone size={11} /> <span>{cv.phone}</span></div>}
                {cv.email && <div className="cv-contact-item"><Mail size={11} /> <span>{cv.email}</span></div>}
                {cv.address && <div className="cv-contact-item"><MapPin size={11} /> <span>{cv.address}</span></div>}
              </div>
              {cv.skills && (
                <div className="cv-sidebar-section">
                  <h3 className="sidebar-pill">KỸ NĂNG</h3>
                  <ul className="sidebar-list">
                    {cv.skills.split('\n').filter(s => s.trim()).map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}
              {cv.education.school && (
                <div className="cv-sidebar-section">
                  <h3 className="sidebar-pill">HỌC VẤN</h3>
                  <div className="sidebar-edu">
                    <p className="edu-school">{cv.education.school}</p>
                    <p className="edu-time">{cv.education.time}</p>
                    <p className="edu-major">{cv.education.major}</p>
                    {cv.education.detail && <p className="edu-detail">{cv.education.detail}</p>}
                  </div>
                </div>
              )}
              {cv.hobbies && (
                <div className="cv-sidebar-section">
                  <h3 className="sidebar-pill">SỞ THÍCH</h3>
                  <ul className="sidebar-list">
                    {cv.hobbies.split('\n').filter(h => h.trim()).map((h, i) => <li key={i}>{h}</li>)}
                  </ul>
                </div>
              )}
            </div>

            <div className="cv-main-box">
              {cv.objective && (
                <div className="cv-main-section">
                  <div className="main-pill-header"><span>MỤC TIÊU</span><div className="pill-line"></div></div>
                  <p className="main-text-content">{cv.objective}</p>
                </div>
              )}

              {cv.experience.length > 0 && (
                <div className="cv-main-section">
                  <div className="main-pill-header"><span>KINH NGHIỆM</span><div className="pill-line"></div></div>
                  {cv.experience.map(exp => (
                    <div key={exp.id} className="exp-item-box">
                      <div className="d-flex justify-content-between"><strong>{exp.role}</strong><span className="x-small opacity-50">{exp.time}</span></div>
                      <p className="cv-accent-text x-small">{exp.company}</p>
                      <p className="main-text-content x-small" style={{ whiteSpace: 'pre-wrap' }}>{exp.desc}</p>
                    </div>
                  ))}
                </div>
              )}

              {cv.projects.length > 0 && (
                <div className="cv-main-section">
                  <div className="main-pill-header"><span>DỰ ÁN</span><div className="pill-line"></div></div>
                  {cv.projects.map(p => (
                    <div key={p.id} className="exp-item-box">
                      <div className="d-flex justify-content-between"><strong>{p.name}</strong><span className="x-small opacity-50">{p.time}</span></div>
                      <p className="cv-accent-text x-small">{p.role}</p>
                      <p className="main-text-content x-small" style={{ whiteSpace: 'pre-wrap' }}>{p.desc}</p>
                    </div>
                  ))}
                </div>
              )}

              {cv.certificates.length > 0 && (
                <div className="cv-main-section">
                  <div className="main-pill-header"><span>CHỨNG CHỈ</span><div className="pill-line"></div></div>
                  {cv.certificates.map(c => (
                    <div key={c.id} className="d-flex justify-content-between align-items-center py-1">
                      <span className="x-small fw-bold">{c.name}</span>
                      <span className="x-small opacity-50">{c.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Col>
      </Row>

      {/* AI RESULT MODAL */}
      <Modal show={aiModal.show} onHide={() => setAiModal({ show: false, title: '', content: '', loading: false, type: '' })} size="lg" centered className="cv-ai-modal">
        <Modal.Header className="cv-ai-header">
          <Modal.Title className="d-flex align-items-center gap-2 text-white">
            <Brain size={20} className="text-primary-glow" />
            {aiModal.title}
          </Modal.Title>
          <Button variant="link" className="text-white-50" onClick={() => setAiModal({ show: false, title: '', content: '', loading: false, type: '' })}>
            <X size={20} />
          </Button>
        </Modal.Header>
        <Modal.Body className="cv-ai-body">
          {aiModal.loading ? (
            <div className="text-center py-5">
              <Loader2 size={40} className="spinner text-primary mb-3" />
              <p className="text-white-50">{aiModal.title}</p>
              <p className="x-small text-white-50">Google Gemini AI đang phân tích CV của bạn...</p>
            </div>
          ) : (
            <div className="cv-ai-content">
              {aiModal.type === 'improve-result' && aiModal.improveData ? (
                <div>
                  <div className="ai-preview-box mb-3">
                    {aiModal.improveData.objective && (
                      <div className="mb-3">
                        <h6 className="text-primary">Mục tiêu mới:</h6>
                        <p className="text-white small">{aiModal.improveData.objective}</p>
                      </div>
                    )}
                    {aiModal.improveData.skills && (
                      <div className="mb-3">
                        <h6 className="text-primary">Kỹ năng:</h6>
                        <p className="text-white small">{Array.isArray(aiModal.improveData.skills) ? aiModal.improveData.skills.join(', ') : aiModal.improveData.skills}</p>
                      </div>
                    )}
                    {aiModal.improveData.experience?.length > 0 && (
                      <div className="mb-3">
                        <h6 className="text-primary">Kinh nghiệm:</h6>
                        {aiModal.improveData.experience.map((e, i) => (
                          <div key={i} className="text-white small mb-1">• {e.role} - {e.company}</div>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button className="w-100 ai-apply-btn" onClick={() => applyImprovements(aiModal.improveData)}>
                    <CheckCircle size={16} /> Áp dụng tất cả thay đổi
                  </Button>
                </div>
              ) : aiModal.type === 'objective-result' && aiModal.objectiveData ? (
                <div className="d-grid gap-3">
                  {Object.entries(aiModal.objectiveData).map(([key, text]) => (
                    <div key={key} className="objective-option p-3 rounded" onClick={() => applyObjective(text)}>
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="badge bg-primary text-white">{key === 'short' ? 'Ngắn' : key === 'medium' ? 'Trung bình' : 'Chi tiết'}</span>
                        <CheckCircle size={16} className="text-white-50" />
                      </div>
                      <p className="text-white small mb-0">{text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="position-relative">
                  <Button size="sm" variant="outline-light" className="position-absolute top-0 end-0 m-2" onClick={handleCopy}>
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                  </Button>
                  <pre className="cv-ai-output text-white small" style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{aiModal.content}</pre>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* HISTORY MODAL */}
      <Modal show={showHistory} onHide={() => setShowHistory(false)} centered className="cv-history-modal">
        <Modal.Header className="cv-ai-header">
          <Modal.Title className="d-flex align-items-center gap-2 text-white"><History size={18} /> Lịch sử CV</Modal.Title>
          <Button variant="link" className="text-white-50" onClick={() => setShowHistory(false)}><X size={20} /></Button>
        </Modal.Header>
        <Modal.Body className="cv-ai-body">
          {history.length === 0 ? (
            <p className="text-white-50 text-center py-4">Chưa có CV nào được lưu</p>
          ) : (
            <div className="d-grid gap-2">
              {history.map((item) => (
                <div key={item.id} className="history-item p-3 rounded d-flex justify-content-between align-items-center" onClick={() => handleLoadFromHistory(item)}>
                  <div>
                    <p className="text-white fw-bold mb-0">{item.cvTitle || item.name}</p>
                    <p className="x-small text-white-50 mb-0">{item.title || 'Chưa có vị trí'} • {item.savedAt ? new Date(item.savedAt).toLocaleDateString('vi-VN') : ''}</p>
                  </div>
                  <Button size="sm" variant="outline-primary">Tải</Button>
                </div>
              ))}
            </div>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default CVMaker;
