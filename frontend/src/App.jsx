import React, { lazy, Suspense } from 'react';
import Header from "./components/Header";
import 'ag-grid-enterprise';
import { BrowserRouter as Router, Route, Routes, Outlet } from 'react-router-dom'

// WITHOUT LAZY, SUSPENCE AND LOADING  

import Home from "./pages/clientUI/home/Home"
import AdminLayout from "./components/layout/AdminLayout"
import DashboardPage from "./pages/dashboardPages/DashboardPage"
import Fundamentals from "./pages/clientUI/fundamental/Fundamentals"
import Sentimental from "./pages/clientUI/sentimental/Sentimental"
import BankingTable from "./pages/dashboardPages/fundamentals/BankingTable"
import ITTable from "./pages/dashboardPages/fundamentals/ITTable"
import LargeCapTable from "./pages/dashboardPages/sentimentalPages/LargeCapTable"
import MidCapTable from "./pages/dashboardPages/sentimentalPages/MidCapTable"
import SmallCapTable from "./pages/dashboardPages/sentimentalPages/SmallCapTable"
import AdminLogin from "./pages/dashboardPages/AdminLogin"
import TechnicalUI from "./pages/clientUI/technical/TechnicalUI"
import TechnicalBankingTable from "./pages/dashboardPages/technical/TechnicalBankingTable"
import DeliveryMain from './pages/clientUI/delivery/DeliveryMain';
import DeliveryTable from './pages/dashboardPages/delivery/DeliveryTable';
import SectorialTable from './pages/dashboardPages/sectorial/SectorialTable';
import FromURLTable from './pages/dashboardPages/fromURL/FromURLTable';
import VideoUploadTable from './pages/dashboardPages/videoUpload/VideoUploadTable';
import VideoDelivery from './pages/clientUI/video_delivery/VideoDelivery';
import FromURLTable2 from './pages/dashboardPages/fromURL2/FromURLTable2';
import ErrorPageComponent from './ErrorPageComponent ';
import ErrorBoundary from './ErrorBoundary';
import DailyIOMain from './pages/clientUI/daily_IO/DailyIOMain';
import { Toaster } from 'sonner';
import ProtectedRoutes from './pages/dashboardPages/ProtectedRoutes';
import DeliveryDashboard from './pages/dashboardPages/dashboardContent/DeliveryDashboard';
import FundDeliveryDashboard from './pages/dashboardPages/dashboardContent/FundDeliveryDashboard';
import MasterScreen from './pages/dashboardPages/masterScreenCAPS/MasterScreen';
import StockPriceChecker from './pages/dashboardPages/stockPriceChecker/StockPriceChecker';
import LiveData from './pages/dashboardPages/liveData/LiveData';
import Footer from './pages/clientUI/home/Footer';
import ClientLayout from './components/layout/ClientLayout';
import Research from './pages/dashboardPages/reSearch/Research';


// WITH LAZY, SUSPENCE AND LOADING  

// import Loading from './Loading';
// const Home = lazy(() => import("./pages/clientUI/home/Home"))
// const AdminLayout = lazy(()=>import("./components/layout/AdminLayout"))
// const DashboardPage = lazy(()=>import("./pages/dashboardPages/DashboardPage"))
// const Fundamentals = lazy(()=>import("./pages/clientUI/fundamental/Fundamentals"))
// const Sentimental = lazy(()=>import("./pages/clientUI/sentimental/Sentimental"))
// const BankingTable = lazy(()=>import("./pages/dashboardPages/fundamentals/BankingTable"))
// const ITTable = lazy(()=>import("./pages/dashboardPages/fundamentals/ITTable"))
// const LargeCapTable = lazy(()=>import("./pages/dashboardPages/sentimentalPages/LargeCapTable"))
// const MidCapTable = lazy(()=>import("./pages/dashboardPages/sentimentalPages/MidCapTable"))
// const SmallCapTable = lazy(()=>import("./pages/dashboardPages/sentimentalPages/SmallCapTable"))
// const AdminLogin = lazy(()=>import("./pages/dashboardPages/AdminLogin"))
// const TechnicalBankingTable = lazy(()=>import("./pages/dashboardPages/technical/TechnicalBankingTable"))
// const TechnicalUI = lazy(() => import("./pages/clientUI/technical/TechnicalUI"))
// const DeliveryMain = lazy(() => import("./pages/clientUI/delivery/DeliveryMain"))


