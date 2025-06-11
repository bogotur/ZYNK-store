import React, { useState, useEffect } from 'react';

import slider from '../assets/img/slaider.png'

const slides = [
  {
    id: 1,
    image: {slider},
    specs: [
      'ПРОЦЕСОР: AMD Ryzen 9 7900X',
      'ВІДЕОКАРТА: NVIDIA GeForce RTX 4080 SUPER 16GB',
      'ОПЕРАТИВНА ПАМʼЯТЬ: 32GB DDR5 6000MHz',
      'SSD ДИСК: Fury Renegade 2TB Gen4 NVMe',
      'ВОДЯНЕ ОХОЛОДЖЕННЯ: Lian Li Galahad II 360 AIO',
      'БЛОК ЖИВЛЕННЯ: Corsair RM850x White [850W]',
      'КОРПУС: Lian Li 011 Dynamic EVO White',
    ],
    oldPrice: '89.999₴',
    newPrice: '55.000₴',
  },
  {
    id: 2,
    image: '/images/pc2.png',
    specs: [
      'ПРОЦЕСОР: Intel Core i9-13900K',
      'ВІДЕОКАРТА: NVIDIA GeForce RTX 4090',
      'ОПЕРАТИВНА ПАМʼЯТЬ: 64GB DDR5 7200MHz',
      'SSD ДИСК: Samsung 980 Pro 2TB',
      'ВОДЯНЕ ОХОЛОДЖЕННЯ: Corsair iCUE H150i',
      'БЛОК ЖИВЛЕННЯ: Seasonic Prime TX-1000',
      'КОРПУС: Lian Li PC-O11 Dynamic',
    ],
    oldPrice: '110.000₴',
    newPrice: '95.000₴',
  },
  // інші слайди
];

function Slider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-center">
      {/* Характеристики */}
      <div className="min-h-[280px]">
        <ul className="space-y-1 text-[10px] sm:text-[12px] md:text-sm font-medium">
          {slides[currentIndex].specs.map((line, idx) => (
            <li key={idx}>{line}</li>
          ))}
        </ul>
        <button className="bg-black text-white px-6 py-2 rounded-full text-sm font-semibold mt-4">
          Придбати
        </button>
      </div>

      {/* Фото + ціна */}
      <div className="flex flex-col items-center xl:items-end min-h-[360px]">
        <img
          src={slides[currentIndex].image}
          alt="Комп'ютер"
          className="w-[110%] max-w-[700px] object-contain"
        />
        <div className="text-right mt-4">
          <div className="text-xl md:text-2xl font-bold">
            <span className="line-through text-gray-500 mr-2">{slides[currentIndex].oldPrice}</span>
          </div>
          <div className="text-[32px] md:text-[48px] font-extrabold text-black">
            {slides[currentIndex].newPrice}
          </div>
        </div>
      </div>

      {/* Індикатори */}
      <div className="col-span-full flex justify-center mt-4 gap-2">
        {slides.map((_, idx) => (
          <span
            key={idx}
            className={`block w-10 h-1 rounded-full cursor-pointer transition-colors ${
              idx === currentIndex ? 'bg-black' : 'bg-gray-300'
            }`}
            onClick={() => setCurrentIndex(idx)}
          />
        ))}
      </div>
    </div>
  );
}

export default Slider;