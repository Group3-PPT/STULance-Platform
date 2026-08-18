import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType,
  PageBreak, Header, Footer, PageNumber,
  convertInchesToTwip
} from 'docx';
import fs from 'fs';

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun({ text, bold: true, font: 'Arial', size: 32, color: '1e3a5f' })],
    spacing: { before: 400, after: 200 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: '1e3a5f', space: 4 } },
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun({ text, bold: true, font: 'Arial', size: 28, color: '2563eb' })],
    spacing: { before: 300, after: 150 },
  });
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    children: [new TextRun({ text, bold: true, font: 'Arial', size: 26, color: '334155' })],
    spacing: { before: 200, after: 100 },
  });
}

function p(text, opts = {}) {
  return new Paragraph({
    children: [new TextRun({
      text,
      font: 'Arial',
      size: opts.size || 24,
      bold: opts.bold || false,
      italics: opts.italics || false,
      color: opts.color || '000000',
    })],
    spacing: { after: opts.after || 120, before: opts.before || 0 },
    alignment: opts.align || AlignmentType.JUSTIFIED,
    indent: opts.indent ? { left: convertInchesToTwip(opts.indent) } : undefined,
  });
}

function bullet(text, level = 0) {
  return new Paragraph({
    children: [new TextRun({ text, font: 'Arial', size: 24 })],
    bullet: { level },
    spacing: { after: 80 },
  });
}

function bold(label, value) {
  return new Paragraph({
    children: [
      new TextRun({ text: label, font: 'Arial', size: 24, bold: true }),
      new TextRun({ text: value, font: 'Arial', size: 24 }),
    ],
    spacing: { after: 80 },
  });
}

function table(headers, rows) {
  const hdr = new TableRow({
    tableHeader: true,
    children: headers.map(h => new TableCell({
      children: [new Paragraph({
        children: [new TextRun({ text: h, bold: true, font: 'Arial', size: 22, color: 'FFFFFF' })],
        alignment: AlignmentType.CENTER,
      })],
      shading: { type: ShadingType.SOLID, color: '1e3a5f' },
      verticalAlign: 'center',
    })),
  });
  const data = rows.map(r => new TableRow({
    children: r.map(c => new TableCell({
      children: [new Paragraph({ children: [new TextRun({ text: String(c), font: 'Arial', size: 22 })] })],
      verticalAlign: 'center',
    })),
  }));
  return new Table({
    rows: [hdr, ...data],
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
      left: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
      right: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
    },
  });
}

function spacer() { return new Paragraph({ children: [], spacing: { after: 100 } }); }
function pb() { return new Paragraph({ children: [new PageBreak()] }); }

// ============================================================
// COVER PAGE
// ============================================================
const cover = [
  spacer(), spacer(), spacer(), spacer(), spacer(), spacer(), spacer(),
  new Paragraph({
    children: [new TextRun({ text: 'BAO CAO DU AN', font: 'Arial', size: 48, bold: true, color: '1e3a5f' })],
    alignment: AlignmentType.CENTER, spacing: { after: 100 },
  }),
  new Paragraph({
    children: [new TextRun({ text: 'STULance Platform', font: 'Arial', size: 36, bold: true, color: '3b82f6' })],
    alignment: AlignmentType.CENTER, spacing: { after: 50 },
  }),
  new Paragraph({
    children: [new TextRun({ text: 'Nen tang ket noi Sinh vien Freelancer voi Doanh nghiep', font: 'Arial', size: 24, italics: true, color: '64748b' })],
    alignment: AlignmentType.CENTER, spacing: { after: 500 },
  }),
  spacer(), spacer(),
  table(['Thong tin', 'Chi tiet'], [
    ['Nhom thuc hien', 'STULance Team'],
    ['Giang vien huong dan', '...'],
    ['Thoi gian trien khai', '30/04/2026 - 10/08/2026'],
    ['Ngay nop', '18/08/2026'],
  ]),
  pb()
];

