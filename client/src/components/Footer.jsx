import React from "react";

import Privatbank from '../assets/img/privatbank.png';
import Mastercard from '../assets/img/mastercard.png';
import Visa from '../assets/img/visa.png';
import Locate from '../assets/img/locate.png';
import Call from '../assets/img/call.png';

function Footer() {
  return (
    <footer className="bg-black text-white py-10 px-4 text-sm">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10 text-sm text-left">
          <div>
            <h2 className="text-2xl font-bold">ZYNK</h2>
          </div>

          <div>
            <h3 className="text-white font-bold text-lg mb-2 uppercase">ШОУРУМ В КИЄВІ</h3>
            <div className="flex items-center mb-1">
              <img src={Locate} alt="Location" className="h-5 w-5 mr-2" />
              <p className="text-white font-semibold text-sm">
                вул. Саксаганського, 112
              </p>
            </div>
            <p className="text-white font-bold text-sm">
              ПРАЦЮЄМО З 8:00 до 21:00
            </p>
          </div>

          <div>
            <h3 className="text-white font-bold text-lg mb-2 uppercase">ШОУРУМ В ЖИТОМИРІ</h3>
            <div className="flex items-center mb-1">
              <img src={Locate} alt="Location" className="h-5 w-5 mr-2" />
              <p className="text-white font-semibold text-sm">
                вул. Велика Бердичівська, 68
              </p>
            </div>
            <p className="text-white font-bold text-sm">
              ПРАЦЮЄМО З 8:00 до 21:00
            </p>
          </div>

          <div>
            <h3 className="text-white font-bold text-lg mb-2 uppercase">ШОУРУМ В ДНІПРІ</h3>
            <div className="flex items-center mb-1">
              <img src={Locate} alt="Location" className="h-5 w-5 mr-2" />
              <p className="text-white font-semibold text-sm">
                вул. Короленка, 18
              </p>
            </div>
            <p className="text-white font-bold text-sm">
              ПРАЦЮЄМО З 8:00 до 21:00
            </p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-4 border-t border-gray-700 pt-6 text-xs text-center">
          <span>ПОЛІТИКА ПОВЕРНЕННЯ</span>
          <span>ЗВОРОТНІЙ ЗВʼЯЗОК</span>
          <span>УМОВИ ГАРАНТІЇ</span>
          <span>УМОВИ ОПЛАТИ</span>
          <span>УМОВИ ДОСТАВКИ</span>
          <span>ДОГОВІР ПУБЛІЧНОЇ ОФЕРТИ</span>
          <span>ЧАСТІ ЗАПИТАННЯ</span>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center mt-8 gap-4">
          <div className="flex items-center gap-2">
            <img src={Call} alt="Phone" className="h-5 w-5 invert" />
            <span className="text-white font-bold text-lg">
              +380973345742
            </span>
          </div>

          <div className="text-center text-xs leading-tight">
            © 2020–2025 <span className="font-bold">ZYNK™</span> | Твоя техніка. Твій стиль. Усі права захищені.
            <br />
          </div>

          <div className="flex items-center gap-4">
            <img src={Privatbank} alt="PrivatBank" className="h-10" />
            <img src={Mastercard} alt="Mastercard" className="h-10" />
            <img src={Visa} alt="Visa" className="h-10" />
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
