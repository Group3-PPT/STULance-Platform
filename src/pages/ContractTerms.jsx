import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, FileText, ShieldCheck } from 'lucide-react';
import '../CSS/Privacy.css';

const ContractTerms = () => {
  const { id } = useParams();

  return (
    <div className="privacy-page py-5">
      <Container>
        <div className="glass-card privacy-container mx-auto animate-fade-in">
          <div className="mb-4">
            <Button variant="link" className="text-primary p-0 text-decoration-none fw-bold" as={Link} to={id ? `/contract/sign/${id}` : '/login'}>
              <ChevronLeft size={18} /> Quay lại ký hợp đồng
            </Button>
          </div>

          <div className="privacy-header mb-5 border-bottom border-secondary pb-4">
            <h1 className="fw-bold text-white d-flex align-items-center gap-3">
              <FileText size={40} className="text-primary-glow" />
              Điều khoản hợp đồng STULance
            </h1>
            <p className="last-updated mt-2">
              <ShieldCheck size={14} className="me-1" /> Phiên bản 2026.07.01 | Có hiệu lực từ 01/07/2026
            </p>
          </div>

          <div className="privacy-content">
            <p className="lead-text">
              Bằng việc ký kết hợp đồng trên nền tảng STULance, các bên cam kết tuân thủ toàn bộ các điều khoản dưới đây.
            </p>

            <section className="policy-section">
              <h2><FileText size={20} className="me-2" /> ĐIỀU 1: NỘI DUNG CÔNG VIỆC</h2>
              <ul className="policy-list">
                <li>Bên B cam kết thực hiện công việc theo đúng mô tả và yêu cầu đã được hai bên thống nhất trên hệ thống STULance.</li>
                <li>Nội dung công việc cụ thể được ghi rõ trong chi tiết hợp đồng trên hệ thống.</li>
                <li>Bên B phải tuân thủ các tiêu chuẩn chất lượng và thời hạn đã cam kết. Mọi thay đổi phải được thỏa thuận lại bằng văn bản qua hệ thống.</li>
                <li>Mọi yêu cầu thay đổi ngoài phạm vi hợp đồng ban đầu sẽ được xem xét và thương lượng lại về chi phí và thời gian.</li>
              </ul>
            </section>

            <section className="policy-section">
              <h2><FileText size={20} className="me-2" /> ĐIỀU 2: GIÁ TRỊ & THANH TOÁN</h2>
              <ul className="policy-list">
                <li>Tổng giá trị hợp đồng được ghi rõ trong chi tiết hợp đồng trên hệ thống.</li>
                <li>Hình thức thanh toán: Thanh toán qua hệ thống Escrow của STULance.</li>
                <li>Bên A cam kết nạp tiền ký quỹ vào hệ thống trước khi hợp đồng có hiệu lực. Số tiền sẽ được giải ngân cho Bên B khi Bên A xác nhận hoàn thành và chấp nhận bản giao.</li>
                <li><strong style={{color:'#f59e0b'}}>Phí nền tảng & quản lý: 10% giá trị hợp đồng.</strong> Phí được trừ tự động khi hợp đồng hoàn thành và bên A xác nhận nghiệm thu.</li>
                <li>Trường hợp hủy hợp đồng: Tiền sẽ được hoàn trả theo chính sách Escrow.</li>
              </ul>
            </section>

            <section className="policy-section">
              <h2><FileText size={20} className="me-2" /> ĐIỀU 3: THỜI HẠN THỰC HIỆN</h2>
              <ul className="policy-list">
                <li>Thời hạn thực hiện hợp đồng được ghi rõ trong chi tiết hợp đồng.</li>
                <li>Bên B phải nộp bản giao (delivery) đúng hạn theo lịch trình đã cam kết trên hệ thống.</li>
                <li>Nếu Bên B chậm tiến độ quá 3 ngày so với thời hạn, Bên A có quyền yêu cầu hoàn tiền hoặc hủy hợp đồng.</li>
                <li>Hai bên có thể gia hạn thời gian thực hiện nếu thỏa thuận qua hệ thống trước khi hết hạn.</li>
              </ul>
            </section>

            <section className="policy-section">
              <h2><FileText size={20} className="me-2" /> ĐIỀU 4: QUYỀN VÀ NGHĨA VỤ CÁC BÊN</h2>
              <p className="fw-bold small mb-2">Bên A (Doanh nghiệp):</p>
              <ul className="policy-list">
                <li>Cung cấp đầy đủ thông tin, tài liệu và yêu cầu cần thiết để Bên B thực hiện công việc.</li>
                <li>Phản hồi và đánh giá bản giao trong vòng 3 ngày kể từ khi nhận được.</li>
                <li>Thanh toán đúng hạn qua hệ thống Escrow khi chấp nhận bản giao.</li>
              </ul>
              <p className="fw-bold small mb-2 mt-3">Bên B (Sinh viên):</p>
              <ul className="policy-list">
                <li>Thực hiện công việc đúng tiến độ và chất lượng đã cam kết.</li>
                <li>Nộp bản giao đúng hạn và chịu trách nhiệm về chất lượng sản phẩm.</li>
                <li>Không được chuyển giao công việc cho bên thứ ba mà không có sự đồng ý của Bên A.</li>
              </ul>
            </section>

            <section className="policy-section">
              <h2><FileText size={20} className="me-2" /> ĐIỀU 5: BẢO MẬT & SỞ HỮU TRÍ TUỆ</h2>
              <ul className="policy-list">
                <li>Cả hai bên cam kết bảo mật mọi thông tin, dữ liệu và tài liệu liên quan đến dự án.</li>
                <li>Mọi sản phẩm, mã nguồn, thiết kế được tạo ra thuộc quyền sở hữu của Bên A sau khi thanh toán đầy đủ.</li>
                <li>Bên B không được sử dụng hoặc tiết lộ thông tin dự án cho bên thứ ba nếu không có sự đồng ý bằng văn bản của Bên A.</li>
              </ul>
            </section>

            <section className="policy-section">
              <h2><FileText size={20} className="me-2" /> ĐIỀU 6: TRÁCH NHIỆM CỦA STULANCE</h2>
              <ul className="policy-list">
                <li>STULance đóng vai trò trung gian kết nối và quản lý giao dịch giữa hai bên.</li>
                <li>STULance quản lý quỹ ký quỹ (Escrow), đảm bảo tiền được giữ an toàn và giải ngân đúng quy định.</li>
                <li>STULance tiếp nhận và xử lý các tranh chấp (dispute) khi có yêu cầu từ một trong hai bên.</li>
                <li>Quyết định của STULance là quyết định cuối cùng (chung thẩm). Các bên cam kết chấp hành.</li>
                <li>STULance không chịu trách nhiệm về chất lượng sản phẩm hay các thỏa thuận ngoài hệ thống.</li>
              </ul>
            </section>

            <section className="policy-section">
              <h2><FileText size={20} className="me-2" /> ĐIỀU 7: GIẢI QUYẾT TRANH CHẤP</h2>
              <ul className="policy-list">
                <li>Mọi tranh chấp trước hết phải được giải quyết thông qua thương lượng trực tiếp trên hệ thống trong vòng 7 ngày.</li>
                <li>Nếu không đạt được thỏa thuận, một trong hai bên có thể yêu cầu tạo tranh chấp trên hệ thống khi hợp đồng đang ở trạng thái IN_PROGRESS hoặc DELIVERED.</li>
                <li>Khi tạo tranh chấp, hợp đồng chuyển sang trạng thái DISPUTED và tạm ngưng cho đến khi có quyết định từ STULance.</li>
                <li>STULance xem xét bằng chứng và đưa ra quyết định: Tiếp tục (IN_PROGRESS), Hoàn thành (COMPLETED), hoặc Hủy bỏ (CANCELLED).</li>
                <li>Quyết định xử lý tranh chấp của STULance là quyết định chung thẩm và có hiệu lực ngay lập tức.</li>
              </ul>
            </section>

            <section className="policy-section">
              <h2><FileText size={20} className="me-2" /> ĐIỀU 8: ĐIỀU KHOẢN CHUNG</h2>
              <ul className="policy-list">
                <li>Hợp đồng có hiệu lực kể từ khi cả hai bên đã ký kết trên hệ thống STULance.</li>
                <li>Mọi sửa đổi, bổ sung hợp đồng phải được thực hiện qua hệ thống và có sự đồng ý của cả hai bên.</li>
                <li>Nếu một điều khoản bị coi là vô hiệu, các điều khoản còn lại vẫn có hiệu lực.</li>
                <li>Hợp đồng được quản lý và lưu trữ trên hệ thống STULance, có giá trị pháp lý theo quy định hiện hành.</li>
              </ul>
            </section>
          </div>

          <div className="text-center mt-5 pt-4 border-top border-secondary">
            <Button as={Link} to={id ? `/contract/sign/${id}` : '/login'} variant="primary" className="px-5 py-2 fw-bold">
              Quay lại ký hợp đồng
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default ContractTerms;
