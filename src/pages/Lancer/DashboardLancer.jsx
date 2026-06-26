import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Badge, ProgressBar, Spinner, Pagination, Tabs, Tab, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FileText, Handshake, Plus, Eye, ExternalLink, TrendingUp, Layers, 
  Heart, Bookmark, Trash2, ChevronRight, Send, Clock, PenTool, ShoppingBag, 
  CheckCircle, CheckCircle2, XCircle, CreditCard, AlertCircle 
} from 'lucide-react';

// Services
import { profileService } from '../../services/profileservice';
import { contractService } from '../../services/contractservice';
import { studentServiceService } from '../../services/studentserviceservice';
import { bidService } from '../../services/bidservice';
import { savedItemsService } from '../../services/saveditemsservice';
import { serviceOrderService } from '../../services/serviceorderservice';

import '../../CSS/Dashboard.css';

const DashboardLancer = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [contractsError, setContractsError] = useState(null);
  const [myServices, setMyServices] = useState([]);
  const [myBids, setMyBids] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [savedServices, setSavedServices] = useState([]);
  const [providerOrders, setProviderOrders] = useState([]);
  const [myOrders, setMyOrders] = useState([]);

  // Phân trang dịch vụ (Sidebar trái)
  const [currentPage, setCurrentPage] = useState(1);
  const servicesPerPage = 3; 

  // --- HELPER: LOGIC HIỂN THỊ TRẠNG THÁI HỢP ĐỒNG ---
  const getContractStatusConfig = (item) => {
    const status = item.status;
    switch (status) {
      case 'SIGNING': 
        return { label: 'Đang ký', variant: 'warning', btnText: 'KÝ TÊN NGAY', btnIcon: <PenTool size={14}/>, link: `/contract/sign/${item.contractId}` };
      case 'AWAITING_PAYMENT': 
        return { label: 'Chờ thanh toán', variant: 'info', btnText: 'THANH TOÁN', btnIcon: <CreditCard size={14}/>, link: `/payment?contractId=${item.contractId}` };
      case 'IN_PROGRESS': 
        return { label: 'Đang hoạt động', variant: 'primary', btnText: 'CHI TIẾT', btnIcon: null, link: `/contract/${item.contractId}` };
      case 'COMPLETED': 
        return { label: 'Đã hoàn thành', variant: 'success', btnText: 'CHI TIẾT', btnIcon: null, link: `/contract/${item.contractId}` };
      case 'DISPUTED': 
        return { label: 'Tranh chấp', variant: 'danger', btnText: 'CHI TIẾT', btnIcon: null, link: `/contract/${item.contractId}` };
      default: 
        return { label: status, variant: 'secondary', btnText: 'CHI TIẾT', btnIcon: null, link: `/contract/${item.contractId}` };
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        profileService.getBasicProfile(),
        contractService.getMyContracts(),
        studentServiceService.getMyServices(),
        bidService.getMyBids(),
        savedItemsService.getMySavedJobs(),
        savedItemsService.getMySavedServices(),
        serviceOrderService.getMyBuyerOrders(),
        serviceOrderService.getMyProviderOrders()
      ]);

      if (results[0].status === 'fulfilled') setProfile(results[0].value.data);
      if (results[1].status === 'fulfilled') { setContracts(results[1].value.data || []); setContractsError(null); }
      else { setContractsError("Không thể tải danh sách hợp đồng. Server trả về lỗi."); }
      if (results[2].status === 'fulfilled') setMyServices(results[2].value.data || []);
      if (results[3].status === 'fulfilled') setMyBids(results[3].value.data || []);
      if (results[4].status === 'fulfilled') setSavedJobs(results[4].value.data || []);
      if (results[5].status === 'fulfilled') setSavedServices(results[5].value.data || []);
      if (results[6].status === 'fulfilled') setMyOrders(results[6].value.data || []);
      if (results[7].status === 'fulfilled') setProviderOrders(results[7].value.data || []);
    } catch (err) { 
        console.error("Lỗi tải Dashboard:", err); 
    } finally { 
        setLoading(false); 
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleWithdraw = async (bidId) => {
    if (!window.confirm("Bạn có chắc chắn muốn rút đơn ứng tuyển này?")) return;
    try {
        await bidService.withdrawBid(bidId);
        setMyBids(prev => prev.filter(b => b.bidId !== bidId));
        alert("Đã rút đơn thành công.");
    } catch (err) { alert("Không thể rút đơn lúc này."); }
  };

  const handleCreateContract = async (orderId) => {
    try {
        const res = await contractService.createFromServiceOrder(orderId);
        if (res.success) {
            alert("🎉 Hợp đồng đã được khởi tạo!");
            navigate(`/contract/${res.data.contractId}`);
        }
    } catch (err) {
        alert("Lỗi: " + (err.response?.data?.message || "Yêu cầu không hợp lệ"));
    }
  };

  const handleClearUnavailable = async () => {
    if (!window.confirm("Xóa tất cả mục đã lưu không còn khả dụng (hết hạn, bị ẩn)?")) return;
    try {
        const res = await savedItemsService.clearUnavailableItems();
        alert("Đã dọn dẹp xong!");
        fetchData();
    } catch (err) {
        alert("Lỗi khi dọn dẹp: " + (err.response?.data?.message || "Không thể thực hiện"));
    }
  };

  const handleAcceptOrder = async (orderId) => {
    try {
        await serviceOrderService.acceptOrder(orderId);
        alert("Đã chấp nhận đơn hàng!");
        fetchData();
    } catch (err) {
        alert("Lỗi: " + (err.response?.data?.message || "Không thể chấp nhận đơn"));
    }
  };

  const handleRejectOrder = async (orderId) => {
    if (!window.confirm("Bạn chắc chắn muốn từ chối đơn này?")) return;
    try {
        await serviceOrderService.rejectOrder(orderId);
        alert("Đã từ chối đơn hàng.");
        fetchData();
    } catch (err) {
        alert("Lỗi: " + (err.response?.data?.message || "Không thể từ chối đơn"));
    }
  };

  // Logic phân trang
  const indexOfLast = currentPage * servicesPerPage;
  const currentServices = myServices.slice(indexOfLast - servicesPerPage, indexOfLast);
  const totalPages = Math.ceil(myServices.length / servicesPerPage);

  const formatMoney = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val).replace('₫', 'đ');

  if (loading) return <div className="vh-100 d-flex justify-content-center align-items-center bg-dark"><Spinner animation="border" variant="primary" /></div>;

  return (
    <div className="dashboard-page py-5 text-white animate-fade-in">
      <Container>
        <div className="mb-5 d-flex justify-content-between align-items-center">
          <div>
            <h1 className="fw-bold display-6 mb-1">Chào, <span className="text-primary-glow">{profile?.fullName || 'Freelancer'}</span> 👋</h1>
            <p className="text-muted x-small uppercase-tracking">Hệ thống quản lý công việc và dịch vụ</p>
          </div>
          <Badge bg="primary" className="shadow-glow px-3 py-2 x-small fw-bold">ID: {profile?.userId?.substring(0,6)}</Badge>
        </div>

        <Row className="g-4">
          {/* CỘT TRÁI: SIDEBAR */}
          <Col lg={4}>
            <div className="glass-card p-3 mb-4 border-white-10">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="x-small fw-bold text-primary-glow opacity-75">CV CỦA TÔI</div>
                    <Button as={Link} to="/cv-maker" className="btn-create-new">TẠO MỚI</Button>
                </div>
                <div className="cv-item-box p-2 rounded-3 d-flex align-items-center justify-content-between border-white-5">
                    <div className="d-flex align-items-center gap-2">
                        <div className="bg-primary bg-opacity-10 p-2 rounded text-primary"><FileText size={18}/></div>
                        <p className="mb-0 x-small fw-bold">CV_Freelancer_Main.pdf</p>
                    </div>
                    <Eye size={14} className="text-muted pointer mx-2" />
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
                            <span className="text-muted" style={{fontSize: '9px'}}>{s.category}</span>
                        </div>
                    </div>
                  </Link>
                ))}
                {totalPages > 1 && (
                    <Pagination size="sm" className="custom-pagination justify-content-center mt-2">
                        {[...Array(totalPages)].map((_, i) => (
                            <Pagination.Item key={i+1} active={i+1 === currentPage} onClick={() => setCurrentPage(i+1)}>{i+1}</Pagination.Item>
                        ))}
                    </Pagination>
                )}
                {myServices.length === 0 && <p className="text-center x-small opacity-25 py-3">Trống</p>}
              </div>
            </div>

            <div className="glass-card p-4 border-white-10 shadow-sm">
               <div className="d-flex align-items-center justify-content-between text-danger x-small fw-bold uppercase-tracking mb-4">
                  <div className="d-flex align-items-center gap-2"><Heart size={16} fill="currentColor"/> VIỆC LÀM ĐÃ LƯU</div>
                  {savedJobs.length > 0 && (
                    <Button variant="link" className="text-danger p-0 x-small text-decoration-none fw-bold d-flex align-items-center gap-1" onClick={handleClearUnavailable}>
                      <Trash2 size={12}/> Dọn
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
                  <div className="d-flex align-items-center gap-2"><Bookmark size={16} fill="currentColor"/> DỊCH VỤ ĐÃ LƯU</div>
                  {savedServices.length > 0 && (
                    <Button variant="link" className="text-info p-0 x-small text-decoration-none fw-bold d-flex align-items-center gap-1" onClick={handleClearUnavailable}>
                      <Trash2 size={12}/> Dọn
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

          {/* CỘT PHẢI: TABS QUẢN LÝ TỔNG THỂ */}
          <Col lg={8}>
            <div className="glass-card p-2 h-100 border-white-10 shadow-lg">
              <Tabs defaultActiveKey="contracts" className="custom-tabs-dashboard mb-3">
                
                {/* TAB 1: CÔNG VIỆC ĐANG LÀM */}
                <Tab eventKey="contracts" title={`Công việc (${contracts.length})`}>
                  <div className="p-2">
                    {contractsError && (
                      <Alert variant="danger" className="bg-danger bg-opacity-10 border-0 text-white x-small mb-3 d-flex align-items-center gap-2 py-2">
                        <AlertCircle size={14}/> {contractsError}
                      </Alert>
                    )}
                    {contracts.map(item => {
                      const cfg = getContractStatusConfig(item);
                      return (
                        <div key={item.contractId} className="contract-card-item p-4 rounded-4 mb-3 border-white-5 shadow-sm">
                          <Row className="align-items-center">
                            <Col md={9}>
                              <Badge bg={cfg.variant} className="text-dark x-small-badge mb-2 fw-bold">{cfg.label.toUpperCase()}</Badge>
                              <h6 className="fw-bold text-white mb-1">{item.contractName || "Dự án Freelance"}</h6>
                              <div className="d-flex gap-3 x-small opacity-50 mb-2">
                                  <span><Clock size={12} className="me-1"/> {new Date(item.updatedAt).toLocaleDateString()}</span>
                                  <span>Đối tác: {item.enterpriseName || 'Enterprise'}</span>
                              </div>
                              <ProgressBar now={item.status === 'COMPLETED' ? 100 : 40} className="custom-progress-sm" style={{width: '120px'}} />
                            </Col>
                            <Col md={3} className="text-md-end mt-2 mt-md-0">
                              <div className="small fw-bold text-success mb-2">{formatMoney(item.totalAmount)}</div>
                              <Button as={Link} to={cfg.link} variant={cfg.variant === 'warning' ? 'primary' : 'outline-light'} className="x-small fw-bold px-3 py-2 shadow-glow d-flex align-items-center gap-1 ms-auto">
                                 {cfg.btnIcon} {cfg.btnText}
                              </Button>
                            </Col>
                          </Row>
                        </div>
                      );
                    })}
                    {contracts.length === 0 && (
                        <div className="text-center py-5 opacity-25">
                            <Handshake size={48} className="mb-3"/>
                            <p className="small">Bạn chưa có dự án nào đang chạy.</p>
                            <Button as={Link} to="/jobs" className="btn-find-jobs x-small">TÌM VIỆC NGAY</Button>
                        </div>
                    )}
                  </div>
                </Tab>

                {/* TAB 2: ĐƠN DỊCH VỤ (KÍCH HOẠT HỢP ĐỒNG) */}
                <Tab eventKey="orders" title={`Đơn dịch vụ (${myOrders.length})`}>
                    <div className="p-2">
                        {myOrders.map(order => (
                            <div key={order.orderId} className="contract-card-item p-3 rounded-4 mb-2 border-white-5">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <div className="d-flex align-items-center gap-2 mb-1">
                                            <ShoppingBag size={14} className="text-primary"/>
                                            <h6 className="fw-bold mb-0 text-white small">{order.serviceTitle}</h6>
                                        </div>
                                        <div className="x-small opacity-50">Giá: {formatMoney(order.orderPrice)} | {new Date(order.createdAt).toLocaleDateString()}</div>
                                    </div>
                                    <div className="text-end">
                                        <Badge bg={order.status === 'ACCEPTED' ? 'info' : 'warning'} className="mb-2 d-block px-3 text-dark">{order.status}</Badge>
                                        {order.status === 'ACCEPTED' && (
                                            <Button variant="primary" size="sm" className="x-small fw-bold shadow-glow" onClick={() => handleCreateContract(order.orderId)}>
                                               <CheckCircle size={12} className="me-1"/> TẠO HỢP ĐỒNG
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {myOrders.length === 0 && <p className="text-center py-5 opacity-25 x-small">Trống</p>}
                    </div>
                </Tab>

                {/* TAB 3: ĐƠN ỨNG TUYỂN (BIDS) */}
                <Tab eventKey="bids" title={`Ứng tuyển (${myBids.length})`}>
                   <div className="p-2">
                      {myBids.map(bid => (
                        <div key={bid.bidId} className="contract-card-item p-3 rounded-4 mb-2 border-white-5">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <div className="d-flex align-items-center gap-2 mb-1"><Send size={12} className="text-primary"/><h6 className="fw-bold mb-0 text-white small">{bid.jobTitle}</h6></div>
                                    <div className="d-flex gap-3 x-small opacity-50"><span>Chào giá: <strong className="text-success">{formatMoney(bid.bidAmount)}</strong></span></div>
                                </div>
                                <div className="text-end">
                                    <Badge bg={bid.status === 'ACCEPTED' ? 'success' : 'warning'} className="mb-2 x-small-badge d-block px-3 text-dark">{bid.status}</Badge>
                                    {bid.status === 'PENDING' && <Button variant="link" className="btn-withdraw p-0 x-small text-decoration-none fw-bold text-danger d-flex align-items-center gap-1 ms-auto" onClick={() => handleWithdraw(bid.bidId)}><Trash2 size={12}/> RÚT ĐƠN</Button>}
                                </div>
                            </div>
                        </div>
                      ))}
                      {myBids.length === 0 && <p className="text-center py-5 opacity-25 x-small">Trống</p>}
                   </div>
                </Tab>

                {/* TAB 4: ĐƠN DỊCH VỤ ĐẾN (PROVIDER) */}
                <Tab eventKey="provider-orders" title={`Đơn đến (${providerOrders.length})`}>
                   <div className="p-2">
                      {providerOrders.map(order => (
                        <div key={order.orderId} className="contract-card-item p-4 rounded-4 mb-3 border-white-5 shadow-sm">
                            <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <div className="d-flex align-items-center gap-2 mb-2">
                                        <ShoppingBag size={14} className="text-info"/>
                                        <h6 className="fw-bold mb-0 text-white">{order.serviceTitle}</h6>
                                    </div>
                                    <div className="x-small opacity-50 mb-1">Khách: <strong>{order.buyerName || 'N/A'}</strong> | {formatMoney(order.orderPrice)}</div>
                                    <div className="x-small opacity-50">Ngày đặt: {new Date(order.createdAt).toLocaleDateString()}</div>
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
                                                <XCircle size={12} className="me-1"/> TỪ CHỐI
                                            </Button>
                                            <Button variant="success" size="sm" className="x-small fw-bold px-3 py-1 shadow-glow" onClick={() => handleAcceptOrder(order.orderId)}>
                                                <CheckCircle2 size={12} className="me-1"/> CHẤP NHẬN
                                            </Button>
                                        </div>
                                    )}
                                    {order.status === 'ACCEPTED' && (
                                        <Button variant="primary" size="sm" className="x-small fw-bold px-3 py-1 shadow-glow" onClick={() => handleCreateContract(order.orderId)}>
                                            <CheckCircle size={12} className="me-1"/> TẠO HỢP ĐỒNG
                                        </Button>
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
    </div>
  );
};

export default DashboardLancer;