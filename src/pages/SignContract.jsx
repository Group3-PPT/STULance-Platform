import React, { useState, useRef, useEffect } from 'react';
import { Container, Row, Col, Button, Card, Spinner, Form } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import SignatureCanvas from 'react-signature-canvas';
import { PenTool, Eraser, Check, ChevronLeft, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { contractSignatureService } from '../services/contractsignatureservice';
import { contractService } from '../services/contractservice';
import '../CSS/Contract.css';

const SignContract = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const sigCanvas = useRef({}); // Ref để điều khiển tấm bảng vẽ

  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);

  // 1. Tải thông tin hợp đồng để người dùng xem lại trước khi ký
  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const res = await contractService.getContractDetail(id);
        setContract(res.data);
      } catch (err) {
        console.error("Lỗi tải thông tin ký kết");
      } finally {
        setLoading(false);
      }
    };
    fetchInfo();
  }, [id]);

  // 2. Xử lý xóa chữ ký làm lại
  const clear = () => sigCanvas.current.clear();

  // 3. Xử lý gửi chữ ký lên Azure
  const handleFinalSign = async () => {
    if (sigCanvas.current.isEmpty()) {
      return alert("Vui lòng vẽ chữ ký của bạn vào khung trắng!");
    }
    if (!isAgreed) {
      return alert("Bạn phải đồng ý với các điều khoản hợp đồng.");
    }

    setIsSubmitting(true);
    try {
      // Lấy ảnh chữ ký dưới dạng Base64 (Chuỗi ảnh)
      const signatureBase64 = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
      
      const payload = {
        signatureData: signatureBase64, // Gửi chuỗi ảnh lên Server
      };

      await contractSignatureService.signContract(id, payload);
      
      alert("🎉 Ký hợp đồng thành công! Hệ thống đang chuyển hướng...");
      navigate(`/contract/${id}`); // Quay lại trang hợp đồng để xem con dấu
    } catch (err) {
      alert("Lỗi khi gửi chữ ký. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="vh-100 d-flex justify-content-center align-items-center bg-dark text-white"><Spinner animation="border" variant="primary" /></div>;

  return (
    <div className="sign-contract-page py-5 text-white animate-fade-in">
      <Container>
        <div className="mb-4">
          <Link to={`/contract/${id}`} className="text-decoration-none text-primary d-flex align-items-center gap-2 small fw-bold">
            <ChevronLeft size={18} /> QUAY LẠI HỢP ĐỒNG
          </Link>
        </div>

        <Row className="justify-content-center">
          <Col lg={8}>
            <div className="glass-card p-4 p-md-5 shadow-lg border-0">
              <div className="text-center mb-5">
                <ShieldCheck size={48} className="text-primary-glow mb-3" />
                <h2 className="fw-bold">Xác nhận ký kết điện tử</h2>
                <p className="text-white-50">Hợp đồng: <span className="text-white fw-bold">{contract?.contractName || "Dự án Freelance"}</span></p>
              </div>

              {/* TÓM TẮT ĐIỀU KHOẢN */}
              <div className="p-3 rounded-4 bg-white bg-opacity-5 border border-white border-opacity-10 mb-4">
                 <h6 className="fw-bold text-primary-glow mb-2 uppercase-tracking">Cam kết pháp lý</h6>
                 <p className="x-small text-white-75 mb-0 italic">
                    Bằng việc ký tên dưới đây, tôi xác nhận đã đọc, hiểu rõ và đồng ý với toàn bộ các điều khoản, 
                    phí dịch vụ và thời gian thực hiện đã ghi trong hợp đồng số {id?.substring(0, 8)}. 
                    Chữ ký này có giá trị pháp lý tương đương với chữ ký tay.
                 </p>
              </div>

              {/* KHUNG VẼ CHỮ KÝ */}
              <div className="signature-container mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                   <label className="small-label fw-bold d-flex align-items-center gap-2">
                      <PenTool size={16} className="text-primary"/> VẼ CHỮ KÝ CỦA BẠN VÀO ĐÂY
                   </label>
                   <Button variant="link" className="text-danger p-0 x-small text-decoration-none" onClick={clear}>
                      <Eraser size={14} className="me-1"/> Xóa làm lại
                   </Button>
                </div>
                
                <div className="sig-canvas-wrapper shadow-inner bg-white rounded-4 overflow-hidden">
                    <SignatureCanvas 
                        ref={sigCanvas}
                        penColor="black"
                        canvasProps={{ className: 'sigCanvas w-100', height: 200 }} 
                    />
                </div>
              </div>

              {/* CHECKBOX XÁC NHẬN */}
              <Form.Group className="mb-5 custom-checkbox">
                <Form.Check 
                  type="checkbox"
                  id="agree-check"
                  label={<span className="small text-white-75">Tôi xác nhận đây là chữ ký hợp pháp của tôi.</span>}
                  checked={isAgreed}
                  onChange={(e) => setIsAgreed(e.target.checked)}
                />
              </Form.Group>

              {/* NÚT HÀNH ĐỘNG */}
              <div className="d-grid gap-3">
                <Button 
                    variant="primary" 
                    size="lg" 
                    className="py-3 fw-bold shadow-glow d-flex align-items-center justify-content-center gap-2"
                    onClick={handleFinalSign}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? <Loader2 className="spinner" /> : <Check size={20}/>}
                    XÁC NHẬN KÝ ĐIỆN TỬ
                </Button>
                <div className="text-center">
                    <p className="x-small text-white-50 d-flex align-items-center justify-content-center gap-1">
                        <AlertCircle size={12}/> Hệ thống bảo mật bởi mã hóa SSL 256-bit
                    </p>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default SignContract;