import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { 
  ShieldCheck, Printer, Eye, EyeOff, ChevronLeft, 
  FileCheck, Lock, Loader2, AlertTriangle, CheckCircle,
  PenTool, XCircle, DollarSign, Hammer
} from 'lucide-react';
import { contractService } from '../services/contractservice';
import { contractSignatureService } from '../services/contractsignatureservice';
import '../CSS/Contract.css';

const Contract = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSensitive, setShowSensitive] = useState(false);
  
  // State dữ liệu
  const [contract, setContract] = useState(null);
  const [signatures, setSignatures] = useState([]);
  
  // Thông tin user hiện tại
  const currentUserRole = localStorage.getItem('userRole'); // 'STUDENT' hoặc 'ENTERPRISE'
  const currentUserId = localStorage.getItem('userId'); 

  // 1. Tải dữ liệu ban đầu
  const initData = async () => {
    setLoading(true);
    try {
      const [contRes, sigRes] = await Promise.all([
        contractService.getContractDetail(id),
        contractSignatureService.getContractSignatures(id)
      ]);
      setContract(contRes.data);
      setSignatures(sigRes.data || []);
    } catch (err) {
      console.error("Lỗi tải hợp đồng:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (id) initData(); }, [id]);

  // 2. Logic kiểm tra vai trò và chữ ký
  const isClient = String(contract?.clientUserId) === String(currentUserId);
  const isProvider = String(contract?.providerUserId) === String(currentUserId);
  
  const hasStudentSigned = signatures.some(s => s.signerRole === 'STUDENT');
  const hasEnterpriseSigned = signatures.some(s => s.signerRole === 'ENTERPRISE');
  const iamSigned = signatures.some(s => String(s.userId) === String(currentUserId));
  const isLocked = Boolean(contract?.contentLockedAt);

  // 3. Các hàm xử lý trạng thái (PATCH)
  const handleAction = async (actionType) => {
    let confirmMsg = "";
    if (actionType === 'complete') confirmMsg = "Xác nhận hoàn thành dự án và giải ngân tiền cho sinh viên?";
    if (actionType === 'cancel') confirmMsg = "Xác nhận hủy bỏ hợp đồng này?";
    if (actionType === 'dispute') confirmMsg = "Bạn muốn gửi yêu cầu khiếu nại/tranh chấp cho hợp đồng này?";

    if (!window.confirm(confirmMsg)) return;

    setIsSaving(true);
    try {
      if (actionType === 'complete') await contractService.completeContract(id);
      if (actionType === 'cancel') await contractService.cancelContract(id);
      if (actionType === 'dispute') await contractService.disputeContract(id);
      
      alert("Cập nhật trạng thái thành công!");
      initData();
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || "Không thể thực hiện hành động"));
    } finally {
      setIsSaving(false);
    }
  };

  // 4. Helper hiển thị
  const formatMoney = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
  const maskInfo = (str) => showSensitive ? (str || "N/A") : "**********";

  const getStatusBadge = (status) => {
    const statusMap = {
      'SIGNING': { bg: 'warning', text: 'Đang ký kết' },
      'AWAITING_PAYMENT': { bg: 'info', text: 'Chờ thanh toán' },
      'IN_PROGRESS': { bg: 'primary', text: 'Đang thực hiện' },
      'COMPLETED': { bg: 'success', text: 'Hoàn thành' },
      'DISPUTED': { bg: 'danger', text: 'Đang tranh chấp' },
      'CANCELLED': { bg: 'secondary', text: 'Đã hủy' }
    };
    const info = statusMap[status] || { bg: 'dark', text: status };
    return <Badge bg={info.bg} className="py-2 px-3 uppercase-tracking">{info.text}</Badge>;
  };

  if (loading) return <div className="vh-100 d-flex justify-content-center align-items-center bg-dark"><Spinner animation="border" variant="primary" /></div>;
  if (!contract) return <div className="text-white text-center py-5">Không tìm thấy hợp đồng.</div>;

  return (
    <div className="contract-page-container py-5 text-white animate-fade-in">
      <Container>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <Button variant="link" className="text-primary p-0 text-decoration-none fw-bold" onClick={() => navigate(-1)}>
            <ChevronLeft /> QUAY LẠI
          </Button>
          <div className="d-flex gap-2">
            <Button variant="outline-light" size="sm" onClick={() => setShowSensitive(!showSensitive)}>
              {showSensitive ? <><EyeOff size={16} className="me-2"/>Ẩn</> : <><Eye size={16} className="me-2"/>Hiện</>}
            </Button>
            <Button variant="primary" size="sm" onClick={() => window.print()}><Printer size={16} className="me-2"/>In file</Button>
          </div>
        </div>

        <Row className="g-4">
          {/* CỘT TRÁI: NỘI DUNG HỢP ĐỒNG (BẢN GIẤY) */}
          <Col lg={8}>
            <div className={`contract-paper shadow-lg text-dark p-5 bg-white ${isLocked ? 'border-locked' : ''}`} id="cv-print">
              {isLocked && <div className="watermark">LOCKED</div>}
              
              <div className="text-center border-bottom border-dark pb-4 mb-5">
                <h6 className="fw-bold mb-0">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h6>
                <p className="small mb-0">Độc lập - Tự do - Hạnh phúc</p>
                <div className="divider-contract mx-auto mt-2"></div>
                <h4 className="fw-bold mt-4">HỢP ĐỒNG DỊCH VỤ FREELANCE</h4>
                <p className="small italic text-muted">Mã số: {contract.contractId?.substring(0, 8).toUpperCase()}</p>
              </div>

              <div className="contract-content small">
                <p className="mb-4 italic">Căn cứ vào nội dung {contract.bidId ? 'Đấu thầu dự án' : 'Đơn đặt hàng dịch vụ'} trên sàn StudentLance, hai bên đồng ý ký kết hợp đồng với các điều khoản sau:</p>
                
                <div className="party-info mb-4">
                    <p className="fw-bold mb-1 text-primary">BÊN THUÊ (BÊN A): {contract.enterpriseName || contract.clientName}</p>
                    <p className="mb-0">Đại diện: {contract.representName || 'N/A'}</p>
                    <p className="mb-0">Địa chỉ: {maskInfo(contract.address)}</p>
                </div>

                <div className="party-info mb-4">
                    <p className="fw-bold mb-1 text-primary">BÊN THỰC HIỆN (BÊN B): {contract.studentName}</p>
                    <p className="mb-0">MSSV: {contract.studentCode}</p>
                    <p className="mb-0">Số CCCD: {maskInfo(contract.citizenId)}</p>
                </div>

                <div className="details-section">
                    <h6 className="fw-bold border-bottom pb-1">ĐIỀU 1: NỘI DUNG CÔNG VIỆC</h6>
                    <p className="ps-2">{contract.description || "Thực hiện sản phẩm theo thỏa thuận đã thống nhất trên hệ thống."}</p>
                    
                    <h6 className="fw-bold border-bottom pb-1 mt-4">ĐIỀU 2: GIÁ TRỊ & THANH TOÁN</h6>
                    <p className="ps-2">Tổng giá trị: <strong className="fs-5">{formatMoney(contract.totalAmount)}</strong></p>
                    <p className="ps-2 italic text-muted">* Tiền đã được nạp vào hệ thống Escrow và sẽ giải ngân khi Bên A xác nhận hoàn thành.</p>
                </div>

                {/* KHU VỰC CHỮ KÝ */}
                <div className="signature-area mt-5 pt-5 d-flex justify-content-around text-center">
                  <div className="sig-block">
                    <p className="fw-bold mb-4">ĐẠI DIỆN BÊN A</p>
                    {hasEnterpriseSigned ? <div className="stamp-box signed">ĐÃ KÝ</div> : <div className="empty-sig">Chờ ký...</div>}
                    <p className="mt-3 fw-bold">{contract.representName || 'Người thuê'}</p>
                  </div>
                  <div className="sig-block">
                    <p className="fw-bold mb-4">ĐẠI DIỆN BÊN B</p>
                    {hasStudentSigned ? <div className="stamp-box signed-blue">ĐÃ KÝ</div> : <div className="empty-sig">Chờ ký...</div>}
                    <p className="mt-3 fw-bold">{contract.studentName}</p>
                  </div>
                </div>
              </div>
            </div>
          </Col>

          {/* CỘT PHẢI: BẢNG ĐIỀU KHIỂN LOGIC */}
          <Col lg={4}>
            <div className="sticky-sidebar">
              <div className="glass-card p-4 border-primary-glow shadow-glow">
                <div className="text-center mb-4">
                    <div className="mb-2">{getStatusBadge(contract.status)}</div>
                    <p className="x-small text-white-50">Cập nhật lúc: {new Date(contract.updatedAt).toLocaleString()}</p>
                </div>

                {isLocked && (
                    <Alert variant="info" className="bg-primary bg-opacity-10 border-0 text-white x-small mb-4">
                        <Lock size={14} className="me-2"/> Nội dung đã được khóa pháp lý.
                    </Alert>
                )}

                <div className="d-grid gap-3">
                  {/* 1. NÚT KÝ TÊN */}
                  {contract.status === 'SIGNING' && !iamSigned && (
                    <Button as={Link} to={`/contract/sign/${id}`} variant="primary" className="py-3 fw-bold shadow-glow">
                        <PenTool size={18} className="me-2"/> KÝ HỢP ĐỒNG NGAY
                    </Button>
                  )}

                  {/* 2. NÚT THANH TOÁN (Chỉ Client) */}
                  {contract.status === 'AWAITING_PAYMENT' && isClient && (
                    <Button as={Link} to={`/JobPayment?contractId=${id}`} variant="success" className="py-3 fw-bold">
                        <DollarSign size={18} className="me-2"/> THANH TOÁN KÝ QUỸ
                    </Button>
                  )}

                  {/* 3. NÚT HOÀN THÀNH (Chỉ Client) */}
                  {contract.status === 'IN_PROGRESS' && isClient && (
                    <Button onClick={() => handleAction('complete')} variant="success" className="py-3 fw-bold shadow-glow" disabled={isSaving}>
                        {isSaving ? <Loader2 className="spinner"/> : <CheckCircle size={18} className="me-2"/>} XÁC NHẬN NGHIỆM THU
                    </Button>
                  )}

                  {/* 4. NÚT KHIẾU NẠI (Cả 2) */}
                  {contract.status === 'IN_PROGRESS' && (
                    <Button onClick={() => handleAction('dispute')} variant="outline-danger" className="py-2 x-small fw-bold">
                        <AlertTriangle size={14} className="me-2"/> GỬI KHIẾU NẠI
                    </Button>
                  )}

                  {/* 5. NÚT HỦY (Giai đoạn đầu) */}
                  {['SIGNING', 'AWAITING_PAYMENT'].includes(contract.status) && (
                    <Button onClick={() => handleAction('cancel')} variant="outline-light" className="py-2 x-small opacity-50">
                        <XCircle size={14} className="me-2"/> HỦY HỢP ĐỒNG
                    </Button>
                  )}
                </div>

                <div className="mt-5 p-3 rounded-4 bg-white bg-opacity-5 border border-white border-opacity-10">
                   <div className="d-flex align-items-center gap-2 text-warning mb-2">
                      <ShieldCheck size={16}/> <span className="x-small fw-bold">BẢO VỆ STUDENTLANCE</span>
                   </div>
                   <p className="x-small text-white-50 mb-0 italic">
                      Mọi thay đổi sau khi ký đều được lưu vết bởi DocumentHash. Hệ thống Escrow đảm bảo an toàn 100% cho dòng tiền.
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

export default Contract;