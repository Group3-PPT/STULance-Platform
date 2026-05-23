import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { ShieldCheck, Lock, Eye, UserCheck, Info } from 'lucide-react';
import '../CSS/Privacy.css'; // Tuân thủ cấu trúc import bạn yêu cầu

const Privacy = () => {
  return (
    <div className="privacy-page py-5">
      <Container>
        <div className="glass-card privacy-container mx-auto animate-fade-in">
          {/* Header Trang */}
          <div className="privacy-header mb-5 border-bottom border-secondary pb-4">
            <h1 className="fw-bold text-white d-flex align-items-center gap-3">
              <ShieldCheck size={40} className="text-primary-glow" /> 
              Chính sách bảo mật
            </h1>
            <p className="last-updated mt-2">
              <Info size={14} className="me-1" /> Cập nhật lần cuối: Ngày 23 tháng 05, 2026
            </p>
          </div>

          <div className="privacy-content">
            <p className="lead-text">
              Chào mừng bạn đến với <strong>StudentLance</strong>. Chúng tôi cam kết bảo vệ thông tin cá nhân của sinh viên và doanh nghiệp khi tham gia nền tảng. Chính sách này mô tả cách chúng tôi thu thập, sử dụng và bảo vệ dữ liệu của bạn để đảm bảo một môi trường kết nối việc làm an toàn, minh bạch.
            </p>

            <section className="policy-section">
              <h2><Lock size={20} className="me-2" /> 1. Thu thập thông tin</h2>
              <p>Chúng tôi thu thập thông tin khi bạn tương tác với nền tảng, bao gồm:</p>
              <ul className="policy-list">
                <li><strong>Thông tin cá nhân:</strong> Họ tên, Email, Số điện thoại, Ngày sinh, Trường đại học.</li>
                <li><strong>Thông tin hồ sơ:</strong> Kỹ năng chuyên môn, dự án đã thực hiện, bản CV PDF, và các liên kết GitHub/LinkedIn/Portfolio.</li>
                <li><strong>Dữ liệu tài chính:</strong> Lịch sử nạp tiền vào ví, mã giao dịch ký quỹ (Escrow) và lịch sử thu nhập của sinh viên.</li>
                <li><strong>Dữ liệu kỹ thuật:</strong> Địa chỉ IP, loại thiết bị và trình duyệt để tối ưu hóa hiển thị giao diện 3D.</li>
              </ul>
            </section>

            <section className="policy-section">
              <h2><UserCheck size={20} className="me-2" /> 2. Sử dụng thông tin</h2>
              <p>Mục đích sử dụng dữ liệu của chúng tôi bao gồm:</p>
              <ul className="policy-list">
                <li>Xác thực danh tính người dùng (Sinh viên/Doanh nghiệp).</li>
                <li>Sử dụng thuật toán AI để gợi ý công việc/dịch vụ phù hợp nhất với Portfolio của sinh viên.</li>
                <li>Quản lý quy trình ký kết hợp đồng điện tử và giải ngân tiền lương an toàn.</li>
                <li>Gửi thông báo về tiến độ công việc hoặc tin nhắn từ đối tác qua hệ thống Chat.</li>
              </ul>
            </section>

            <section className="policy-section">
              <h2><ShieldCheck size={20} className="me-2" /> 3. Bảo mật dữ liệu</h2>
              <p>
                StudentLance áp dụng tiêu chuẩn bảo mật cao cấp:
              </p>
              <ul className="policy-list">
                <li>Toàn bộ dữ liệu truyền tải được mã hóa bằng giao thức <strong>SSL/TLS</strong>.</li>
                <li>Thông tin nhạy cảm trên hợp đồng được áp dụng cơ chế <strong>Masking</strong> (ẩn một phần) và chỉ hiển thị khi có yêu cầu xác thực.</li>
                <li>Hệ thống lưu trữ đám mây có tường lửa bảo vệ 24/7 khỏi các truy cập trái phép.</li>
              </ul>
            </section>

            <section className="policy-section">
              <h2><Eye size={20} className="me-2" /> 4. Quyền của người dùng</h2>
              <p>Bạn có toàn quyền kiểm soát dữ liệu của mình trên StudentLance:</p>
              <ul className="policy-list">
                <li>Truy cập và cập nhật thông tin cá nhân bất kỳ lúc nào tại trang Thiết lập tài khoản.</li>
                <li>Yêu cầu trích xuất dữ liệu Portfolio hoặc bản sao các hợp đồng đã ký.</li>
                <li>Yêu cầu xóa vĩnh viễn tài khoản và toàn bộ dữ liệu liên quan khỏi máy chủ của chúng tôi.</li>
              </ul>
            </section>

            <div className="contact-notice mt-5 p-4 rounded-4 bg-white-5 text-center">
              <p className="mb-0 small text-muted">
                Mọi thắc mắc về vấn đề bảo mật, vui lòng liên hệ Ban quản trị qua email: 
                <a href="mailto:privacy@studentlance.vn" className="text-primary ms-1 text-decoration-none fw-bold">privacy@studentlance.vn</a>
              </p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Privacy;