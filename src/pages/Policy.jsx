import React, { useState } from 'react';
import { Container, Form, Button, Spinner } from 'react-bootstrap';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ShieldCheck, FileText, AlertCircle, ChevronLeft } from 'lucide-react';
import { authService } from '../services/authService';
import '../CSS/Privacy.css';

const Policy = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const policyData = location.state || {};
  const email = policyData.email || sessionStorage.getItem('pendingPolicyEmail') || '';
  const password = policyData.password || sessionStorage.getItem('pendingPolicyPassword') || '';
  const policyVersion = policyData.policyVersion || '2026.07.01';

  const handleAcceptPolicy = async () => {
    if (!agreed) {
      alert("Vui lòng đọc và đồng ý với điều khoản sử dụng trước khi tiếp tục.");
      return;
    }

    setLoading(true);
    try {
      const res = await authService.acceptPolicy({ email, password, policyVersion });
      const result = res?.data?.data || res?.data;

      const tokenToSave = result?.accessToken || result?.token;
      if (!tokenToSave) {
        alert("Lỗi: Server không trả về Token sau khi chấp thuận!");
        return;
      }

      localStorage.setItem('accessToken', tokenToSave);
      sessionStorage.setItem('refreshToken', result?.refreshToken || '');

      const roleValue = result?.roleId || result?.roleName || result?.role || '';
      localStorage.setItem('userRole', roleValue);

      sessionStorage.removeItem('pendingPolicyEmail');
      sessionStorage.removeItem('pendingPolicyPassword');

      window.dispatchEvent(new Event("local-storage-update"));

      if (roleValue === 'STUDENT' || roleValue === 'odl1dDNm') { navigate('/dashboardlancer'); }
      else if (roleValue === 'ENTERPRISE' || roleValue === 'Jx7ze2Kd') { navigate('/manage-jobs'); }
      else if (roleValue === 'ADMIN' || roleValue === 'pPDY5Dnk') { navigate('/admin'); }
      else { navigate('/'); }
    } catch (error) {
      console.error("Lỗi chấp thuận chính sách:", error);
      alert("Không thể chấp thuận chính sách. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="privacy-page py-5">
        <Container>
          <div className="glass-card p-5 text-center">
            <AlertCircle size={48} className="text-warning mb-3" />
            <h4 className="text-white fw-bold mb-3">Phiên đăng nhập hết hạn</h4>
            <p className="text-white-50 mb-4">Vui lòng đăng nhập lại để tiếp tục.</p>
            <Link to="/login" className="btn btn-primary fw-bold">Đăng nhập</Link>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="privacy-page py-5">
      <Container>
        <div className="glass-card privacy-container mx-auto animate-fade-in">
          <div className="mb-4">
            <Button variant="link" className="text-primary p-0 text-decoration-none fw-bold" onClick={() => navigate('/login')}>
              <ChevronLeft size={18} /> Quay lại đăng nhập
            </Button>
          </div>

          <div className="privacy-header mb-5 border-bottom border-secondary pb-4">
            <h1 className="fw-bold text-white d-flex align-items-center gap-3">
              <ShieldCheck size={40} className="text-primary-glow" />
              {policyData.policyTitle || 'Điều khoản sử dụng và chính sách STULance'}
            </h1>
            <p className="last-updated mt-2">
              <FileText size={14} className="me-1" /> Phiên bản: {policyVersion} | Cập nhật lần cuối: 01/07/2026
            </p>
          </div>

          <div className="privacy-content">
            <p className="lead-text">
              Chào mừng bạn đến với <strong>STULance</strong> - Nền tảng kết nối Freelancer Sinh viên và Doanh nghiệp. 
              Vui lòng đọc kỹ các điều khoản sử dụng dưới đây trước khi đồng ý. Bằng việc nhấn vào nút "Đồng ý", bạn xác nhận đã đọc, hiểu và chấp thuận toàn bộ nội dung điều khoản.
            </p>

            <section className="policy-section">
              <h2><FileText size={20} className="me-2" /> 1. Định nghĩa</h2>
              <ul className="policy-list">
                <li><strong>"Nền tảng"</strong> hay <strong>"Hệ thống"</strong>: Website STULance và các dịch vụ liên quan.</li>
                <li><strong>"Người dùng"</strong>: Bất kỳ cá nhân hoặc tổ chức nào đăng ký và sử dụng Nền tảng.</li>
                <li><strong>"Sinh viên" (Bên B)</strong>: Người dùng cung cấp dịch vụ Freelancer trên Nền tảng.</li>
                <li><strong>"Doanh nghiệp" (Bên A)</strong>: Người dùng tuyển dụng hoặc đặt dịch vụ trên Nền tảng.</li>
                <li><strong>"Hợp đồng"</strong>: Thỏ thuận điện tử được ký kết giữa Sinh viên và Doanh nghiệp thông qua Nền tảng.</li>
                <li><strong>"Ký quỹ (Escrow)"</strong>: Cơ chế giữ tiền an toàn, tiền chỉ được giải ngân khi hai bên xác nhận hoàn thành.</li>
              </ul>
            </section>

            <section className="policy-section">
              <h2><FileText size={20} className="me-2" /> 2. Đăng ký và tài khoản</h2>
              <ul className="policy-list">
                <li>Người dùng cam kết cung cấp thông tin chính xác khi đăng ký tài khoản.</li>
                <li>Mỗi địa chỉ email chỉ được đăng ký một tài khoản duy nhất.</li>
                <li>Người dùng chịu trách nhiệm bảo mật thông tin đăng nhập của mình.</li>
                <li>STULance có quyền tạm ngưng hoặc khóa tài khoản nếu phát hiện hành vi vi phạm.</li>
                <li>Người dùng phải từ 18 tuổi trở lên hoặc có sự đồng ý của người giám hộ hợp pháp.</li>
              </ul>
            </section>

            <section className="policy-section">
              <h2><FileText size={20} className="me-2" /> 3. Quy trình làm việc và hợp đồng</h2>
              <ul className="policy-list">
                <li>Doanh nghiệp đăng bài tuyển dụng hoặc đặt dịch vụ. Sinh viên ứng tuyển hoặc chào giá.</li>
                <li>Khi hai bên thống nhất, hợp đồng điện tử được tạo trên Hệ thống.</li>
                <li>Hợp đồng phải được cả hai bên ký tên điện tử trước khi có hiệu lực.</li>
                <li>Sinh viên nộp bản giao (delivery) đúng hạn theo cam kết trong hợp đồng.</li>
                <li>Doanh nghiệp nghiệm thu và chấp nhận bản giao trong vòng <strong>3 ngày</strong> kể từ khi nhận.</li>
                <li>Nếu Doanh nghiệp không phản hồi trong 3 ngày, hệ thống tự động coi như đã chấp nhận.</li>
              </ul>
            </section>

            <section className="policy-section">
              <h2><FileText size={20} className="me-2" /> 4. Thanh toán và phí nền tảng</h2>
              <ul className="policy-list">
                <li>Mọi thanh toán giữa các bên phải thực hiện thông qua Hệ thống của STULance.</li>
                <li><strong>Phí nền tảng và quản lý: 10% giá trị hợp đồng</strong>, được trừ tự động khi hợp đồng hoàn thành và bên A xác nhận nghiệm thu.</li>
                <li>Ví dụ: Hợp đồng trị giá 1.000.000 VNĐ, Sinh viên nhận 900.000 VNĐ, STULance thu 100.000 VNĐ phí nền tảng.</li>
                <li>Tiền ký quỹ (Escrow) được giữ an toàn trên Hệ thống cho đến khi hợp đồng hoàn thành hoặc hủy theo quy định.</li>
                <li>Doanh nghiệp cam kết nạp tiền ký quỹ trước khi hợp đồng có hiệu lực.</li>
                <li>Việc rút tiền từ ví tuân theo chính sách rút tiền của STULance (tối thiểu 50.000 VNĐ/lần).</li>
              </ul>
            </section>

            <section className="policy-section">
              <h2><FileText size={20} className="me-2" /> 5. Hủy hợp đồng và hoàn tiền</h2>
              <ul className="policy-list">
                <li><strong>Trước khi Sinh viên bắt đầu làm việc:</strong> Doanh nghiệp được hoàn lại 100% tiền ký quỹ.</li>
                <li><strong>Sau khi Sinh viên bắt đầu làm việc:</strong> Tiền hoàn lại tùy thuộc vào thỏa thuận của hai bên và mức độ công việc đã hoàn thành.</li>
                <li><strong>Tranh chấp:</strong> Nếu hai bên không thỏa thuận được, STULance sẽ đóng vai trò trung gian giải quyết. Quyết định cuối cùng thuộc về Ban quản trị STULance.</li>
                <li>Sinh viên có quyền yêu cầu hủy hợp đồng nếu Doanh nghiệp không cung cấp đủ thông tin hoặc tài liệu cần thiết trong vòng <strong>5 ngày</strong>.</li>
              </ul>
            </section>

            <section className="policy-section">
              <h2><FileText size={20} className="me-2" /> 6. Quy tắc ứng xử</h2>
              <ul className="policy-list">
                <li>Người dùng tôn trọng lẫn nhau, không sử dụng ngôn ngữ xúc phạm hoặc phân biệt đối xử.</li>
                <li>Không spam, quảng cáo trái phép hoặc gửi nội dung không liên quan.</li>
                <li>Không cố tình gian lận, lừa đảo hoặc chiếm đoạt tài sản của người dùng khác.</li>
                <li>Không sao chép, phân phối hoặc sử dụng trái phép nội dung, mã nguồn của Nền tảng.</li>
                <li>Mọi hành vi vi phạm sẽ bị xử lý theo quy định của STULance, có thể bao gồm khóa tài khoản vĩnh viễn.</li>
              </ul>
            </section>

            <section className="policy-section">
              <h2><FileText size={20} className="me-2" /> 7. Sở hữu trí tuệ</h2>
              <ul className="policy-list">
                <li>Sinh viên giữ quyền sở hữu đối với sản phẩm sáng tạo除非 có thỏa thuận khác trong hợp đồng.</li>
                <li>Khi hợp đồng hoàn thành và thanh toán đầy đủ, Doanh nghiệp được quyền sử dụng sản phẩm theo thỏa thuận.</li>
                <li>STULance không sở hữu bất kỳ sản phẩm nào được tạo ra bởi Sinh viên trên Nền tảng.</li>
              </ul>
            </section>

            <section className="policy-section">
              <h2><FileText size={20} className="me-2" /> 8. Trách nhiệm và giới hạn</h2>
              <ul className="policy-list">
                <li>STULance đóng vai trò trung gian kết nối, không chịu trách nhiệm về chất lượng dịch vụ giữa các bên.</li>
                <li>STULance không bảo đảm rằng Nền tảng sẽ hoạt động liên tục mà không có lỗi.</li>
                <li>STULance không chịu trách nhiệm cho bất kỳ thiệt hại gián tiếp, ngẫu nhiên hoặc đặc biệt nào phát sinh từ việc sử dụng Nền tảng.</li>
                <li>Tổng trách nhiệm của STULance đối với người dùng không vượt quá tổng phí nền tảng mà người dùng đã đóng.</li>
              </ul>
            </section>

            <section className="policy-section">
              <h2><FileText size={20} className="me-2" /> 9. Chính sách bảo mật</h2>
              <p>Thông tin cá nhân của bạn được xử lý theo <Link to="/privacy" className="text-primary">Chính sách bảo mật</Link> của STULance. Bằng việc đồng ý điều khoản này, bạn cũng đồng ý với việc xử lý dữ liệu cá nhân như mô tả trong Chính sách bảo mật.</p>
            </section>

            <section className="policy-section">
              <h2><FileText size={20} className="me-2" /> 10. Sửa đổi điều khoản</h2>
              <ul className="policy-list">
                <li>STULance có quyền sửa đổi điều khoản này vào bất kỳ lúc nào. Phiên bản mới sẽ có hiệu lực ngay khi được công bố trên Nền tảng.</li>
                <li>Người dùng sẽ được thông báo qua email khi có thay đổi quan trọng.</li>
                <li>Việc tiếp tục sử dụng Nền tảng sau khi có thay đổi được coi là chấp nhận điều khoản mới.</li>
              </ul>
            </section>

            <section className="policy-section">
              <h2><FileText size={20} className="me-2" /> 11. Giải quyết tranh chấp</h2>
              <ul className="policy-list">
                <li>Mọi tranh chấp phát sinh từ hoặc liên quan đến việc sử dụng Nền tảng sẽ được giải quyết thông qua thương lượng.</li>
                <li>Nếu không thương lượng được, tranh chấp sẽ được đưa ra Tòa án nhân dân có thẩm quyền tại Việt Nam.</li>
                <li>Luật áp dụng là luật pháp nước Cộng hòa XHCN Việt Nam.</li>
              </ul>
            </section>
          </div>

          <div className="mt-5 p-4 rounded-4 border-top border-secondary pt-4" style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.15)' }}>
            <Form.Check
              type="checkbox"
              id="policy-agree"
              className="custom-checkbox mb-3"
              label={
                <span className="small text-white">
                  <strong>Tôi đã đọc và đồng ý với điều khoản sử dụng và chính sách STULance (Phiên bản {policyVersion})</strong>
                </span>
              }
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />

            <div className="d-flex gap-3">
              <Button variant="outline-light" className="flex-grow-1 py-2 fw-bold" onClick={() => navigate('/login')}>
                Từ chối
              </Button>
              <Button variant="success" className="flex-grow-1 py-2 fw-bold shadow-glow" onClick={handleAcceptPolicy} disabled={loading || !agreed}>
                {loading ? <><Spinner animation="border" size="sm" className="me-2" /> Đang xử lý...</> : <><ShieldCheck size={18} className="me-2" /> Đồng ý và tiếp tục</>}
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Policy;
