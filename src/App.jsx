import React, { useState, useEffect } from 'react';
import { authService } from './services/authService';
import { createBrowserRouter, RouterProvider, Outlet, useSearchParams, useLocation } from 'react-router-dom';

import NavbarComp from './components/NavbarComp';
import FooterComp from './components/Footer';
import ChatBox from './components/ChatBox';
import ThreeBg from './components/Threebg';
import LoadingScreen from './components/LoadingScreen';
import { ToastProvider } from './components/Toast';
import { RequireAdmin, RequireStudent, RequireEnterprise, RequireAuth } from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import CVMaker from './pages/CVMaker';
import Portfolio from './pages/Lancer/Portfolio';
import BusinessProfile from './pages/Business/BusinessProfile';
import Jobs from './pages/Jobs';
import Businesses from './pages/Business/Businesses';
import FindStudents from './pages/Business/FindStudents';
import FindEnterprises from './pages/Business/FindEnterprises';
import Services from './pages/Services/Services';
import ServicesList from './pages/Services/ServicesList';
import ServiceDetail from './pages/Services/ServiceDetail';
import Payment from './pages/Payment';
import ServiceInvoice from './pages/Services/ServiceInvoice';
import Contract from './pages/Contract';
import ProfileSettings from './pages/Lancer/ProfileSettings';
import PostJob from './pages/Business/PostJob';
import ManageJobs from './pages/Business/ManageJobs';
import PostService from './pages/Services/PostService';
import DashboardLancer from './pages/Lancer/DashboardLancer';
import Handbook from './pages/Handbook';
import Privacy from './pages/Privacy';
import JobPayment from './pages/JobPayment';
import Universities from './pages/Universities';
import AdminDashboard from './pages/Admin/AdminDashboard';
import ManageAccounts from './pages/Admin/ManageAccounts';
import ManagePayments from './pages/Admin/ManagePayments';
import AdminLayout from './pages/Admin/AdminLayout';
import ManagePosts from './pages/Admin/ManagePosts';
import AdminReports from './pages/Admin/AdminReports';
import ManageReports from './pages/Admin/ManageReports';
import ManageReportDetail from './components/ReportDetailView';
import BusinessProfileSettings from './pages/Business/BusinessProfileSettings';
import AdminSkillManagement from './pages/Admin/AdminSkillManagement';
import MyPortfolio from './pages/Lancer/MyPortfolio';
import ManageStudentServices from './pages/Admin/ManageStudentServices';
import ManageContracts from './pages/Admin/ManageContracts';
import ApplyJob from './pages/Lancer/ApplyJob';
import SignContract from './pages/SignContract';
import ContractTerms from './pages/ContractTerms';
import Policy from './pages/Policy';
import NotFound from './pages/NotFound';
import { paymentService } from './services/paymentservice';

const PAGE_TITLES = {
  '/': 'Trang chủ',
  '/login': 'Đăng nhập',
  '/register': 'Đăng ký',
  '/forgot-password': 'Quên mật khẩu',
  '/jobs': 'Việc làm',
  '/businesses': 'Doanh nghiệp',
  '/services': 'Dịch vụ',
  '/services-list': 'Danh sách dịch vụ',
  '/portfolio': 'Portfolio',
  '/handbook': 'Cẩm nang',
  '/privacy': 'Chính sách bảo mật',
  '/policy': 'Điều khoản sử dụng',
  '/universities': 'Trường đại học',
  '/dashboardlancer': 'Bảng điều khiển',
  '/cv-maker': 'Tạo CV',
  '/profile-settings': 'Cài đặt hồ sơ',
  '/portfolio-manager': 'Quản lý Portfolio',
  '/post-service': 'Đăng dịch vụ',
  '/post-job': 'Đăng việc',
  '/manage-jobs': 'Quản lý việc',
  '/find-students': 'Tìm sinh viên',
  '/find-enterprises': 'Tìm doanh nghiệp',
  '/payment': 'Thanh toán',
  '/service-invoice': 'Hóa đơn dịch vụ',
};

const useSeo = () => {
  const location = useLocation();
  useEffect(() => {
    const path = location.pathname;
    const title = PAGE_TITLES[path] || '';
    document.title = title ? `${title} | STULance` : 'STULance - Kết nối Sinh viên & Doanh nghiệp';
  }, [location.pathname]);
};

