import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';

import PCslaider from '../../assets/img/slaider.png';
import slaider2 from '../../assets/img/slaider2.webp';
import slaider3 from '../../assets/img/slaider3.webp';

import Gpu from '../../assets/img/Gpu.png';
import Cpu from '../../assets/img/Cpu.png';
import Bloody from '../../assets/img/bloody.png';
import Hator from '../../assets/img/hator.png';
import HyperX from '../../assets/img/hyperX.png';
import Logitech from '../../assets/img/logitech.png';
import Razer from '../../assets/img/razer.png';
import SteelSeries from '../../assets/img/steelseries.png';
import Premium from '../../assets/img/premium.png';
import Money from '../../assets/img/money.png';
import Detect from '../../assets/img/detect.png';
import Poshta from '../../assets/img/poshta.png';
import Motherboard from '../../assets/img/Motherboard.png';
import Ram from '../../assets/img/Ram.png';
import Ssd from '../../assets/img/Ssd.png';
import Psu from '../../assets/img/Psu.png';
import Cooling from '../../assets/img/Cooling.png';
import Case from '../../assets/img/Case.png';
import Keyboard from '../../assets/img/Keyboard.png';
import Mouse from '../../assets/img/Mouse.png';
import Headphones from '../../assets/img/Headphones.png';
import Controller from '../../assets/img/Controller.png';

import Modern from '../../assets/img/modern.png';
import Official from '../../assets/img/official.png';
import Connection from '../../assets/img/connection.png';
import Consultation from '../../assets/img/consultation.png';
import Checked from '../../assets/img/checked.png';
import Gamer from '../../assets/img/gamer.png';
import Carriage from '../../assets/img/carriage.png';
import Price from '../../assets/img/price.png';
import Upgrade from '../../assets/img/upgrade.png';

import Women from '../../assets/img/women.png';
import Men from '../../assets/img/men.png';


const pcSlides = [
  {
    img: PCslaider,
    priceOld: '89.999₴',
    priceNew: '55.000₴',
    specs: [
      'AMD Ryzen 9 7900X',
      'NVIDIA GeForce RTX 4080 SUPER 16GB',
      '32GB DDR5 6000MHz',
      'Fury Renegade 2TB Gen4 NVMe',
      'Lian Li Galahad II 360 AIO',
      'Corsair RM850x White [850W]',
      'Lian Li 011 Dynamic EVO White',
    ],
  },
  {
    img: slaider2,
    priceOld: '79.999₴',
    priceNew: '52.000₴',
    specs: [
      'Intel Core i9-14900KF',
      'NVIDIA GeForce RTX 4070 Ti 12GB',
      '32GB DDR5 6400MHz',
      'Samsung 980 PRO 1TB Gen4 NVMe',
      'NZXT Kraken X73 RGB',
      'Be Quiet! Straight Power 850W',
      'NZXT H9 Flow RGB',
    ],
  },
  {
    img: slaider3,
    priceOld: '65.999₴',
    priceNew: '48.000₴',
    specs: [
      'AMD Ryzen 7 7800X3D',
      'Radeon RX 7900 XTX 24GB',
      '32GB DDR5 6000MHz',
      'Crucial P5 Plus 2TB NVMe',
      'Deepcool LS720 WH',
      'Seasonic Focus 850W',
      'Fractal Design Meshify 2 White',
    ],
  },
];

