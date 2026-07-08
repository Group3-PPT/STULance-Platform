import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Badge, Spinner } from 'react-bootstrap';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { 
  FileText, ShieldCheck, Wallet, ChevronLeft, 
  CheckCircle2, Loader2, ShoppingCart
} from 'lucide-react';
import { serviceOrderService } from '../../services/serviceorderservice';
import { roleService } from '../../services/roleservice';
import '../../CSS/ServiceInvoice.css';

const ServiceInvoice = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const service = location.state?.service;

  // 1. Hàm định danh Role (STUDENT/ENTERPRISE)
  const getStandardRoleName = async (currentRoleId) => {
    if (['STUDENT', 'ENTERPRISE'].includes(currentRoleId)) return currentRoleId;
    try {
      const res = await roleService.getRegisterOptions();
      const matchedRole = res.data?.find(r => r.roleId === currentRoleId);
      return matchedRole ? matchedRole.roleName : null;
    } catch (err) { return null; }
  };

  // 2. Xử lý Tạo Đơn Hàng (Không tạo hợp đồng tại đây)
  const handleConfirmOrder = async () => {
    if (!service) return;
    setIsProcessing(true);
    try {
      const myRoleId = localStorage.getItem('userRole');
      const buyerTypeName = await getStandardRoleName(myRoleId);

      if (!buyerTypeName) throw new Error("Không thể xác định vai trò người mua.");

      const payload = {
        buyerType: buyerTypeName, 
        requirements: "Đặt hàng qua hệ thống STULance" 
      };

      // GỌI API TẠO ĐƠN HÀNG (POST /v1/service-orders/services/{id})
      const orderRes = await serviceOrderService.createOrder(service.serviceId, payload);
      
      if (orderRes.success) {
        alert("🎉 Đã gửi đơn đặt hàng thành công! Vui lòng đợi người bán xác nhận.");
        // Chuyển về Dashboard để xem trạng thái đơn hàng PENDING
        navigate('/dashboardlancer'); 
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Lỗi xử lý đơn hàng";
      alert("Thất bại: " + errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!service) return <div className="text-white text-center py-5">Đơn hàng không hợp lệ.</div>;

  return (
    <div className="invoice-page py-5 text-white animate-fade-in">
      <Container>
        <div className="mb-4">
          <Button variant="link" className="text-primary p-0 text-decoration-none fw-bold" onClick={() => navigate(-1)}>
            <ChevronLeft size={18} /> QUAY LẠI
          </Button>
        </div>

        <Row className="g-4">
          <Col lg={8}>
            <div className="glass-card p-4">
              <h4 className="fw-bold mb-4 d-flex align-items-center gap-2 border-bottom border-white border-opacity-10 pb-3 text-primary-glow">
                <ShoppingCart className="text-primary" /> XÁC NHẬN ĐẶT HÀNG
              </h4>

              <div className="invoice-item-box glass-card p-3 mb-4">
                <Badge bg="primary" className="mb-2">DỊCH VỤ SINH VIÊN</Badge>
                <h5 className="fw-bold text-white">{service.title}</h5>
                <p className="small text-white-50">Người bán: <strong>{service.studentName}</strong></p>
                <div className="text-end h4 fw-bold text-success">
                  {service.price?.toLocaleString()}đ
                </div>
              </div>

              <div className="p-3 rounded-4 border-dashed-blue d-flex gap-3 align-items-center" style={{ background: 'rgba(16,185,129,0.04)', border: '1px dashed rgba(16,185,129,0.15)' }}>
                 <ShieldCheck size={32} className="text-success" />
                 <p className="x-small mb-0 opacity-75">
                    Đơn hàng sẽ được tạo ở trạng thái <strong>PENDING</strong>. Tiền chỉ được chuyển khi hai bên ký hợp đồng và hoàn thành dự án.
                 </p>
              </div>
            </div>
          </Col>

          <Col lg={4}>
            <div className="glass-card p-4 sticky-top shadow-glow" style={{top: '100px'}}>
              <h5 className="fw-bold mb-4">Tóm tắt thanh toán</h5>
              <div className="d-flex justify-content-between mb-2 small text-white-50">
                <span>Giá dịch vụ</span>
                <span>{service.price?.toLocaleString()}đ</span>
              </div>
              <div className="d-flex justify-content-between mb-4 small text-white-50">
                <span>Phí dịch vụ (5%)</span>
                <span>{(service.price * 0.05).toLocaleString()}đ</span>
              </div>
              <div className="d-flex justify-content-between border-top border-white border-opacity-10 pt-3 mb-5 h4 fw-bold text-primary-glow">
                <span>Tổng cộng</span>
                <span>{(service.price * 1.05).toLocaleString()}đ</span>
              </div>

              <Button 
                variant="primary" className="w-100 py-3 fw-bold shadow-glow"
                onClick={handleConfirmOrder} disabled={isProcessing}
              >
                {isProcessing ? <Loader2 className="spinner me-2" /> : <CheckCircle2 className="me-2" size={18}/>}
                GỬI YÊU CẦU ĐẶT HÀNG
              </Button>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ServiceInvoice;