import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import AboutIcon from '../assets/img/info.png';
import ShareIcon from '../assets/img/share.png';
import GuaranteeIcon from '../assets/img/guarantee.png';
import ContactsIcon from '../assets/img/contacts.png';
import DeliveryIcon from '../assets/img/delivery.png';
import LoginIcon from '../assets/img/login.png';
import ViberIcon from '../assets/img/viber.png';
import FacebookIcon from '../assets/img/facebook.png';
import GoogleIcon from '../assets/img/google.png';
import TelegramIcon from '../assets/img/telegram.png';
import BasketIcon from '../assets/img/basket.png';

function Header() {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setMenuOpen(false);
    navigate('/');
  };

  // Приклад кошика
  const cartItems = [
    { id: 1, name: 'Клавіатура', quantity: 1 },
    { id: 2, name: 'Миша', quantity: 2 },
  ];

  return (
    <header className="w-full">
      <div className="flex items-center justify-center px-4 py-1 text-sm font-bold text-black bg-white gap-x-6 sm:gap-x-10 md:gap-x-16">
        <div>ЗНИЖКИ 50% МАЙЖЕ НА ВСЮ ПЕРИФЕРІЮ</div>
        <div>ВСТИГНИ ЗІБРАТИ КОМП`ЮТЕР СВОЄЇ МРІЇ</div>
      </div>

      <div className="flex items-center justify-between h-20 px-4 text-white bg-black">
        <div className="flex flex-col items-center"> 
          <Link to="/" className="text-3xl font-light leading-none"> 
            ZYNK
          </Link>
          <Link to="/" className="text-sm font-bold leading-none"> 
            store.ua
          </Link>
        </div>

        <nav className="flex items-center gap-3 text-xs sm:gap-4 sm:text-sm font-bold md:gap-12">
          <Link to="/about" className="flex items-center gap-1.5 hover:text-gray-300 transition-colors">
            <img src={AboutIcon} alt="Про нас" className="w-7 h-7" /> Про нас
          </Link>
          <Link to="/share" className="flex items-center gap-1.5 hover:text-gray-300 transition-colors">
            <img src={ShareIcon} alt="Акції" className='w-6 h-6' /> Акції
          </Link>
          <Link to="/guarantee" className="flex items-center gap-1.5 hover:text-gray-300 transition-colors">
            <img src={GuaranteeIcon} alt="Гарантії" className='w-6 h-6' /> Гарантії
          </Link>
          <Link to="/contacts" className="flex items-center gap-1.5 hover:text-gray-300 transition-colors">
            <img src={ContactsIcon} alt="Контакти" className='w-7 h-7' /> Контакти
          </Link>
          <Link to="/delivery" className="flex items-center gap-1.5 hover:text-gray-300 transition-colors">
            <img src={DeliveryIcon} alt="Доставка та оплата" className='w-7 h-7' /> Доставка та оплата
          </Link>

          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-1.5 text-white focus:outline-none"
              >
                <img src={LoginIcon} alt="Користувач" className='w-7 h-7' />
                <span>{user.name}</span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded shadow-lg z-50">
                  <div className="p-2 border-b">
                    <strong>Кошик:</strong>
                    {cartItems.length ? (
                      <ul>
                        {cartItems.map(item => (
                          <li key={item.id}>{item.name} x{item.quantity}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>Порожньо</p>
                    )}
                  </div>
                  <Link
                    to="/orders"
                    className="block px-4 py-2 hover:bg-gray-200"
                    onClick={() => setMenuOpen(false)}
                  >
                    Замовлення
                  </Link>
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 hover:bg-gray-200"
                  >
                    Вийти
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="flex items-center gap-1.5 hover:text-gray-300 transition-colors">
              <img src={LoginIcon} alt="Вхід" className='w-7 h-7' /> Вхід
            </Link>
          )}

          <Link to="/basket" className="flex items-center gap-1.5 hover:text-gray-300 transition-colors">
            <img src={BasketIcon} alt="Кошик" className='w-6 h-6' /> 
          </Link>
        </nav>

        <div className="text-sm text-right">
          <div className="text-xs md:text-[11px] font-bold -mt-1">ПН-ПТ: 9:00-18:00 | СБ-НД: 10:00-17:00</div>
          <div className="flex items-center justify-center gap-2 mt-2 md:gap-3">
            <a href="#" aria-label="Viber" className="transition-opacity hover:opacity-75">
              <img src={ViberIcon} alt="Viber" className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </a>
            <a href="#" aria-label="Facebook" className="transition-opacity hover:opacity-75">
              <img src={FacebookIcon} alt="Facebook" className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </a>
            <a href="#" aria-label="Google" className="transition-opacity hover:opacity-75">
              <img src={GoogleIcon} alt="Google" className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </a>
            <a href="#" aria-label="Telegram" className="transition-opacity hover:opacity-75">
              <img src={TelegramIcon} alt="Telegram" className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