function Home() {
  const [activeIndex, setActiveIndex] = useState(0);
  const benefits = [
    {icon: Modern, label: 'Сучасний асортимент' },
    {icon: Official, label: 'Офіційна гарантія' },
    {icon: Connection, label: 'Завжди на зв`язку' },
    {icon: Consultation, label: 'Консультація від експертів' },
    {icon: Checked, label: 'Перевірена техніка' },
    {icon: Gamer, label: 'Для геймерів і не тільки' },
    {icon: Carriage, label: 'Безкоштовна доставка' },
    {icon: Price, label: 'Справедливі ціни' },
    {icon: Upgrade, label: 'Можливість апгрейду' },
  ]

  const reviews = [
    {
      icon: Men, 
      name: 'Олександр Іваненко',
      text: '«Брав у ZYNK монітор і клавіатуру — все супер. Оперативно відповіли, швидко доставили. Якість на рівні, рекомендую всім знайомим!»',
    },
    {
      icon: Women,
      name: 'Олена Ковальчук',
      text: '«Магазин справді топовий! Купувала ПК для роботи — менеджер допоміг вибрати і пояснив все по характеристикам. Дуже задоволена»'
    },
     {
      icon: Men,
      name: 'Андрій Ковтун',
      text: '«Купив комплектуючі для апгрейду ПК. Все працює, доставка трохи затрималась, але підтримка швидко вирішила питання. Все ок.»',
    },
    {
      icon: Women,
      name: 'Анна Сидоренко',
      text: '«Хороший магазин. Купила відеокарту, все працює. Було б ідеально, якби була можливість оплатити при отриманні — довелося платити наперед.»',
    },
    {
      icon: Men,
      name: 'Максим Руденко',
      text: '«Перший раз замовляв тут — і точно не останній. Купив SSD, отримав ще й знижку. Дуже приємно. Рекомендую всім друзям!»',
    },
    {
      icon: Women,
      name: 'Катерина Черненко',
      text: '«Окрема подяка менеджеру Володимиру — все пояснив, допоміг підібрати монітор для роботи з графікою. Дуже професійно!»',
    }
  ]

  return (
    <div className="bg-white w-full overflow-hidden">
      <Swiper
        modules={[Autoplay]}
        spaceBetween={30}
        slidesPerView={1}
        autoplay={{ delay: 5000 }}
        loop
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        className="mb-10"
      >
        {pcSlides.map((pc, idx) => (
          <SwiperSlide key={idx}>
            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 px-4 md:px-10 py-10 items-center">
              <div className="col-span-1 justify-center text-center xl:text-left -mt-15">
                <h1 className="font-montserrat font-black text-[clamp(2.5rem,8vw,100px)] leading-[1.4] uppercase whitespace-pre-line scale-y-110">
                  Встигни{'\n'}придбати{'\n'}новинку
                </h1>
              </div>

              <div className="col-span-1 xl:ml-47 mt-[-150px] md:mt-[-320px]">
                <ul className="space-y-1 text-[9px] sm:text-[10px] md:text-[11px] font-normal">
                  {pc.specs.map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              </div>

              <div className="col-span-1 flex flex-col items-center xl:items-end">
                <img
                  src={pc.img}
                  alt={`PC-${idx}`}
                  className="w-full max-w-[500px] object-contain"
                />
                <div className="text-right mt-4">
                  <div className="text-xl md:text-5xl font-bold">
                    <span className="line-through text-[35px] md:text-[38px] mr-5 font-black text-black relative top-5">
                      {pc.priceOld}
                    </span>
                  </div>
                  <span className="text-[32px] md:text-[80px] mr-5 font-black text-black">
                    {pc.priceNew}
                  </span>
                </div>
              </div>
            </section>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="flex justify-center items-center space-x-4 -mt-6 mb-3">
        {pcSlides.map((_, idx) => (
          <div
            key={idx}
            className={`h-[2px] w-12 rounded-full transition-all duration-300 ${
              idx === activeIndex ? 'bg-black opacity-100' : 'bg-gray-400 opacity-50'
            }`}
          />
        ))}
      </div>

      <section className="bg-black py-2">
        <div className="flex justify-center items-center gap-22 md:gap-28 flex-wrap px-4 md:px-10">
          {[Bloody, Hator, HyperX, Logitech, Razer, SteelSeries].map((brand, idx) => (
            <img
              key={idx}
              src={brand}
              alt={`brand-${idx}`}
              className="h-16 md:h-20 lg:h-24 w-[180px] md:w-[200px] object-contain"
              style={{ width: '100px' }}
            />
          ))}
        </div>
      </section>

      <section className="py-20 px-4 md:px-20 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        <div className="flex flex-col items-center">
          <img src={Premium} alt="Преміум-якість" className="h-22 mb-2" />
          <span className="font-black text-sm md:text-xl">Преміум-якість</span>
        </div>
        <div className="flex flex-col items-center">
          <img src={Money} alt="Розумна ціна" className="h-22 mb-2" />
          <span className="font-black text-sm md:text-xl">Розумна ціна</span>
        </div>
        <div className="flex flex-col items-center">
          <img src={Detect} alt="Техніка, що перевірена" className="h-22 mb-2" />
          <span className="font-black text-sm md:text-xl">Техніка, що перевірена</span>
        </div>
        <div className="flex flex-col items-center">
          <img src={Poshta} alt="Безкоштовна доставка" className="h-22 mb-2" />
          <span className="font-black text-sm md:text-xl">Безкоштовна доставка</span>
        </div>
      </section>

      <div className="bg-black text-white text-center py-4 text-lg md:text-2xl font-medium tracking-wide">
        ОБИРАЙ ТЕХНІКУ ДО СВОГО СМАКУ
      </div>

     <section className="py-10 px-4 md:px-20 bg-white">
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
    {[
      { label: 'Материнська плата', icon: Motherboard, link: '/motherboards' },
      { label: 'Відеокарта', icon: Gpu, link: '/videocards' },
      { label: 'Процесори', icon: Cpu, link: '/cpu' },
      { label: 'Оперативна памʼять', icon: Ram, link: '/ram' },
      { label: 'SSD диски', icon: Ssd, link: '/ssd' },
      { label: 'Блоки живлення', icon: Psu, link: '/psu' },
      { label: 'Системи охолодження', icon: Cooling, link: '/cooling' },
      { label: 'Корпуси', icon: Case, link: '/cases' },
      { label: 'Клавіатури', icon: Keyboard, link: '/keyboards' },
      { label: 'Мишки', icon: Mouse, link: '/mice' },
      { label: 'Навушники', icon: Headphones, link: '/headphones' },
      { label: 'Контролери', icon: Controller, link: '/controllers' },
    ].map((item, idx) => (
      <Link
        key={idx}
        to={item.link}
        className="border border-black rounded-[20px] bg-white text-center p-4 flex flex-col justify-start items-center h-[300px] hover:shadow-lg transition-shadow"
      >
        <p className="font-black text-[14px] sm:text-[22px] leading-tight mb-2">
          {item.label}
        </p>
        <div className="flex-1 flex items-center justify-center w-full">
          <img
            src={item.icon}
            alt={item.label}
            className="h-[180px] object-contain"
          />
        </div>
      </Link>
    ))}
  </div>
</section>
      
          <section className='bg-black text-white py-20 px-4'>
  <div className='max-w-7xl mx-auto px-4 md:px-20'>
    <h2 className='text-center text-2xl md:text-4xl font-black mb-10'>ЧОМУ САМЕ МИ?</h2>
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
      {benefits.map((benefit, idx) => (
        <div
          key={idx}
          className='flex items-center space-x-4 bg-[#0f0f0f] rounded-xl p-6'
        >
          <img
            src={benefit.icon}
            alt={benefit.label}
            className='h-12 md:h-16 object-contain'
          />
          <p className='text-base md:text-lg font-medium'>{benefit.label}</p>
        </div>
      ))}
    </div>
  </div>
</section>
<section className="bg-white text-black py-20 px-4">
  <div className="max-w-7xl mx-auto px-4 md:px-20">
    <h2 className="text-2xl md:text-4xl font-black mb-12">ВІДГУКИ</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {reviews.map((review, idx) => (
        <div
          key={idx}
          className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md transform transition duration-300 hover:scale-105"
        >
          <div className="flex flex-col items-center text-center mb-4">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-black flex items-center justify-center mb-2">
              <img
                src={review.icon}
                alt={review.name}
                className="h-10 w-10 md:h-12 md:w-12 object-contain"
              />
            </div>
            <p className="text-base md:text-lg font-semibold">{review.name}</p>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">{review.text}</p>
          <div className="flex justify-center mt-4">
            {Array(5).fill(0).map((_, i) => (
              <svg
                key={i}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5 text-gray-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.48 3.499a.7.7 0 011.04 0l2.47 5.006 5.517.801a.7.7 0 01.387 1.194l-3.994 3.893.943 5.501a.7.7 0 01-1.017.738L12 18.347l-4.936 2.595a.7.7 0 01-1.017-.738l.943-5.501-3.994-3.893a.7.7 0 01.387-1.194l5.517-.801 2.47-5.006z"
                />
              </svg>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
</section>
    </div>
  );
}

export default Home;