// ============================================================
// CHAPTER 1: GIOI THIEU TONG QUAT
// ============================================================
const ch1 = [
  h1('1. GIOI THIEU TONG QUAT'),

  h2('1.1. Tieu de du an'),
  p('STULance — Nen tang ket noi Sinh vien Freelancer voi Doanh nghiep', { bold: true, size: 26 }),

  h2('1.2. Mo ta du an'),
  p('STULance giup sinh vien co hoi nghe nghiep phu hop nganh, dong thoi ho tro doanh nghiep tuyen dung nhan su tre, linh hoat va chuyen mon hoa. Tam nhin: xay dung he sinh thai viec lam cho the he tre Viet Nam.'),
  spacer(),
  p('He thong ho tro 3 vai tro chinh: Sinh vien (freelancer), Doanh nghiep (nguoi thue), va Quan tri vien (Admin). Moi vai tro co day du chuc nang phuc vu nhu cau rieng, voi quy trinh hoan chinh tu tim viec, dang dich vu, ky hop dong, thanh toan den danh gia.'),
  spacer(),
  p('Cac gia tri cot loi cua STULance:'),
  bullet('Minh bach hop dong: Hop dong dien tu voi chu ky so, 8 dieu khoan chi tiet'),
  bullet('Thanh toan nhanh: Tich hop VNPay voi he thong Escrow ky quy'),
  bullet('Portfolio chuyen nghiep: 4 mau CV, cong cu tao CV, quan ly du an'),
  bullet('Danh gia hai chieu: Sinh vien va doanh nghiep danh gia lan nhau'),
  bullet('Bao cao vi pham: He thong bao cao va xu ly vi pham tu dong'),
  pb()
];

// ============================================================
// CHAPTER 2: TONG QUAN DU AN
// ============================================================
const ch2 = [
  h1('2. TONG QUAN DU AN'),

  bold('Ten du an: ', 'STULance — Student Freelance Platform'),
  bold('Linh vuc: ', 'Nen tang so, freelance, tuyen dung, giao duc'),
  bold('Doi tuong su dung: ', 'Sinh vien, Doanh nghiep, Quan tri vien'),
  bold('Thoi gian trien khai: ', '30/04/2026 – 10/08/2026'),
  spacer(),

  h2('2.1. Muc tieu chinh'),
  bullet('Ket noi sinh vien co ky nang voi doanh nghiep co nhu cau tuyen dung'),
  bullet('Ho tro sinh vien xay dung ho so ca nhan, portfolio va danh sach dich vu'),
  bullet('Cung cap quy trinh hop dong dien tu co chu ky so'),
  bullet('Ho tro thanh toan qua ung dung ngan hang nen tang'),
  bullet('Xay dung he thong danh gia hai chieu va bao cao vi pham'),
  spacer(),

  h2('2.2. Gia tri chinh'),
  table(['Gia tri', 'Mo ta'], [
    ['Minh bach hop dong', 'Hop dong dien tu voi 8 dieu khoan, chu ky so, escrow payment'],
    ['Thanh toan nhanh', 'Tich hop VNPay, escrow ky quy 10% phi nen tang'],
    ['Portfolio chuyen nghiep', '4 mau CV, cong cu tao CV AI, quan ly du an'],
    ['Danh gia hai chieu', 'SV danh gia DN va nguoc lai, xay dung uy tin'],
    ['Bao cao vi pham', 'He thong bao cao, Admin xu ly, bao ve nguoi dung'],
  ]),
  spacer(),

  h2('2.3. Quy mo du an'),
  table(['Chi so', 'Gia tri'], [
    ['Tong so file ma nguon', '140 file'],
    ['Tong dong code', '31,604 dong'],
    ['File JSX (React components)', '69 file (21,374 dong)'],
    ['File CSS', '42 file (8,691 dong)'],
    ['File Service (API)', '29 file (1,539 dong)'],
    ['Tong so trang (pages)', '47 trang'],
    ['Tong so route', '52 route'],
    ['Tong so component', '20 component'],
  ]),
  pb()
];

