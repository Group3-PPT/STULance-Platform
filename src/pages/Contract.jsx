import React, { useState } from 'react';
import { Container, Row, Col, Button, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom'; // 1. Thêm useNavigate
import { 
  ShieldCheck, Printer, Eye, EyeOff, 
  ChevronLeft, FileCheck, Lock
} from 'lucide-react';
import '../CSS/Contract.css';

const Contract = () => {
  const navigate = useNavigate(); // 2. Khởi tạo điều hướng
  const [isSigned, setIsSigned] = useState(false);
  const [showSensitive, setShowSensitive] = useState(false);

  // GIẢ LẬP VAI TRÒ NGƯỜI DÙNG ĐANG ĐĂNG NHẬP
  // Bạn có thể đổi 'lancer' thành 'business' để test chuyển trang khác nhau
  const currentUserRole = 'lancer'; 

  const [data] = useState({
    id: "089/HĐDV-2026",
    partyA: {
      name: "CÔNG TY CỔ PHẦN CÔNG NGHỆ TECHNOVA",
      represent: "Lê Hoàng Nam",
      position: "Giám đốc",
      taxCode: "0102345678",
      address: "Tòa nhà Lotte, Ba Đình, Hà Nội"
    },
    partyB: {
      name: "TRẦN MẠNH DŨNG",
      dob: "18/12/2002",
      idCard: "001202005678",
      idDate: "15/05/2020",
      idPlace: "CA Hà Nội",
      taxCode: "8596642100",
      bankAcc: "19035678901012",
      bankName: "Techcombank - CN Hà Thành"
    },
    details: {
      workContent: "Thiết kế bộ nhận diện thương hiệu EduSmart (bao gồm Logo, Namecard, Brand Guidelines)",
      startDate: "25/05/2026",
      endDate: "15/06/2026",
      acceptanceCriteria: "Sản phẩm đúng màu sắc thương hiệu, định dạng file AI/PNG/PDF, được Bên A xác nhận hài lòng.",
      totalBudget: 15000000,
      totalBudgetStr: "Mười lăm triệu đồng chẵn",
      prepayPercent: 30,
      revisions: 3,
      penaltyPercent: 0.5
    }
  });

  // 3. HÀM XỬ LÝ KÝ VÀ ĐIỀU HƯỚNG
  const handleSignAction = () => {
    if (window.confirm("Xác nhận ký hợp đồng điện tử?")) {
      setIsSigned(true);
      
      // Đợi 1.5s để hiển thị con dấu "ĐÃ KÝ" cho đẹp rồi mới chuyển trang
      setTimeout(() => {
        if (currentUserRole === 'business') {
            navigate('/manage-jobs'); // Doanh nghiệp về trang quản lý bài đăng
        } else {
            navigate('/dashboardlaner'); // Lancer (Sinh viên) về Dashboard
        }
      }, 1500);
    }
  };

  const maskInfo = (str, visibleCount = 4) => {
    if (!str || showSensitive) return str;
    return str.substring(0, visibleCount) + "**********" + str.substring(str.length - 2);
  };

  const formatMoney = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  return (
    <div className="contract-page-container py-5">
      <Container>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <Link to="/services" className="btn-back-link"><ChevronLeft size={18}/> Quay lại</Link>
          <div className="d-flex gap-2">
            <Button variant="outline-light" onClick={() => setShowSensitive(!showSensitive)}>
              {showSensitive ? <><EyeOff size={18} className="me-2"/> Ẩn thông tin</> : <><Eye size={18} className="me-2"/> Hiện thông tin</>}
            </Button>
            <Button variant="primary" onClick={() => window.print()}><Printer size={18} className="me-2"/> In hợp đồng</Button>
          </div>
        </div>

        <Row className="g-4">
          <Col lg={8}>
            <div className="contract-paper shadow-2xl animate-fade-in" id="cv-print">
              <div className="text-center">
                <h6 className="fw-bold mb-0">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h6>
                <p className="fw-bold small mb-0">Độc lập - Tự do - Hạnh phúc</p>
                <div className="doc-divider mx-auto"></div>
                <h4 className="fw-bold mt-4 mb-0">HỢP ĐỒNG DỊCH VỤ</h4>
                <p className="small">(Số: {data.id})</p>
              </div>

              <div className="doc-content mt-4">
                <p className="italic small mb-0">- Căn cứ Bộ luật Dân sự số 91/2015/QH13;</p>
                <p className="italic small">- Căn cứ vào nhu cầu và khả năng của hai bên.</p>

                <p className="mt-4">Hôm nay, ngày 23 tháng 05 năm 2026, tại hệ thống StudentLance, chúng tôi gồm:</p>

                <div className="party-box mb-4">
                  <h6 className="fw-bold">BÊN THUÊ DỊCH VỤ (BÊN A)</h6>
                  <p>Tên công ty/Cá nhân: <strong>{data.partyA.name}</strong></p>
                  <p>Đại diện bởi: <strong>{data.partyA.represent}</strong> <span className="ms-3">Chức vụ:</span> {data.partyA.position}</p>
                  <p>Mã số thuế / CCCD: <span className="masked-data">{maskInfo(data.partyA.taxCode)}</span></p>
                  <p>Địa chỉ: {showSensitive ? data.partyA.address : "****************************************"}</p>
                </div>

                <div className="party-box mb-4">
                  <h6 className="fw-bold">BÊN CUNG CẤP DỊCH VỤ (BÊN B - FREELANCER)</h6>
                  <p>Họ và tên: <strong>{data.partyB.name}</strong></p>
                  <p>Ngày tháng năm sinh: {maskInfo(data.partyB.dob, 2)}</p>
                  <p>Số CCCD: <span className="masked-data">{maskInfo(data.partyB.idCard, 4)}</span> <span className="ms-3">Nơi cấp:</span> {data.partyB.idPlace}</p>
                  <p>Mã số thuế cá nhân: <span className="masked-data">{maskInfo(data.partyB.taxCode, 3)}</span></p>
                  <p>Số tài khoản: <span className="masked-data">{maskInfo(data.partyB.bankAcc, 4)}</span> Tại ngân hàng: {data.partyB.bankName}</p>
                </div>

                <div className="articles">
                  <h6 className="fw-bold">ĐIỀU 1: NỘI DUNG CÔNG VIỆC VÀ TIẾN ĐỘ</h6>
                  <p>1. Bên A thuê Bên B thực hiện các công việc sau: {data.details.workContent}</p>
                  <p>2. Thời gian thực hiện: Từ ngày {data.details.startDate} đến ngày {data.details.endDate}.</p>
                  <p>3. Tiêu chuẩn nghiệm thu sản phẩm: {data.details.acceptanceCriteria}</p>

                  <h6 className="fw-bold">ĐIỀU 2: PHÍ DỊCH VỤ VÀ PHƯƠNG THỨC THANH TOÁN</h6>
                  <p>1. Tổng chi phí dịch vụ trọn gói là: <strong>{formatMoney(data.details.totalBudget)}</strong> (Bằng chữ: {data.details.totalBudgetStr}).</p>
                  <p>2. Tiến độ thanh toán chia làm 02 đợt:</p>
                  <ul className="ps-4">
                    <li>Đợt 1: Bên A tạm ứng {data.details.prepayPercent}% (tương đương {formatMoney(data.details.totalBudget * data.details.prepayPercent / 100)}) sau khi ký hợp đồng qua hệ thống StudentLance.</li>
                    <li>Đợt 2: Bên A thanh toán phần còn lại sau khi Bên B bàn giao sản phẩm và nghiệm thu đạt yêu cầu.</li>
                  </ul>
                </div>

                <div className="signature-row mt-5">
                  <div className="sig-col">
                    <p className="fw-bold">ĐẠI DIỆN BÊN A</p>
                    <div className="stamp-box signed">ĐÃ KÝ</div>
                    <p className="small">{data.partyA.represent}</p>
                  </div>
                  <div className="sig-col">
                    <p className="fw-bold">ĐẠI DIỆN BÊN B</p>
                    {isSigned ? (
                      <div className="stamp-box signed-blue">ĐÃ KÝ</div>
                    ) : (
                      <div className="empty-sig">Chờ ký...</div>
                    )}
                    <p className="small">{data.partyB.name}</p>
                  </div>
                </div>
              </div>
            </div>
          </Col>

          <Col lg={4}>
            <div className="sticky-sidebar">
              <div className="glass-card p-4 border-primary-glow">
                <h5 className="text-white fw-bold mb-4 d-flex align-items-center gap-2">
                  <Lock size={20} className="text-primary" /> Quản lý hợp đồng
                </h5>
                
                <div className="escrow-box p-3 rounded-4 bg-white-5 mb-4 border border-white-10">
                   <div className="d-flex justify-content-between x-small mb-1">
                      <span className="text-muted">Ngân sách dự án:</span>
                      <span className="text-white">{formatMoney(data.details.totalBudget)}</span>
                   </div>
                   <Badge bg="success" className="w-100 py-2">KÝ QUỸ ESCROW: ĐÃ NẠP TIỀN</Badge>
                </div>

                {!isSigned ? (
                  <Button variant="primary" className="w-100 py-3 fw-bold shadow-glow mb-3" onClick={handleSignAction}>
                    <h1 size={20} className="me-2" /> KÝ TÊN & BẮT ĐẦU
                  </Button>
                ) : (
                  <div className="text-center text-success p-3 border border-success rounded-4 mb-3">
                    <FileCheck size={32} className="mb-2" />
                    <p className="fw-bold mb-0">Đã ký - Đang chuyển hướng...</p>
                  </div>
                )}
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Contract;