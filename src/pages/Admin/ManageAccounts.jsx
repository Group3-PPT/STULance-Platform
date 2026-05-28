import React, { useState } from 'react';
import { Table, Badge, Form, InputGroup, Row, Col } from 'react-bootstrap';
import { UserCheck, UserX, ShieldAlert, Mail, Calendar, Search, Filter } from 'lucide-react';
import '../../CSS/ManageAccounts.css'; 

const ManageAccounts = () => {
  // 1. Thêm nhiều dữ liệu Doanh nghiệp và Sinh viên mẫu
  const [users] = useState([
    { id: "SV-101", name: "Nguyễn Văn A", type: "Sinh viên", email: "a.sv@hust.edu.vn", status: "Hoạt động", date: "12/05/2026" },
    { id: "DN-502", name: "TechNova Corp", type: "Doanh nghiệp", email: "hr@technova.vn", status: "Chờ duyệt", date: "20/05/2026" },
    { id: "SV-105", name: "Lê Hoàng Nam", type: "Sinh viên", email: "nam.lh@fpt.edu.vn", status: "Hoạt động", date: "01/01/2026" },
    { id: "DN-801", name: "FPT Software", type: "Doanh nghiệp", email: "recruitment@fpt.com", status: "Hoạt động", date: "15/04/2026" },
    { id: "DN-802", name: "VNG Corporation", type: "Doanh nghiệp", email: "talent@vng.com.vn", status: "Hoạt động", date: "10/02/2026" },
    { id: "DN-803", name: "Shopee Vietnam", type: "Doanh nghiệp", email: "hr@shopee.vn", status: "Bị khóa", date: "05/01/2026" },
    { id: "SV-202", name: "Trần Thị Cẩm Tú", type: "Sinh viên", email: "tu.ttc@neu.edu.vn", status: "Hoạt động", date: "22/05/2026" },
  ]);

  // 2. State để quản lý việc tìm kiếm
  const [searchTerm, setSearchTerm] = useState("");

  // 3. Logic lọc người dùng dựa trên từ khóa tìm kiếm
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="acc-manage-container animate-fade-in">
      {/* Cụm Tiêu đề và Thanh tìm kiếm */}
      <Row className="align-items-center mb-4 g-3">
        <Col md={6}>
          <h3 className="acc-title mb-0">Quản lý <span>Tài khoản</span></h3>
        </Col>
        <Col md={6}>
          <div className="d-flex gap-2 justify-content-md-end">
            <InputGroup className="acc-search-group glass-card">
              <InputGroup.Text className="bg-transparent border-0 text-muted">
                <Search size={18} />
              </InputGroup.Text>
              <Form.Control
                placeholder="Tìm tên, email hoặc mã ID..."
                className="bg-transparent border-0 text-white shadow-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
            <button className="acc-btn-filter glass-card">
               <Filter size={18} />
            </button>
          </div>
        </Col>
      </Row>

      {/* Thẻ chứa bảng */}
      <div className="acc-table-box shadow-lg">
        <Table responsive variant="dark" className="acc-table align-middle mb-0">
          <thead>
            <tr>
              <th className="ps-4">Mã ID</th>
              <th>Họ tên / Đơn vị</th>
              <th>Loại tài khoản</th>
              <th>Liên hệ</th>
              <th>Trạng thái</th>
              <th className="text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map(u => (
                <tr key={u.id}>
                  <td className="ps-4 acc-id">{u.id}</td>
                  <td>
                      <div className="acc-name">{u.name}</div>
                      <div className="text-muted x-small d-flex align-items-center gap-1">
                          <Calendar size={10}/> {u.date}
                      </div>
                  </td>
                  <td>
                    <Badge 
                        bg={u.type === 'Sinh viên' ? 'info' : 'primary'} 
                        className={`x-small fw-bold ${u.type === 'Doanh nghiệp' ? 'badge-enterprise' : ''}`}
                    >
                      {u.type}
                    </Badge>
                  </td>
                  <td>
                     <div className="small text-white-50"><Mail size={12} className="me-2"/>{u.email}</div>
                  </td>
                  <td>
                    <span className={`status-pill-acc ${
                        u.status === 'Hoạt động' ? 'bg-success-glow' : 
                        u.status === 'Bị khóa' ? 'bg-danger-glow' : 'bg-warning-glow'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td>
                    <div className="acc-actions justify-content-center">
                      <button className="acc-btn check" title="Xác thực">
                          <UserCheck size={18}/>
                      </button>
                      <button className="acc-btn block" title="Khóa tài khoản">
                          <UserX size={18}/>
                      </button>
                      <button className="acc-btn" title="Cảnh báo vi phạm">
                          <ShieldAlert size={18}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
                <tr>
                    <td colSpan="6" className="text-center py-5 text-muted italic">
                        Không tìm thấy người dùng nào khớp với từ khóa "{searchTerm}"
                    </td>
                </tr>
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default ManageAccounts;