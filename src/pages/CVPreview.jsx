import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Spinner, Button } from 'react-bootstrap';
import {
  MapPin, Mail, Phone, GraduationCap, Code2, Briefcase,
  Printer, ChevronLeft, Globe, Layers, ExternalLink
} from 'lucide-react';
import { cvService as cvApi } from '../services/cvApiService';
import '../CSS/CVPreview.css';

function CVPreview() {
  var params = useParams();
  var cvId = params.cvId;
  var studentId = params.studentId;
  var cvState = useState(null);
  var cv = cvState[0];
  var setCv = cvState[1];
  var loadingState = useState(true);
  var loading = loadingState[0];
  var setLoading = loadingState[1];
  var errorState = useState(null);
  var error = errorState[0];
  var setError = errorState[1];

  useEffect(function fetchCvData() {
    var cancelled = false;
    async function loadCv() {
      setLoading(true);
      setError(null);
      try {
        var res = null;
        if (cvId) {
          res = await cvApi.getPublicCv(cvId);
        } else if (studentId) {
          res = await cvApi.getStudentPublicCv(studentId);
        }
        if (cancelled) return;
        if (res && res.success !== false) {
          var cvData = res.data || res;
          if (Array.isArray(cvData) && cvData.length > 0) {
            var defaultCv = cvData.find(function (c) { return c.isDefault; }) || cvData[0];
            setCv(defaultCv);
          } else {
            setCv(cvData);
          }
        } else {
          setError((res && res.message) || "CV không tồn tại hoặc không công khai.");
        }
      } catch (err) {
        if (!cancelled) {
          setError("Không thể tải CV. CV có thể đã bị ẩn hoặc không tồn tại.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadCv();
    return function cleanup() { cancelled = true; };
  }, [cvId, studentId]);

  function handlePrint() {
    window.print();
  }

  /* --- LOADING --- */
  if (loading) {
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center bg-dark">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  /* --- ERROR --- */
  if (error || !cv) {
    return (
      <div className="vh-100 d-flex flex-column justify-content-center align-items-center bg-dark text-white">
        <h3 className="mb-3">CV không khả dụng</h3>
        <p className="text-white-50 mb-4">{error}</p>
        <Link to="/" className="btn btn-primary">Về trang chủ</Link>
      </div>
    );
  }

  /* --- EXTRACT DATA --- */
  var templateCode = cv.templateCode || 'modern';
  var skills = cv.skills || [];
  var portfolios = cv.portfolios || [];
  var owner = cv.owner || {};
  var cvFullName = owner.fullName || cv.fullName || '';
  var cvEmail = owner.email || cv.email || '';
  var cvPhone = owner.phoneNumber || cv.phoneNumber || '';
  var cvLocation = owner.location || cv.location || '';
  var cvSchool = owner.school || cv.school || '';
  var cvMajor = owner.major || cv.major || '';
  var cvGpa = owner.gpa || cv.gpa || 0;
  var cvAvatar = owner.avatarUrl || cv.avatarUrl || '';
  var cvDesiredPosition = cv.desiredPosition || '';
  var cvSummary = cv.professionalSummary || '';
  var cvWebsite = cv.website || '';

  /* --- HELPER: initials --- */
  function getInitials(name) {
    if (!name) return '?';
    var parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return parts[0].charAt(0) + parts[parts.length - 1].charAt(0);
  }

  /* --- HELPER: avatar circle --- */
  function renderAvatarCircle(style) {
    var baseStyle = { width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' };
    var merged = style ? Object.assign({}, baseStyle, style) : baseStyle;
    if (cvAvatar) {
      return <img src={cvAvatar} alt="avatar" style={merged} />;
    }
    return (
      <span style={{ fontSize: '42px', fontWeight: 300, letterSpacing: '2px', color: 'white' }}>
        {getInitials(cvFullName)}
      </span>
    );
  }

  /* --- HELPER: sidebar contact --- */
  function renderSidebarContact() {
    return (
      <div style={{ width: '100%', marginBottom: '30px' }}>
        {cv.showEmail && cvEmail && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', marginBottom: '10px', color: '#e2e8f0' }}>
            <Mail size={11} style={{ color: '#fff', opacity: 0.8, flexShrink: 0 }} /> <span>{cvEmail}</span>
          </div>
        )}
        {cv.showPhone && cvPhone && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', marginBottom: '10px', color: '#e2e8f0' }}>
            <Phone size={11} style={{ color: '#fff', opacity: 0.8, flexShrink: 0 }} /> <span>{cvPhone}</span>
          </div>
        )}
        {cvLocation && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', marginBottom: '10px', color: '#e2e8f0' }}>
            <MapPin size={11} style={{ color: '#fff', opacity: 0.8, flexShrink: 0 }} /> <span>{cvLocation}</span>
          </div>
        )}
        {cvSchool && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', marginBottom: '10px', color: '#e2e8f0' }}>
            <GraduationCap size={11} style={{ color: '#fff', opacity: 0.8, flexShrink: 0 }} /> <span>{cvSchool}</span>
          </div>
        )}
        {cvWebsite && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', marginBottom: '10px', color: '#e2e8f0' }}>
            <Globe size={11} style={{ color: '#fff', opacity: 0.8, flexShrink: 0 }} /> <span>{cvWebsite}</span>
          </div>
        )}
      </div>
    );
  }

  /* --- HELPER: sidebar skills --- */
  function renderSidebarSkills(color) {
    if (skills.length === 0) return null;
    return (
      <div style={{ width: '100%', marginBottom: '25px' }}>
        <h3 style={{
          background: 'rgba(255,255,255,0.2)', padding: '5px 18px', borderRadius: '50px',
          fontSize: '11px', fontWeight: 800, display: 'inline-block', marginBottom: '15px',
          textTransform: 'uppercase', letterSpacing: '1px', color: 'white'
        }}>KỸ NĂNG</h3>
        <ul style={{ listStyle: 'none', paddingLeft: 0, fontSize: '11px', color: 'white' }}>
          {skills.map(function (s, i) {
            return <li key={i} style={{ marginBottom: '8px', lineHeight: 1.5 }}>• {s.skillName || s.name || s}</li>;
          })}
        </ul>
      </div>
    );
  }

  /* --- HELPER: sidebar education --- */
  function renderSidebarEducation() {
    if (!cvMajor && !cvGpa) return null;
    return (
      <div style={{ width: '100%', marginBottom: '25px' }}>
        <h3 style={{
          background: 'rgba(255,255,255,0.2)', padding: '5px 18px', borderRadius: '50px',
          fontSize: '11px', fontWeight: 800, display: 'inline-block', marginBottom: '15px',
          textTransform: 'uppercase', letterSpacing: '1px', color: 'white'
        }}>CHUYÊN NGÀNH</h3>
        <ul style={{ listStyle: 'none', paddingLeft: 0, fontSize: '11px', color: 'white' }}>
          {cvMajor && <li style={{ marginBottom: '8px', lineHeight: 1.5 }}>• {cvMajor}</li>}
          {cvGpa > 0 && <li style={{ marginBottom: '8px', lineHeight: 1.5 }}>• GPA: {cvGpa}</li>}
        </ul>
      </div>
    );
  }

  /* --- HELPER: main pill header --- */
  function renderMainPillHeader(text, accentColor) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <span style={{
          background: accentColor, color: 'white', padding: '4px 20px',
          borderRadius: '50px', fontWeight: 'bold', fontSize: '12px',
          textTransform: 'uppercase', whiteSpace: 'nowrap'
        }}>{text}</span>
        <div style={{ flex: 1, height: '1.5px', background: accentColor, opacity: 0.3 }}></div>
      </div>
    );
  }

  /* --- HELPER: main summary --- */
  function renderMainSummary(accentColor) {
    if (!cvSummary) return null;
    return (
      <div style={{ marginBottom: '30px' }}>
        {renderMainPillHeader('GIỚI THIỆU', accentColor)}
        <p style={{ fontSize: '11px', lineHeight: 1.8, textAlign: 'justify', color: '#444', whiteSpace: 'pre-line' }}>{cvSummary}</p>
      </div>
    );
  }

  /* --- HELPER: main portfolios --- */
  /* --- HELPER: render main portfolios section ---
     Hiển thị danh sách dự án trong phần main của CV.
     Mỗi dự án có: tên, mô tả, công nghệ, link, ngày tạo.
     accentColor: màu accent của template (dùng cho link). */
  function renderMainPortfolios(accentColor) {
    if (portfolios.length === 0) {
      return null;
    }

    /* --- Map qua từng portfolio --- */
    var portfolioItems = portfolios.map(function renderOnePortfolio(portfolio, index) {

      /* --- Parse technologies: có thể là array hoặc string phân cách bằng dấu phẩy --- */
      var rawTechnologies = portfolio.technologies || '';
      var technologyArray = [];

      if (Array.isArray(rawTechnologies)) {
        technologyArray = rawTechnologies;
      } else if (typeof rawTechnologies === 'string' && rawTechnologies.length > 0) {
        technologyArray = rawTechnologies.split(',');
      }

      /* --- Format ngày tạo: MM/YYYY --- */
      var createdAtText = '';
      if (portfolio.createdAt) {
        var createdDate = new Date(portfolio.createdAt);
        createdAtText = createdDate.toLocaleDateString('vi-VN', {
          month: '2-digit',
          year: 'numeric'
        });
      }

      /* --- Tên dự án: ưu tiên projectName, fallback title --- */
      var projectTitle = portfolio.projectName || portfolio.title || '';

      /* --- Render tech tags --- */
      var technologyTags = null;
      if (technologyArray.length > 0) {
        technologyTags = (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}>
            {technologyArray.map(function renderTechTag(techText, tagIndex) {
              var trimmedTech = techText.trim();
              return (
                <span key={tagIndex} style={{
                  fontSize: '10px',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: 'rgba(0,0,0,0.06)',
                  color: '#555',
                  border: '1px solid rgba(0,0,0,0.08)'
                }}>
                  {trimmedTech}
                </span>
              );
            })}
          </div>
        );
      }

      /* --- Render link URL --- */
      var projectLink = null;
      if (portfolio.url) {
        var linkColor = accentColor || '#3b82f6';
        projectLink = (
          <a
            href={portfolio.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: '10px',
              color: linkColor,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              marginTop: '6px'
            }}
          >
            {portfolio.url}
          </a>
        );
      }

      /* --- Render 1 portfolio item --- */
      return (
        <div key={index} style={{ marginBottom: '18px' }}>
          {/* Header: tên dự án + ngày tạo */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <strong style={{ fontSize: '12px', color: '#222' }}>
              {projectTitle}
            </strong>
            {createdAtText && (
              <span style={{ fontSize: '10px', color: '#999', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                {createdAtText}
              </span>
            )}
          </div>

          {/* Mô tả */}
          {portfolio.description && (
            <p style={{ fontSize: '11px', lineHeight: 1.8, color: '#444', whiteSpace: 'pre-wrap', marginTop: '4px' }}>
              {portfolio.description}
            </p>
          )}

          {/* Tech tags */}
          {technologyTags}

          {/* Link URL */}
          {projectLink}
        </div>
      );
    });

    /* --- Render section --- */
    return (
      <div style={{ marginBottom: '30px' }}>
        {renderMainPillHeader('DỰ ÁN', accentColor)}
        {portfolioItems}
      </div>
    );
  }

  /* ================================================================
     TEMPLATE: MODERN — Sidebar trái dark blue + Main phải trắng
     ================================================================ */
  function renderModern() {
    return (
      <div style={{ display: 'flex', minHeight: '1123px' }}>
        <div style={{ width: '38%', background: '#2c3e50', color: 'white', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '120px', height: '120px', borderRadius: '50%', border: '4px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', overflow: 'hidden' }}>
            {renderAvatarCircle()}
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px', lineHeight: 1.2, color: 'white', width: '100%' }}>{cvFullName || 'Tên sinh viên'}</h1>
          <p style={{ fontSize: '13px', textAlign: 'center', opacity: 0.8, marginBottom: '30px', color: 'white' }}>{cvDesiredPosition || 'Vị trí ứng tuyển'}</p>
          {renderSidebarContact()}
          {renderSidebarSkills()}
          {renderSidebarEducation()}
        </div>
        <div style={{ flex: 1, padding: '35px 28px', color: '#333', background: 'white' }}>
          {renderMainSummary('#446872')}
          {renderMainPortfolios('#446872')}
        </div>
      </div>
    );
  }

  /* ================================================================
     TEMPLATE: CLASSIC — Sidebar phải purple + Main trái
     ================================================================ */
  function renderClassic() {
    return (
      <div style={{ display: 'flex', minHeight: '1123px' }}>
        <div style={{ flex: 1, padding: '35px 28px', color: '#333', background: 'white', borderRight: '2px double rgba(139,92,246,0.3)' }}>
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 800, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '6px', color: '#333', fontFamily: 'Georgia, serif' }}>{cvFullName || 'Tên sinh viên'}</h1>
            <p style={{ fontSize: '13px', textAlign: 'center', marginBottom: '16px', color: '#8b5cf6', fontFamily: 'Georgia, serif' }}>{cvDesiredPosition || ''}</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', fontSize: '11px', color: '#666' }}>
              {cv.showEmail && cvEmail && <span>{cvEmail}</span>}
              {cv.showPhone && cvPhone && <span>{cvPhone}</span>}
              {cvLocation && <span>{cvLocation}</span>}
            </div>
          </div>
          {renderMainSummary('#6b21a8')}
          {renderMainPortfolios('#6b21a8')}
        </div>
        <div style={{ width: '35%', background: '#4a1d6b', color: 'white', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '120px', height: '120px', borderRadius: '8px', border: '4px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', overflow: 'hidden' }}>
            {renderAvatarCircle()}
          </div>
          <div style={{ width: '100%', marginBottom: '30px' }}>
            {cv.showEmail && cvEmail && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', marginBottom: '10px', color: '#e2e8f0' }}>
                <Mail size={11} style={{ color: '#fff', opacity: 0.8, flexShrink: 0 }} /> <span>{cvEmail}</span>
              </div>
            )}
            {cv.showPhone && cvPhone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', marginBottom: '10px', color: '#e2e8f0' }}>
                <Phone size={11} style={{ color: '#fff', opacity: 0.8, flexShrink: 0 }} /> <span>{cvPhone}</span>
              </div>
            )}
            {cvLocation && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', marginBottom: '10px', color: '#e2e8f0' }}>
                <MapPin size={11} style={{ color: '#fff', opacity: 0.8, flexShrink: 0 }} /> <span>{cvLocation}</span>
              </div>
            )}
          </div>
          {renderSidebarSkills()}
          {renderSidebarEducation()}
        </div>
      </div>
    );
  }

  /* ================================================================
     TEMPLATE: MINIMAL — Top header centered + body 2 columns
     ================================================================ */
  function renderMinimal() {
    return (
      <div style={{ minHeight: '1123px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ textAlign: 'center', padding: '32px 40px', borderBottom: '2px solid rgba(16,185,129,0.3)' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', border: '3px solid rgba(16,185,129,0.4)', margin: '0 auto 16px', overflow: 'hidden', background: 'rgba(16,185,129,0.1)' }}>
            {renderAvatarCircle()}
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '6px', color: '#333' }}>{cvFullName || 'Tên sinh viên'}</h1>
          <p style={{ fontSize: '13px', color: '#10b981', fontWeight: 400, letterSpacing: '1px', marginBottom: '12px' }}>{cvDesiredPosition || ''}</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', fontSize: '11px', color: '#666' }}>
            {cv.showEmail && cvEmail && <span>{cvEmail}</span>}
            {cv.showPhone && cvPhone && <span>{cvPhone}</span>}
            {cvLocation && <span>{cvLocation}</span>}
            {cvSchool && <span>{cvSchool}</span>}
          </div>
        </div>
        <div style={{ display: 'flex', flex: 1, padding: '24px 40px', gap: '32px' }}>
          <div style={{ flex: 1, color: '#333', background: 'white' }}>
            {renderMainSummary('#059669')}
            {renderMainPortfolios('#059669')}
          </div>
          <div style={{ width: '220px' }}>
            {cvSchool && (
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '10px', letterSpacing: '3px', color: '#10b981', borderBottom: '1px solid rgba(16,185,129,0.2)', paddingBottom: '6px', marginBottom: '10px', textTransform: 'uppercase', fontWeight: 700 }}>Học vấn</h3>
                <div style={{ fontSize: '11px', color: '#444' }}>
                  <div style={{ fontWeight: 700 }}>{cvSchool}</div>
                  {cvMajor && <div>{cvMajor}</div>}
                  {cvGpa > 0 && <div>GPA: {cvGpa}</div>}
                </div>
              </div>
            )}
            {skills.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '10px', letterSpacing: '3px', color: '#10b981', borderBottom: '1px solid rgba(16,185,129,0.2)', paddingBottom: '6px', marginBottom: '10px', textTransform: 'uppercase', fontWeight: 700 }}>Kỹ năng</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {skills.map(function (s, i) {
                    return <span key={i} style={{ fontSize: '10px', padding: '3px 10px', borderRadius: '3px', background: 'rgba(16,185,129,0.08)', color: '#10b981', border: '1px solid rgba(16,185,129,0.15)' }}>{s.skillName || s.name || s}</span>;
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ================================================================
     TEMPLATE: CREATIVE — Sidebar trái gradient + Main phải
     ================================================================ */
  function renderCreative() {
    return (
      <div style={{ display: 'flex', minHeight: '1123px', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ width: '38%', background: 'linear-gradient(180deg, #3d2e0f 0%, #1a1205 100%)', color: 'white', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '120px', height: '120px', borderRadius: '20px', border: '3px solid rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', overflow: 'hidden' }}>
            {renderAvatarCircle({ borderRadius: '17px' })}
          </div>
          <h1 style={{ fontSize: '18px', fontWeight: 800, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px', lineHeight: 1.2, background: 'linear-gradient(135deg, #f59e0b, #ef4444)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{cvFullName || 'Tên sinh viên'}</h1>
          <p style={{ fontSize: '13px', textAlign: 'center', opacity: 0.8, marginBottom: '30px', color: '#f59e0b' }}>{cvDesiredPosition || ''}</p>
          <div style={{ width: '100%', marginBottom: '30px' }}>
            {cv.showEmail && cvEmail && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', marginBottom: '10px', color: '#e2e8f0' }}>
                <Mail size={11} style={{ color: '#f59e0b', flexShrink: 0 }} /> <span>{cvEmail}</span>
              </div>
            )}
            {cv.showPhone && cvPhone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', marginBottom: '10px', color: '#e2e8f0' }}>
                <Phone size={11} style={{ color: '#f59e0b', flexShrink: 0 }} /> <span>{cvPhone}</span>
              </div>
            )}
            {cvLocation && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', marginBottom: '10px', color: '#e2e8f0' }}>
                <MapPin size={11} style={{ color: '#f59e0b', flexShrink: 0 }} /> <span>{cvLocation}</span>
              </div>
            )}
            {cvSchool && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', marginBottom: '10px', color: '#e2e8f0' }}>
                <GraduationCap size={11} style={{ color: '#f59e0b', flexShrink: 0 }} /> <span>{cvSchool}</span>
              </div>
            )}
          </div>
          {skills.length > 0 && (
            <div style={{ width: '100%', marginBottom: '25px' }}>
              <h3 style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: '#f59e0b', marginBottom: '12px' }}>KỸ NĂNG</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {skills.map(function (s, i) {
                  return <span key={i} style={{ fontSize: '10px', padding: '4px 12px', borderRadius: '8px', background: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.2)' }}>{s.skillName || s.name || s}</span>;
                })}
              </div>
            </div>
          )}
          {cvMajor && (
            <div style={{ width: '100%', marginBottom: '25px' }}>
              <h3 style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: '#f59e0b', marginBottom: '12px' }}>CHUYÊN NGÀNH</h3>
              <ul style={{ listStyle: 'none', paddingLeft: 0, fontSize: '11px', color: 'white' }}>
                <li style={{ marginBottom: '8px', lineHeight: 1.5 }}>• {cvMajor}</li>
                {cvGpa > 0 && <li style={{ marginBottom: '8px', lineHeight: 1.5 }}>• GPA: {cvGpa}</li>}
              </ul>
            </div>
          )}
        </div>
        <div style={{ flex: 1, padding: '35px 28px', color: '#333', background: 'white' }}>
          {renderMainSummary('#d97706')}
          {renderMainPortfolios('#d97706')}
        </div>
      </div>
    );
  }

  /* --- RENDER BY TEMPLATE --- */
  function renderByTemplate() {
    switch (templateCode) {
      case 'classic': return renderClassic();
      case 'minimal': return renderMinimal();
      case 'creative': return renderCreative();
      case 'modern':
      default: return renderModern();
    }
  }

  return (
    <div className="cv-preview-page">
      <div className="cv-print-actions no-print">
        <Container>
          <div className="d-flex justify-content-between align-items-center py-3">
            <Link to="/" className="text-decoration-none text-white-50 d-flex align-items-center gap-1 small">
              <ChevronLeft size={16} /> Trang chủ
            </Link>
            <div className="d-flex align-items-center gap-2">
              <span className="text-white-50 small me-2">Template: <strong className="text-white">{templateCode}</strong></span>
              <Button variant="primary" className="fw-bold px-4" onClick={handlePrint}>
                <Printer size={16} className="me-2" /> In CV
              </Button>
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-4">
        <div style={{ maxWidth: '794px', margin: '0 auto', background: 'white', boxShadow: '0 0 40px rgba(0,0,0,0.4)', borderRadius: '4px', overflow: 'hidden' }}>
          {renderByTemplate()}
        </div>

        <div className="mt-4 pt-3 border-top text-center">
          <p className="x-small text-white-50">
            CV được tạo trên <Link to="/" className="text-primary text-decoration-none">STULance</Link>
          </p>
        </div>
      </Container>
    </div>
  );
}

export default CVPreview;