// ============================================================
// CHAPTER 3: VAN DE & GIAI PHAP
// ============================================================
const ch3 = [
  h1('3. VAN DE & GIAI PHAP'),

  h2('3.1. Van de hien tai'),
  bullet('Sinh vien kho tim viec phu hop voi nganh hoc va ky nang'),
  bullet('Doanh nghiep kho tuyen nhan su tre co ky nang chuyen mon'),
  bullet('Thieu nen tang chuyen biet cho sinh vien freelancer'),
  bullet('Quan ly hop dong va thanh toan thieu minh bach'),
  spacer(),

  h2('3.2. Giai phap STULance'),
  bullet('Nen tang ket noi truc tiep sinh vien va doanh nghiep'),
  bullet('Quan ly ho so ca nhan, ky nang, kinh nghiem va portfolio'),
  bullet('Sinh vien dang goi dich vu freelance'),
  bullet('Doanh nghiep dang bai tuyen dung va tim kiem sinh vien'),
  bullet('Hop dong dien tu voi chu ky so'),
  bullet('Thanh toan qua ung dung ngan hang nen tang'),
  bullet('He thong danh gia hai chieu va bao cao vi pham'),
  spacer(),

  h2('3.3. So sanh voi giai phap khac'),
  table(['Tieu chi', 'STULance', 'Nen tang chung'], [
    ['Doi tuong', 'Sinh vien Viet Nam', 'Moi nguoi'],
    ['Hop dong', 'Dien tu, chu ky so, 8 dieu khoan', 'Co ban hoac khong co'],
    ['Thanh toan', 'Escrow VNPay, phi 10%', 'Chuyen khoan truc tiep'],
    ['CV/Portfolio', '4 mau CV, AI tao CV', 'Tao thu cong'],
    ['Danh gia', 'Hai chieu, verified', 'Mot chieu'],
    ['Bao cao', 'Co he thong xu ly', 'Khong hoac co ban'],
  ]),
  pb()
];

// ============================================================
// CHAPTER 4: CO SO DU LIEU
// ============================================================
const ch4 = [
  h1('4. CO SO DU LIEU CHINH'),

  p('Database: stulancedb (SQL Server)', { bold: true }),
  spacer(),

  h2('4.1. Cac bang chinh'),
  table(['Bang', 'Mo ta', 'Truong chinh'], [
    ['Users', 'Tai khoan nguoi dung co ban', 'userId, email, status, roles[]'],
    ['Students', 'Thong tin sinh vien freelancer', 'studentId, fullName, school, major, gpa'],
    ['Enterprises', 'Thong tin doanh nghiep', 'enterpriseId, companyName, taxCode, website'],
    ['Jobs', 'Bai dang tuyen dung', 'jobId, title, salary, status, deadline'],
    ['StudentServices', 'Goi dich vu freelance', 'serviceId, title, price, category, deliveryDays'],
    ['Contracts', 'Hop dong dien tu', 'contractId, status, totalBudget, deliveryDays'],
    ['Payments', 'Giao dich thanh toan', 'paymentId, amount, method, status, vnpayRef'],
    ['Reviews', 'Danh gia giua SV va DN', 'reviewId, rating, comment, targetType'],
    ['Reports', 'Bao cao vi pham', 'reportId, targetType, content, status'],
    ['Bids', 'Ho so ung tuyen', 'bidId, jobId, studentId, amount, status'],
    ['Deliveries', 'Ban giao du an', 'deliveryId, contractId, deliveryUrl, note'],
    ['Progress', 'Tien do thuc hien', 'progressId, contractId, percent, note'],
  ]),
  spacer(),

  h2('4.2. Mo hinh du lieu'),
  p('Mo hinh quan hoa chuan hoa (3NF), ho tro truy van hieu qua va mo rong de dang. Cac bang chinh ket noi qua khoa ngoai, duoc index tuy theo tan suat truy van.'),
  spacer(),
  p('Du lieu luu tru tren Azure SQL Server, voi Entity Framework Core lam ORM. Moi thay doi schema duoc quan ly qua EF Core Migration.'),
  pb()
];

