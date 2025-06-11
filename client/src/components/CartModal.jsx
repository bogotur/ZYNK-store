import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Додайте цей імпорт

const CartModal = ({ item, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);

  const navigate = useNavigate(); // Ініціалізуйте useNavigate

  useEffect(() => {
    if (item && item.price !== undefined) {
      setTotalPrice(item.price * quantity);
    }
  }, [quantity, item]);

  if (!item) {
    console.warn("CartModal: item is null or undefined, not rendering modal.");
    return null;
  }

  const handleQuantityChange = (amount) => {
    setQuantity(prevQuantity => Math.max(1, prevQuantity + amount));
  };

  const formatPrice = (price) => {
    if (price === undefined || price === null) return '0';
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  let productName = '';
  let productDetails = '';
  let imageUrlAlt = "Зображення товару";

  const isCpu = item.brand_cpu_name !== undefined;
  const isVideocard = item.brand_name !== undefined;
  const isMotherboard = item.brand_mb_name !== undefined; // Додано для материнських плат
  const isRam = item.brand_ram_name !== undefined; // Додано для RAM

  if (isCpu) {
    productName = `${item.brand_cpu_name || ''} ${item.name || ''}`.trim();
    imageUrlAlt = `${item.brand_cpu_name || ''} ${item.name || ''}`;
  } else if (isVideocard) {
    productName = `${item.brand_name || ''} ${item.model_name || ''}`.trim();
    imageUrlAlt = `${item.brand_name || ''} ${item.model_name || ''}`;
    let detailsParts = [];
    if (item.memory_gb) detailsParts.push(`${item.memory_gb}Gb`);
    if (item.game_rock_series) detailsParts.push(item.game_rock_series);

    let modelSpecs = [];
    if (item.model_code) modelSpecs.push(item.model_code);
    if (item.memory_bus_width) modelSpecs.push(`${item.memory_bus_width} bit`);
    if (item.interface_type) modelSpecs.push(item.interface_type);

    if (modelSpecs.length > 0) {
      detailsParts.push(`(${modelSpecs.join(', ')})`);
    }
    productDetails = detailsParts.join(' ');
  } else if (isMotherboard) { // Логіка для материнських плат
      productName = `${item.brand_mb_name || ''} ${item.model_mb_name || item.name || ''}`.trim();
      imageUrlAlt = `${item.brand_mb_name || ''} ${item.model_mb_name || item.name || ''}`;
      let detailsParts = [];
      if (item.socket_mb_name) detailsParts.push(`Сокет: ${item.socket_mb_name}`);
      if (item.form_factor_mb_name) detailsParts.push(`Форм-фактор: ${item.form_factor_mb_name}`);
      if (item.memory_type_mb_name) detailsParts.push(`Тип пам'яті: ${item.memory_type_mb_name}`);
      productDetails = detailsParts.join(', ');
  } else if (isRam) { // Логіка для RAM
      productName = `${item.brand_ram_name || ''} ${item.name || ''}`.trim();
      imageUrlAlt = `${item.brand_ram_name || ''} ${item.name || ''}`;
      let detailsParts = [];
      if (item.memory_size_ram_value) detailsParts.push(`${item.memory_size_ram_value}`);
      if (item.memory_type_ram_name) detailsParts.push(`${item.memory_type_ram_name}`);
      if (item.frequency_ram_value) detailsParts.push(`${item.frequency_ram_value}`);
      productDetails = detailsParts.join(', ');
  }
  else {
    productName = item.name || item.id || 'Невідомий товар';
  }

  // Нова функція для переходу на сторінку замовлення
  const handleCheckoutClick = () => {
    onClose(); // Закриваємо модальне вікно кошика
    navigate('/checkout', {
      state: {
        item: { // Передаємо лише необхідні дані про товар, щоб уникнути надмірної кількості даних у URL
          id: item.id,
          name: productName,
          price: item.price,
          image_url: item.image_url,
          // Додаємо тип товару, щоб бекенд міг відрізнити
          type: isCpu ? 'cpu' : (isVideocard ? 'videocard' : (isMotherboard ? 'motherboard' : (isRam ? 'ram' : 'unknown'))),
        },
        quantity: quantity,
        totalPrice: totalPrice
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.6)] flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl min-h-[400px] mx-4 relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Кошик</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl font-bold">&times;</button>
        </div>

        <div className="flex items-center border-b pb-4 mb-4">
          {item.image_url && (
            <img
              src={`http://localhost:8108/images${item.image_url}`}
              alt={imageUrlAlt}
              className="w-20 h-20 object-contain mr-4 flex-shrink-0 rounded-md"
              onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/80x80/E0E0E0/333333?text=No+Image'; }}
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-base leading-tight">
              {productName} {productDetails}
            </p>
            {item.product_code && <p className="text-sm text-gray-500 mt-1">Код: {item.product_code}</p>}

            <div className="flex items-center mt-3">
              <button
                onClick={() => handleQuantityChange(-1)}
                className="border border-gray-300 px-3 py-1 rounded-l text-sm font-bold hover:bg-gray-100 transition-colors"
              >
                -
              </button>
              <span className="border-t border-b border-gray-300 px-4 py-1 text-sm font-semibold">{quantity}</span>
              <button
                onClick={() => handleQuantityChange(1)}
                className="border border-gray-300 px-3 py-1 rounded-r text-sm font-bold hover:bg-gray-100 transition-colors"
              >
                +
              </button>
            </div>
          </div>

          <div className="text-right ml-4 flex-shrink-0">
            {item.old_price && (
              <p className="text-gray-400 line-through text-sm whitespace-nowrap">{formatPrice(item.old_price)} ₴</p>
            )}
            <p className="text-lg font-bold text-red-600 whitespace-nowrap">{formatPrice(item.price)} ₴</p>
            <button className="text-gray-400 hover:text-red-600 text-lg mt-1 block ml-auto transition-colors">🗑️</button>
          </div>
        </div>

        <div className="flex justify-between items-center text-xl font-bold mb-6">
          <span>Разом</span>
          <span>{formatPrice(totalPrice)} ₴</span>
        </div>

        <div className="flex justify-between space-x-4">
          <button
            onClick={onClose}
            className="flex-1 border border-green-600 text-green-600 px-4 py-3 rounded-lg hover:bg-green-50 transition-colors"
          >
            Продовжити покупки
          </button>
          <button
            onClick={handleCheckoutClick} // Змінено onClick на нову функцію
            className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Зробити замовлення
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartModal;