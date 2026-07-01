import React, { useState, useEffect } from 'react';
import { authService } from './services/authService';
import { createBrowserRouter, RouterProvider, Outlet, useSearchParams } from 'react-router-dom';

import NavbarComp from './components/NavbarComp';
import AuthNavbar from './components/AuthNavbar';
import BusinessNavbar from './components/BusinessNavbar';
import StudentNavbar from './components/StudentNavbar';
import FooterComp from './components/Footer';
import ChatBox from './components/ChatBox';
import ThreeBg from './components/Threebg'; // Sửa chữ B thành b cho đúng tên file
import JobCardSidebar from './components/JobCardSidebar';
import JobDetailView from './components/JobDetailView';
import LoadingScreen from './components/LoadingScreen';
import { ToastProvider } from './components/Toast';

// IMPORT CÁC TRANG - Hãy kiểm tra kỹ đường dẫn file (components hay pages?)
import Home from './pages/Home'; 
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import CVMaker from './pages/CVMaker';
import Portfolio from './pages/Lancer/Portfolio';
import BusinessProfile from './pages/Business/BusinessProfile';
import Jobs from './pages/Jobs'; // Đừng quên import trang Jobs nếu bạn đã tạo nó
import Businesses from './pages/Business/Businesses'; // Đừng quên import trang Businesses nếu bạn đã tạo nó
import FindStudents from './pages/Business/FindStudents';
import FindEnterprises from './pages/Business/FindEnterprises';
import Services from './pages/Services/Services'; // Đừng quên import trang Services nếu bạn đã tạo nó
import ServicesList from './pages/Services/ServicesList'; // Đừng quên import trang ServicesList nếu bạn đã tạo nó
import ServiceDetail from './pages/Services/ServiceDetail'; // Đừng quên import trang ServiceDetail nếu bạn đã tạo nó
import Payment from './pages/Payment';
import ServiceInvoice from './pages/Services/ServiceInvoice'; // Đừng quên import trang ServiceInvoice nếu bạn đã tạo nó
import Contract from './pages/Contract'; // Đừng quên import trang Contract nếu bạn đã tạo nó
import ProfileSettings from './pages/Lancer/ProfileSettings'; // Đừng quên import trang ProfileSettings nếu bạn đã tạo nó
import PostJob from './pages/Business/PostJob';
import ManageJobs from './pages/Business/ManageJobs'; // Đừng quên import trang ManageJobs nếu bạn đã tạo nó
import PostService from './pages/Services/PostService'; // Đừng quên import trang PostService nếu bạn đã tạo nó
import DashboardLancer from './pages/Lancer/DashboardLancer'; // Đừng quên import trang Dashboard nếu bạn đã tạo nó
import Handbook from './pages/Handbook'; // Đừng quên import trang Handbook nếu bạn đã tạo nó
import Privacy from './pages/Privacy'; // Đừng quên import trang Privacy nếu bạn đã tạo nó
import JobPayment from './pages/JobPayment'; // Đừng quên import trang JobPayment nếu bạn đã tạo nó
import Universities from './pages/Universities'; // Đừng quên import trang Universities nếu bạn đã tạo nó
import AdminDashboard from './pages/Admin/AdminDashboard'; // Đừng quên import trang AdminDashboard nếu bạn đã tạo nó
import ManageAccounts from './pages/Admin/ManageAccounts';
import ManagePayments from './pages/Admin/ManagePayments';
import AdminLayout from './pages/Admin/AdminLayout';
import ManagePosts from './pages/Admin/ManagePosts';
import AdminReports from './pages/Admin/AdminReports';
import ManageReports from './pages/Admin/ManageReports';
import ManageReportDetail from './components/ReportDetailView';
import BusinessProfileSettings from './pages/Business/BusinessProfileSettings'; 
import AdminSkillManagement from './pages/Admin/AdminSkillManagement';
import MyPortfolio from './pages/Lancer/MyPortfolio'; // Đừng quên import trang MyPortfolio nếu bạn đã tạo nó
import ManageStudentServices from './pages/Admin/ManageStudentServices'; // Đừng quên import trang ManageStudentServices nếu bạn đã tạo nó
import ApplyJob from './pages/Lancer/ApplyJob'; // Đừng quên import trang ApplyJob nếu bạn đã tạo nó
import SignContract from './pages/SignContract';
import NotFound from './pages/NotFound';
import { paymentService } from './services/paymentservice';
// --- 1. LAYOUT CHO USER (CÓ LOADING SCREEN) ---
const MainLayout = () => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="app-wrapper">
      {/* LoadingScreen chỉ xuất hiện ở đây */}
      {isLoading && <LoadingScreen onFinished={() => setIsLoading(false)} />}
      
      <div style={{ 
        opacity: isLoading ? 0 : 1, 
        transition: 'opacity 1s ease',
        visibility: isLoading ? 'hidden' : 'visible' 
      }}>
        <ThreeBg /> 
        <NavbarComp />
        <main style={{ 
          position: 'relative', 
          zIndex: 10, 
          paddingTop: '90px', // Đẩy nội dung xuống 100px (chiều cao navbar + khoảng cách đẹp)
          minHeight: '100vh' }}>
          <Outlet />
        </main>
        <ChatBox />
        <FooterComp />
      </div>
    </div>
  );
};

