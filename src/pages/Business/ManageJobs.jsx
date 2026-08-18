import React, { useState, useEffect, useCallback } from 'react';
import { Container, Badge, Button, Row, Col, Modal, Spinner, Tabs, Tab, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import {
  Users, Plus, Loader2, Clock, CheckCircle, AlertTriangle, RefreshCw,
  Check, X, User, Calendar, DollarSign, Handshake, Eye, PenTool,
  Briefcase, Search, MapPin, TrendingUp, MoreVertical, ExternalLink,
  FileText, ArrowUpRight, Star
} from 'lucide-react';
import { jobService } from "../../services/jobservice";
import { bidService } from "../../services/bidservice";
import { contractService } from "../../services/contractservice";
import { serviceOrderService } from "../../services/serviceorderservice";
import { dashboardService } from "../../services/dashboardService";
import PaginationBar from '../../components/PaginationBar';
import '../../CSS/ManageJobs.css';

const ManageJobs = () => {
  // ============================================================
  // STATE: DANH SÁCH DỮ LIỆU
  // ============================================================

  // Danh sách bài tuyển dụng của doanh nghiệp
  const [jobs, setJobs] = useState([]);

  // Danh sách hợp đồng
  const [contracts, setContracts] = useState([]);

  // Trạng thái loading (hiện spinner)
  const [loading, setLoading] = useState(true);

  // Thông báo lỗi (hiện alert nếu có)
  const [error, setError] = useState(null);

  // Tab đang chọn: 'jobs' | 'orders' | 'contracts'
  const [activeTab, setActiveTab] = useState('jobs');

  // Từ khóa tìm kiếm
  const [searchTerm, setSearchTerm] = useState('');

  // Bộ lọc trạng thái bài đăng (chỉ dùng cho tab jobs)
  const [filterStatus, setFilterStatus] = useState('');

  // ============================================================
  // STATE: MODAL XEM ỨNG VIÊN (BIDS)
  // ============================================================

  // Hiển thị modal danh sách ứng viên?
  const [showBidsModal, setShowBidsModal] = useState(false);

  // Bài đăng đang xem ứng viên
  const [selectedJob, setSelectedJob] = useState(null);

  // Danh sách đơn ứng tuyển (bids) của bài đăng đang chọn
  const [bids, setBids] = useState([]);

  // Đang tải danh sách ứng viên?
  const [bidsLoading, setBidsLoading] = useState(false);

  // ID đơn ứng tuyển đang xử lý (để disable nút khi đang gọi API)
  const [actingBidId, setActingBidId] = useState(null);

  // ============================================================
  // STATE: MODAL CHỈNH SỬA BÀI ĐĂNG
  // ============================================================

  // Hiển thị modal chỉnh sửa?
  const [showEditModal, setShowEditModal] = useState(false);

  // Bài đăng đang chỉnh sửa
  const [editJob, setEditJob] = useState(null);

  // Form data khi chỉnh sửa
  const [editForm, setEditForm] = useState({
    title: '',           // Tiêu đề
    salary: '',          // Mức lương
    description: '',     // Mô tả
    requirements: ''     // Yêu cầu
  });

  // ============================================================
  // STATE: THỐNG KÊ DASHBOARD
  // ============================================================

  // Thống kê tổng quan từ API dashboard
  const [dashboardStats, setDashboardStats] = useState(null);

  // ============================================================
  // STATE: ĐƠN DỊCH VỤ
  // ============================================================

  // Danh sách đơn dịch vụ (service orders)
  const [serviceOrders, setServiceOrders] = useState([]);

  // ID đơn hàng đang xử lý (để disable nút)
  const [creatingContract, setCreatingContract] = useState(null);

  // ============================================================
  // STATE: MODAL TẠO HỢP ĐỒNG
  // ============================================================

  // Hiển thị modal tạo hợp đồng?
  const [showCreateContractModal, setShowCreateContractModal] = useState(false);

  // Loại tạo hợp đồng: 'bid' (từ đơn ứng tuyển) hoặc 'order' (từ đơn dịch vụ)
  const [createContractType, setCreateContractType] = useState(null);

  // ID của bid hoặc order đang chọn để tạo hợp đồng
  const [createContractId, setCreateContractId] = useState(null);

  // Form data khi tạo hợp đồng
  const [createForm, setCreateForm] = useState({
    workContent: '',       // Nội dung công việc
    startDate: '',         // Ngày bắt đầu
    endDate: '',           // Ngày kết thúc
    acceptanceCriteria: '' // Tiêu chí nghiệm thu
  });

  // Đang gửi form tạo hợp đồng?
  const [creatingSubmit, setCreatingSubmit] = useState(false);

  // ============================================================
  // STATE: PHÂN TRANG
  // ============================================================

  // Thông tin phân trang cho từng tab
  const [jobsPagination, setJobsPagination] = useState({
    page: 1,           // Trang hiện tại
    totalPages: 1,     // Tổng số trang
    totalItems: 0      // Tổng số mục
  });

  const [ordersPagination, setOrdersPagination] = useState({
    page: 1,
    totalPages: 1,
    totalItems: 0
  });

  const [contractsPagination, setContractsPagination] = useState({
    page: 1,
    totalPages: 1,
    totalItems: 0
  });

  // Số mục hiển thị trên mỗi trang
  const pageSize = 12;

  // ============================================================
  // HÀM TẢI DANH SÁCH BÀI TUYỂN DỤNG
  // ============================================================
  const fetchMyJobs = useCallback(async (page = 1, keyword = '', status = '') => {
    setLoading(true);
    setError(null);
    try {
      // Gọi API lấy danh sách bài đăng của tôi
      const res = await jobService.getMyJobs({
        page: page,
        pageSize: pageSize,
        keyword: keyword || undefined,    // undefined sẽ bị bỏ qua khi gửi lên server
        status: status || undefined
      });

      if (res.success && res.data) {
        const data = res.data;

        // Lưu danh sách bài đăng
        const jobList = data.items || [];

        // Lưu thông tin phân trang
        setJobsPagination({
          page: data.page || 1,
          totalPages: data.totalPages || 1,
          totalItems: data.totalItems || 0
        });

        // Bổ sung số lượng ứng viên cho từng bài đăng
        // Gọi API lấy danh sách bids cho TỪNG bài đăng (song song)
        const enriched = await Promise.allSettled(
          jobList.map(async (job) => {
            try {
              // Gọi API lấy bids của bài đăng này
              const bidRes = await bidService.getJobBids(job.jobId);

              // Parse danh sách bids từ response
              let bidArr = [];
              if (Array.isArray(bidRes && bidRes.data)) {
                bidArr = bidRes.data;
              } else if (bidRes && bidRes.data && bidRes.data.items) {
                bidArr = bidRes.data.items;
              }

              // Lấy số lượng bids
              const bidCount = bidArr.length || (job.bidCount || 0);

              // Trả về job kèm bidCount
              return { ...job, bidCount: bidCount };
            } catch {
              // Nếu lỗi → giữ nguyên bidCount từ job gốc
              return { ...job, bidCount: job.bidCount || 0 };
            }
          })
        );

        // Chuyển kết quả Promise.allSettled thành mảng jobs
        // fulfilled → lấy value, rejected → lấy reason, filter null
        const finalJobs = enriched
          .map(result => {
            if (result.status === 'fulfilled') {
              return result.value;
            } else {
              return result.reason;
            }
          })
          .filter(Boolean);

        setJobs(finalJobs);
      }
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setError("Chức năng này chưa sẵn sàng.");
      } else {
        setError("Không thể tải danh sách bài đăng.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================
  // HÀM TẢI DANH SÁCH HỢP ĐỒNG
  // ============================================================
  const fetchContracts = useCallback(async (page = 1, keyword = '') => {
    setLoading(true);
    try {
      const res = await contractService.getMyContracts({
        page: page,
        pageSize: pageSize,
        keyword: keyword || undefined
      });

      if (res.success && res.data) {
        const data = res.data;
        const contractList = data.items || [];

        // Lưu thông tin phân trang
        setContractsPagination({
          page: data.page || 1,
          totalPages: data.totalPages || 1,
          totalItems: data.totalItems || 0
        });

        // Bổ sung thông tin cho từng hợp đồng
        const enriched = contractList.map(c => {
          // Kiểm tra hợp đồng đã bị khóa chưa
          const isLocked = Boolean(c.isContentLocked || c.contentLockedAt);

          return {
            ...c,
            // Nếu đã khóa hoặc đã ký → coi như đã ký
            hasStudentSigned: isLocked || c.hasStudentSigned || c.studentSignedAt || false,
            hasEnterpriseSigned: isLocked || c.hasEnterpriseSigned || c.enterpriseSignedAt || false,
            // Hợp đồng hoàn thành → progress = 100%
            progressPercent: c.status === 'COMPLETED' ? 100 : (c.progressPercent || 0),
          };
        });

        // Tải tiến độ cho hợp đồng đang chạy
        // Chỉ tải cho hợp đồng có status IN_PROGRESS hoặc DELIVERED
        const contractsNeedingProgress = enriched.filter(c => {
          return c.status === 'IN_PROGRESS' || c.status === 'DELIVERED';
        });

        const progressPromises = contractsNeedingProgress.map(c => {
          return contractService.getProgress(c.contractId)
            .then(res => {
              // Parse dữ liệu tiến độ
              let progressData = null;
              if (Array.isArray(res && res.data)) {
                // Nếu là mảng → lấy phần tử đầu tiên
                progressData = res.data[0];
              } else {
                progressData = res && res.data || null;
              }

              // Cập nhật progressPercent cho hợp đồng
              if (progressData) {
                c.progressPercent = progressData.progressPercent || 0;
              }
            })
            .catch(() => {
              // Nếu lỗi → giữ nguyên progressPercent cũ
            });
        });

        // Đợi tất cả API tiến độ hoàn thành
        await Promise.allSettled(progressPromises);

        // Lưu danh sách hợp đồng đã enriched
        setContracts(enriched);
      }
    } catch (err) {
      console.error("Lỗi tải hợp đồng:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================
  // HÀM TẢI DANH SÁCH ĐƠN DỊCH VỤ
  // ============================================================
  const fetchServiceOrders = useCallback(async (page = 1, keyword = '') => {
    setLoading(true);
    try {
      const res = await serviceOrderService.getEnterpriseOrders({
        page: page,
        pageSize: pageSize,
        keyword: keyword || undefined
      });

      if (res.success && res.data) {
        const data = res.data;

        // Lưu danh sách đơn dịch vụ
        setServiceOrders(data.items || []);

        // Lưu thông tin phân trang
        setOrdersPagination({
          page: data.page || 1,
          totalPages: data.totalPages || 1,
          totalItems: data.totalItems || 0
        });
      }
    } catch (err) {
      console.error("Lỗi tải đơn dịch vụ:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================
  // useEffect: TẢI DỮ LIỆU KHI CHUYỂN TAB
  // ============================================================
  useEffect(() => {
    // Tải dữ liệu tương ứng với tab đang chọn
    if (activeTab === 'jobs') {
      fetchMyJobs(1, '', filterStatus);
    } else if (activeTab === 'contracts') {
      fetchContracts(1);
    } else if (activeTab === 'orders') {
      fetchServiceOrders(1);
    }

    // Xóa từ khóa tìm kiếm khi chuyển tab
    setSearchTerm('');
  }, [activeTab, filterStatus]);

  // ============================================================
  // useEffect: TẢI THỐNG KÊ DASHBOARD (chỉ chạy 1 lần)
  // ============================================================
  useEffect(() => {
    dashboardService.getEnterpriseDashboard()
      .then(res => {
        setDashboardStats(res.data);
      })
      .catch(() => {
        // Nếu lỗi → bỏ qua, không hiển thị thống kê
      });
  }, []);

  // ============================================================
  // HÀM TÌM KIẾM TRONG TAB HIỆN TẠI
  // ============================================================
  const handleTabSearch = () => {
    if (activeTab === 'jobs') {
      fetchMyJobs(1, searchTerm, filterStatus);
    } else if (activeTab === 'contracts') {
      fetchContracts(1, searchTerm);
    } else if (activeTab === 'orders') {
      fetchServiceOrders(1, searchTerm);
    }
  };

  // ============================================================
  // HÀM CHUYỂN TRANG TRONG TAB HIỆN TẠI
  // ============================================================
  const handleTabPageChange = (page) => {
    if (activeTab === 'jobs') {
      fetchMyJobs(page, searchTerm, filterStatus);
    } else if (activeTab === 'contracts') {
      fetchContracts(page, searchTerm);
    } else if (activeTab === 'orders') {
      fetchServiceOrders(page, searchTerm);
    }
  };

  // ============================================================
  // HÀM MỞ MODAL TẠO HỢP ĐỒNG TỪ ĐƠN ỨNG TUYỂN
  // ============================================================
  const handleCreateContractFromBid = (bidId) => {
    setCreateContractType('bid');         // Loại: từ đơn ứng tuyển
    setCreateContractId(bidId);          // ID đơn ứng tuyển
    setCreateForm({                       // Reset form
      workContent: '',
      startDate: '',
      endDate: '',
      acceptanceCriteria: ''
    });
    setShowCreateContractModal(true);    // Mở modal
  };

  // ============================================================
  // HÀM MỞ MODAL TẠO HỢP ĐỒNG TỪ ĐƠN DỊCH VỤ
  // ============================================================
  const handleCreateContractFromOrder = (orderId) => {
    setCreateContractType('order');       // Loại: từ đơn dịch vụ
    setCreateContractId(orderId);        // ID đơn dịch vụ
    setCreateForm({                       // Reset form
      workContent: '',
      startDate: '',
      endDate: '',
      acceptanceCriteria: ''
    });
    setShowCreateContractModal(true);    // Mở modal
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
      const selectedOrder = serviceOrders.find(o => o.orderId === createContractId);
      const selectedBid = bids.find(b => b.bidId === createContractId);

      const payload = {
        WorkContent: createForm.workContent,
        StartDate: createForm.startDate,
        EndDate: createForm.endDate,
        Requirements: createForm.acceptanceCriteria,
        TotalBudget: createContractType === 'bid' 
          ? (selectedBid?.bidAmount || selectedBid?.amount || 0)
          : (selectedOrder?.orderPrice || selectedOrder?.totalAmount || 0)
      };

      console.log('Create contract payload:', payload);

      if (createContractType === 'bid') {
        await contractService.createFromBid(createContractId, payload);
      } else {
        await contractService.createFromServiceOrder(createContractId, payload);
      }

      alert("Tạo hợp đồng thành công!");

      // Đóng modal
      setShowCreateContractModal(false);

      // Tải lại dữ liệu cho cả 3 tab
      fetchMyJobs(jobsPagination.page, '', filterStatus);
      fetchContracts(contractsPagination.page);
      fetchServiceOrders(ordersPagination.page);
    } catch (err) {
      let errorMessage = "Không thể tạo hợp đồng";
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      }
      alert("Lỗi: " + errorMessage);
    } finally {
      setCreatingSubmit(false);
    }
  };

  // ============================================================
  // HÀM CHẤP NHẬN ĐƠN DỊCH VỤ
  // ============================================================
  const handleAcceptOrder = async (orderId) => {
    setCreatingContract(orderId);  // Đánh dấu đang xử lý đơn này
    try {
      await serviceOrderService.acceptOrder(orderId);

      // Cập nhật local state: đổi trạng thái đơn hàng
      setServiceOrders(serviceOrders.map(o => {
        if (o.orderId === orderId) {
          return { ...o, status: 'ACCEPTED' };
        }
        return o;
      }));
    } catch (err) {
      let errorMessage = "Không thể chấp nhận";
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      }
      alert("Lỗi: " + errorMessage);
    } finally {
      setCreatingContract(null);  // Xóa đánh dấu xử lý
    }
  };

  // ============================================================
  // HÀM TỪ CHỐI ĐƠN DỊCH VỤ
  // ============================================================
  const handleRejectOrder = async (orderId) => {
    const userConfirmed = window.confirm('Từ chối đơn dịch vụ này?');
    if (!userConfirmed) return;

    setCreatingContract(orderId);
    try {
      await serviceOrderService.rejectOrder(orderId);

      // Cập nhật local state
      setServiceOrders(serviceOrders.map(o => {
        if (o.orderId === orderId) {
          return { ...o, status: 'REJECTED' };
        }
        return o;
      }));
    } catch (err) {
      let errorMessage = "Không thể từ chối";
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      }
      alert("Lỗi: " + errorMessage);
    } finally {
      setCreatingContract(null);
    }
  };

  // ============================================================
  // HÀM XÓA BÀI TUYỂN DỤNG
  // ============================================================
  const handleDelete = async (jobId) => {
    const userConfirmed = window.confirm('Xóa bài tuyển dụng này?');
    if (!userConfirmed) return;

    try {
      await jobService.deleteJob(jobId);

      // Cập nhật local state: xóa bài đăng vừa xóa khỏi danh sách
      setJobs(jobs.filter(j => j.jobId !== jobId));
    } catch (err) {
      alert("Lỗi khi xóa.");
    }
  };

  // ============================================================
  // HÀM XEM DANH SÁCH ỨNG VIÊN CỦA MỘT BÀI ĐĂNG
  // ============================================================
  const handleViewBids = async (job) => {
    // Lưu bài đăng đang xem
    setSelectedJob(job);

    // Mở modal
    setShowBidsModal(true);

    // Bắt đầu tải danh sách ứng viên
    setBidsLoading(true);
    try {
      const res = await bidService.getJobBids(job.jobId);

      // Parse danh sách bids từ response
      const bidData = res && res.data;
      let bidList = [];

      if (bidData && bidData.items) {
        // Dạng PagedResponse: { items: [...] }
        bidList = bidData.items;
      } else if (Array.isArray(bidData)) {
        // Dạng mảng trực tiếp: [...]
        bidList = bidData;
      }

      setBids(bidList);
    } catch (err) {
      setBids([]);
    } finally {
      setBidsLoading(false);
    }
  };

  // ============================================================
  // HÀM CHẤP NHẬN ĐƠN ỨNG TUYỂN
  // ============================================================
  const handleAcceptBid = async (bidId) => {
    setActingBidId(bidId);  // Đánh dấu đang xử lý
    try {
      await bidService.acceptBid(bidId);

      // Cập nhật local state
      setBids(bids.map(b => {
        if (b.bidId === bidId) {
          return { ...b, status: 'ACCEPTED' };
        }
        return b;
      }));
    } catch (err) {
      let errorMessage = "Không xác định";
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      }
      alert("Lỗi: " + errorMessage);
    } finally {
      setActingBidId(null);
    }
  };

  // ============================================================
  // HÀM TỪ CHỐI ĐƠN ỨNG TUYỂN
  // ============================================================
  const handleRejectBid = async (bidId) => {
    const userConfirmed = window.confirm('Từ chối ứng viên này?');
    if (!userConfirmed) return;

    setActingBidId(bidId);
    try {
      await bidService.rejectBid(bidId);

      // Cập nhật local state
      setBids(bids.map(b => {
        if (b.bidId === bidId) {
          return { ...b, status: 'REJECTED' };
        }
        return b;
      }));
    } catch (err) {
      let errorMessage = "Không xác định";
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      }
      alert("Lỗi: " + errorMessage);
    } finally {
      setActingBidId(null);
    }
  };

  // ============================================================
  // HÀM MỞ MODAL CHỈNH SỬA BÀI ĐĂNG
  // ============================================================
  const handleEditJob = (job) => {
    setEditJob(job);
    setEditForm({
      title: job.title || '',
      salary: job.salary || '',
      description: job.description || '',
      requirements: job.requirements || ''
    });
    setShowEditModal(true);
  };

  // ============================================================
  // HÀM LƯU THAY ĐỔI BÀI ĐĂNG
  // ============================================================
  const handleSaveEdit = async () => {
    if (!editForm.title.trim()) {
      alert("Vui lòng nhập tiêu đề");
      return;
    }

    try {
      await jobService.updateJob(editJob.jobId, {
        ...editForm,
        salary: Number(editForm.salary) || 0   // Chuyển string → number
      });

      alert("Cập nhật thành công!");
      setShowEditModal(false);

      // Tải lại danh sách bài đăng
      fetchMyJobs(jobsPagination.page, '', filterStatus);
    } catch (err) {
      let errorMessage = "Không thể cập nhật";
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      }
      alert("Lỗi: " + errorMessage);
    }
  };

  // ============================================================
  // HÀM XÁC ĐỊNH TRẠNG THÁI BÀI ĐĂNG
  // Input: status (string)
  // Output: { label, color, bg, icon }
  // ============================================================
  const getStatusConfig = (status) => {
    const statusMap = {
      'APPROVED': {
        label: 'Đang hiển thị',
        color: '#10b981',
        bg: 'rgba(16,185,129,0.12)',
        icon: <CheckCircle size={12} />
      },
      'OPEN': {
        label: 'Đang hiển thị',
        color: '#10b981',
        bg: 'rgba(16,185,129,0.12)',
        icon: <CheckCircle size={12} />
      },
      'PENDING': {
        label: 'Chờ duyệt',
        color: '#f59e0b',
        bg: 'rgba(245,158,11,0.12)',
        icon: <Clock size={12} />
      },
      'REJECTED': {
        label: 'Bị từ chối',
        color: '#ef4444',
        bg: 'rgba(239,68,68,0.12)',
        icon: <X size={12} />
      },
      'CLOSED': {
        label: 'Đã đóng',
        color: '#6b7280',
        bg: 'rgba(107,114,128,0.12)',
        icon: <X size={12} />
      },
    };

    // Tìm theo status, nếu không tìm thấy → dùng mặc định
    if (statusMap[status]) {
      return statusMap[status];
    }
    return {
      label: status,
      color: '#60a5fa',
      bg: 'rgba(96,165,250,0.12)',
      icon: <Briefcase size={12} />
    };
  };

  // ============================================================
  // HÀM XÁC ĐỊNH TRẠNG THÁI HỢP ĐỒNG
  // ============================================================
  const getContractStatusConfig = (status) => {
    const statusMap = {
      'SIGNING':          { label: 'Chờ ký',          color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
      'AWAITING_PAYMENT': { label: 'Chờ thanh toán',  color: '#60a5fa', bg: 'rgba(96,165,250,0.12)' },
      'IN_PROGRESS':      { label: 'Đang thực hiện',  color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
      'DELIVERED':        { label: 'Đã bàn giao',     color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
      'CANCEL_REQUESTED': { label: 'Yêu cầu hủy',    color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
      'COMPLETED':        { label: 'Hoàn thành',      color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
      'DISPUTED':         { label: 'Tranh chấp',      color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
      'CANCELLED':        { label: 'Đã hủy',          color: '#6b7280', bg: 'rgba(107,114,128,0.12)' },
      'EXPIRED':          { label: 'Hết hạn',         color: '#6b7280', bg: 'rgba(107,114,128,0.12)' },
    };

    if (statusMap[status]) {
      return statusMap[status];
    }
    return {
      label: status,
      color: '#60a5fa',
      bg: 'rgba(96,165,250,0.12)'
    };
  };

  // ============================================================
  // HÀM XÁC ĐỊNH TRẠNG THÁI ĐƠN ỨNG TUYỂN
  // ============================================================
  const getBidStatusConfig = (status) => {
    const statusMap = {
      'ACCEPTED':  { label: 'Chấp nhận', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
      'PENDING':   { label: 'Chờ duyệt', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
      'REJECTED':  { label: 'Từ chối',   color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
      'WITHDRAWN': { label: 'Đã rút',    color: '#6b7280', bg: 'rgba(107,114,128,0.12)' },
    };

    if (statusMap[status]) {
      return statusMap[status];
    }
    return {
      label: status,
      color: '#60a5fa',
      bg: 'rgba(96,165,250,0.12)'
    };
  };

  // ============================================================
  // HÀM XÁC ĐỊNH TRẠNG THÁI ĐƠN DỊCH VỤ
  // ============================================================
  const getOrderStatusConfig = (status) => {
    const statusMap = {
      'PENDING':      { label: 'Chờ xử lý',     color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
      'ACCEPTED':     { label: 'Đã chấp nhận',  color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
      'REJECTED':     { label: 'Từ chối',       color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
      'IN_PROGRESS':  { label: 'Đang thực hiện', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
      'COMPLETED':    { label: 'Hoàn thành',     color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
      'CANCELLED':    { label: 'Đã hủy',         color: '#6b7280', bg: 'rgba(107,114,128,0.12)' },
    };

    if (statusMap[status]) {
      return statusMap[status];
    }
    return {
      label: status,
      color: '#60a5fa',
      bg: 'rgba(96,165,250,0.12)'
    };
  };

  // ============================================================
  // HÀM TIỆN ÍCH
  // ============================================================

  // Định dạng tiền VND
  const formatMoney = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  // Tổng số đơn ứng tuyển (cộng dồn từ tất cả bài đăng)
  let totalBids = 0;
  for (let i = 0; i < jobs.length; i++) {
    totalBids = totalBids + (jobs[i].bidCount || 0);
  }

  return (
    <div className="mj-page py-5 text-white animate-fade-in">
      <Container fluid className="px-lg-5">
        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-5">
          <div>
            <h1 className="fw-bold display-6 mb-1">
              Quản lý <span className="text-primary-glow">Dự án</span>
            </h1>
            <p className="text-white-50 mb-0">Theo dõi bài đăng tuyển dụng và hợp đồng</p>
          </div>
          <Link to="/post-job" className="mj-btn-create text-decoration-none">
            <Plus size={18} /> ĐĂNG TIN MỚI
          </Link>
        </div>

        {/* STATS CARDS */}
        <Row className="g-3 mb-4">
          <Col xl={3} md={6}>
            <div className="mj-stat-card">
              <div className="mj-stat-icon" style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}>
                <Briefcase size={22} />
              </div>
              <div className="flex-fill">
                <p className="mj-stat-label">Tổng bài đăng</p>
                <h3 className="mj-stat-value">{jobsPagination.totalItems}</h3>
              </div>
              <TrendingUp size={16} className="text-success opacity-50" />
            </div>
          </Col>
          <Col xl={3} md={6}>
            <div className="mj-stat-card">
              <div className="mj-stat-icon" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
                <CheckCircle size={22} />
              </div>
              <div className="flex-fill">
                <p className="mj-stat-label">Đang hiển thị</p>
                <h3 className="mj-stat-value text-success">{jobs.filter(j => j.status === 'APPROVED' || j.status === 'OPEN').length}</h3>
              </div>
              <ArrowUpRight size={16} className="text-success opacity-50" />
            </div>
          </Col>
          <Col xl={3} md={6}>
            <div className="mj-stat-card">
              <div className="mj-stat-icon" style={{ background: 'rgba(168,85,247,0.1)', color: '#a855f7' }}>
                <Users size={22} />
              </div>
              <div className="flex-fill">
                <p className="mj-stat-label">Tổng ứng viên</p>
                <h3 className="mj-stat-value" style={{ color: '#a855f7' }}>{totalBids}</h3>
              </div>
              <Star size={16} className="text-warning opacity-50" />
            </div>
          </Col>
          <Col xl={3} md={6}>
            <div className="mj-stat-card">
              <div className="mj-stat-icon" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>
                <Handshake size={22} />
              </div>
              <div className="flex-fill">
                <p className="mj-stat-label">Hợp đồng</p>
                <h3 className="mj-stat-value text-warning">{contractsPagination.totalItems}</h3>
              </div>
              <FileText size={16} className="text-info opacity-50" />
            </div>
          </Col>
        </Row>

        {/* TABS + SEARCH */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <Tabs activeKey={activeTab} onSelect={(k) => { setActiveTab(k); setSearchTerm(''); }} className="mj-tabs">
            <Tab eventKey="jobs" title={<span><Briefcase size={14} className="me-1" /> Bài đăng ({jobsPagination.totalItems})</span>} />
            <Tab eventKey="orders" title={<span><FileText size={14} className="me-1" /> Đơn dịch vụ ({ordersPagination.totalItems})</span>} />
            <Tab eventKey="contracts" title={<span><Handshake size={14} className="me-1" /> Hợp đồng ({contractsPagination.totalItems})</span>} />
          </Tabs>
          <div className="mj-search">
            <Search size={16} className="text-white-50" />
            <input
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTabSearch()}
            />
          </div>
        </div>

        {activeTab === 'jobs' && (
          <div className="d-flex gap-2 mb-4 flex-wrap">
            {[
              { value: '', label: 'Tất cả' },
              { value: 'OPEN', label: 'Đang hiển thị' },
              { value: 'PENDING', label: 'Chờ duyệt' },
              { value: 'REJECTED', label: 'Bị từ chối' },
              { value: 'CLOSED', label: 'Đã đóng' },
            ].map(f => (
              <button key={f.value}
                className={`post-tab-btn ${filterStatus === f.value ? 'active' : ''}`}
                style={{ fontSize: '12px', padding: '6px 14px' }}
                onClick={() => setFilterStatus(f.value)}
              >{f.label}</button>
            ))}
          </div>
        )}

        {/* CONTENT */}
        {loading ? (
          <div className="text-center py-5">
            <Loader2 className="spinner text-primary" size={40} />
          </div>
        ) : error ? (
          <div className="mj-empty-state">
            <AlertTriangle size={48} className="text-warning mb-3" />
            <p className="text-white-50 mb-3">{error}</p>
            <Button variant="outline-primary" onClick={() => handleTabPageChange(1)}>
              <RefreshCw size={16} className="me-1" /> Thử lại
            </Button>
          </div>
        ) : activeTab === 'jobs' ? (
          <>
            {jobs.length === 0 ? (
              <div className="mj-empty-state">
                <Briefcase size={48} className="text-white-50 mb-3" />
                <p className="text-white-50">Chưa có bài đăng nào</p>
                <Link to="/post-job" className="btn btn-primary fw-bold px-4">Đăng tin ngay</Link>
              </div>
            ) : (
              <Row className="g-3">
                {jobs.map((job) => {
                  const st = getStatusConfig(job.status);
                  return (
                    <Col xl={4} md={6} key={job.jobId}>
                      <div className="mj-job-card">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <span className="mj-status-badge" style={{ background: st.bg, color: st.color }}>
                            {st.icon} {st.label}
                          </span>
                          <span className="mj-date">{new Date(job.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <h6 className="mj-job-title">{job.title}</h6>
                        <p className="mj-job-type">{job.jobType}</p>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <span className="mj-job-price">{job.salary > 0 ? `Giá tiền: ${formatMoney(job.salary)}` : 'Thỏa thuận'}</span>
                          <span className="mj-job-meta">
                            <Users size={12} className="me-1" /> {job.bidCount || 0} ứng viên
                          </span>
                        </div>
                        <div className="d-flex gap-2">
                          <button className="mj-action-btn primary" onClick={() => handleViewBids(job)}>
                            <Users size={14} /> Ứng viên
                          </button>
                          <button className="mj-action-btn primary" onClick={() => handleEditJob(job)}>
                            <PenTool size={14} /> Chỉnh sửa
                          </button>
                          <Button as={Link} to={`/jobs/${job.jobId}`} variant="outline-light" size="sm" className="mj-action-btn">
                            <ExternalLink size={14} /> Xem
                          </Button>
                          <button className="mj-action-btn danger" onClick={() => handleDelete(job.jobId)}>
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    </Col>
                  );
                })}
              </Row>
            )}

            <PaginationBar
              currentPage={jobsPagination.page}
              totalPages={jobsPagination.totalPages}
              onPageChange={handleTabPageChange}
            />
          </>
        ) : activeTab === 'orders' ? (
          <>
            {serviceOrders.length === 0 ? (
              <div className="mj-empty-state">
                <FileText size={48} className="text-white-50 mb-3" />
                <p className="text-white-50">Chưa có đơn dịch vụ nào</p>
              </div>
            ) : (
              <div className="mj-contract-list">
                {serviceOrders.map((order) => {
                  const st = getOrderStatusConfig(order.status);
                  return (
                    <div key={order.orderId} className="mj-contract-card">
                      <div className="d-flex align-items-center gap-4 flex-fill">
                        <div className="mj-contract-avatar">
                          <User size={22} />
                        </div>
                        <div className="flex-fill">
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <h6 className="mj-contract-name mb-0">{order.serviceName || 'Dịch vụ'}</h6>
                            <span className="mj-contract-id">#{order.orderId?.substring(0, 8)}</span>
                          </div>
                          <p className="mj-contract-student mb-0">
                            <User size={12} className="me-1" /> {order.studentName || order.buyerName || 'N/A'}
                          </p>
                          {order.description && <p className="text-white-50 x-small mb-0 mt-1">{order.description}</p>}
                        </div>
                      </div>

                      <div className="mj-contract-info">
                        <span className="mj-contract-amount">{formatMoney(order.totalAmount || order.price)}</span>
                        <span className="mj-status-badge" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                      </div>

                      <div className="d-flex gap-2">
                        {order.status === 'PENDING' && (
                          <>
                            <button
                              className="mj-btn-sm success"
                              disabled={creatingContract === order.orderId}
                              onClick={() => handleAcceptOrder(order.orderId)}
                            >
                              <Check size={14} /> Chấp nhận
                            </button>
                            <button
                              className="mj-btn-sm danger"
                              disabled={creatingContract === order.orderId}
                              onClick={() => handleRejectOrder(order.orderId)}
                            >
                              <X size={14} /> Từ chối
                            </button>
                          </>
                        )}
                        {order.status === 'ACCEPTED' && (
                          <button
                            className="mj-btn-sm success"
                            disabled={creatingContract === order.orderId}
                            onClick={() => handleCreateContractFromOrder(order.orderId)}
                          >
                            {creatingContract === order.orderId ? <Spinner size="sm" animation="border" /> : <FileText size={14} />}
                            Tạo hợp đồng
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <PaginationBar
              currentPage={ordersPagination.page}
              totalPages={ordersPagination.totalPages}
              onPageChange={handleTabPageChange}
            />
          </>
        ) : (
          <>
            {contracts.length === 0 ? (
              <div className="mj-empty-state">
                <Handshake size={48} className="text-white-50 mb-3" />
                <p className="text-white-50">Chưa có hợp đồng nào</p>
              </div>
            ) : (
              <div className="mj-contract-list">
                {contracts.map((c) => {
                  const st = getContractStatusConfig(c.status);
                  const hasStudentSigned = c.hasStudentSigned || c.studentSignedAt;
                  const hasEnterpriseSigned = c.hasEnterpriseSigned || c.enterpriseSignedAt;
                  const partnerName = c.studentName || c.providerName || c.clientName || 'N/A';
                  const progress = c.progressPercent || 0;
                  const isBothSigned = hasStudentSigned && hasEnterpriseSigned;
                  return (
                    <div key={c.contractId} className="mj-contract-card">
                      <div className="d-flex align-items-center gap-4 flex-fill">
                        <div className="mj-contract-avatar">
                          <User size={22} />
                        </div>
                        <div className="flex-fill">
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <h6 className="mj-contract-name mb-0">{c.contractName || c.jobTitle || c.description || c.workContent || c.title || 'Hợp đồng'}</h6>
                            <span className="mj-contract-id">#{c.contractId?.substring(0, 8)}</span>
                          </div>
                          <p className="mj-contract-student mb-0">
                            <User size={12} className="me-1" /> {partnerName}
                          </p>
                          <div className="mt-2" style={{maxWidth: 200}}>
                            <div className="d-flex justify-content-between mb-1">
                              <span className="x-small text-white-50">Tiến độ</span>
                              <span className="x-small fw-bold" style={{color: progress >= 100 ? '#10b981' : '#3b82f6'}}>{progress}%</span>
                            </div>
                            <div className="w-100" style={{height: 4, borderRadius: 4, background: 'rgba(255,255,255,0.08)'}}>
                              <div style={{width: `${progress}%`, height: '100%', borderRadius: 4, background: progress >= 100 ? '#10b981' : progress > 0 ? '#3b82f6' : 'rgba(255,255,255,0.15)', transition: 'width 0.3s'}} />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mj-contract-info">
                        <span className="mj-contract-amount">{formatMoney(c.totalBudget || c.totalAmount)}</span>
                        <span className="mj-status-badge" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                      </div>

                      <div className="mj-contract-sign">
                        <div className={`mj-sign-dot ${hasEnterpriseSigned ? 'signed' : ''}`}>
                          {hasEnterpriseSigned ? <CheckCircle size={10} /> : <Clock size={10} />}
                          <span>DN</span>
                        </div>
                        <div className={`mj-sign-dot ${hasStudentSigned ? 'signed' : ''}`}>
                          {hasStudentSigned ? <CheckCircle size={10} /> : <Clock size={10} />}
                          <span>SV</span>
                        </div>
                      </div>

                      <div className="d-flex gap-2">
                        <Button as={Link} to={`/contract/${c.contractId}`} variant="outline-light" size="sm" className="mj-btn-sm">
                          <Eye size={13} /> Xem
                        </Button>
                        {c.status === 'SIGNING' && !hasEnterpriseSigned && (
                          <Button as={Link} to={`/contract/sign/${c.contractId}`} variant="primary" size="sm" className="mj-btn-sm">
                            <PenTool size={13} /> Ký
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <PaginationBar
              currentPage={contractsPagination.page}
              totalPages={contractsPagination.totalPages}
              onPageChange={handleTabPageChange}
            />
          </>
        )}
      </Container>

      {/* MODAL ỨNG VIÊN */}
      <Modal show={showBidsModal} onHide={() => setShowBidsModal(false)} size="lg" centered dialogClassName="modal-dark">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold d-flex align-items-center gap-2">
            <div className="mj-stat-icon" style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6', width: 40, height: 40 }}>
              <Users size={18} />
            </div>
            <div>
              <span className="text-white">Ứng viên</span>
              <p className="x-small text-white-50 mb-0">{selectedJob?.title}</p>
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-3">
          {bidsLoading ? (
            <div className="text-center py-5"><Loader2 className="spinner text-primary" size={36} /></div>
          ) : bids.length === 0 ? (
            <div className="mj-empty-state py-4">
              <Users size={40} className="text-white-50 mb-2" />
              <p className="text-white-50 mb-0 small">Chưa có ứng viên nào</p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {bids.map((bid) => {
                const bs = getBidStatusConfig(bid.status);
                const studentId = bid.studentId || bid.student?.studentId || bid.student?.userId;
                return (
                  <div key={bid.bidId} className="mj-bid-card">
                    <div className="d-flex gap-3 flex-fill">
                      <div className="mj-bid-avatar">
                        <User size={20} />
                      </div>
                      <div className="flex-fill">
                        <h6 className="fw-bold text-white mb-1">{bid.studentName || bid.student?.fullName || 'Ứng viên'}</h6>
                        <div className="d-flex flex-wrap gap-3 x-small text-white-50 mb-2">
                          <span className="d-flex align-items-center gap-1">
                            <DollarSign size={12} /> {bid.bidAmount ? formatMoney(bid.bidAmount) : 'Chưa có'}
                          </span>
                          <span className="d-flex align-items-center gap-1">
                            <Calendar size={12} /> {
                              bid.expectedDays 
                                ? bid.expectedDays + ' ngày'
                                : bid.deadlineCommit 
                                  ? Math.max(1, Math.ceil((new Date(bid.deadlineCommit) - new Date(bid.createdAt)) / (1000 * 60 * 60 * 24))) + ' ngày'
                                  : '? ngày'
                            }
                          </span>
                          {bid.createdAt && (
                            <span className="d-flex align-items-center gap-1">
                              <Clock size={12} /> {new Date(bid.createdAt).toLocaleDateString('vi-VN')}
                            </span>
                          )}
                        </div>
                        {bid.message && <p className="text-white-50 small mb-2 fst-italic">"{bid.message}"</p>}
                        <span className="mj-status-badge" style={{ background: bs.bg, color: bs.color }}>{bs.label}</span>
                      </div>
                    </div>
                    <div className="d-flex gap-2 mt-2">
                      {studentId && (
                        <Link to={`/cv/student/${studentId}`} target="_blank" className="mj-btn-sm secondary text-decoration-none">
                          <FileText size={13} /> CV
                        </Link>
                      )}
                      {studentId && (
                        <Link to={`/portfolio/${studentId}`} target="_blank" className="mj-btn-sm primary text-decoration-none">
                          <ExternalLink size={13} /> Profile
                        </Link>
                      )}
                      {bid.status === 'PENDING' && (
                        <>
                          <button
                            className="mj-btn-sm success"
                            disabled={actingBidId === bid.bidId}
                            onClick={() => handleAcceptBid(bid.bidId)}
                          >
                            {actingBidId === bid.bidId ? <Spinner size="sm" animation="border" /> : <Check size={14} />}
                            Chấp nhận
                          </button>
                          <button
                            className="mj-btn-sm danger"
                            disabled={actingBidId === bid.bidId}
                            onClick={() => handleRejectBid(bid.bidId)}
                          >
                            <X size={14} /> Từ chối
                          </button>
                        </>
                      )}
                      {bid.status === 'ACCEPTED' && (
                        <button
                          className="mj-btn-sm success"
                          disabled={creatingContract === bid.bidId}
                          onClick={() => handleCreateContractFromBid(bid.bidId)}
                        >
                          {creatingContract === bid.bidId ? <Spinner size="sm" animation="border" /> : <FileText size={14} />}
                          Tạo hợp đồng
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* MODAL CHỈNH SỬA CÔNG VIỆC */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered dialogClassName="modal-dark">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold d-flex align-items-center gap-2">
            <div className="mj-stat-icon" style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6', width: 40, height: 40 }}>
              <PenTool size={18} />
            </div>
            <div>
              <span className="text-white">Chỉnh sửa công việc</span>
              <p className="x-small text-white-50 mb-0">{editJob?.title}</p>
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-3">
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="x-small fw-bold text-white-50">TIÊU ĐỀ</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nhập tiêu đề..."
                className="bg-dark-input text-white border-0"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="x-small fw-bold text-white-50">MỨC LƯƠNG (VND)</Form.Label>
              <Form.Control
                type="number"
                placeholder="Nhập mức lương..."
                className="bg-dark-input text-white border-0"
                value={editForm.salary}
                onChange={(e) => setEditForm({ ...editForm, salary: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="x-small fw-bold text-white-50">MÔ TẢ</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Nhập mô tả..."
                className="bg-dark-input text-white border-0"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="x-small fw-bold text-white-50">YÊU CẦU</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Nhập yêu cầu..."
                className="bg-dark-input text-white border-0"
                value={editForm.requirements}
                onChange={(e) => setEditForm({ ...editForm, requirements: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="outline-light" onClick={() => setShowEditModal(false)}>Hủy</Button>
          <Button variant="primary" onClick={handleSaveEdit}>Lưu thay đổi</Button>
        </Modal.Footer>
      </Modal>

      {/* MODAL TẠO HỢP ĐỒNG */}
      <Modal show={showCreateContractModal} onHide={() => setShowCreateContractModal(false)} centered dialogClassName="modal-dark">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold d-flex align-items-center gap-2">
            <div className="mj-stat-icon" style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', width: 40, height: 40 }}>
              <FileText size={18} />
            </div>
            <div>
              <span className="text-white">Tạo hợp đồng mới</span>
              <p className="x-small text-white-50 mb-0">{createContractType === 'bid' ? 'Từ đơn ứng tuyển' : 'Từ đơn dịch vụ'}</p>
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-3">
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="x-small fw-bold text-white-50">NỘI DUNG CÔNG VIỆC *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
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
                  <Form.Control
                    type="date"
                    className="bg-dark-input text-white border-0"
                    value={createForm.startDate}
                    onChange={(e) => setCreateForm({ ...createForm, startDate: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="x-small fw-bold text-white-50">NGÀY KẾT THÚC *</Form.Label>
                  <Form.Control
                    type="date"
                    className="bg-dark-input text-white border-0"
                    value={createForm.endDate}
                    onChange={(e) => setCreateForm({ ...createForm, endDate: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label className="x-small fw-bold text-white-50">TIÊU CHÍ NGHIỆM THU</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
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

export default ManageJobs;