function App() {
  return (
    <>
      <Toaster richColors position="top-right" />
      {/* <Suspense fallback={<Loading msg='Please wait...' />}> */}
      <Router>
        <Routes>
          {/* CLIENT UI  */}
          <Route path='/' element={
            <>
              {/* <Header />
              <Outlet />
              <Footer/> */}
              <ClientLayout />
            </>
          }>
            <Route index={true} path="/" element={<Home />} />
            <Route path="user-dashboard" element={
              <div className='py-8 px-6 h-[85vh]'>
                {/* <DeliveryDashboard /> */}
                <FundDeliveryDashboard />
              </div>
            } />
            <Route path="fundamentals" element={<Fundamentals />} />
            <Route path="sentimental" element={<Sentimental />} />
            {/* <Route path="technical" element={<TechnicalUI />} /> */}
            {/* <Route path="delivery" element={<DeliveryMain />} /> */}
            {/* <Route path="sectorial" element={<DeliveryMain />} /> */}
            <Route path="daily-spurts" element={<DailyIOMain />} />
            <Route path="live-data" element={
              <div className='flex justify-center items-end p-4'>
                <LiveData />
              </div>
            } />
            <Route path="research" element={
              <div className='p-4'>
                <Research />
              </div>
            } />
            <Route path="video" element={<VideoDelivery />} />
            <Route path="*" element={<ErrorPageComponent />} />
          </Route>


          {/* ADMIN DASHBOARD  */}
          <Route path='/login' element={<AdminLogin />} />
          {/* <Route path='/dashboard' element={
            <ErrorBoundary>
              <AdminLayout />
            </ErrorBoundary>
          } > */}

          {/* PROTECTED ROUTES */}
          {/* <Route element={<ProtectedRoutes />}>
              <Route index={true} element={<DashboardPage />} />
              <Route path="fundamentals/banking" element={<BankingTable />} />
              <Route path="fundamentals/it" element={<ITTable />} />
              <Route path="sentimental/large-cap" element={<LargeCapTable />} />
              <Route path="sentimental/mid-cap" element={<MidCapTable />} />
              <Route path="sentimental/small-cap" element={<SmallCapTable />} />
              <Route path="technical/banking" element={<TechnicalBankingTable />} />
              <Route path="delivery" element={<DeliveryTable />} />
              <Route path="sectorial" element={<SectorialTable />} />
              <Route path="fromdate" element={<FromURLTable />} />
              <Route path="upload-video" element={<VideoUploadTable />} />
              <Route path="fromurl" element={<FromURLTable2 />} />
              <Route path="*" element={<ErrorPageComponent />} />
            </Route> */}


          <Route element={<ProtectedRoutes />}>
            <Route path="/dashboard" element={<AdminLayout />}>
              <Route index={true} element={<ErrorBoundary><DashboardPage /></ErrorBoundary>} />
              <Route path="fundamentals/banking" element={<ErrorBoundary><BankingTable /></ErrorBoundary>} />
              <Route path="fundamentals/it" element={<ErrorBoundary><ITTable /></ErrorBoundary>} />
              <Route path="sentimental/large-cap" element={<ErrorBoundary><LargeCapTable /></ErrorBoundary>} />
              <Route path="sentimental/mid-cap" element={<ErrorBoundary><MidCapTable /></ErrorBoundary>} />
              <Route path="sentimental/small-cap" element={<ErrorBoundary><SmallCapTable /></ErrorBoundary>} />
              <Route path="technical/banking" element={<ErrorBoundary><TechnicalBankingTable /></ErrorBoundary>} />
              {/* <Route path="delivery" element={<ErrorBoundary><DeliveryTable /></ErrorBoundary>} /> */}
              <Route path="sectorial" element={<ErrorBoundary><SectorialTable /></ErrorBoundary>} />
              <Route path="fii-data" element={<ErrorBoundary><FromURLTable /></ErrorBoundary>} />
              <Route path="daily-spurt" element={<ErrorBoundary><FromURLTable2 /></ErrorBoundary>} />
              <Route path="stock-price-checker" element={<ErrorBoundary><StockPriceChecker /></ErrorBoundary>} />
              <Route path="research" element={<ErrorBoundary><Research /></ErrorBoundary>} />
              <Route path="upload-video" element={<ErrorBoundary><VideoUploadTable /></ErrorBoundary>} />
              {/* <Route path="master-screen" element={<ErrorBoundary><MasterScreen /></ErrorBoundary>} /> */}
              <Route path="*" element={<ErrorPageComponent />} />
            </Route>
          </Route>


          {/* </Route> */}
          <Route path="*" element={<ErrorPageComponent />} />
        </Routes>
      </Router>
      {/* </Suspense> */}
    </>
  )
}

export default App