const PaymentReturn = () => {
    const [searchParams] = useSearchParams();
    
    useEffect(() => {
        const params = Object.fromEntries([...searchParams]);
        paymentService.handleVnpayReturn(params).then(res => {
            if (res.success) alert("Nạp tiền thành công!");
            window.location.href = "/payment";
        });
    }, []);

    return <div className="text-center py-5 text-white">Đang xử lý kết quả thanh toán...</div>;
};

// --- 2. CẤU HÌNH ROUTER TỔNG ---
const router = createBrowserRouter([
  {
   path: '/',
    element: <MainLayout />, 
    children: [
      { index: true, element: <Home /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'forgot-password', element: <ForgotPassword /> },

      // --- PHẦN SINH VIÊN & PORTFOLIO ---
      { path: 'dashboardlancer', element: <DashboardLancer /> }, 
      { path: 'cv-maker', element: <CVMaker /> },
      { path: 'profile-settings', element: <ProfileSettings /> },
      
      // Xem Portfolio của mình hoặc của người khác theo ID
      { path: 'portfolio', element: <Portfolio /> },
      { path: 'portfolio/:id', element: <Portfolio /> }, 
      
      // Quản lý danh sách dự án cá nhân
      { path: 'portfolio-manager', element: <MyPortfolio /> }, 

      // --- PHẦN DỊCH VỤ (SERVICES) ---
      { path: 'services-list', element: <ServicesList /> }, // Danh mục lớn
      { path: 'services', element: <Services /> },          // Danh sách TikTok Style
      
      // CHI TIẾT DỊCH VỤ: Bắt buộc thêm /:id để lấy dữ liệu từ Azure
      { path: 'service-detail/:id', element: <ServiceDetail /> }, 
      
      { path: 'service-invoice', element: <ServiceInvoice /> },
      { path: 'post-service', element: <PostService /> },

      // --- PHẦN DOANH NGHIỆP & VIỆC LÀM ---
      { path: 'businesses', element: <Businesses /> },
      { path: 'find-students', element: <FindStudents /> },
      { path: 'find-enterprises', element: <FindEnterprises /> },
      { path: 'businesses/business-profile', element: <BusinessProfile /> },
      { path: 'businesses/business-profile-settings', element: <BusinessProfileSettings /> },
      { path: 'jobs', element: <Jobs /> },
      { path: 'post-job', element: <PostJob /> },
      { path: 'manage-jobs', element: <ManageJobs /> },
      { path: 'jobs/apply/:jobId', element: <ApplyJob /> },

      // --- THANH TOÁN & HỢP ĐỒNG ---
      { path: 'payment', element: <Payment /> },
      { path: 'payment/return', element: <PaymentReturn /> },
      { path: 'JobPayment', element: <JobPayment /> },
      { path: 'contract/:id', element: <Contract /> },
      { path: 'contract/sign/:id', element: <SignContract /> },
      // --- THÔNG TIN KHÁC ---
      { path: 'handbook', element: <Handbook /> },
      { path: 'privacy', element: <Privacy /> },
      { path: 'universities', element: <Universities /> },
      { path: 'post-service/:id', element: <PostService /> },
      { path: '*', element: <NotFound /> },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />, // Admin side: KHÔNG CÓ Loading
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'accounts', element: <ManageAccounts /> },
      { path: 'payments', element: <ManagePayments /> },
      { path: 'posts', element: <ManagePosts /> },
      { path: 'reports', element: <AdminReports /> },
      { path: 'manage-reports', element: <ManageReports /> },
      { path: 'report-detail', element: <ManageReportDetail /> },
      { path: 'skills', element: <AdminSkillManagement /> },
      { path: 'student-services', element: <ManageStudentServices /> },
      { path: '*', element: <NotFound /> },
    ]
  }
]);

function App() {
  // Logic khởi chạy khi ứng dụng bắt đầu
  useEffect(() => {
    // 1. Khôi phục chu kỳ refresh token nếu đang có session
    // 2. Tự động đổi token mới ngay lập tức để kiểm tra tính hợp lệ
    authService.initAuth();
  }, []);

  return (
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>
  );
}
export default App;