// ============================================================
// CHAPTER 5: CONG NGHE FRONTEND
// ============================================================
const ch5 = [
  h1('5. CONG NGHE FRONTEND'),

  p('Kien truc giao dien toi uu hieu nang, responsive va de mo rong.', { italics: true }),
  spacer(),

  table(['Cong nghe', 'Phien ban', 'Chuc nang'], [
    ['React', '19.2.6', 'Framework UI chinh, thanh phan (component)'],
    ['Vite', '8.0.12', 'Cong cu build, dev server, hot reload'],
    ['React Bootstrap', '2.10.10', 'Thu vien giao dien Bootstrap cho React'],
    ['Bootstrap', '5.3.3', 'CSS framework, he thong grid'],
    ['React Router DOM', '7.15.1', 'Dieu huong trang (client-side routing)'],
    ['Axios', '1.17.0', 'HTTP client, gui request den API'],
    ['Lucide React', '1.16.0', 'Bo icon SVG (200+ icon)'],
    ['Recharts', '3.8.1', 'Thu vien bieu do (admin dashboard)'],
    ['Three.js', '0.165.0', 'Do hoa 3D (animation nen)'],
    ['html2pdf.js', '0.14.0', 'Xuat file PDF (CV, hop dong)'],
    ['react-signature-canvas', '1.1.0-alpha.2', 'Ky so tren hop dong'],
    ['Google Gemini API', '-', 'AI tao CV va recommendation'],
  ]),
  spacer(),

  h2('5.1. Cau truc thu muc'),
  table(['Thu muc', 'Noi dung', 'So file'], [
    ['src/pages/', 'Cac trang chinh', '47 file JSX'],
    ['src/components/', 'Thanh phan tai su dung', '20 file JSX'],
    ['src/services/', 'Lop API (axios wrapper)', '29 file JS'],
    ['src/CSS/', 'Stylesheet', '42 file CSS'],
    ['src/pages/Auth/', 'Dang nhap, dang ky', '3 file'],
    ['src/pages/Admin/', 'Quan tri vien', '10 file'],
    ['src/pages/Lancer/', 'Sinh vien freelancer', '6 file'],
    ['src/pages/Business/', 'Doanh nghiep', '8 file'],
    ['src/pages/Services/', 'Dich vu sinh vien', '5 file'],
  ]),
  spacer(),

  h2('5.2. He thong route'),
  p('Tong so 52 route, phan thanh 5 nhom chinh:'),
  table(['Nhom route', 'So luong', 'Mo ta'], [
    ['Public', '20 route', 'Trang cong khai, khong can dang nhap'],
    ['Student-only', '7 route', 'Sinh vien (dashboard, CV, portfolio)'],
    ['Enterprise-only', '5 route', 'Doanh nghiep (dang tin, quan ly)'],
    ['Auth shared', '6 route', 'Sinh vien + Doanh nghiep (hop dong, thanh toan)'],
    ['Admin', '10 route', 'Quan tri vien (dashboard, quan ly)'],
  ]),
  pb()
];

// ============================================================
// CHAPTER 6: CONG NGHE BACKEND & DATABASE
// ============================================================
const ch6 = [
  h1('6. CONG NGHE BACKEND & DATABASE'),

  h2('6.1. Backend'),
  table(['Cong nghe', 'Mo ta'], [
    ['ASP.NET Core 9', 'Framework backend chinh, API RESTful'],
    ['Entity Framework Core', 'ORM, quan ly ket noi CSDL'],
    ['JWT Authentication', 'Xac thuc nguoi dung qua Bearer Token'],
    ['SignalR', 'Ho tro real-time (chat, notification)'],
    ['Azure App Service', 'Phuc vu backend API (southeastasia-01)'],
    ['Azure Blob Storage', 'Luu tru file (anh, CV, tai lieu)'],
    ['CI/CD', 'Tu dong deploy khi push GitHub'],
  ]),
  spacer(),

  h2('6.2. Database'),
  p('SQL Server (stulancedb): dam bao quan he du lieu, migrations va hieu nang truy van.'),
  spacer(),
  p('Cac bang chinh: Users, Students, Enterprises, Jobs, Contracts, Payments, Reviews, Reports'),
  spacer(),
  p('Mo hinh du lieu quan hoa chuan hoa (3NF), ho tro truy van hieu qua va mo rong de dang. Entity Framework Core Migration quan ly schema.'),
  spacer(),

  h2('6.3. Moi truong trien khai'),
  table(['Thanh phan', 'Cong cu', 'URL'], [
    ['Frontend', 'Vercel', 'https://stulance-platform.vercel.app'],
    ['Backend', 'Azure App Service', 'https://stulance-platform-...azurewebsites.net'],
    ['Database', 'Azure SQL Server', 'southeastasia-01'],
    ['Storage', 'Azure Blob Storage', 'stulancestorage.blob.core.windows.net'],
    ['Payment', 'VNPay', 'sandbox.vnpayment.vn'],
    ['AI', 'Google Gemini', 'generativelanguage.googleapis.com'],
  ]),
  pb()
];

