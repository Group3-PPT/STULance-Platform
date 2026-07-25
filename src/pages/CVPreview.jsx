import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Spinner, Button } from 'react-bootstrap';
import {
  MapPin, Mail, Phone, GraduationCap, Award, Code2, Briefcase,
  Printer, ChevronLeft, Globe, Layers, ExternalLink
} from 'lucide-react';
import { cvService } from '../services/cvservice';
import '../CSS/CVPreview.css';

const CVPreview = () => {
  const { cvId } = useParams();
  const [cv, setCv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCv = async () => {
      setLoading(true);
      try {
        const res = await cvService.getPublicCv(cvId);
        if (res.success !== false) {
          setCv(res.data || res);
        } else {
          setError(res.message || "CV không tồn tại hoặc không công khai.");
        }
      } catch (err) {
        setError("Không thể tải CV. CV có thể đã bị ẩn hoặc không tồn tại.");
      } finally {
        setLoading(false);
      }
    };
    fetchCv();
  }, [cvId]);

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center bg-dark">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error || !cv) {
    return (
      <div className="vh-100 d-flex flex-column justify-content-center align-items-center bg-dark text-white">
        <h3 className="mb-3">CV không khả dụng</h3>
        <p className="text-white-50 mb-4">{error}</p>
        <Link to="/" className="btn btn-primary">Về trang chủ</Link>
      </div>
    );
  }

  const templateCode = cv.templateCode || 'modern';
  const skills = cv.skills || [];
  const portfolios = cv.portfolios || [];

  return (
    <div className={`cv-preview-page template-${templateCode}`}>
      <div className="cv-print-actions no-print">
        <Container>
          <div className="d-flex justify-content-between align-items-center py-3">
            <Link to="/" className="text-decoration-none text-white-50 d-flex align-items-center gap-1 small">
              <ChevronLeft size={16} /> Trang chủ
            </Link>
            <Button variant="primary" className="fw-bold px-4" onClick={handlePrint}>
              <Printer size={16} className="me-2" /> In CV
            </Button>
          </div>
        </Container>
      </div>

      <Container className="cv-paper py-5">
        <div className="cv-header mb-4">
          <div className="d-flex align-items-center gap-4 flex-wrap">
            <img
              src={cv.avatarUrl || cv.studentAvatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(cv.fullName || 'CV')}&background=0D8ABC&color=fff&size=150`}
              alt="avatar"
              className="cv-avatar"
            />
            <div className="flex-fill">
              <h1 className="cv-name fw-bold mb-1">{cv.fullName || 'Tên sinh viên'}</h1>
              {cv.desiredPosition && (
                <p className="cv-position h5 mb-2">{cv.desiredPosition}</p>
              )}
              <div className="d-flex flex-wrap gap-3 cv-contact">
                {cv.showEmail && cv.email && (
                  <span><Mail size={14} className="me-1" /> {cv.email}</span>
                )}
                {cv.showPhone && cv.phoneNumber && (
                  <span><Phone size={14} className="me-1" /> {cv.phoneNumber}</span>
                )}
                {cv.location && (
                  <span><MapPin size={14} className="me-1" /> {cv.location}</span>
                )}
                {cv.school && (
                  <span><GraduationCap size={14} className="me-1" /> {cv.school}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {cv.professionalSummary && (
          <section className="cv-section">
            <h3 className="cv-section-title">
              <Briefcase size={18} className="me-2" /> Giới thiệu
            </h3>
            <p className="cv-text" style={{ whiteSpace: 'pre-line' }}>{cv.professionalSummary}</p>
          </section>
        )}

        {skills.length > 0 && (
          <section className="cv-section">
            <h3 className="cv-section-title">
              <Code2 size={18} className="me-2" /> Kỹ năng
            </h3>
            <div className="d-flex flex-wrap gap-2">
              {skills.map((skill, i) => (
                <span key={i} className="cv-skill-tag">
                  {skill.skillName || skill.name || skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {portfolios.length > 0 && (
          <section className="cv-section">
            <h3 className="cv-section-title">
              <Layers size={18} className="me-2" /> Dự án
            </h3>
            <div className="d-grid gap-3">
              {portfolios.map((p, i) => (
                <div key={i} className="cv-project-card">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h5 className="fw-bold mb-1">{p.projectName || p.title}</h5>
                      {p.description && <p className="cv-text small mb-1">{p.description}</p>}
                      {p.technologies && (
                        <div className="d-flex flex-wrap gap-1 mt-2">
                          {(Array.isArray(p.technologies) ? p.technologies : p.technologies.split(',')).map((t, j) => (
                            <span key={j} className="cv-skill-tag x-small">{t.trim()}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    {p.url && (
                      <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-primary">
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="cv-footer mt-5 pt-3 border-top text-center">
          <p className="x-small text-white-50">
            CV được tạo trên <Link to="/" className="text-primary text-decoration-none">STULance</Link>
          </p>
        </div>
      </Container>
    </div>
  );
};

export default CVPreview;
