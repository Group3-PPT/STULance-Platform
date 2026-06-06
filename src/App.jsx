import React, { useState } from 'react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
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
import Services from './pages/Services/Services'; // Đừng quên import trang Services nếu bạn đã tạo nó
import ServicesList from './pages/Services/ServicesList'; // Đừng quên import trang ServicesList nếu bạn đã tạo nó
import ServiceDetail from './pages/Services/ServiceDetail'; // Đừng quên import trang ServiceDetail nếu bạn đã tạo nó
import Payment from './pages/Payment';
import ServiceInvoice from './pages/Services/ServiceInvoice'; // Đừng quên import trang ServiceInvoice nếu bạn đã tạo nó
import Contract from './pages/Contract'; // Đừng quên import trang Contract nếu bạn đã tạo nó
import ProfileSettings from './pages/Lancer/ProfileSettings'; // Đừng quên import trang ProfileSettings nếu bạn đã tạo nó
import PostJob from './pages/Lancer/PostJob';
import ManageJobs from './pages/Business/ManageJobs'; // Đừng quên import trang ManageJobs nếu bạn đã tạo nó
import PostService from './pages/Services/PostService'; // Đừng quên import trang PostService nếu bạn đã tạo nó
import DashboardLancer from './pages/Lancer/DashboardLancer'; // Đừng quên import trang Dashboard nếu bạn đã tạo nó
import Handbook from './pages/Handbook'; // Đừng quên import trang Handbook nếu bạn đã tạo nó
import Privacy from './pages/Privacy'; // Đừng quên import trang Privacy nếu bạn đã tạo nó
import JobPayment from './pages/JobPayment'; // Đừng quên import trang JobPayment nếu bạn đã tạo nó
import Universities from './pages/Universities'; // Đừng quên import trang Universities nếu bạn đã tạo nó
import AdminDashboard from './pages/Admin/AdminDashboard'; // Đừng quên import trang AdminDashboard nếu bạn đã tạo nó
import ManageUsers from './pages/Admin/ManageAccounts'; // Đừng quên import trang ManageUsers nếu bạn đã tạo nó
import ManageAccounts from './pages/Admin/ManageAccounts';
import ManagePayments from './pages/Admin/ManagePayments';
import AdminLayout from './pages/Admin/AdminLayout';
import ManagePosts from './pages/Admin/ManagePosts';
import AdminReports from './pages/Admin/AdminReports';
import ManageReports from './pages/Admin/ManageReports';
import ManageReportDetail from './components/ReportDetailView';
import BusinessProfileSettings from './pages/Business/BusinessProfileSettings'; // Đừng quên import trang BusinessProfileSettings nếu bạn đã tạo nó


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

// --- 2. CẤU HÌNH ROUTER TỔNG ---
const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />, // User side: CÓ Loading
    children: [
      { index: true, element: <Home /> },
      { path: 'cv-maker', element: <CVMaker /> },
      { path: 'portfolio', element: <Portfolio /> },
      { path: 'businesses/business-profile', element: <BusinessProfile /> },
      { path: 'jobs', element: <Jobs /> },
      { path: 'businesses', element: <Businesses /> },
      { path: 'services-list', element: <ServicesList /> },
      { path: 'services', element: <Services /> },
      { path: 'service-detail', element: <ServiceDetail /> },
      { path: 'payment', element: <Payment /> },
      { path: 'service-invoice', element: <ServiceInvoice /> },
      { path: 'contract', element: <Contract /> },
      { path: 'profile-settings', element: <ProfileSettings /> },
      { path: 'post-job', element: <PostJob /> },
      { path: 'manage-jobs', element: <ManageJobs /> },
      { path: 'post-service', element: <PostService /> },
      { path: 'dashboardlancer', element: <DashboardLancer /> }, 
      { path: 'handbook', element: <Handbook /> },
      { path: 'privacy', element: <Privacy /> },
      { path: 'JobPayment', element: <JobPayment /> },
      { path: 'universities', element: <Universities /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'forgot-password', element: <ForgotPassword /> },
      { path: 'businesses/business-profile-settings', element: <BusinessProfileSettings /> },

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
      {path: 'reports', element: <AdminReports /> },
      { path: 'manage-reports', element: <ManageReports /> },
      { path: 'report-detail', element: <ManageReportDetail /> },

    ]
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;