const MainLayout = () => {
  const [isLoading, setIsLoading] = useState(true);
  useSeo();
  return (
    <div className="app-wrapper">
      {isLoading && <LoadingScreen onFinished={() => setIsLoading(false)} />}
      <div style={{ opacity: isLoading ? 0 : 1, transition: 'opacity 1s ease', visibility: isLoading ? 'hidden' : 'visible' }}>
        <ThreeBg />
        <NavbarComp />
        <main style={{ position: 'relative', zIndex: 10, paddingTop: '90px', minHeight: '100vh' }}>
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
  const userRole = localStorage.getItem('userRole');
  useEffect(() => {
    const params = Object.fromEntries([...searchParams]);
    paymentService.handleVnpayReturn(params).then(res => {
      if (res?.success || res?.data?.isGatewaySuccess) {
        alert("Thanh toán thành công!");
      }
      if (userRole === 'ENTERPRISE') {
        window.location.href = "/manage-jobs";
      } else if (userRole === 'STUDENT') {
        window.location.href = "/dashboardlancer";
      } else {
        window.location.href = "/payment";
      }
    }).catch(() => {
      window.location.href = "/payment";
    });
  }, []);
  return <div className="text-center py-5 text-white">Đang xử lý kết quả thanh toán...</div>;
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      // ===== PUBLIC =====
      { index: true, element: <Home /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'forgot-password', element: <ForgotPassword /> },
      { path: 'jobs', element: <Jobs /> },
      { path: 'jobs/apply/:jobId', element: <ApplyJob /> },
      { path: 'businesses', element: <Businesses /> },
      { path: 'businesses/business-profile/:id', element: <BusinessProfile /> },
      { path: 'businesses/business-profile', element: <BusinessProfile /> },
      { path: 'services-list', element: <ServicesList /> },
      { path: 'services', element: <Services /> },
      { path: 'service-detail/:id', element: <ServiceDetail /> },
      { path: 'portfolio', element: <Portfolio /> },
      { path: 'portfolio/:id', element: <Portfolio /> },
      { path: 'handbook', element: <Handbook /> },
      { path: 'privacy', element: <Privacy /> },
      { path: 'policy', element: <Policy /> },
      { path: 'contract-terms/:id', element: <ContractTerms /> },
      { path: 'universities', element: <Universities /> },

      // ===== SINH VIÊN ONLY =====
      {
        element: <RequireStudent />,
        children: [
          { path: 'dashboardlancer', element: <DashboardLancer /> },
          { path: 'cv-maker', element: <CVMaker /> },
          { path: 'profile-settings', element: <ProfileSettings /> },
          { path: 'portfolio-manager', element: <MyPortfolio /> },
          { path: 'post-service', element: <PostService /> },
          { path: 'post-service/:id', element: <PostService /> },
        ]
      },

      // ===== DOANH NGHIỆP ONLY =====
      {
        element: <RequireEnterprise />,
        children: [
          { path: 'post-job', element: <PostJob /> },
          { path: 'manage-jobs', element: <ManageJobs /> },
          { path: 'businesses/business-profile-settings', element: <BusinessProfileSettings /> },
        ]
      },

      { path: 'find-students', element: <FindStudents /> },
      { path: 'find-enterprises', element: <FindEnterprises /> },

      // ===== SINH VIÊN + DOANH NGHIỆP =====
      {
        element: <RequireAuth />,
        children: [
          { path: 'contract/:id', element: <Contract /> },
          { path: 'contract/sign/:id', element: <SignContract /> },
          { path: 'payment', element: <Payment /> },
          { path: 'payment/return', element: <PaymentReturn /> },
          { path: 'JobPayment', element: <JobPayment /> },
          { path: 'service-invoice', element: <ServiceInvoice /> },
        ]
      },

      { path: '*', element: <NotFound /> },
    ],
  },
  {
    path: '/admin',
    element: <RequireAdmin />,
    children: [
      {
        element: <AdminLayout />,
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
          { path: 'contracts', element: <ManageContracts /> },
          { path: '*', element: <NotFound /> },
        ]
      }
    ]
  }
]);

function App() {
  useEffect(() => {
    authService.initAuth();
  }, []);

  return (
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>
  );
}

export default App;
