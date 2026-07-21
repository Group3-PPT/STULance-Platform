import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  PenTool, Check, ChevronLeft, ShieldCheck,
  AlertCircle, Loader2, FileText, Lock, Clock, User, CheckCircle
} from 'lucide-react';
import { contractService } from '../services/contractservice';
import { contractSignatureService } from '../services/contractsignatureservice';
import '../CSS/Contract.css';

const SignContract = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);
  const [error, setError] = useState(null);
  const [alreadySigned, setAlreadySigned] = useState(false);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const [contRes] = await Promise.allSettled([
          contractService.getContractDetail(id)
        ]);

        if (contRes.status === 'fulfilled') {
          const data = contRes.value.data || contRes.value;
          setContract(data);

          if (data.status !== 'SIGNING') {
            if (data.status === 'AWAITING_PAYMENT' || data.status === 'IN_PROGRESS' || data.status === 'COMPLETED') {
              setAlreadySigned(true);
            } else {
              setError("Hợp đồng không ở trạng thái ký kết.");
            }
          }
        }
      } catch (err) {
        console.error("Lỗi tải thông tin hợp đồng:", err);
        setError("Không thể tải thông tin hợp đồng.");
      } finally {
        setLoading(false);
      }
    };
    fetchInfo();
  }, [id]);

  const generateSignatureBlob = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 120;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 300, 120);
    ctx.fillStyle = '#1a1a2e';
    ctx.font = 'italic 24px "Times New Roman", serif';
    ctx.textAlign = 'center';
    ctx.fillText('Chữ ký điện tử', 150, 50);
    ctx.font = 'bold 18px "Times New Roman", serif';
    ctx.fillText('Đã xác nhận', 150, 85);
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/png');
    });
  };

  const handleFinalSign = async () => {
    if (!isAgreed) {
      return alert("Bạn phải đồng ý với điều khoản trước khi ký.");
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const blob = await generateSignatureBlob();
      const userRole = localStorage.getItem('userRole');
      const signerRole = userRole === 'ENTERPRISE' ? 'CLIENT' : 'PROVIDER';
      await contractSignatureService.signContract(id, blob, signerRole);
      alert("Ký hợp đồng thành công!");
      navigate(`/contract/${id}`);
    } catch (err) {
      console.error("Lỗi ký hợp đồng:", err);
      console.error("Response data:", err.response?.data);
      console.error("Status:", err.response?.status);
      const msg = err.response?.data?.message || err.response?.data || '';
      if (err.response?.status === 400 && (String(msg).includes('đã ký') || String(msg).includes('already'))) {
        alert("Bạn đã ký hợp đồng này rồi!");
        navigate(`/contract/${id}`);
        return;
      }
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg) || "Lỗi khi ký hợp đồng. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatMoney = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

  if (loading) {
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center" style={{background: '#0a0f1a'}}>
        <div className="text-center">
          <Loader2 className="spinner text-primary" size={40} />
          <p className="text-white-50 mt-3 small">Đang tải hợp đồng...</p>
        </div>
      </div>
    );
  }

  if (error && !contract) {
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center" style={{background: '#0a0f1a'}}>
        <div className="text-center">
          <AlertCircle size={48} className="text-danger mb-3" />
          <p className="text-white">{error}</p>
          <Link to="/jobs" className="btn btn-primary mt-3">Quay lại</Link>
        </div>
      </div>
    );
  }

  if (alreadySigned) {
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center" style={{background: '#0a0f1a'}}>
        <div className="text-center">
          <div className="mb-3" style={{width: 64, height: 64, borderRadius: '50%', background: 'rgba(34,197,94,0.15)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center'}}>
            <CheckCircle size={32} style={{color: '#22c55e'}} />
          </div>
          <h5 className="fw-bold text-white mb-2">Bạn đã ký hợp đồng này</h5>
          <p className="text-white-50 small mb-3">Chữ ký điện tử của bạn đã được ghi nhận trên hệ thống.</p>
          <Link to={`/contract/${id}`} className="btn btn-primary">Xem hợp đồng</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="sign-contract-page animate-fade-in">
      <Container>
        <div className="mb-4">
          <Link to={`/contract/${id}`} className="sign-back-link">
            <ChevronLeft size={18} /> QUAY LẠI HỢP ĐỒNG
          </Link>
        </div>

        <Row className="justify-content-center">
          <Col lg={8} xl={7}>
            <div className="sign-summary-card mb-4">
              <div className="sign-summary-header">
                <FileText size={20} />
                <span>TÓM TẮT HỢP ĐỒNG</span>
              </div>
              <div className="sign-summary-body">
                <div className="sign-summary-row">
                  <div className="sign-summary-item">
                    <User size={14} />
                    <div>
                      <span className="sign-summary-label">Bên thuê</span>
                      <span className="sign-summary-value">{contract?.clientInfo?.displayName || contract?.clientName || contract?.enterpriseName || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="sign-summary-item">
                    <User size={14} />
                    <div>
                      <span className="sign-summary-label">Bên thực hiện</span>
                      <span className="sign-summary-value">{contract?.providerInfo?.displayName || contract?.providerName || contract?.studentName || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="sign-summary-item">
                    <Clock size={14} />
                    <div>
                      <span className="sign-summary-label">Thời hạn</span>
                      <span className="sign-summary-value">{contract?.deliveryDays || 7} ngày</span>
                    </div>
                  </div>
                  <div className="sign-summary-item sign-summary-price">
                    <div>
                      <span className="sign-summary-label">Giá trị hợp đồng</span>
                      <span className="sign-summary-value price">{formatMoney(contract?.totalBudget || contract?.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="sign-main-card">
              <div className="sign-main-header">
                <div className="sign-icon-circle">
                  <ShieldCheck size={28} />
                </div>
                <h3 className="sign-main-title">Xác nhận ký kết điện tử</h3>
                <p className="sign-main-subtitle">
                  Hợp đồng: <strong>{contract?.jobTitle || contract?.contractName || "Dự án Freelance"}</strong>
                </p>
              </div>

              <div className="sign-legal-notice">
                <Lock size={14} />
                <p>
                  Bằng việc nhấn nút bên dưới, tôi xác nhận đã đọc, hiểu rõ và đồng ý với toàn bộ các điều khoản,
                  phí dịch vụ và thời gian thực hiện đã ghi trong hợp đồng.
                  Chữ ký này có giá trị pháp lý tương đương chữ ký tay.
                </p>
              </div>

              <Form.Group className="sign-checkbox-group">
                <Form.Check
                  type="checkbox"
                  id="agree-check"
                  label={
                    <span className="sign-checkbox-label">
                      Tôi xác nhận đã đọc và đồng ý với <Link to={`/contract-terms/${id}`} target="_blank" className="text-primary fw-bold text-decoration-underline">điều khoản hợp đồng</Link> và muốn ký kết điện tử.
                    </span>
                  }
                  checked={isAgreed}
                  onChange={(e) => setIsAgreed(e.target.checked)}
                />
              </Form.Group>

              {error && (
                <div className="sign-error-message">
                  <AlertCircle size={14} />
                  <span>{error}</span>
                </div>
              )}

              <button
                className="sign-submit-btn"
                onClick={handleFinalSign}
                disabled={isSubmitting || !isAgreed}
              >
                {isSubmitting ? (
                  <><Loader2 className="spinner" size={18} /> ĐANG XỬ LÝ...</>
                ) : (
                  <><PenTool size={18} /> KÝ HỢP ĐỒNG NGAY</>
                )}
              </button>

              <div className="sign-security-badge">
                <Lock size={12} />
                <span>Bảo mật bởi mã hóa SSL 256-bit</span>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default SignContract;