// ============================================================
// CHAPTER 7: XAC THUC & BAO MAT
// ============================================================
const ch7 = [
  h1('7. XAC THUC & BAO MAT'),

  h2('7.1. He thong xac thuc'),
  p('He thong dung JWT (Access + Refresh Token) voi quy trinh:'),
  spacer(),
  table(['Buoc', 'Mo ta'], [
    ['1. User Login', 'Nguoi dung dang nhap voi tai khoan'],
    ['2. Receive Tokens', 'Nhan Access Token va Refresh Token'],
    ['3. Attach Access', 'Gui Bearer Token trong moi request'],
    ['4. Refresh Access', 'Khi Access Token het han, dung Refresh Token de cap moi'],
    ['5. Logout', 'Dang xuat va xoa token'],
  ]),
  spacer(),
  p('Mo ta: He thong dung JWT (Access + Refresh). Axios tu dong gui Bearer token; khi Access het han, dung Refresh de cap moi; Refresh het han se yeu cau dang nhap lai.', { italics: true }),
  spacer(),

  h2('7.2. Bao mat frontend'),
  bullet('Content-Type interceptor: Tu dong xoa Content-Type cho GET/HEAD/DELETE va FormData'),
  bullet('Session expired handling: Tu dong logout khi token het han (401)'),
  bullet('Visibility change handler: Kiem tra token khi nguoi dung quay lai tab'),
  bullet('Role-based routing: 4 loai protected route (Student, Enterprise, Auth, Admin)'),
  bullet('Auto-refresh token: Lam moi moi 14 phut truoc khi het han'),
  spacer(),

  h2('7.3. Bao mat backend'),
  bullet('JWT Bearer Token: Xac thuc moi request'),
  bullet('CORS: Backend chi danh cho frontend domain'),
  bullet('Rate limiting: Ap dung cho API de ngan chan spam'),
  bullet('Escrow payment: Tien giu ky quy, chi giai ngan khi ca hai ben dong y'),
  bullet('XSS protection: React auto-escape JSX'),
  pb()
];

// ============================================================
// CHAPTER 8: TINH NANG CHINH THEO VAI TRO
// ============================================================
const ch8 = [
  h1('8. TINH NANG CHINH THEO VAI TRO'),

  h2('8.1. Sinh vien'),
  table(['Tinh nang', 'Mo ta'], [
    ['Dang ky/OTP', 'Tao tai khoan sinh vien voi xac thuc email'],
    ['Quan ly ho so', 'Cap nhat thong tin ca nhan, truong, nganh, GPA'],
    ['Quan ly CV', 'Tao/sua/xoa CV voi 4 mau, xuat PDF'],
    ['Portfolio', 'Them/sua/xoa du an mau voi anh, mo ta, link demo'],
    ['Dang goi dich vu', 'Tao goi dich vu freelance voi gia, thoi gian giao'],
    ['Ung tuyen viec lam', 'Nop ho so ung tuyen, gui yeu cau'],
    ['Ky hop dong', 'Ky so hop dong dien tu tren he thong'],
    ['Cap nhat tien do', 'Bao cao % hoan thanh, nop ban giao'],
    ['Rut tien', 'Rut tien tu tai khoan qua VNPay'],
    ['Danh gia doanh nghiep', 'Danh gia 1-5 sao sau khi hoan thanh hop dong'],
  ]),
  spacer(),

  h2('8.2. Doanh nghiep'),
  table(['Tinh nang', 'Mo ta'], [
    ['Dang tin tuyen dung', 'Dang tin voi tieu de, mo ta, muc luong, deadline'],
    ['Quan ly tin', 'Sua/xoa/duyet tin tuyen dung'],
    ['Tim kiem ung vien', 'Tim SV theo ky nang, GPA, danh gia'],
    ['Dat hang dich vu', 'Dat mua goi dich vu tu sinh vien'],
    ['Ky hop dong', 'Ky so hop dong, gui yeu cau hop dong'],
    ['Thanh toan ky quy', 'Nap tien ky quy qua VNPay QR'],
    ['Nghiem thu', 'Xac nhan ban giao, giai ngan tien cho SV'],
    ['Danh gia sinh vien', 'Danh gia 1-5 sao sau hop dong'],
  ]),
  spacer(),

  h2('8.3. Admin'),
  table(['Tinh nang', 'Mo ta'], [
    ['Dashboard tong quan', 'Thong ke doanh thu, tai khoan, hop dong, bao cao (Recharts)'],
    ['Quan ly tai khoan', 'Xem/duyet/khoa/cam tai khoan nguoi dung'],
    ['Quan ly bai viet', 'Duyet/tu choi tin tuyen dung'],
    ['Quan ly dich vu', 'Xem/quan ly dich vu sinh vien'],
    ['Quan ly hop dong', 'Xem chi tiet, xu ly tranh chap'],
    ['Quan ly thanh toan', 'Xem giao dich, xu ly rut tien'],
    ['Quan ly bao cao', 'Xem/tu choi/giai quyet bao cao vi pham'],
    ['Quan ly ky nang', 'Them/sua/xoa ky nang he thong'],
  ]),
  pb()
];

