import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import Header from './components/Header';
import Footer from './components/Footer';
import CheckoutPage from './components/CheckoutPage';

import { CartProvider } from './components/CartContext';
import FloatingCart from './components/FloatingCart';

import Profile from './components/pages/Profile';
import Home from './components/pages/Home';
import About from './components/pages/About';
import Contacts from './components/pages/Contacts';
import Share from './components/pages/Share';
import Guarantee from './components/pages/Guarantee';
import Delivery from './components/pages/Delivery';
import Videocards from './components/pages/Videocards';
import Cpu from './components/pages/Cpu';
import Motherboard from './components/pages/Motherboards';
import SSD from './components/pages/SSD';
import Ram from './components/pages/Ram';
import Login from './components/pages/Login';
import Orders from './components/pages/Orders';

import AdminOrdersPage from './components/pages/AdminPages/AdminOrdersPage';
import AdminLoginPage from './components/pages/AdminPages/AdminLoginPage';
import AdminDashboardPage from './components/pages/AdminPages/AdminDashboardPage';
import AdminUsersPage from './components/pages/AdminPages/AdminUsersPage';
import AdminInventoryPage from './components/pages/AdminPages/AdminInventoryPage';

function AppContent() {
  const location = useLocation();

  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdminPage && <Header />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/about" element={<About />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/share" element={<Share />} />
        <Route path="/guarantee" element={<Guarantee />} />
        <Route path="/delivery" element={<Delivery />} />
        <Route path="/videocards" element={<Videocards />} />
        <Route path="/cpu" element={<Cpu />} />
        <Route path="/motherboards" element={<Motherboard />} />
        <Route path="/ram" element={<Ram />} />
        <Route path="/ssd" element={<SSD />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/orders" element={<Orders />} />

        <Route path="/admin" element={<AdminLoginPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/orders" element={<AdminOrdersPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/inventory" element={<AdminInventoryPage />} />
      </Routes>

      {!isAdminPage && <FloatingCart />}
      {!isAdminPage && <Footer />}
    </>
  );
}

function App() {
  return (
    <CartProvider>
      <Router>
        <AppContent />
      </Router>
    </CartProvider>
  );
}

export default App;
