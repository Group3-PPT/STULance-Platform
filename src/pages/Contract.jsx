import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Badge, Spinner, Alert, Form, Tab, Tabs, Modal } from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ShieldCheck, Printer, Eye, EyeOff, ChevronLeft, Download,
  FileCheck, Lock, Loader2, AlertTriangle, CheckCircle,
  PenTool, XCircle, DollarSign, Upload, MessageSquare,
  Clock, Star, Send, File, ShieldAlert
} from 'lucide-react';
import { contractService } from '../services/contractservice';
import { contractSignatureService } from '../services/contractsignatureservice';
import { paymentService } from '../services/paymentservice';
import { reportService } from '../services/reportService';
import { authService } from '../services/authService';
import ReportModal from '../components/ReportModal';
import html2pdf from 'html2pdf.js';
import '../CSS/Contract.css';

const Contract = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSensitive, setShowSensitive] = useState(false);

  const [contract, setContract] = useState(null);
  const [signatures, setSignatures] = useState([]);
  const [progress, setProgress] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [evaluates, setEvaluates] = useState([]);

  const [activeTab, setActiveTab] = useState('progress');
  const [progressNote, setProgressNote] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [deliveryTitle, setDeliveryTitle] = useState('');
  const [deliveryDesc, setDeliveryDesc] = useState('');
  const [evalRating, setEvalRating] = useState(5);
  const [evalComment, setEvalComment] = useState('');
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [revisionReason, setRevisionReason] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [revisionRequests, setRevisionRequests] = useState([]);

  const currentUserRole = localStorage.getItem('userRole');
  const [currentUserId, setCurrentUserId] = useState(() => localStorage.getItem('userId'));

  const initData = async () => {
    setLoading(true);
    try {
      const userId = await authService.ensureUserId();
      if (userId) setCurrentUserId(userId);
      const isAdmin = currentUserRole === 'ADMIN';
      const detailFn = isAdmin ? contractService.adminGetContractDetail : contractService.getContractDetail;

      const [contRes, sigRes, progressRes, deliveryRes, evalRes, revisionRes] = await Promise.allSettled([
        detailFn(id),
        isAdmin ? Promise.resolve({ success: false }) : contractSignatureService.getContractSignatures(id),
        isAdmin ? Promise.resolve({ success: false }) : contractService.getProgress(id),
        isAdmin ? Promise.resolve({ success: false }) : contractService.getDeliveries(id),
        isAdmin ? Promise.resolve({ success: false }) : contractService.getEvaluates(id),
        isAdmin ? Promise.resolve({ success: false }) : contractService.getRevisionRequests(id)
      ]);

      // === 1. HỢP ĐỒNG CHÍNH ===
      if (contRes.status === 'fulfilled') {
        const contractData = contRes.value.data;
        setContract(contractData);
      }

      // === 2. CHỮ KÝ ===
      if (sigRes.status === 'fulfilled') {
        const rawData = sigRes.value.data;
        let parsedSignatures = [];
        if (Array.isArray(rawData)) {
          parsedSignatures = rawData;
        } else if (rawData && rawData.items) {
          parsedSignatures = rawData.items;
        } else if (rawData && rawData.signatures) {
          parsedSignatures = rawData.signatures;
        } else {
          parsedSignatures = [];
        }
        console.log("Signatures raw:", rawData, "Parsed:", parsedSignatures);
        setSignatures(parsedSignatures);
      }

      // === 3. TIẾN ĐỘ ===
      if (progressRes.status === 'fulfilled') {
        const rawData = progressRes.value.data;
        if (Array.isArray(rawData) && rawData.length > 0) {
          const latestProgress = rawData[rawData.length - 1];
          setProgress(latestProgress);
          setProgressPercent(latestProgress.progressPercent || 0);
        } else if (rawData && typeof rawData === 'object') {
          setProgress(rawData);
          setProgressPercent(rawData.progressPercent || 0);
        } else {
          // Không có dữ liệu tiến độ
          setProgress(null);
          setProgressPercent(0);
        }
      }

      // === 4. BẢN GIAO ===
      if (deliveryRes.status === 'fulfilled') {
        const rawData = deliveryRes.value.data;
        let parsedDeliveries = [];

        if (Array.isArray(rawData)) {
          parsedDeliveries = rawData;
        } else if (rawData && rawData.items) {
          parsedDeliveries = rawData.items;
        } else {
          parsedDeliveries = [];
        }

        setDeliveries(parsedDeliveries);
      }

      // === 5. ĐÁNH GIÁ ===
      if (evalRes.status === 'fulfilled') {
        const rawData = evalRes.value.data;
        let parsedEvaluates = [];
        if (Array.isArray(rawData)) {
          parsedEvaluates = rawData;
        } else if (rawData && rawData.items) {
          parsedEvaluates = rawData.items;
        } else {
          parsedEvaluates = [];
        }
        setEvaluates(parsedEvaluates);
      }

      // === 6. YÊU CẦU CHỈNH SỬA ===
      if (revisionRes.status === 'fulfilled') {
        const rawData = revisionRes.value.data;
        let parsedRevisions = [];
        if (Array.isArray(rawData)) {
          parsedRevisions = rawData;
        } else if (rawData && rawData.items) {
          parsedRevisions = rawData.items;
        } else {
          parsedRevisions = [];
        }
        setRevisionRequests(parsedRevisions);
      }
    } catch (err) {
      console.error("Lỗi tải hợp đồng:", err);
    } finally {
      setLoading(false);
    }
  };

  // Tự động tải dữ liệu khi component mount hoặc id thay đổi
  useEffect(() => {
    if (id) {
      initData();
    }
  }, [id]);


  // BIẾN TÍNH TOÁN (Derived Variables)
  let isClient = false;
  let isProvider = false;

  if (contract) {
    // Lấy userId của bên thuê (doanh nghiệp)
    const clientUserId = contract.clientInfo && contract.clientInfo.userId
      ? contract.clientInfo.userId
      : contract.clientUserId;

    // Lấy userId của bên thực hiện (sinh viên)
    const providerUserId = contract.providerInfo && contract.providerInfo.userId
      ? contract.providerInfo.userId
      : contract.providerUserId;

    // So sánh với currentUserId để xác định vai trò của người dùng hiện tại
    isClient = String(clientUserId) === String(currentUserId);
    isProvider = String(providerUserId) === String(currentUserId);
  }

  // Hợp đồng này có phải của tôi không? (dùng để ẩn nút tố cáo)
  const isOwnContract = isClient || isProvider;

  // Đảm bảo sigList luôn là mảng (tránh lỗi nếu signatures bị null/undefined)
  const sigList = Array.isArray(signatures) ? signatures : [];

  // Hợp đồng đã bị khóa nội dung chưa?
  // isLocked = true nghĩa là không ai chỉnh sửa nội dung hợp đồng được nữa
  const isLocked = contract && (contract.isContentLocked || contract.contentLockedAt);

  // Hợp đồng đã qua giai đoạn ký kết chưa?
  // pastSigning = true nếu status KHÔNG PHẢI là SIGNING, CANCELLED, hay EXPIRED
  const pastSigning = contract
    && contract.status !== 'SIGNING'
    && contract.status !== 'CANCELLED'
    && contract.status !== 'EXPIRED';

  // Doanh nghiệp đã ký chưa?
  // Có 2 cách kiểm tra:
  //   1. Tìm trong danh sách chữ ký có role là CLIENT hoặc ENTERPRISE
  //   2. Nếu hợp đồng đã qua giai đoạn ký + đã khóa → coi như đã ký
  let hasEnterpriseSigned = false;
  for (let i = 0; i < sigList.length; i++) {
    const sig = sigList[i];
    if (sig.signerRole === 'CLIENT' || sig.signerRole === 'ENTERPRISE') {
      hasEnterpriseSigned = true;
      break;
    }
  }
  if (!hasEnterpriseSigned && pastSigning && isLocked) {
    hasEnterpriseSigned = true;
  }

  // Sinh viên đã ký chưa?
  let hasStudentSigned = false;
  for (let i = 0; i < sigList.length; i++) {
    const sig = sigList[i];
    if (sig.signerRole === 'PROVIDER' || sig.signerRole === 'STUDENT') {
      hasStudentSigned = true;
      break;
    }
  }
  if (!hasStudentSigned && pastSigning && isLocked) {
    hasStudentSigned = true;
  }

  // Tôi (người dùng hiện tại) đã ký chưa?
  // Tìm trong danh sách chữ ký có userId trùng với currentUserId
  let iamSigned = false;
  for (let i = 0; i < sigList.length; i++) {
    const sig = sigList[i];
    // Lấy userId từ nhiều trường có thể có
    const sigUserId = sig.userId || sig.signerUserId;
    if (sigUserId && String(sigUserId) === String(currentUserId)) {
      iamSigned = true;
      break;
    }
  }
  // Nếu hợp đồng không ở trạng thái SIGNING → coi như đã ký
  if (contract && contract.status !== 'SIGNING') {
    iamSigned = true;
  }

  // ============================================================
  // HANDLER: THANH TOÁN KÝ QUỸ QUA VNPAY
  // ============================================================
  const handlePayContract = async () => {
    try {
      // Bật loading
      setIsSaving(true);

      // Gọi API tạo link thanh toán VNPAY
      const res = await paymentService.createVnpayQr(id);

      // Lấy URL thanh toán từ response
      // API có thể trả về nhiều dạng khác nhau, thử từng trường
      let paymentUrl = null;

      if (res && res.data && res.data.paymentUrl) {
        paymentUrl = res.data.paymentUrl;
      } else if (res && res.paymentUrl) {
        paymentUrl = res.paymentUrl;
      } else if (res && res.data && res.data.url) {
        paymentUrl = res.data.url;
      } else if (res && res.url) {
        paymentUrl = res.url;
      }

      // Nếu có URL → chuyển hướng sang trang VNPAY
      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        alert("Không nhận được link thanh toán. Vui lòng thử lại.");
        console.error("VNPAY response:", res);
      }

    } catch (err) {
      // Hiển thị lỗi từ server hoặc lỗi mặc định
      let errorMessage = "Không thể tạo thanh toán VNPAY";
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      }
      alert("Lỗi: " + errorMessage);
    } finally {
      // Tắt loading (luôn chạy dù thành công hay thất bại)
      setIsSaving(false);
    }
  };

  // ============================================================
  // HANDLER: HÀNH ĐỘNG TỔNG HỢP TRÊN HỢP ĐỒNG
  // ============================================================
  // actionType có thể là: 'complete', 'cancel', 'dispute', 'approveCancel', 'rejectCancel'
  // disputeReasonText chỉ dùng khi actionType === 'dispute'
  const handleAction = async (actionType, disputeReasonText) => {

    // Bước 1: Hiển thị xác nhận 
    let confirmMessage = "";

    if (actionType === 'complete') {
      confirmMessage = "Xác nhận hoàn thành dự án và giải ngân tiền cho sinh viên?";
    }
    if (actionType === 'cancel') {
      confirmMessage = "Bạn muốn yêu cầu hủy hợp đồng này?";
    }
    if (actionType === 'approveCancel') {
      confirmMessage = "Bạn đồng ý hủy hợp đồng này?";
    }
    if (actionType === 'rejectCancel') {
      confirmMessage = "Từ chối yêu cầu hủy? Hợp đồng sẽ tiếp tục.";
    }

    // Nếu không phải dispute → hỏi xác nhận. Nếu người dùng bấm Cancel → dừng lại
    if (actionType !== 'dispute') {
      const userConfirmed = window.confirm(confirmMessage);
      if (!userConfirmed) return;
    }

    // Bước 2: Gọi API tương ứng
    setIsSaving(true);
    try {
      if (actionType === 'complete') {
        // Nghiệm thu → giải ngân tiền cho sinh viên
        await contractService.completeContract(id);
      }

      if (actionType === 'cancel') {
        // Yêu cầu hủy hợp đồng
        await contractService.cancelContract(id);
      }

      if (actionType === 'dispute') {
        // Tạo tranh chấp với lý do
        await contractService.disputeContract(id, { reason: disputeReasonText });
        // Đóng modal và xóa lý do
        setShowDisputeModal(false);
        setDisputeReason('');
      }

      if (actionType === 'approveCancel') {
        // Đồng ý hủy hợp đồng
        await contractService.approveCancelContract(id);
      }

      if (actionType === 'rejectCancel') {
        // Từ chối hủy hợp đồng
        await contractService.rejectCancelContract(id);
      }

      // Bước 3: Thông báo thành công và tải lại dữ liệu
      alert("Cập nhật thành công!");
      initData();

    } catch (err) {
      let errorMessage = "Không thể thực hiện";
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      }
      alert("Lỗi: " + errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // ============================================================
  // HANDLER: XUẤT FILE PDF
  // ============================================================
  const handleDownload = async () => {
    // Tìm element chứa nội dung hợp đồng cần xuất PDF
    const contractElement = document.getElementById('cv-print');
    if (!contractElement) return;

    // Tên file PDF: HopDong_xxxxxxxx.pdf (lấy 8 ký tự đầu contractId)
    let contractName = "HopDong_contract";
    if (contract && contract.contractId) {
      contractName = "HopDong_" + contract.contractId.substring(0, 8);
    }

    // Cấu hình html2pdf
    const options = {
      margin: [10, 10, 10, 10],                 // Lề trên, phải, dưới, trái (mm)
      filename: contractName + ".pdf",           // Tên file
      image: { type: 'jpeg', quality: 0.98 },   // Chất lượng ảnh
      html2canvas: {
        scale: 2,                // Phóng to 2x cho sắc nét
        useCORS: true,           // Cho phép tải ảnh từ domain khác
        letterRendering: true,   // Hiển thị chữ đẹp hơn
        logging: false           // Tắt log debug
      },
      jsPDF: {
        unit: 'mm',          // Đơn vị đo: mm
        format: 'a4',        // Khổ giấy A4
        orientation: 'portrait'  // Paper dọc
      }
    };

    try {
      // Tạo file PDF và tải xuống
      await html2pdf().set(options).from(contractElement).save();
    } catch (err) {
      console.error("Lỗi xuất PDF:", err);
      alert("Không thể xuất PDF. Vui lòng thử lại.");
    }
  };

  // ============================================================
  // HANDLER: GỬI TỐ CÁO
  // ============================================================
  const handleReport = async () => {
    const reason = prompt("Nhập lý do báo cáo:");
    if (!reason) return;
    try {
      await reportService.createReport({
        targetType: 'CONTRACT',
        targetId: id,
        reason: reason
      });
      alert("Đã gửi báo cáo!");
    } catch (err) {
      let errorMessage = "Không thể gửi";
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      }
      alert("Lỗi: " + errorMessage);
    }
  };

  // ============================================================
  // HANDLER: CẬP NHẬT TIẾN ĐỘ (Sinh viên)
  // ============================================================
  const handleSubmitProgress = async () => {
    // Kiểm tra ghi chú không được để trống
    if (!progressNote.trim()) {
      alert("Vui lòng nhập ghi chú");
      return;
    }

    setIsSaving(true);
    try {
      await contractService.updateProgress(id, {
        progressPercent: progressPercent,       // Phần trăm hoàn thành (0-100)
        title: "Tiến độ " + progressPercent + "%",  // Têu đề tự động
        content: progressNote,                  // Nội dung ghi chú
        attachmentUrl: ''                       // Chưa hỗ trợ file đính kèm
      });

      // Xóa form sau khi gửi thành công
      setProgressNote('');
      alert("Cập nhật tiến độ thành công!");

      // Tải lại dữ liệu để hiển thị tiến độ mới
      initData();

    } catch (err) {
      let errorMessage = "Không thể cập nhật";
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      }
      alert("Lỗi: " + errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // ============================================================
  // HANDLER: NỘP BẢN GIAO (Sinh viên)
  // ============================================================
  const handleSubmitDelivery = async () => {
    // Kiểm tra link bản giao không được để trống
    if (!deliveryTitle.trim()) {
      alert("Vui lòng nhập link bản giao");
      return;
    }

    setIsSaving(true);
    try {
      await contractService.submitDelivery(id, {
        deliveryUrl: deliveryTitle,    
        note: deliveryDesc             
      });

      // Xóa form sau khi gửi thành công
      setDeliveryTitle('');
      setDeliveryDesc('');
      alert("Nộp bản giao thành công!");

      // Tải lại dữ liệu
      initData();

    } catch (err) {
      let errorMessage = "Không thể nộp";
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      }
      alert("Lỗi: " + errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // ============================================================
  // HANDLER: GỬI ĐÁNH GIÁ (Cả hai bên)
  // ============================================================
  const handleSubmitEvaluate = async () => {
    // Kiểm tra nhận xét không được để trống
    if (!evalComment.trim()) {
      alert("Vui lòng nhập nhận xét");
      return;
    }

    setIsSaving(true);
    try {
      await contractService.submitEvaluate(id, {
        rating: evalRating,      // Số sao (1-5)
        comment: evalComment     // Nội dung nhận xét
      });

      // Xóa form sau khi gửi thành công
      setEvalComment('');
      setEvalRating(5);    // Reset về 5 sao
      alert("Gửi đánh giá thành công!");

      // Tải lại dữ liệu
      initData();

    } catch (err) {
      let errorMessage = "Không thể gửi";
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      }
      alert("Lỗi: " + errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // ============================================================
  // HANDLER: YÊU CẦU CHỈNH SỬA (Doanh nghiệp)
  // ============================================================
  const handleSubmitRevision = async () => {
    // Kiểm tra lý do không được để trống
    if (!revisionReason.trim()) {
      alert("Vui lòng nhập lý do chỉnh sửa");
      return;
    }

    setIsSaving(true);
    try {
      await contractService.requestRevision(id, {
        reason: revisionReason     // Lý do cần chỉnh sửa
      });

      // Xóa form và đóng modal
      setRevisionReason('');
      setShowRevisionModal(false);
      alert("Yêu cầu chỉnh sửa đã được gửi!");

      // Tải lại dữ liệu
      initData();

    } catch (err) {
      let errorMessage = "Không thể gửi yêu cầu";
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      }
      alert("Lỗi: " + errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // ============================================================
  // HÀM TIỆN ÍCH
  // ============================================================

  // Định dạng tiền VND: 1000000 → "1.000.000₫"
  const formatMoney = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  // Ẩn/hiện thông tin nhạy cảm (CCCD, MST, SĐT)
  // showSensitive = true → hiển thị thật
  // showSensitive = false → hiển thị "**********"
  const maskInfo = (text) => {
    if (showSensitive) {
      return text || "N/A";
    } else {
      return "**********";
    }
  };

  // Lấy tổng tiền hợp đồng
  // Thử nhiều trường có thể chứa giá trị tiền
  let contractAmount = 0;
  if (contract) {
    if (contract.totalBudget) {
      contractAmount = contract.totalBudget;
    } else if (contract.totalAmount) {
      contractAmount = contract.totalAmount;
    } else if (contract.bidAmount) {
      contractAmount = contract.bidAmount;
    } else if (contract.price) {
      contractAmount = contract.price;
    } else if (contract.amount) {
      contractAmount = contract.amount;
    }
  }

  // ============================================================
  // HÀM HIỂN THỊ TRẠNG THÁI (Badge)
  // ============================================================
  // Map trạng thái hợp đồng → màu sắc + text hiển thị
  const getStatusBadge = (status) => {
    const statusConfig = {
      'SIGNING':            { backgroundColor: 'warning', text: 'Đang ký kết' },
      'AWAITING_PAYMENT':   { backgroundColor: 'info',    text: 'Chờ thanh toán' },
      'IN_PROGRESS':        { backgroundColor: 'primary', text: 'Đang thực hiện' },
      'DELIVERED':          { backgroundColor: 'success', text: 'Đã bàn giao' },
      'CANCEL_REQUESTED':   { backgroundColor: 'danger',  text: 'Yêu cầu hủy' },
      'DISPUTED':           { backgroundColor: 'danger',  text: 'Đang tranh chấp' },
      'COMPLETED':          { backgroundColor: 'success', text: 'Hoàn thành' },
      'CANCELLED':          { backgroundColor: 'secondary', text: 'Đã hủy' },
      'EXPIRED':            { backgroundColor: 'dark',    text: 'Hết hạn' },
    };

    // Tìm config theo status, nếu không tìm thấy → dùng dark
    const config = statusConfig[status] || { backgroundColor: 'dark', text: status };

    return (
      <Badge bg={config.backgroundColor} className="py-2 px-3 uppercase-tracking">
        {config.text}
      </Badge>
    );
  };

  // ============================================================
  // HÀM HIỂN THỊ CHỮ KÝ
  // ============================================================

  // Tìm chữ ký của doanh nghiệp trong danh sách signatures
  const renderEnterpriseSignature = () => {
    let enterpriseSignature = null;

    // Tìm chữ ký có role là CLIENT hoặc ENTERPRISE
    for (let i = 0; i < sigList.length; i++) {
      const sig = sigList[i];
      if (sig.signerRole === 'CLIENT' || sig.signerRole === 'ENTERPRISE') {
        enterpriseSignature = sig;
        break;
      }
    }

    if (!enterpriseSignature) {
      return <span>ĐÃ KÝ</span>;
    }

    // Lấy ảnh chữ ký từ nhiều trường có thể có
    let signatureImageUrl = null;
    if (enterpriseSignature.signatureImageUrl) {
      signatureImageUrl = enterpriseSignature.signatureImageUrl;
    } else if (enterpriseSignature.signatureData) {
      signatureImageUrl = enterpriseSignature.signatureData;
    } else if (enterpriseSignature.signatureImageFile) {
      signatureImageUrl = enterpriseSignature.signatureImageFile;
    }

    if (signatureImageUrl) {
      return (
        <img
          src={signatureImageUrl}
          alt="Chữ ký doanh nghiệp"
          style={{ maxWidth: '180px', maxHeight: '80px', objectFit: 'contain' }}
        />
      );
    }

    return <span>ĐÃ KÝ</span>;
  };

  // Tìm chữ ký của sinh viên trong danh sách signatures
  const renderStudentSignature = () => {
    let studentSignature = null;

    // Tìm chữ ký có role là PROVIDER hoặc STUDENT
    for (let i = 0; i < sigList.length; i++) {
      const sig = sigList[i];
      if (sig.signerRole === 'PROVIDER' || sig.signerRole === 'STUDENT') {
        studentSignature = sig;
        break;
      }
    }

    if (!studentSignature) {
      return <span>ĐÃ KÝ</span>;
    }

    // Lấy ảnh chữ ký từ nhiều trường có thể có
    let signatureImageUrl = null;
    if (studentSignature.signatureImageUrl) {
      signatureImageUrl = studentSignature.signatureImageUrl;
    } else if (studentSignature.signatureData) {
      signatureImageUrl = studentSignature.signatureData;
    } else if (studentSignature.signatureImageFile) {
      signatureImageUrl = studentSignature.signatureImageFile;
    }

    if (signatureImageUrl) {
      return (
        <img
          src={signatureImageUrl}
          alt="Chữ ký sinh viên"
          style={{ maxWidth: '180px', maxHeight: '80px', objectFit: 'contain' }}
        />
      );
    }

    return <span>ĐÃ KÝ</span>;
  };

  // ============================================================
  // RENDER: LOADING STATE
  // ============================================================
  if (loading) {
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center bg-dark">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  // ============================================================
  // RENDER: KHÔNG TÌM THẤY HỢP ĐỒNG
  // ============================================================
  if (!contract) {
    return (
      <div className="text-white text-center py-5">
        Không tìm thấy hợp đồng.
      </div>
    );
  }

  return (
    <div className="contract-page-container py-5 text-white animate-fade-in">
      <Container>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <Button variant="link" className="text-primary p-0 text-decoration-none fw-bold" onClick={() => navigate(-1)}>
            <ChevronLeft /> QUAY LẠI
          </Button>
          <div className="d-flex gap-2">
            <Button variant="outline-light" size="sm" onClick={() => setShowSensitive(!showSensitive)}>
              {showSensitive ? <><EyeOff size={16} className="me-2" />Ẩn</> : <><Eye size={16} className="me-2" />Hiện</>}
            </Button>
            <Button variant="outline-primary" size="sm" onClick={handleDownload}><Download size={16} className="me-2" />Tải về</Button>
            <Button variant="primary" size="sm" onClick={() => window.print()}><Printer size={16} className="me-2" />In file</Button>
          </div>
        </div>

        <Row className="g-4">
          <Col lg={8}>
            <div className={`contract-paper shadow-lg text-dark p-5 bg-white ${isLocked ? 'border-locked' : ''}`} id="cv-print">
              {isLocked && <div className="watermark">LOCKED</div>}

              <div className="text-center border-bottom border-dark pb-3 mb-4">
                <h6 className="fw-bold mb-0" style={{fontSize: '12px'}}>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h6>
                <p className="mb-0" style={{fontSize: '11px'}}>Độc lập - Tự do - Hạnh phúc</p>
                <div className="divider-contract mx-auto mt-2"></div>
                <h5 className="fw-bold mt-3" style={{fontSize: '16px'}}>HỢP ĐỒNG DỊCH VỤ FREELANCE</h5>
                <p className="italic mb-0" style={{ fontSize: '11px', color: '#666' }}>Mã số: {contract.contractId?.substring(0, 8).toUpperCase()}</p>
              </div>

              <div className="contract-content">
                <p className="mb-3 italic" style={{fontSize: '11.5px'}}>Căn cứ vào nội dung {contract.bidId ? 'Đấu thầu dự án' : 'Đơn đặt hàng dịch vụ'} trên sàn StudentLance, hai bên đồng ý ký kết hợp đồng với các điều khoản sau:</p>

                <div className="party-info mb-3">
                  <p className="fw-bold mb-1 text-primary" style={{fontSize: '12px'}}>BÊN THUÊ (BÊN A): {contract.clientInfo?.displayName || contract.clientName || 'N/A'}</p>
                  <p className="mb-0" style={{fontSize: '11px'}}>Họ tên: {contract.clientInfo?.fullName || contract.clientInfo?.displayName || 'N/A'}</p>
                  <p className="mb-0" style={{fontSize: '11px'}}>Email: {contract.clientInfo?.email || 'N/A'}</p>
                  {contract.clientInfo?.companyTaxCode && (
                    <p className="mb-0" style={{fontSize: '11px'}}>Mã số thuế: {maskInfo(contract.clientInfo.companyTaxCode)}</p>
                  )}
                  {contract.clientInfo?.address && (
                    <p className="mb-0" style={{fontSize: '11px'}}>Địa chỉ: {maskInfo(contract.clientInfo.address)}</p>
                  )}
                  {contract.clientInfo?.phoneNumber && (
                    <p className="mb-0" style={{fontSize: '11px'}}>Số điện thoại: {maskInfo(contract.clientInfo.phoneNumber)}</p>
                  )}
                </div>

                <div className="party-info mb-3">
                  <p className="fw-bold mb-1 text-primary" style={{fontSize: '12px'}}>BÊN THỰC HIỆN (BÊN B): {contract.providerInfo?.displayName || contract.providerName || 'N/A'}</p>
                  {contract.providerInfo?.citizenId && (
                    <p className="mb-0" style={{fontSize: '11px'}}>Số CCCD: {maskInfo(contract.providerInfo.citizenId)}</p>
                  )}
                  {contract.providerInfo?.phoneNumber && (
                    <p className="mb-0" style={{fontSize: '11px'}}>Số điện thoại: {maskInfo(contract.providerInfo.phoneNumber)}</p>
                  )}
                </div>

                <div className="details-section">
                  {/* ĐIỀU 1: NỘI DUNG CÔNG VIỆC */}
                  <h6 className="fw-bold border-bottom pb-1" style={{fontSize: '12px'}}>ĐIỀU 1: NỘI DUNG CÔNG VIỆC</h6>
                  <p className="ps-2 mb-1" style={{fontSize: '11.5px'}}>1.1. Bên B cam kết thực hiện công việc theo đúng mô tả và yêu cầu đã được hai bên thống nhất trên hệ thống STULance.</p>
                  <p className="ps-2 mb-1" style={{fontSize: '11.5px'}}>1.2. Nội dung công việc cụ thể: <strong>{contract.description || "Thực hiện sản phẩm theo thỏa thuận đã thống nhất trên hệ thống."}</strong></p>
                  <p className="ps-2 mb-1" style={{fontSize: '11.5px'}}>1.3. Bên B phải tuân thủ các tiêu chuẩn chất lượng và thời hạn đã cam kết. Trong trường hợp phát sinh thay đổi, hai bên phải thỏa thuận lại bằng văn bản qua hệ thống.</p>
                  <p className="ps-2 mb-2" style={{fontSize: '11.5px'}}>1.4. Mọi yêu cầu thay đổi ngoài phạm vi hợp đồng ban đầu sẽ được xem xét và thương lượng lại về chi phí và thời gian.</p>

                  {/* ĐIỀU 2: GIÁ TRỊ & THANH TOÁN */}
                  <h6 className="fw-bold border-bottom pb-1 mt-3" style={{fontSize: '12px'}}>ĐIỀU 2: GIÁ TRỊ & THANH TOÁN</h6>
                  <p className="ps-2 mb-1" style={{fontSize: '11.5px'}}>2.1. Tổng giá trị hợp đồng: <strong style={{color: '#b91c1c', fontSize: '13px'}}>{formatMoney(contractAmount)}</strong></p>
                  <p className="ps-2 mb-1" style={{fontSize: '11.5px'}}>2.2. Hình thức thanh toán: Thanh toán qua hệ thống Escrow của STULance.</p>
                  <p className="ps-2 mb-1" style={{fontSize: '11.5px'}}>2.3. Bên A cam kết nạp tiền ký quỹ vào hệ thống trước khi hợp đồng có hiệu lực. Số tiền sẽ được giải ngân cho Bên B khi Bên A xác nhận hoàn thành và chấp nhận bản giao.</p>
                  <p className="ps-2 mb-1 p-2 rounded" style={{fontSize: '11.5px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)'}}>
                    <strong>2.4. Phí nền tảng & quản lý: 10% giá trị hợp đồng</strong> ({formatMoney(contractAmount * 0.1)}).<br/>
                    - Phí được trừ tự động khi hợp đồng hoàn thành và bên A xác nhận nghiệm thu.<br/>
                    - Bên B nhận: <strong style={{color:'#22c55e'}}>{formatMoney(contractAmount * 0.9)}</strong> (sau khi trừ phí nền tảng).<br/>
                    - Phí nền tảng bao gồm: phí quản lý giao dịch, phí bảo mật Escrow, phí hỗ trợ tranh chấp và vận hành hệ thống.
                  </p>
                  <p className="ps-2 mb-1" style={{fontSize: '11.5px'}}>2.5. Trường hợp hủy hợp đồng: Tiền sẽ được hoàn trả theo chính sách Escrow của STULance (xem Điều 7).</p>
                  <p className="ps-2 mb-2" style={{ color: '#888', fontSize: '10.5px' }}>* Mọi giao dịch đều được ghi nhận và bảo mật bởi hệ thống. STULance không chịu trách nhiệm cho các giao dịch ngoài hệ thống.</p>

                  {/* ĐIỀU 3: THỜI HẠN THỰC HIỆN */}
                  <h6 className="fw-bold border-bottom pb-1 mt-3" style={{fontSize: '12px'}}>ĐIỀU 3: THỜI HẠN THỰC HIỆN</h6>
                  <p className="ps-2 mb-1" style={{fontSize: '11.5px'}}>3.1. Thời hạn thực hiện hợp đồng: <strong>{contract.deliveryDays || 7}</strong> ngày kể từ ngày hợp đồng có hiệu lực.</p>
                  <p className="ps-2 mb-1" style={{fontSize: '11.5px'}}>3.2. Bên B phải nộp bản giao (delivery) đúng hạn theo lịch trình đã cam kết trên hệ thống.</p>
                  <p className="ps-2 mb-1" style={{fontSize: '11.5px'}}>3.3. Nếu Bên B chậm tiến độ quá <strong>3 ngày</strong> so với thời hạn, Bên A có quyền yêu cầu hoàn tiền hoặc hủy hợp đồng.</p>
                  <p className="ps-2 mb-2" style={{fontSize: '11.5px'}}>3.4. Hai bên có thể gia hạn thời gian thực hiện nếu thỏa thuận qua hệ thống trước khi hết hạn.</p>

                  {/* ĐIỀU 4: QUYỀN VÀ NGHĨA VỤ CÁC BÊN */}
                  <h6 className="fw-bold border-bottom pb-1 mt-3" style={{fontSize: '12px'}}>ĐIỀU 4: QUYỀN VÀ NGHĨA VỤ CÁC BÊN</h6>
                  <p className="ps-2 fw-bold mb-1" style={{fontSize: '11.5px'}}>Bên A (Doanh nghiệp):</p>
                  <p className="ps-2 mb-1" style={{fontSize: '11.5px'}}>4.1. Cung cấp đầy đủ thông tin, tài liệu và yêu cầu cần thiết để Bên B thực hiện công việc.</p>
                  <p className="ps-2 mb-1" style={{fontSize: '11.5px'}}>4.2. Phản hồi và đánh giá bản giao trong vòng <strong>3 ngày</strong> kể từ khi nhận được.</p>
                  <p className="ps-2 mb-1" style={{fontSize: '11.5px'}}>4.3. Thanh toán đúng hạn qua hệ thống Escrow khi chấp nhận bản giao.</p>
                  <p className="ps-2 fw-bold mb-1 mt-2" style={{fontSize: '11.5px'}}>Bên B (Sinh viên):</p>
                  <p className="ps-2 mb-1" style={{fontSize: '11.5px'}}>4.4. Thực hiện công việc đúng tiến độ và chất lượng đã cam kết.</p>
                  <p className="ps-2 mb-1" style={{fontSize: '11.5px'}}>4.5. Nộp bản giao đúng hạn và chịu trách nhiệm về chất lượng sản phẩm.</p>
                  <p className="ps-2 mb-2" style={{fontSize: '11.5px'}}>4.6. Không được chuyển giao công việc cho bên thứ ba mà không có sự đồng ý của Bên A.</p>

                  {/* ĐIỀU 5: BẢO MẬT & SỞ HỮU TRÍ TUỆ */}
                  <h6 className="fw-bold border-bottom pb-1 mt-3" style={{fontSize: '12px'}}>ĐIỀU 5: BẢO MẬT & SỞ HỮU TRÍ TUỆ</h6>
                  <p className="ps-2 mb-1" style={{fontSize: '11.5px'}}>5.1. Cả hai bên cam kết bảo mật mọi thông tin, dữ liệu và tài liệu liên quan đến dự án trong suốt thời gian thực hiện và sau khi kết thúc hợp đồng.</p>
                  <p className="ps-2 mb-1" style={{fontSize: '11.5px'}}>5.2. Mọi sản phẩm, mã nguồn, thiết kế và tài liệu được tạo ra trong quá trình thực hiện hợp đồng thuộc quyền sở hữu của Bên A sau khi thanh toán đầy đủ.</p>
                  <p className="ps-2 mb-2" style={{fontSize: '11.5px'}}>5.3. Bên B không được sử dụng hoặc tiết lộ thông tin dự án cho bất kỳ bên thứ ba nào nếu không có sự đồng ý bằng văn bản của Bên A.</p>

                  {/* ĐIỀU 6: TRÁCH NHIỆM CỦA STULANCE */}
                  <h6 className="fw-bold border-bottom pb-1 mt-3" style={{fontSize: '12px'}}>ĐIỀU 6: TRÁCH NHIỆM CỦA STULANCE</h6>
                  <p className="ps-2 mb-1" style={{fontSize: '11.5px'}}>6.1. STULance đóng vai trò trung gian kết nối và quản lý giao dịch giữa hai bên.</p>
                  <p className="ps-2 mb-1" style={{fontSize: '11.5px'}}>6.2. STULance quản lý quỹ ký quỹ (Escrow), đảm bảo tiền được giữ an toàn và giải ngân đúng quy định.</p>
                  <p className="ps-2 mb-1" style={{fontSize: '11.5px'}}>6.3. STULance tiếp nhận và xử lý các tranh chấp (dispute) theo quy trình: khi có yêu cầu từ một trong hai bên, STULance sẽ xem xét bằng chứng và lịch sử giao dịch trên hệ thống để đưa ra quyết định công bằng.</p>
                  <p className="ps-2 mb-1" style={{fontSize: '11.5px'}}>6.4. Quyết định của STULance là quyết định cuối cùng (chung thẩm). Các bên cam kết chấp hành.</p>
                  <p className="ps-2 mb-2" style={{fontSize: '11.5px'}}>6.5. STULance không chịu trách nhiệm về chất lượng sản phẩm, hiệu suất công việc hay các thỏa thuận ngoài hệ thống giữa các bên.</p>

                  {/* ĐIỀU 7: GIẢI QUYẾT TRANH CHẤP */}
                  <h6 className="fw-bold border-bottom pb-1 mt-3" style={{fontSize: '12px'}}>ĐIỀU 7: GIẢI QUYẾT TRANH CHẤP</h6>
                  <p className="ps-2 mb-1" style={{fontSize: '11.5px'}}>7.1. <strong>Thương lượng:</strong> Mọi tranh chấp trước hết phải được giải quyết thông qua thương lượng trực tiếp trên hệ thống trong vòng <strong>7 ngày</strong>.</p>
                  <p className="ps-2 mb-1 p-2 rounded" style={{fontSize: '11.5px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)'}}>
                    <strong>7.2. Tạo tranh chấp (Dispute):</strong><br/>
                    - Nếu không đạt được thỏa thuận, một trong hai bên (Bên A hoặc Bên B) có thể yêu cầu tạo tranh chấp trên hệ thống khi hợp đồng đang ở trạng thái <strong>IN_PROGRESS</strong> hoặc <strong>DELIVERED</strong>.<br/>
                    - Khi tạo tranh chấp, hợp đồng chuyển sang trạng thái <strong>DISPUTED</strong>.<br/>
                    - Trong thời gian tranh chấp, hợp đồng tạm ngưng các hoạt động khác cho đến khi có quyết định từ STULance.
                  </p>
                  <p className="ps-2 mb-1 p-2 rounded" style={{fontSize: '11.5px', background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)'}}>
                    <strong>7.3. Xử lý tranh chấp bởi STULance (Admin):</strong><br/>
                    STULance xem xét bằng chứng và đưa ra một trong ba quyết định:<br/>
                    - <strong style={{color:'#22c55e'}}>Tiếp tục (IN_PROGRESS):</strong> Hợp đồng được khôi phục, hai bên tiếp tục thực hiện.<br/>
                    - <strong style={{color:'#3b82f6'}}>Hoàn thành (COMPLETED):</strong> Hợp đồng kết thúc, tiền ký quỹ được giải ngân cho Bên B (trừ 10% phí nền tảng).<br/>
                    - <strong style={{color:'#ef4444'}}>Hủy bỏ (CANCELLED):</strong> Hợp đồng bị hủy, tiền ký quỹ được hoàn trả cho Bên A theo tỷ lệ thỏa đáng.
                  </p>
                  <p className="ps-2 mb-2" style={{fontSize: '11.5px'}}>7.4. Quyết định xử lý tranh chấp của STULance là quyết định chung thẩm và có hiệu lực ngay lập tức.</p>

                  {/* ĐIỀU 8: ĐIỀU KHOẢN CHUNG */}
                  <h6 className="fw-bold border-bottom pb-1 mt-3" style={{fontSize: '12px'}}>ĐIỀU 8: ĐIỀU KHOẢN CHUNG</h6>
                  <p className="ps-2 mb-1" style={{fontSize: '11.5px'}}>8.1. Hợp đồng này có hiệu lực kể từ khi cả hai bên đã ký kết trên hệ thống STULance.</p>
                  <p className="ps-2 mb-1" style={{fontSize: '11.5px'}}>8.2. Mọi sửa đổi, bổ sung hợp đồng phải được thực hiện qua hệ thống và có sự đồng ý của cả hai bên.</p>
                  <p className="ps-2 mb-1" style={{fontSize: '11.5px'}}>8.3. Nếu một điều khoản nào đó của hợp đồng bị coi là vô hiệu, các điều khoản còn lại vẫn có hiệu lực.</p>
                  <p className="ps-2 mb-2" style={{fontSize: '11.5px'}}>8.4. Hợp đồng này được quản lý và lưu trữ trên hệ thống STULance, có giá trị pháp lý theo quy định hiện hành.</p>
                </div>

                {/* Khu vực chữ ký */}
                <div className="signature-area mt-5 pt-5 d-flex justify-content-around text-center">

                  {/* CHỮ KÝ BÊN A (DOANH NGHIỆP) */}
                  <div className="sig-block">
                    <p className="fw-bold mb-4">ĐẠI DIỆN BÊN A</p>

                    {hasEnterpriseSigned ? (
                      <div className="stamp-box signed">
                        {renderEnterpriseSignature()}
                      </div>
                    ) : (
                      <div className="empty-sig">Chờ ký...</div>
                    )}

                    <p className="mt-3 fw-bold">
                      {contract.representName || 'Người thuê'}
                    </p>
                  </div>

                  {/* CHỮ KÝ BÊN B (SINH VIÊN) */}
                  <div className="sig-block">
                    <p className="fw-bold mb-4">ĐẠI DIỆN BÊN B</p>

                    {hasStudentSigned ? (
                      <div className="stamp-box signed-blue">
                        {renderStudentSignature()}
                      </div>
                    ) : (
                      <div className="empty-sig">Chờ ký...</div>
                    )}

                    <p className="mt-3 fw-bold">{contract.studentName}</p>
                  </div>

                </div>
              </div>
            </div>
          </Col>

          <Col lg={4}>
            <div className="sticky-sidebar">
              <div className="glass-card p-4 border-primary-glow shadow-glow mb-4">
                <div className="text-center mb-4">
                  <div className="mb-2">{getStatusBadge(contract.status)}</div>
                  <p className="x-small text-white-50">Cập nhật: {new Date(contract.updatedAt).toLocaleString()}</p>
                </div>

                {contract.status === 'DISPUTED' && (
                  <div className="mb-4 p-3 rounded" style={{background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)'}}>
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <AlertTriangle size={14} className="text-danger" />
                      <span className="x-small fw-bold text-danger">TRẠNG THÁI TRANH CHẤP</span>
                    </div>
                    {contract.disputeReason && (
                      <p className="x-small text-white mb-1"><strong>Lý do:</strong> {contract.disputeReason}</p>
                    )}
                    {contract.disputedByUserId && (
                      <p className="x-small text-white-50 mb-1">Người tạo: {contract.disputedByUserId === currentUserId ? 'Bạn' : 'Đối tác'}</p>
                    )}
                    {contract.disputedAt && (
                      <p className="x-small text-white-50 mb-0">Thời gian: {new Date(contract.disputedAt).toLocaleString('vi-VN')}</p>
                    )}
                  </div>
                )}

                {isLocked && (
                  <Alert variant="info" className="bg-primary bg-opacity-10 border-0 text-white x-small mb-4">
                    <Lock size={14} className="me-2" /> Nội dung đã khóa.
                  </Alert>
                )}

                <div className="d-grid gap-3">
                  {contract.status === 'SIGNING' && !iamSigned && (
                    <Button as={Link} to={`/contract/sign/${id}`} variant="primary" className="py-3 fw-bold shadow-glow">
                      <PenTool size={18} className="me-2" /> KÝ HỢP ĐỒNG NGAY
                    </Button>
                  )}

                  {contract.status === 'AWAITING_PAYMENT' && isClient && (
                    <Button onClick={handlePayContract} variant="success" className="py-3 fw-bold" disabled={isSaving}>
                      {isSaving ? <Loader2 className="spinner" /> : <DollarSign size={18} className="me-2" />} THANH TOÁN KÝ QUỸ
                    </Button>
                  )}

                  {contract.status === 'DELIVERED' && isClient && (
                    <Button onClick={() => handleAction('complete')} variant="success" className="py-3 fw-bold shadow-glow" disabled={isSaving}>
                      {isSaving ? <Loader2 className="spinner" /> : <CheckCircle size={18} className="me-2" />} NGHIỆM THU & GIẢI NGÂN
                    </Button>
                  )}

                  {contract.status === 'DELIVERED' && isClient && (
                    <Button onClick={() => setShowRevisionModal(true)} variant="outline-warning" className="py-2 x-small fw-bold">
                      <MessageSquare size={14} className="me-2" /> YÊU CẦU CHỈNH SỬA
                    </Button>
                  )}

                  {(contract.status === 'IN_PROGRESS' || contract.status === 'DELIVERED') && (
                    <Button onClick={() => handleAction('cancel')} variant="outline-warning" className="py-2 x-small fw-bold">
                      <AlertTriangle size={14} className="me-2" /> YÊU CẦU HỦY
                    </Button>
                  )}

                  {(contract.status === 'IN_PROGRESS' || contract.status === 'DELIVERED') && (
                    <Button onClick={() => setShowDisputeModal(true)} variant="danger" className="py-2 x-small fw-bold">
                      <AlertTriangle size={14} className="me-2" /> TẠO TRANH CHẤP
                    </Button>
                  )}

                  {contract.status === 'DISPUTED' && (
                    <Alert variant="danger" className="text-center x-small fw-bold mb-0 py-3">
                      <AlertTriangle size={16} className="me-2" /> Hợp đồng đang tranh chấp — Chờ Admin xử lý
                    </Alert>
                  )}

                  {!isOwnContract && (
                    <Button variant="outline-danger" className="py-2 x-small fw-bold" onClick={() => setShowReportModal(true)}>
                      <ShieldAlert size={14} className="me-2" /> TỐ CÁO HỢP ĐỒNG
                    </Button>
                  )}

                  {contract.status === 'CANCEL_REQUESTED' && (
                    <div className="d-grid gap-2">
                      <Button onClick={() => handleAction('approveCancel')} variant="danger" className="py-2 fw-bold" disabled={isSaving}>
                        {isSaving ? <Loader2 className="spinner" /> : <CheckCircle size={14} className="me-2" />} ĐỒNG Ý HỦY
                      </Button>
                      <Button onClick={() => handleAction('rejectCancel')} variant="outline-light" className="py-2" disabled={isSaving}>
                        <X size={14} className="me-2" /> TỪ CHỐI HỦY
                      </Button>
                    </div>
                  )}

                  {contract.status === 'CANCEL_REQUESTED' && (
                    <Alert variant="warning" className="text-center x-small fw-bold mb-0">
                      Đang chờ bên kia xử lý yêu cầu hủy
                    </Alert>
                  )}

                  {['SIGNING', 'AWAITING_PAYMENT'].includes(contract.status) && (
                    <Button onClick={() => handleAction('cancel')} variant="outline-light" className="py-2 x-small opacity-50">
                      <XCircle size={14} className="me-2" /> HỦY HỢP ĐỒNG
                    </Button>
                  )}
                </div>

                <div className="mt-4 p-3 rounded" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="d-flex align-items-center gap-2 text-warning mb-2">
                    <ShieldCheck size={16} /> <span className="x-small fw-bold">BẢO VỆ STULANCE</span>
                  </div>
                  <p className="x-small text-white-50 mb-1" style={{ fontStyle: 'italic' }}>
                    Mọi thay đổi sau khi ký đều được lưu vết. Escrow đảm bảo an toàn dòng tiền.
                  </p>
                  <p className="x-small text-white-50 mb-0" style={{ fontStyle: 'italic' }}>
                    Phí nền tảng: <strong className="text-warning">10%</strong> giá trị hợp đồng. Nếu có tranh chấp, Admin sẽ đưa ra quyết định cuối cùng.
                  </p>
                </div>
              </div>

              {/* PROGRESS, DELIVERY, EVALUATE TABS */}
              <div className="glass-card p-3 border-white-10">
                <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="custom-tabs-dashboard mb-3">
                  <Tab eventKey="progress" title={`Tiến độ`}>
                    <div className="p-2">
                      {progress ? (
                        <div className="mb-3">
                          <div className="d-flex justify-content-between mb-1">
                            <span className="x-small fw-bold">Tiến độ hiện tại</span>
                            <span className="x-small fw-bold text-primary">{progress.progressPercent || 0}%</span>
                          </div>
                          <div className="progress" style={{ height: 8, background: 'rgba(255,255,255,0.1)' }}>
                            <div className="progress-bar bg-primary" style={{ width: `${progress.progressPercent || 0}%` }} />
                          </div>
                          {progress.note && <p className="x-small text-white-50 mt-2">{progress.note}</p>}
                        </div>
                      ) : (
                        <p className="x-small text-white-50 text-center py-3">Chưa có tiến độ</p>
                      )}

                      {contract.status === 'IN_PROGRESS' && isProvider && (
                        <div className="mt-3 p-3 rounded" style={{ background: 'rgba(255,255,255,0.03)' }}>
                          <Form.Label className="x-small fw-bold">Cập nhật tiến độ (%)</Form.Label>
                          <Form.Range min={0} max={100} step={5} value={progressPercent}
                            onChange={(e) => setProgressPercent(Number(e.target.value))} />
                          <span className="x-small text-primary fw-bold">{progressPercent}%</span>
                          <Form.Control as="textarea" rows={2} placeholder="Ghi chú..."
                            className="bg-dark-input text-white border-0 mt-2" size="sm"
                            value={progressNote} onChange={(e) => setProgressNote(e.target.value)} />
                          <Button variant="primary" size="sm" className="mt-2 w-100 x-small fw-bold"
                            onClick={handleSubmitProgress} disabled={isSaving}>
                            {isSaving ? <Loader2 className="spinner me-1" size={12} /> : <Send size={12} className="me-1" />}
                            CẬP NHẬT
                          </Button>
                        </div>
                      )}
                    </div>
                  </Tab>

                  <Tab eventKey="deliveries" title={`Bản giao (${deliveries.length})`}>
                    <div className="p-2">
                      {deliveries.map((d, idx) => (
                        <div key={d.deliveryId || idx} className="p-2 mb-2 rounded" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <File size={12} className="text-info" />
                            <a href={d.deliveryUrl || '#'} target="_blank" rel="noreferrer" className="x-small fw-bold text-info text-decoration-none">
                              {d.deliveryUrl || `Bản giao #${idx + 1}`}
                            </a>
                          </div>
                          <p className="x-small text-white-50 mb-0">{d.note || 'Không có ghi chú'}</p>
                          <p className="x-small text-white-50 mt-1" style={{ fontSize: 10 }}>{d.createdAt ? new Date(d.createdAt).toLocaleString('vi-VN') : ''}</p>
                        </div>
                      ))}
                      {deliveries.length === 0 && <p className="x-small text-white-50 text-center py-3">Chưa có bản giao nào</p>}

                      {revisionRequests.length > 0 && (
                        <div className="mt-3 mb-2">
                          <p className="x-small fw-bold text-warning mb-2"><MessageSquare size={12} className="me-1" /> YÊU CẦU CHỈNH SỬA ({revisionRequests.length})</p>
                          {revisionRequests.map((r, idx) => (
                            <div key={r.revisionRequestId || idx} className="p-2 mb-2 rounded" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
                              <div className="d-flex align-items-center gap-2 mb-1">
                                <MessageSquare size={11} className="text-warning" />
                                <span className="x-small fw-bold text-warning">{r.createdBy || 'Doanh nghiệp'}</span>
                                <span className="x-small text-white-50" style={{ fontSize: 10 }}>{r.createdAt ? new Date(r.createdAt).toLocaleString('vi-VN') : ''}</span>
                              </div>
                              <p className="x-small text-white mb-0">{r.reason || r.content || 'Không có lý do'}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {['IN_PROGRESS', 'DELIVERED'].includes(contract.status) && isProvider && (
                        <div className="mt-3 p-3 rounded" style={{ background: 'rgba(255,255,255,0.03)' }}>
                          <Form.Label className="x-small fw-bold">Link bản giao (Google Drive, Figma, GitHub...)</Form.Label>
                          <Form.Control size="sm" className="bg-dark-input text-white border-0 mb-2"
                            placeholder="https://..." value={deliveryTitle} onChange={(e) => setDeliveryTitle(e.target.value)} />
                          <Form.Label className="x-small fw-bold">Ghi chú</Form.Label>
                          <Form.Control as="textarea" rows={2} size="sm" className="bg-dark-input text-white border-0 mb-2"
                            placeholder="Mô tả nội dung bàn giao..." value={deliveryDesc} onChange={(e) => setDeliveryDesc(e.target.value)} />
                          <Button variant="info" size="sm" className="w-100 x-small fw-bold"
                            onClick={handleSubmitDelivery} disabled={isSaving}>
                            <Upload size={12} className="me-1" /> NỘP BẢN GIAO
                          </Button>
                        </div>
                      )}
                    </div>
                  </Tab>

                  <Tab eventKey="evaluates" title={`Đánh giá (${evaluates.length})`}>
                    <div className="p-2">
                      {evaluates.map((e, idx) => (
                        <div key={e.evaluateId || idx} className="p-2 mb-2 rounded" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <Star size={12} className="text-warning" fill="#f59e0b" />
                            <span className="x-small fw-bold text-white">{e.rating}/5</span>
                            <span className="x-small text-white-50">- {e.createdBy || 'Ẩn danh'}</span>
                          </div>
                          <p className="x-small text-white-50 mb-0">{e.comment}</p>
                          <p className="x-small text-white-50 mt-1" style={{ fontSize: 10 }}>{e.createdAt ? new Date(e.createdAt).toLocaleString('vi-VN') : ''}</p>
                        </div>
                      ))}
                      {evaluates.length === 0 && <p className="x-small text-white-50 text-center py-3">Chưa có đánh giá</p>}

                      {['COMPLETED', 'DELIVERED'].includes(contract.status) && (
                        <div className="mt-3 p-3 rounded" style={{ background: 'rgba(255,255,255,0.03)' }}>
                          <Form.Label className="x-small fw-bold">Đánh giá (1-5 sao)</Form.Label>
                          <div className="d-flex gap-1 mb-2">
                            {[1, 2, 3, 4, 5].map(s => (
                              <Star key={s} size={20} className="pointer"
                                fill={s <= evalRating ? '#f59e0b' : 'transparent'}
                                color={s <= evalRating ? '#f59e0b' : '#666'}
                                onClick={() => setEvalRating(s)} />
                            ))}
                          </div>
                          <Form.Control as="textarea" rows={2} size="sm" className="bg-dark-input text-white border-0 mb-2"
                            placeholder="Nhận xét..." value={evalComment} onChange={(e) => setEvalComment(e.target.value)} />
                          <Button variant="warning" size="sm" className="w-100 x-small fw-bold text-dark"
                            onClick={handleSubmitEvaluate} disabled={isSaving}>
                            <MessageSquare size={12} className="me-1" /> GỬI ĐÁNH GIÁ
                          </Button>
                        </div>
                      )}
                    </div>
                  </Tab>
                </Tabs>
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      {/* REVISION REQUEST MODAL */}
      <Modal show={showRevisionModal} onHide={() => { setShowRevisionModal(false); setRevisionReason(''); }} centered dialogClassName="modal-dark">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold d-flex align-items-center gap-2">
            <div style={{background:'rgba(245,158,11,0.1)', color:'#f59e0b', width:40, height:40, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center'}}>
              <MessageSquare size={18} />
            </div>
            <div>
              <span className="text-white">Yêu cầu chỉnh sửa</span>
              <p className="x-small text-white-50 mb-0">Gửi yêu cầu chỉnh sửa cho Sinh viên</p>
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-3">
          <div className="mb-3 p-3 rounded" style={{background:'rgba(245,158,11,0.06)', border:'1px solid rgba(245,158,11,0.15)'}}>
            <p className="x-small text-white-50 mb-1">Hợp đồng: <strong className="text-white">{contract?.jobTitle || contract?.contractName}</strong></p>
            <p className="x-small text-white-50 mb-0">Bản giao hiện tại: <strong className="text-warning">{deliveries.length} bản giao</strong></p>
          </div>

          <Form.Group className="mb-3">
            <Form.Label className="x-small fw-bold text-white-50">LÝ DO CHỈNH SỬA *</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              placeholder="Mô tả chi tiết những nội dung cần chỉnh sửa..."
              className="bg-dark-input text-white border-0"
              value={revisionReason}
              onChange={(e) => setRevisionReason(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="outline-light" onClick={() => { setShowRevisionModal(false); setRevisionReason(''); }}>Hủy</Button>
          <Button variant="warning" className="text-dark fw-bold" onClick={handleSubmitRevision} disabled={!revisionReason.trim() || isSaving}>
            {isSaving ? <><Loader2 className="spinner me-1" size={14} /> Đang gửi...</> : <><MessageSquare size={14} className="me-1" /> Gửi yêu cầu</>}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* DISPUTE MODAL */}
      <Modal show={showDisputeModal} onHide={() => setShowDisputeModal(false)} centered dialogClassName="modal-dark">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold d-flex align-items-center gap-2">
            <div style={{background:'rgba(239,68,68,0.1)', color:'#ef4444', width:40, height:40, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center'}}>
              <AlertTriangle size={18} />
            </div>
            <div>
              <span className="text-white">Tạo tranh chấp</span>
              <p className="x-small text-white-50 mb-0">Hợp đồng sẽ chuyển sang trạng thái DISPUTED</p>
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-3">
          <div className="mb-3 p-3 rounded" style={{background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.15)'}}>
            <p className="x-small text-white-50 mb-1">Hợp đồng: <strong className="text-white">{contract?.jobTitle || contract?.contractName}</strong></p>
            <p className="x-small text-white-50 mb-0">Giá trị: <strong className="text-warning">{formatMoney(contractAmount)}</strong></p>
          </div>

          <Form.Group className="mb-3">
            <Form.Label className="x-small fw-bold text-white-50">LÝ DO TRANH CHẤP *</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              placeholder="Mô tả chi tiết lý do bạn tạo tranh chấp (tối đa 1000 ký tự)..."
              className="bg-dark-input text-white border-0"
              value={disputeReason}
              maxLength={1000}
              onChange={(e) => setDisputeReason(e.target.value)}
            />
            <p className="x-small text-white-50 mt-1 mb-0">{disputeReason.length}/1000 ký tự</p>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="outline-light" onClick={() => { setShowDisputeModal(false); setDisputeReason(''); }}>Hủy</Button>
          <Button variant="danger" onClick={() => handleAction('dispute', disputeReason)} disabled={!disputeReason.trim() || isSaving}>
            {isSaving ? <><Loader2 className="spinner me-1" size={14} /> Đang gửi...</> : <><AlertTriangle size={14} className="me-1" /> Gửi tranh chấp</>}
          </Button>
        </Modal.Footer>
      </Modal>

      <ReportModal
        show={showReportModal}
        onHide={() => setShowReportModal(false)}
        targetType="CONTRACT"
        targetId={id}
        targetName={`Hợp đồng #${id?.substring(0, 8)}`}
      />
    </div>
  );
};

export default Contract;