// ============================================================
// CHAPTER 9: API & LUONG NGHIEP VU
// ============================================================
const ch9 = [
  h1('9. API CHINH & LUONG NGHIEP VU'),

  h2('9.1. Mo hinh API'),
  p('He thong dung REST API voi cau truc PagedResponse<T>:'),
  p('{ items: T[], page: number, pageSize: number, totalItems: number, totalPages: number }', { italics: true, size: 22 }),
  spacer(),
  p('Moi request JWT header: Authorization: Bearer <token>', { italics: true, size: 22 }),
  spacer(),

  h2('9.2. Endpoints tieu bieu'),
  table(['Method', 'Endpoint', 'Mo ta'], [
    ['POST', '/v1/auth/login', 'Dang nhap, nhan JWT token'],
    ['POST', '/v1/auth/register', 'Dang ky tai khoan moi'],
    ['POST', '/v1/auth/refresh-token', 'Lam moi Access Token'],
    ['GET', '/v1/users/me', 'Lay thong tin nguoi dung hien tai'],
    ['PUT', '/v1/users/me', 'Cap nhat ho so ca nhan'],
    ['GET', '/v1/jobs', 'Lay danh sach viec lam cong khai'],
    ['POST', '/v1/jobs', 'Dang tin tuyen dung moi'],
    ['GET', '/v1/jobs/me', 'Lay tin cua doanh nghiep dang nhap'],
    ['GET', '/v1/student-services', 'Lay danh sach dich vu cong khai'],
    ['POST', '/v1/student-services', 'Tao dich vu moi'],
    ['GET', '/v1/contracts/{id}', 'Xem chi tiet hop dong'],
    ['POST', '/v1/contracts/{id}/progress', 'Cap nhat tien do'],
    ['POST', '/v1/contracts/{id}/deliveries', 'Nop ban giao'],
    ['POST', '/v1/vnpay/create-qr', 'Tao QR thanh toan VNPay'],
    ['GET', '/v1/recommendations/me', 'Lay de xuat AI ca nhan hoa'],
  ]),
  spacer(),

  h2('9.3. Luong nghiep vu chinh'),
  p('Luong 1: Sinh vien dang ky → Tao ho so → Dang dich vu → Doanh nghiep dat hang → Ky hop dong → Thanh toan → Ban giao → Nghiem thu → Danh gia'),
  spacer(),
  p('Luong 2: Doanh nghiep dang tin → Tim SV → Gui yeu cau → Ky hop dong → Nhan ban giao → Duyet → Giai ngan → Danh gia'),
  spacer(),
  p('Bao mat: JWT Bearer Token, Axios interceptor xu ly tu dong'),
  pb()
];

