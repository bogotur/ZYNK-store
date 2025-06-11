import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Header from './components/Header';
import Footer from './components/Footer';
import CartModal from './components/CartModal';
import CheckoutPage from './components/CheckoutPage';

import Home from './components/pages/Home';
import About from './components/pages/About';
import Contacts from './components/pages/Contacts';
import Share from './components/pages/Share';
import Guarantee from './components/pages/Guarantee';
import Delivery from './components/pages/Delivery';
import Videocards from './components/pages/Videocards';
import Cpu from './components/pages/Cpu';
import Motherboard from './components/pages/Motherboards';
import Ram from './components/pages/Ram';
import Login from './components/pages/Login';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/share" element={<Share />} />
        <Route path="/guarantee" element={<Guarantee />} />
        <Route path="/delivery" element={<Delivery />} />
        <Route path="/videocards" element={<Videocards />} />
        <Route path="/cpu" element={<Cpu />} />
        <Route path="/motherboards" element={<Motherboard />} />
        <Route path="/ram" element={<Ram />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/CartModal" element={<CartModal />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
