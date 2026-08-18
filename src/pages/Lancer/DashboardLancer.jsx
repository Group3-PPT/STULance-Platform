import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Button, Badge, ProgressBar, Spinner, Pagination, Tabs, Tab, Alert, Modal, Form } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText, Handshake, Plus, Eye, ExternalLink, TrendingUp, Layers,
  Heart, Bookmark, Trash2, ChevronRight, Send, Clock, PenTool, ShoppingBag,
  CheckCircle, CheckCircle2, XCircle, CreditCard, AlertCircle, Wallet, Star, User, Loader2
} from 'lucide-react';

import { profileService } from '../../services/profileservice';
import { contractService } from '../../services/contractservice';
import { studentServiceService } from '../../services/studentserviceservice';
import { bidService } from '../../services/bidservice';
import { savedItemsService } from '../../services/saveditemsservice';
import { serviceOrderService } from '../../services/serviceorderservice';
import { dashboardService } from '../../services/dashboardService';
import { unwrapList } from '../../services/responseUtils';
import PaginationBar from '../../components/PaginationBar';

import '../../CSS/Dashboard.css';

const DashboardLancer = () => {
  // ============================================================
  // NAVIGATION & STATE
  // ============================================================
  const navigate = useNavigate();

  // Trạng thái loading (hiện spinner khi đang tải dữ liệu)
  const [loading, setLoading] = useState(true);

  // Dữ liệu hồ sơ người dùng (từ profileService)
  const [profile, setProfile] = useState(null);

  // Dữ liệu tổng quan dashboard (từ dashboardService)
  const [dashboard, setDashboard] = useState(null);

  // Danh sách hợp đồng của tôi
  const [contracts, setContracts] = useState([]);

  // Lỗi khi tải hợp đồng (hiện alert nếu có)
  const [contractsError, setContractsError] = useState(null);

  // Danh sách dịch vụ tôi đang bán
  const [myServices, setMyServices] = useState([]);

  // Danh sách đơn ứng tuyển tôi đã gửi
  const [myBids, setMyBids] = useState([]);

  // Việc làm đã lưu (bookmark)
  const [savedJobs, setSavedJobs] = useState([]);

  // Dịch vụ đã lưu (bookmark)
  const [savedServices, setSavedServices] = useState([]);

  // Đơn hàng tôi là người bán (sinh viên bán dịch vụ)
  const [providerOrders, setProviderOrders] = useState([]);

  // Đơn hàng tôi là người mua (mua dịch vụ của người khác)
  const [myOrders, setMyOrders] = useState([]);

  // Modal tạo hợp đồng mới
  const [showCreateContractModal, setShowCreateContractModal] = useState(false);

  // ID đơn hàng đang chọn để tạo hợp đồng
  const [createContractOrderId, setCreateContractOrderId] = useState(null);

  // Form data khi tạo hợp đồng mới
  const [createForm, setCreateForm] = useState({
    workContent: '',       // Nội dung công việc
    startDate: '',         // Ngày bắt đầu
    endDate: '',           // Ngày kết thúc
    acceptanceCriteria: '' // Tiêu chí nghiệm thu
  });

  // Đang gửi form tạo hợp đồng?
  const [creatingSubmit, setCreatingSubmit] = useState(false);

  // ============================================================
  // PHÂN TRANG
  // ============================================================

  // Phân trang cho danh sách dịch vụ (hiện 3 dịch vụ/trang)
  const [currentPage, setCurrentPage] = useState(1);
  const servicesPerPage = 3;

  // Phân trang cho danh sách đơn ứng tuyển
  const [bidsPage, setBidsPage] = useState(1);
  const [bidsTotalPages, setBidsTotalPages] = useState(1);
  const [bidsTotalItems, setBidsTotalItems] = useState(0);
  const bidsPageSize = 10;

  // ============================================================
  // HÀM XÁC ĐỊNH TRẠNG THÁI HỢP ĐỒNG
  // Input: item (hợp đồng)
  // Output: { label, variant, btnText, btnIcon, link }
  // ============================================================
  const getContractStatusConfig = (item) => {
    // Lấy status từ hợp đồng
    const status = item.status;

    // Map status → cấu hình hiển thị
    // Mỗi status có: label (text), variant (màu Badge), btnText (text nút), link (đường dẫn)
    switch (status) {

      case 'SIGNING':
        // Hợp đồng đang chờ ký → hiển thị nút "Ký tên ngay"
        return {
          label: 'Đang ký',
          variant: 'warning',
          btnText: 'KÝ TÊN NGAY',
          btnIcon: <PenTool size={14} />,
          link: `/contract/sign/${item.contractId}`
        };

      case 'AWAITING_PAYMENT':
        // Hợp đồng chờ thanh toán → hiển thị nút "Chi tiết"
        return {
          label: 'Chờ thanh toán',
          variant: 'info',
          btnText: 'CHI TIẾT',
          btnIcon: null,
          link: `/contract/${item.contractId}`
        };

      case 'IN_PROGRESS':
        // Hợp đồng đang thực hiện
        return {
          label: 'Đang thực hiện',
          variant: 'primary',
          btnText: 'CHI TIẾT',
          btnIcon: null,
          link: `/contract/${item.contractId}`
        };

      case 'DELIVERED':
        // Đã bàn giao → chờ nghiệm thu
        return {
          label: 'Đã bàn giao',
          variant: 'success',
          btnText: 'CHI TIẾT',
          btnIcon: null,
          link: `/contract/${item.contractId}`
        };

      case 'CANCEL_REQUESTED':
        // Có yêu cầu hủy
        return {
          label: 'Yêu cầu hủy',
          variant: 'danger',
          btnText: 'CHI TIẾT',
          btnIcon: null,
          link: `/contract/${item.contractId}`
        };

      case 'COMPLETED':
        // Hợp đồng hoàn thành
        return {
          label: 'Đã hoàn thành',
          variant: 'success',
          btnText: 'CHI TIẾT',
          btnIcon: null,
          link: `/contract/${item.contractId}`
        };

      case 'DISPUTED':
        // Đang tranh chấp
        return {
          label: 'Tranh chấp',
          variant: 'danger',
          btnText: 'CHI TIẾT',
          btnIcon: null,
          link: `/contract/${item.contractId}`
        };

      case 'CANCELLED':
        // Đã bị hủy
        return {
          label: 'Đã hủy',
          variant: 'secondary',
          btnText: 'CHI TIẾT',
          btnIcon: null,
          link: `/contract/${item.contractId}`
        };

      case 'EXPIRED':
        // Hết hạn
        return {
          label: 'Hết hạn',
          variant: 'secondary',
          btnText: 'CHI TIẾT',
          btnIcon: null,
          link: `/contract/${item.contractId}`
        };

      default:
        // Trạng thái không xác định
        return {
          label: status,
          variant: 'secondary',
          btnText: 'CHI TIẾT',
          btnIcon: null,
          link: `/contract/${item.contractId}`
        };
    }
  };

  // ============================================================
  // HÀM TẢI DỮ LIỆU DASHBOARD
  // Gọi 8 API cùng lúc bằng Promise.allSettled
  // ============================================================
  const fetchData = async () => {
    setLoading(true);
    try {
      // Gọi 8 API song song (không cần chờ API này xong mới gọi API kia)
      const results = await Promise.allSettled([

        profileService.getBasicProfile(),         // [0] Hồ sơ người dùng
        contractService.getMyContracts(),          // [1] Danh sách hợp đồng
        studentServiceService.getMyServices(),     // [2] Danh sách dịch vụ tôi bán
        savedItemsService.getMySavedJobs(),        // [3] Việc làm đã lưu
        savedItemsService.getMySavedServices(),    // [4] Dịch vụ đã lưu
        serviceOrderService.getMyBuyerOrders(),    // [5] Đơn hàng tôi mua
        serviceOrderService.getMyProviderOrders(), // [6] Đơn hàng tôi bán
        dashboardService.getStudentDashboard()     // [7] Thống kê tổng quan
      ]);

      // Xử lý kết quả từ từng API
      // Nếu API thành công (fulfilled) → lưu dữ liệu vào state
      // Nếu API thất bại (rejected) → bỏ qua, giữ nguyên giá trị cũ

      // [0] Hồ sơ
      if (results[0].status === 'fulfilled') {
        setProfile(results[0].value.data);
      }

      // [1] Hợp đồng
      if (results[1].status === 'fulfilled') {
        // unwrapList: xử lý nhiều dạng response (array, pagedResponse, etc.)
        setContracts(unwrapList(results[1].value));
        setContractsError(null);
      } else {
        setContractsError("Không thể tải danh sách hợp đồng. Server trả về lỗi.");
      }

      // [2] Dịch vụ tôi bán
      if (results[2].status === 'fulfilled') {
        setMyServices(unwrapList(results[2].value));
      }

      // [3] Việc làm đã lưu
      if (results[3].status === 'fulfilled') {
        setSavedJobs(unwrapList(results[3].value));
      }

      // [4] Dịch vụ đã lưu
      if (results[4].status === 'fulfilled') {
        setSavedServices(unwrapList(results[4].value));
      }

      // [5] Đơn hàng tôi mua
      if (results[5].status === 'fulfilled') {
        setMyOrders(unwrapList(results[5].value));
      }

      // [6] Đơn hàng tôi bán
      if (results[6].status === 'fulfilled') {
        setProviderOrders(unwrapList(results[6].value));
      }

      // [7] Thống kê dashboard
      if (results[7].status === 'fulfilled') {
        setDashboard(results[7].value.data);
      }

      // Tải thêm danh sách đơn ứng tuyển (trang 1)
      await fetchBids(1);

    } catch (err) {
      console.error("Lỗi tải Dashboard:", err);
    } finally {
      // Tắt loading (luôn chạy dù thành công hay thất bại)
      setLoading(false);
    }
  };

  // Tự động gọi fetchData khi component mount (chỉ chạy 1 lần)
  useEffect(() => {
    fetchData();
  }, []);

  // ============================================================
  // HÀM TẢI DANH SÁCH ĐƠN ỨNG TUYỂN (PHÂN TRANG)
  // ============================================================
  const fetchBids = useCallback(async (page = 1) => {
    try {
      // Gọi API lấy danh sách đơn ứng tuyển của tôi
      const res = await bidService.getMyBids({
        page: page,
        pageSize: bidsPageSize
      });

      // Kiểm tra response thành công
      if (res.success && res.data) {
        const data = res.data;

        // Lưu danh sách đơn ứng tuyển
        // data.items: mảng các đơn ứng tuyển
        // Nếu không có items → dùng mảng rỗng []
        setMyBids(data.items || []);

        // Lưu thông tin phân trang
        setBidsTotalPages(data.totalPages || 1);    // Tổng số trang
        setBidsTotalItems(data.totalItems || 0);    // Tổng số đơn ứng tuyển
        setBidsPage(data.page || 1);                // Trang hiện tại
      }
    } catch (err) {
      console.error("Lỗi tải bids:", err);
    }
  }, []);

  // Xử lý khi chuyển trang trong danh sách đơn ứng tuyển
  const handleBidsPageChange = (page) => {
    fetchBids(page);
  };

  // ============================================================
  // HÀM RÚT ĐƠN ỨNG TUYỂN
  // ============================================================
  const handleWithdraw = async (bidId) => {
    // Hỏi xác nhận trước khi rút đơn
    const userConfirmed = window.confirm("Bạn có chắc chắn muốn rút đơn ứng tuyển này?");
    if (!userConfirmed) return;

    try {
      // Gọi API rút đơn
      await bidService.withdrawBid(bidId);

      // Cập nhật local state: xóa đơn vừa rút khỏi danh sách
      // filter: giữ lại các đơn có bidId KHÁC bidId vừa rút
      setMyBids(prev => prev.filter(b => b.bidId !== bidId));

      alert("Đã rút đơn thành công.");
    } catch (err) {
      alert("Không thể rút đơn lúc này.");
    }
  };

  // ============================================================
  // HÀM MỞ MODAL TẠO HỢP ĐỒNG TỪ ĐƠN DỊCH VỤ
  // ============================================================
  const handleCreateContract = async (orderId) => {
    // Lưu ID đơn hàng đang chọn
    setCreateContractOrderId(orderId);

    // Reset form về rỗng
    setCreateForm({
      workContent: '',
      startDate: '',
      endDate: '',
      acceptanceCriteria: ''
    });

    // Mở modal
    setShowCreateContractModal(true);
  };

  // ============================================================
  // HÀM GỬI FORM TẠO HỢP ĐỒNG
  // ============================================================
  const handleSubmitCreateContract = async () => {
    // Kiểm tra dữ liệu đầu vào
    if (!createForm.workContent.trim()) {
      alert("Vui lòng nhập nội dung công việc");
      return;
    }
    if (!createForm.startDate) {
      alert("Vui lòng chọn ngày bắt đầu");
      return;
    }
    if (!createForm.endDate) {
      alert("Vui lòng chọn ngày kết thúc");
      return;
    }

    // Bắt đầu gửi form
    setCreatingSubmit(true);
    try {
      const selectedOrder = providerOrders.find(o => o.orderId === createContractOrderId) 
        || myOrders.find(o => o.orderId === createContractOrderId);

      const payload = {
        WorkContent: createForm.workContent,
        StartDate: createForm.startDate,
        EndDate: createForm.endDate,
        Requirements: createForm.acceptanceCriteria,
        TotalBudget: selectedOrder?.orderPrice || 0
      };

      console.log('Create contract payload:', payload);
      await contractService.createFromServiceOrder(createContractOrderId, payload);

      alert("Tạo hợp đồng thành công!");

      // Đóng modal
      setShowCreateContractModal(false);

      // Tải lại toàn bộ dữ liệu
      fetchData();
    } catch (err) {
      console.error('Create contract error:', err.response?.data || err.message);
      let errorMessage = "Không thể tạo hợp đồng";
      if (err.response && err.response.data) {
        errorMessage = err.response.data.message || JSON.stringify(err.response.data);
      }
      alert("Lỗi: " + errorMessage);
    } finally {
      setCreatingSubmit(false);
    }
  };

  // ============================================================
  // HÀM DỌN DẸP CÁC MỤC ĐÃ LƯU KHÔNG CÒN KHẢ DỤNG
  // ============================================================
  const handleClearUnavailable = async () => {
    const userConfirmed = window.confirm("Xóa tất cả mục đã lưu không còn khả dụng?");
    if (!userConfirmed) return;

    try {
      await savedItemsService.clearUnavailableItems();
      alert("Đã dọn dẹp xong!");
      fetchData();
    } catch (err) {
      let errorMessage = "Không thể thực hiện";
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      }
      alert("Lỗi khi dọn dẹp: " + errorMessage);
    }
  };

  // ============================================================
  // HÀM CHẤP NHẬN ĐƠN DỊCH VỤ (Sinh viên là người bán)
  // ============================================================
  const handleAcceptOrder = async (orderId) => {
    try {
      await serviceOrderService.acceptOrder(orderId);
      alert("Đã chấp nhận đơn hàng!");
      fetchData();
    } catch (err) {
      let errorMessage = "Không thể chấp nhận đơn";
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      }
      alert("Lỗi: " + errorMessage);
    }
  };

  // ============================================================
  // HÀM TỪ CHỐI ĐƠN DỊCH VỤ (Sinh viên là người bán)
  // ============================================================
  const handleRejectOrder = async (orderId) => {
    const userConfirmed = window.confirm("Bạn chắc chắn muốn từ chối đơn này?");
    if (!userConfirmed) return;

    try {
      await serviceOrderService.rejectOrder(orderId);
      alert("Đã từ chối đơn hàng.");
      fetchData();
    } catch (err) {
      let errorMessage = "Không thể từ chối đơn";
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      }
      alert("Lỗi: " + errorMessage);
    }
  };

  // ============================================================
  // BIẾN TÍNH TOÁN (Derived Variables)
  // Tự động cập nhật khi state thay đổi
  // ============================================================

  // Tính toán phân trang cho danh sách dịch vụ
  // indexOfLast: vị trí phần tử cuối cùng trên trang hiện tại
  const indexOfLast = currentPage * servicesPerPage;

  // currentServices: danh sách dịch vụ hiển thị trên trang hiện tại
  // Ví dụ: trang 1 → lấy 3 dịch vụ đầu tiên
  const currentServices = myServices.slice(indexOfLast - servicesPerPage, indexOfLast);

  // Tổng số trang phân trang cho dịch vụ
  const totalPages = Math.ceil(myServices.length / servicesPerPage);

  // Định dạng tiền VND: 1000000 → "1.000.000đ"
  const formatMoney = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount).replace('₫', 'đ');
  };

  // Lọc hợp đồng theo trạng thái
  // Hợp đồng đang chạy: IN_PROGRESS hoặc SIGNING
  const activeContracts = contracts.filter(c => {
    return c.status === 'IN_PROGRESS' || c.status === 'SIGNING';
  });

  // Hợp đồng đã hoàn thành
  const completedContracts = contracts.filter(c => {
    return c.status === 'COMPLETED';
  });

  // Tổng thu nhập từ hợp đồng đã hoàn thành
  // Duyệt qua từng hợp đồng đã hoàn thành, cộng dồn tổng tiền
  let totalEarnings = 0;
  for (let i = 0; i < completedContracts.length; i++) {
    const contract = completedContracts[i];
    // Lấy tổng budget (thử nhiều trường có thể có)
    const amount = contract.totalBudget || contract.totalAmount || 0;
    totalEarnings = totalEarnings + amount;
  }

  if (loading) return <div className="vh-100 d-flex justify-content-center align-items-center bg-dark"><Spinner animation="border" variant="primary" /></div>;

  return (
    <div className="dashboard-page py-5 text-white animate-fade-in">
      <Container>
        <div className="mb-5 d-flex justify-content-between align-items-center">
          <div>
            <h1 className="fw-bold display-6 mb-1">Chào, <span className="text-primary-glow">{profile?.fullName || 'Freelancer'}</span></h1>
            <p className="x-small uppercase-tracking text-white-50">Hệ thống quản lý công việc và dịch vụ</p>
          </div>
          <div className="d-flex align-items-center gap-2">
            {localStorage.getItem('userRole') === 'ENTERPRISE' ? (
              <Button as={Link} to="/saved-services" variant="outline-primary" size="sm" className="x-small fw-bold px-3 py-2">
                <Heart size={14} className="me-1" /> DỊCH VỤ ĐÃ LƯU
              </Button>
            ) : (
              <Button as={Link} to="/portfolio-manager" variant="outline-primary" size="sm" className="x-small fw-bold px-3 py-2">
                <User size={14} className="me-1" /> XEM PORTFOLIO
              </Button>
            )}
            <Badge bg="primary" className="shadow-glow px-3 py-2 x-small fw-bold">ID: {profile?.userId?.substring(0, 6)}</Badge>
          </div>
        </div>

        {/* STATS CARDS */}
        <Row className="g-3 mb-4">
          <Col xl={3} md={6}>
            <div className="glass-card p-3 border-white-10">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="x-small fw-bold text-white-50 mb-1">HỢP ĐỒNG ĐANG CHẠY</p>
                  <h3 className="fw-bold text-white mb-0">{activeContracts.length}</h3>
                </div>
                <div className="bg-primary bg-opacity-10 p-2 rounded"><Handshake size={18} className="text-primary" /></div>
              </div>
            </div>
          </Col>
          <Col xl={3} md={6}>
            <div className="glass-card p-3 border-white-10">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="x-small fw-bold text-white-50 mb-1">DOANH THU</p>
                  <h3 className="fw-bold text-success mb-0">{formatMoney(totalEarnings)}</h3>
                </div>
                <div className="bg-success bg-opacity-10 p-2 rounded"><Wallet size={18} className="text-success" /></div>
              </div>
            </div>
          </Col>
          <Col xl={3} md={6}>
            <div className="glass-card p-3 border-white-10">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="x-small fw-bold text-white-50 mb-1">DỊCH VỤ</p>
                  <h3 className="fw-bold text-info mb-0">{myServices.length}</h3>
                </div>
                <div className="bg-info bg-opacity-10 p-2 rounded"><Layers size={18} className="text-info" /></div>
              </div>
            </div>
          </Col>
          <Col xl={3} md={6}>
            <div className="glass-card p-3 border-white-10">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="x-small fw-bold text-white-50 mb-1">ĐÃ HOÀN THÀNH</p>
                  <h3 className="fw-bold text-warning mb-0">{completedContracts.length}</h3>
                </div>
                <div className="bg-warning bg-opacity-10 p-2 rounded"><Star size={18} className="text-warning" /></div>
              </div>
            </div>
          </Col>
        </Row>

        <Row className="g-4">
          {/* LEFT SIDEBAR */}
          <Col lg={4}>
            <div className="glass-card p-3 mb-4 border-white-10">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="x-small fw-bold text-primary-glow opacity-75">CV CỦA TÔI</div>
                <Button as={Link} to="/manage-cvs" className="btn-create-new">TẠO MỚI</Button>
              </div>
              <div className="cv-item-box p-2 rounded-3 d-flex align-items-center justify-content-between border-white-5">
                <div className="d-flex align-items-center gap-2">
                  <div className="bg-primary bg-opacity-10 p-2 rounded text-primary"><FileText size={18} /></div>
                  <p className="mb-0 x-small fw-bold">CV_Freelancer_Main.pdf</p>
                </div>
                <Eye size={14} className="text-white-50 pointer mx-2" />
              </div>
            </div>

            <div className="glass-card p-3 mb-4 border-white-10">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="x-small fw-bold text-primary-glow opacity-75">GÓI DỊCH VỤ</div>
                <Button as={Link} to="/post-service" className="btn-post-service">ĐĂNG BÀI</Button>
              </div>
              <div className="services-list-mini">
                {currentServices.map(s => (
                  <Link to={`/post-service/${s.serviceId}`} key={s.serviceId} className="text-decoration-none">
                    <div className="service-mini-item p-3 mb-2 rounded-3 border-white-5 hover-edit">
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <span className="x-small fw-bold text-white text-truncate w-75">{s.title}</span>
                        <Badge bg="success" className="status-active-sm">ACTIVE</Badge>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mt-1">
                        <span className="text-warning x-small fw-bold">{formatMoney(s.price)}</span>
                        <span className="text-white-50" style={{ fontSize: '9px' }}>{s.category}</span>
                      </div>
                    </div>
                  </Link>
                ))}
                {totalPages > 1 && (
                  <Pagination size="sm" className="custom-pagination justify-content-center mt-2">
                    {[...Array(totalPages)].map((_, i) => (
                      <Pagination.Item key={i + 1} active={i + 1 === currentPage} onClick={() => setCurrentPage(i + 1)}>{i + 1}</Pagination.Item>
                    ))}
                  </Pagination>
                )}
                {myServices.length === 0 && <p className="text-center x-small opacity-25 py-3">Trống</p>}
              </div>
            </div>

            <div className="glass-card p-4 border-white-10 shadow-sm">
              <div className="d-flex align-items-center justify-content-between text-danger x-small fw-bold uppercase-tracking mb-4">
                <div className="d-flex align-items-center gap-2"><Heart size={16} fill="currentColor" /> VIỆC LÀM ĐÃ LƯU</div>
                {savedJobs.length > 0 && (
                  <Button variant="link" className="text-danger p-0 x-small text-decoration-none fw-bold d-flex align-items-center gap-1" onClick={handleClearUnavailable}>
                    <Trash2 size={12} /> Dọn
                  </Button>
                )}
              </div>
              {savedJobs.slice(0, 2).map(job => (
                <Link to={`/jobs/${job.jobId}`} key={job.jobId} className="text-decoration-none">
                  <div className="service-mini-item p-2 mb-2 rounded border-white-5 hover-edit">
                    <p className="mb-0 small fw-bold text-white text-truncate">{job.title}</p>
                    <p className="mb-0 x-small text-primary-glow">{formatMoney(job.salary)}</p>
                  </div> 
                </Link>
              ))}
              {savedJobs.length === 0 && <p className="text-center x-small opacity-25 py-2">Trống</p>}
            </div>

            <div className="glass-card p-4 border-white-10 shadow-sm">
              <div className="d-flex align-items-center justify-content-between text-info x-small fw-bold uppercase-tracking mb-4">
                <div className="d-flex align-items-center gap-2"><Bookmark size={16} fill="currentColor" /> DỊCH VỤ ĐÃ LƯU</div>
                {savedServices.length > 0 && (
                  <Button variant="link" className="text-info p-0 x-small text-decoration-none fw-bold d-flex align-items-center gap-1" onClick={handleClearUnavailable}>
                    <Trash2 size={12} /> Dọn
                  </Button>
                )}
              </div>
              {savedServices.slice(0, 2).map(svc => (
                <Link to={`/service-detail/${svc.serviceId}`} key={svc.serviceId} className="text-decoration-none">
                  <div className="service-mini-item p-2 mb-2 rounded border-white-5 hover-edit">
                    <p className="mb-0 small fw-bold text-white text-truncate">{svc.title}</p>
                    <p className="mb-0 x-small text-primary-glow">{formatMoney(svc.price)}</p>
                  </div>
                </Link>
              ))}
              {savedServices.length === 0 && <p className="text-center x-small opacity-25 py-2">Trống</p>}
            </div>
          </Col>

          {/* RIGHT CONTENT: TABS */}
          <Col lg={8}>
            <div className="glass-card p-2 h-100 border-white-10 shadow-lg">
              <Tabs defaultActiveKey="contracts" className="custom-tabs-dashboard mb-3">
                <Tab eventKey="contracts" title={`Công việc (${contracts.length})`}>
                  <div className="p-2">
                    {contractsError && (
                      <Alert variant="danger" className="bg-danger bg-opacity-10 border-0 text-white x-small mb-3 d-flex align-items-center gap-2 py-2">
                        <AlertCircle size={14} /> {contractsError}
                      </Alert>
                    )}
                    {contracts.map(item => {
                      const cfg = getContractStatusConfig(item);
                      return (
                        <div key={item.contractId} className="contract-card-item p-4 rounded-4 mb-3 border-white-5 shadow-sm">
                          <Row className="align-items-center">
                            <Col md={9}>
                              <Badge bg={cfg.variant} className="text-dark x-small-badge mb-2 fw-bold">{cfg.label.toUpperCase()}</Badge>
                              <h6 className="fw-bold text-white mb-1">{item.jobTitle || item.contractName || item.description || item.workContent || item.title || 'Dự án Freelance'}</h6>
                              <div className="d-flex gap-3 x-small text-white-50 mb-2">
                                <span><Clock size={12} className="me-1" /> {new Date(item.updatedAt).toLocaleDateString()}</span>
                                <span>Đối tác: {item.clientInfo?.displayName || item.clientName || item.enterpriseName || 'Enterprise'}</span>
                              </div>
                              <div className="d-flex align-items-center gap-2">
                                <ProgressBar now={item.status === 'COMPLETED' ? 100 : (item.progressPercent || 0)} className="custom-progress-sm flex-grow-1" style={{ width: '120px' }} />
                                <span className="x-small fw-bold text-primary-glow">{item.status === 'COMPLETED' ? 100 : (item.progressPercent || 0)}%</span>
                              </div>
                            </Col>
                            <Col md={3} className="text-md-end mt-2 mt-md-0">
                              <div className="small fw-bold text-success mb-2">{formatMoney(item.totalBudget || item.totalAmount)}</div>
                              <div className="d-flex gap-2 justify-content-md-end flex-wrap">
                                {item.status === 'SIGNING' && (
                                  <Button as={Link} to={`/contract/${item.contractId}`} variant="outline-light" className="x-small fw-bold px-3 py-2 d-flex align-items-center gap-1">
                                    <FileText size={14} /> XEM HỢP ĐỒNG
                                  </Button>
                                )}
                                <Button as={Link} to={cfg.link} variant={cfg.variant === 'warning' ? 'primary' : 'outline-light'} className="x-small fw-bold px-3 py-2 shadow-glow d-flex align-items-center gap-1">
                                  {cfg.btnIcon} {cfg.btnText}
                                </Button>
                              </div>
                            </Col>
                          </Row>
                        </div>
                      );
                    })}
                    {contracts.length === 0 && (
                      <div className="text-center py-5 opacity-25">
                        <Handshake size={48} className="mb-3" />
                        <p className="small">Bạn chưa có dự án nào đang chạy.</p>
                        <Button as={Link} to="/jobs" className="btn-find-jobs x-small">TÌM VIỆC NGAY</Button>
                      </div>
                    )}
                  </div>
                </Tab>

                <Tab eventKey="orders" title={`Đơn dịch vụ (${myOrders.length})`}>
                  <div className="p-2">
                    {myOrders.map(order => (
                      <div key={order.orderId} className="contract-card-item p-3 rounded-4 mb-2 border-white-5">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <div className="d-flex align-items-center gap-2 mb-1">
                              <ShoppingBag size={14} className="text-primary" />
                              <h6 className="fw-bold mb-0 text-white small">{order.serviceTitle}</h6>
                            </div>
                            <div className="x-small text-white-50">Giá: {formatMoney(order.orderPrice || order.totalAmount || order.totalPrice || order.price || order.servicePrice || order.amount || 0)} | {new Date(order.createdAt).toLocaleDateString()}</div>
                          </div>
                          <div className="text-end">
                            <Badge bg={order.status === 'ACCEPTED' ? 'info' : 'warning'} className="mb-2 d-block px-3 text-dark">{order.status}</Badge>
                            {order.status === 'ACCEPTED' && (
                              <Button variant="primary" size="sm" className="x-small fw-bold shadow-glow" onClick={() => handleCreateContract(order.orderId)}>
                                <CheckCircle size={12} className="me-1" /> TẠO HỢP ĐỒNG
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {myOrders.length === 0 && <p className="text-center py-5 opacity-25 x-small">Trống</p>}
                  </div>
                </Tab>

                <Tab eventKey="bids" title={`Ứng tuyển (${bidsTotalItems})`}>
                  <div className="p-2">
                    {myBids.map(bid => (
                      <div key={bid.bidId} className="contract-card-item p-3 rounded-4 mb-2 border-white-5">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <div className="d-flex align-items-center gap-2 mb-1"><Send size={12} className="text-primary" /><h6 className="fw-bold mb-0 text-white small">{bid.jobTitle}</h6></div>
                            <div className="d-flex gap-3 x-small text-white-50"><span>Chào giá: <strong className="text-success">{formatMoney(bid.bidAmount)}</strong></span></div>
                            <div className="d-flex align-items-center gap-1 mt-1">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} size={10} className={i < (bid.averageRating || 0) ? 'text-warning' : 'text-white-50'} fill={i < (bid.averageRating || 0) ? '#f59e0b' : 'none'} />
                              ))}
                              {bid.averageRating > 0 && <span className="x-small fw-bold text-warning ms-1">{bid.averageRating}</span>}
                            </div>
                          </div>
                          <div className="text-end">
                            <Badge bg={bid.status === 'ACCEPTED' ? 'success' : 'warning'} className="mb-2 x-small-badge d-block px-3 text-dark">{bid.status}</Badge>
                            {bid.status === 'PENDING' && <Button variant="link" className="btn-withdraw p-0 x-small text-decoration-none fw-bold text-danger d-flex align-items-center gap-1 ms-auto" onClick={() => handleWithdraw(bid.bidId)}><Trash2 size={12} /> RÚT ĐƠN</Button>}
                          </div>
                        </div>
                      </div>
                    ))}
                    {myBids.length === 0 && <p className="text-center py-5 opacity-25 x-small">Trống</p>}

                    <PaginationBar
                      currentPage={bidsPage}
                      totalPages={bidsTotalPages}
                      onPageChange={handleBidsPageChange}
                    />
                  </div>
                </Tab>

                <Tab eventKey="provider-orders" title={`Đơn đến (${providerOrders.length})`}>
                  <div className="p-2">
                    {providerOrders.map(order => (
                      <div key={order.orderId} className="contract-card-item p-4 rounded-4 mb-3 border-white-5 shadow-sm">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <div className="d-flex align-items-center gap-2 mb-2">
                              <ShoppingBag size={14} className="text-info" />
                              <h6 className="fw-bold mb-0 text-white">{order.serviceTitle}</h6>
                            </div>
                            <div className="x-small text-white-50 mb-1">Khách: <strong>{order.buyerName || 'N/A'}</strong> | {formatMoney(order.orderPrice || order.totalAmount || order.totalPrice || order.price || 0)}</div>
                            <div className="x-small text-white-50">Ngày đặt: {new Date(order.createdAt).toLocaleDateString()}</div>
                            <div className="d-flex align-items-center gap-1 mt-1">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} size={10} className={i < (order.averageRating || 0) ? 'text-warning' : 'text-white-50'} fill={i < (order.averageRating || 0) ? '#f59e0b' : 'none'} />
                              ))}
                              {order.averageRating > 0 && <span className="x-small fw-bold text-warning ms-1">{order.averageRating}</span>}
                            </div>
                            {order.requirements && <div className="x-small text-info mt-2 fst-italic">Yêu cầu: {order.requirements}</div>}
                          </div>
                          <div className="text-end">
                            <Badge bg={
                              order.status === 'ACCEPTED' ? 'success' :
                                order.status === 'REJECTED' ? 'danger' :
                                  order.status === 'CANCELLED' ? 'secondary' : 'warning'
                            } className="mb-2 d-block px-3 text-dark">{order.status}</Badge>
                            {order.status === 'PENDING' && (
                              <div className="d-flex gap-2 justify-content-end">
                                <Button variant="outline-danger" size="sm" className="x-small fw-bold px-3 py-1" onClick={() => handleRejectOrder(order.orderId)}>
                                  <XCircle size={12} className="me-1" /> TỪ CHỐI
                                </Button>
                                <Button variant="success" size="sm" className="x-small fw-bold px-3 py-1 shadow-glow" onClick={() => handleAcceptOrder(order.orderId)}>
                                  <CheckCircle2 size={12} className="me-1" /> CHẤP NHẬN
                                </Button>
                              </div>
                            )}
                            {order.status === 'ACCEPTED' && (
                              <div className="x-small text-success fst-italic">Đã chấp nhận — chờ khách tạo hợp đồng</div>
                            )}
                            {order.status === 'IN_PROGRESS' && (
                              <div className="x-small text-primary fst-italic">Đang thực hiện</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {providerOrders.length === 0 && <p className="text-center py-5 opacity-25 x-small">Chưa có đơn dịch vụ nào từ khách</p>}
                  </div>
                </Tab>
              </Tabs>
            </div>
          </Col>
        </Row>
      </Container>

      <Modal show={showCreateContractModal} onHide={() => setShowCreateContractModal(false)} centered dialogClassName="modal-dark">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold d-flex align-items-center gap-2">
            <div className="bg-primary bg-opacity-10 p-2 rounded"><FileText size={18} className="text-primary" /></div>
            <div>
              <span className="text-white">Tạo hợp đồng mới</span>
              <p className="x-small text-white-50 mb-0">Từ đơn dịch vụ</p>
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-3">
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="x-small fw-bold text-white-50">NỘI DUNG CÔNG VIỆC *</Form.Label>
              <Form.Control
                as="textarea" rows={3}
                placeholder="Mô tả chi tiết nội dung công việc cần thực hiện..."
                className="bg-dark-input text-white border-0"
                value={createForm.workContent}
                onChange={(e) => setCreateForm({ ...createForm, workContent: e.target.value })}
              />
            </Form.Group>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="x-small fw-bold text-white-50">NGÀY BẮT ĐẦU *</Form.Label>
                  <Form.Control type="date" className="bg-dark-input text-white border-0" value={createForm.startDate}
                    onChange={(e) => setCreateForm({ ...createForm, startDate: e.target.value })} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="x-small fw-bold text-white-50">NGÀY KẾT THÚC *</Form.Label>
                  <Form.Control type="date" className="bg-dark-input text-white border-0" value={createForm.endDate}
                    onChange={(e) => setCreateForm({ ...createForm, endDate: e.target.value })} />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label className="x-small fw-bold text-white-50">TIÊU CHÍ NGHIỆM THU</Form.Label>
              <Form.Control
                as="textarea" rows={2}
                placeholder="Các tiêu chí để nghiệm thu kết quả..."
                className="bg-dark-input text-white border-0"
                value={createForm.acceptanceCriteria}
                onChange={(e) => setCreateForm({ ...createForm, acceptanceCriteria: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="outline-light" onClick={() => setShowCreateContractModal(false)}>Hủy</Button>
          <Button variant="success" onClick={handleSubmitCreateContract} disabled={creatingSubmit}>
            {creatingSubmit ? <><Loader2 className="spinner me-1" size={14} /> Đang tạo...</> : <><FileText size={14} className="me-1" /> Tạo hợp đồng</>}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default DashboardLancer;