// ============================================================
// CHAPTER 10: TRIEN KHAI & KIEM THU
// ============================================================
const ch10 = [
  h1('10. TRIEN KHAI, CAI DAT & KIEM THU'),

  h2('10.1. Backend — Huong dan nhanh'),
  bullet('Yeu cau: .NET 9 SDK, SQL Server, Visual Studio 2022'),
  bullet('Buoc 1: Clone repository'),
  bullet('Buoc 2: Tao database stulancedb tren SQL Server'),
  bullet('Buoc 3: dotnet restore → dotnet build → dotnet run'),
  bullet('Buoc 4: Kiem tra Swagger tai /swagger'),
  spacer(),

  h2('10.2. Frontend — Huong dan nhanh'),
  bullet('Yeu cau: Node.js v20+, npm v10+'),
  bullet('Buoc 1: Clone repository'),
  bullet('Buoc 2: npm install'),
  bullet('Buoc 3: Cau hinh proxy vite.config.js'),
  bullet('Buoc 4: npm run dev → http://localhost:5173'),
  spacer(),

  h2('10.3. Cau hinh proxy'),
  p("server: { proxy: { '/api': { target: 'https://stulance-platform-...azurewebsites.net', changeOrigin: true } } }", { italics: true, size: 20 }),
  spacer(),

  h2('10.4. Kiem thu'),
  p('20/20 kich ban kiem thu thanh cong.', { bold: true }),
  spacer(),
  table(['Kich ban', 'Trang thai'], [
    ['TS01: Dang nhap JWT', 'Thanh cong'],
    ['TS02: Dang ky tai khoan', 'Thanh cong'],
    ['TS03: Quen mat khau', 'Thanh cong'],
    ['TS04: Tao CV 4 mau', 'Thanh cong'],
    ['TS05: Xuat PDF CV', 'Thanh cong'],
    ['TS06: Dang dich vu', 'Thanh cong'],
    ['TS07: Dang tin tuyen dung', 'Thanh cong'],
    ['TS08: Ung tuyen viec', 'Thanh cong'],
    ['TS09: Ky hop dong', 'Thanh cong'],
    ['TS10: Thanh toan VNPay', 'Thanh cong'],
    ['TS11: Cap nhat tien do', 'Thanh cong'],
    ['TS12: Nop ban giao', 'Thanh cong'],
    ['TS13: Nghiem thu', 'Thanh cong'],
    ['TS14: Danh gia', 'Thanh cong'],
    ['TS15: Bao cao vi pham', 'Thanh cong'],
    ['TS16: Admin dashboard', 'Thanh cong'],
    ['TS17: Quan ly tai khoan', 'Thanh cong'],
    ['TS18: Quan ly hop dong', 'Thanh cong'],
    ['TS19: Responsive mobile', 'Thanh cong'],
    ['TS20: Auto-refresh token', 'Thanh cong'],
  ]),
  spacer(),

  h2('10.5. Trien khai production'),
  table(['Thanh phan', 'Moi truong'], [
    ['Frontend', 'Vercel (CDN toan cau, tu dong deploy tu GitHub)'],
    ['Backend', 'Azure App Service (auto-scale, CI/CD)'],
    ['Database', 'Azure SQL Server (backup tu dong)'],
    ['Storage', 'Azure Blob Storage (anh, CV, tai lieu)'],
  ]),
  pb()
];

// ============================================================
// CHAPTER 11: HUONG PHAT TRIEN TUONG LAI
// ============================================================
const ch11 = [
  h1('11. HUONG PHAT TRIEN TUONG LAI'),

  p('STULance se tiep doi moi va mo rong de cung co vi the dan dau trong viec ket noi tai nang tre voi cac co hoi nghe nghiep.'),
  spacer(),

  h2('11.1. Ung dung di dong da nen tang'),
  p('Phat trien ung dung iOS & Android de tang cuong kha nang tiep can, mang lai trai nghiem lien mach cho sinh vien va doanh nghiep moi luc, moi noi.'),
  spacer(),

  h2('11.2. Tich hop AI & De xuat thong minh'),
  p('Ap dung tri tue nhan tao de phan tich du lieu, tu dong de xuat viec lam phu hop cho sinh vien va ung vien ly tuong cho doanh nghiep, toi uu hoa qua trinh ket noi.'),
  spacer(),

  h2('11.3. Mo rong thi truong va doi tac'),
  p('Nghien cuu mo rong sang cac thi truong tiem nang khac, thiet lap quan he doi tac chien luoc voi cac truong dai hoc va to chuc giao duc.'),
  spacer(),

  h2('11.4. Cac tinh nang ke hoach'),
  bullet('Chat truc tuyen: Cap nhat ChatBox voi SignalR/WebSocket'),
  bullet('Notification push: Thong bao realtime tren trinh duyet'),
  bullet('Upload file: Ho tro nhieu loai file (PDF, Word, ZIP)'),
  bullet('Multi-language: Ho tro tieng Anh/Tieng Viet'),
  bullet('Mobile app: React Native hoac PWA'),
  bullet('Code splitting: Lazy loading de giam kich thuoc bundle'),
  bullet('Danh gia chi tiet: Multi-criteria review system'),
  bullet('Analytics: Bieu do chi tiet cho doanh nghiep'),
  pb()
];

// ============================================================
// CHAPTER 12: KET QUA & THANH TUU
// ============================================================
const ch12 = [
  h1('12. KET QUA & THANH TUU DU AN'),

  p('Du an STULance da dat duoc nhung ket qua dang ke, san sang cho giai doan trien khai va phat trien tiep theo.'),
  spacer(),

  h2('12.1. Hoan dung dung thoi han'),
  p('Toan bo du an da duoc phat trien va hoan thien theo dung ke hoach de ra, dam bao tien do trien khai. Thoi gian trien khai: 30/04/2026 – 10/08/2026 (3.5 thang).'),
  spacer(),

  h2('12.2. Dat 100% muc tieu tinh nang'),
  p('Tat ca cac tinh nang cot loi cho sinh vien, doanh nghiep va admin deu da duoc tich hop day du va hoat dong on dinh.'),
  spacer(),
  table(['Nhom tinh nang', 'So luong', 'Trang thai'], [
    ['Xac thuc (Login, Register, OTP)', '3 tinh nang', 'Hoan thanh'],
    ['Sinh vien (CV, Portfolio, Dich vu)', '8 tinh nang', 'Hoan thanh'],
    ['Doanh nghiep (Tin, Hop dong, Thanh toan)', '7 tinh nang', 'Hoan thanh'],
    ['Admin (Dashboard, Quan ly)', '8 tinh nang', 'Hoan thanh'],
    ['Hop dong & Ky so', '5 tinh nang', 'Hoan thanh'],
    ['Thanh toan VNPay', '3 tinh nang', 'Hoan thanh'],
    ['Bao cao & Danh gia', '3 tinh nang', 'Hoan thanh'],
    ['AI Recommendation', '2 tinh nang', 'Hoan thanh'],
  ]),
  spacer(),

  h2('12.3. Ty le loi thap'),
  p('Qua qua trinh kiem thu nghiem ngat, he thong hoat dong voi do tin cay cao, dam bao trai nghiem lien mach. 20/20 kich ban kiem thu thanh cong.'),
  spacer(),

  h2('12.4. Kien truc mo rong'),
  p('He thong duoc xay dung voi kien truc module, de dang mo rong va tich hop cac tinh nang moi trong tuong lai. Cau truc src/ ro rang: pages/, components/, services/, CSS/.'),
  spacer(),

  h2('12.5. Giao dien nguoi dung than thien'),
  p('Thiet ke UI/UX duoc toi uu hoa, mang lai trai nghiem truc quan va de su dung cho moi doi tuong nguoi dung. Dark theme hien dai, responsive tren moi thiet bi.'),
  spacer(),
  p('STULance Platform — Nen tang ket noi Sinh vien Freelancer voi Doanh nghiep', { bold: true, color: '1e3a5f', align: AlignmentType.CENTER }),
];

// ============================================================
// ASSEMBLE DOCUMENT
// ============================================================
const doc = new Document({
  creator: 'STULance Team',
  title: 'Bao cao du an STULance Platform',
  description: 'Bao cao chi tiet website ket noi sinh vien freelancer',
  styles: {
    default: {
      document: { run: { font: 'Arial', size: 24 } },
    },
  },
  sections: [{
    properties: {
      page: {
        margin: {
          top: convertInchesToTwip(1),
          bottom: convertInchesToTwip(1),
          left: convertInchesToTwip(1.2),
          right: convertInchesToTwip(1.2),
        },
      },
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          children: [new TextRun({ text: 'BAO CAO DU AN — STULance Platform', font: 'Arial', size: 18, color: '999999', italics: true })],
          alignment: AlignmentType.RIGHT,
        })],
      }),
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          children: [
            new TextRun({ text: 'STULance Team | ', font: 'Arial', size: 18, color: '999999' }),
            new TextRun({ children: [PageNumber.CURRENT], font: 'Arial', size: 18, color: '999999' }),
            new TextRun({ text: ' / ', font: 'Arial', size: 18, color: '999999' }),
            new TextRun({ children: [PageNumber.TOTAL_PAGES], font: 'Arial', size: 18, color: '999999' }),
          ],
          alignment: AlignmentType.CENTER,
        })],
      }),
    },
    children: [
      ...cover,
      ...ch1,
      ...ch2,
      ...ch3,
      ...ch4,
      ...ch5,
      ...ch6,
      ...ch7,
      ...ch8,
      ...ch9,
      ...ch10,
      ...ch11,
      ...ch12,
    ],
  }],
});

// ============================================================
// WRITE FILE
// ============================================================
const buffer = await Packer.toBuffer(doc);
const outPath = 'D:\\VSCODE\\STULance Platform\\BaoCao_STULance_Platform.docx';
fs.writeFileSync(outPath, buffer);
console.log('Da tao thanh cong: ' + outPath);
