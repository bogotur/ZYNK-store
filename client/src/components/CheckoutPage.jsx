import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { item, quantity, totalPrice } = location.state || {}; // Отримуємо дані з CartModal

  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    deliveryAddress: '',
    paymentMethod: 'card', // Дефолтний спосіб оплати
  });

  const [orderStatus, setOrderStatus] = useState('');
  const [loading, setLoading] = useState(false);

  // Перевірка, чи є дані про товар. Якщо ні, перенаправляємо на головну
  useEffect(() => {
    if (!item) {
      navigate('/');
    }
  }, [item, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setOrderStatus('');

    if (!item || !item.id || !item.name || !item.price) {
      setOrderStatus('Помилка: Немає інформації про товар.');
      setLoading(false);
      return;
    }

    // --- ПОЧАТОК ЗМІН ---

    // 1. Отримуємо JWT токен з localStorage
    const token = localStorage.getItem('token');

    // 2. Якщо токена немає, повідомляємо користувача або перенаправляємо на логін
    if (!token) {
      setOrderStatus('Помилка: Ви не авторизовані. Будь ласка, увійдіть в акаунт.');
      setLoading(false);
      // Опціонально: перенаправити на сторінку логіну
      // navigate('/login');
      return;
    }

    // 3. Формуємо заголовки запиту, включаючи токен
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` // Додаємо токен у заголовок Authorization
    };

    // --- КІНЕЦЬ ЗМІН ---

    try {
      const orderData = {
        product_id: item.id,
        product_name: item.name,
        product_price: item.price,
        product_type: item.type,
        quantity: quantity,
        total_amount: totalPrice,
        customer_name: formData.customerName,
        customer_email: formData.customerEmail,
        customer_phone: formData.customerPhone,
        delivery_address: formData.deliveryAddress,
        payment_method: formData.paymentMethod,
      };

      const response = await axios.post('http://localhost:8108/place_order', orderData, { headers }); // Передаємо сформовані заголовки

      if (response.status === 201) {
        setOrderStatus('Замовлення успішно оформлено! Дякуємо за покупку.');
        setFormData({ // Очищаємо форму
          customerName: '',
          customerEmail: '',
          customerPhone: '',
          deliveryAddress: '',
          paymentMethod: 'card',
        });
        // Опціонально: перенаправити на сторінку підтвердження замовлення або головну
        // setTimeout(() => navigate('/order-confirmation'), 3000);
      } else {
        setOrderStatus(`Помилка оформлення: ${response.data.message || 'Невідома помилка'}`);
      }
    } catch (error) {
      console.error('Помилка при оформленні замовлення:', error);
      if (error.response && error.response.data && error.response.data.message) {
        setOrderStatus(`Помилка: ${error.response.data.message}`);
      } else {
        setOrderStatus('Помилка сервера при оформленні замовлення. Перевірте консоль.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!item) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg">Замовлення не знайдено. Будь ласка, оберіть товар знову.</p>
      </div>
    );
  }

  const formatPrice = (price) => {
    if (price === undefined || price === null) return '0';
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Оформлення замовлення</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-bold mb-4">Деталі замовлення</h2>
        <div className="flex items-center mb-4 border-b pb-4">
          {item.image_url && (
            <img
              src={`http://localhost:8108/images${item.image_url}`}
              alt={item.name}
              className="w-24 h-24 object-contain mr-4 rounded-md"
              onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/96x96/E0E0E0/333333?text=No+Image'; }}
            />
          )}
          <div>
            <p className="text-lg font-semibold">{item.name}</p>
            <p className="text-gray-600">Ціна за одиницю: {formatPrice(item.price)} ₴</p>
            <p className="text-gray-600">Кількість: {quantity}</p>
            <p className="text-xl font-bold mt-2">Загальна сума: {formatPrice(totalPrice)} ₴</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Ваші дані</h2>

        <div className="mb-4">
          <label htmlFor="customerName" className="block text-gray-700 text-sm font-bold mb-2">
            Ваше ім'я:
          </label>
          <input
            type="text"
            id="customerName"
            name="customerName"
            value={formData.customerName}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="customerEmail" className="block text-gray-700 text-sm font-bold mb-2">
            Email:
          </label>
          <input
            type="email"
            id="customerEmail"
            name="customerEmail"
            value={formData.customerEmail}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="customerPhone" className="block text-gray-700 text-sm font-bold mb-2">
            Телефон:
          </label>
          <input
            type="tel"
            id="customerPhone"
            name="customerPhone"
            value={formData.customerPhone}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        <div className="mb-6">
          <label htmlFor="deliveryAddress" className="block text-gray-700 text-sm font-bold mb-2">
            Адреса доставки:
          </label>
          <textarea
            id="deliveryAddress"
            name="deliveryAddress"
            value={formData.deliveryAddress}
            onChange={handleInputChange}
            rows="3"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          ></textarea>
        </div>

        <h2 className="text-xl font-bold mb-4">Спосіб оплати</h2>
        <div className="mb-6">
          <label className="inline-flex items-center mr-6">
            <input
              type="radio"
              name="paymentMethod"
              value="card"
              checked={formData.paymentMethod === 'card'}
              onChange={handleInputChange}
              className="form-radio h-4 w-4 text-green-600"
            />
            <span className="ml-2 text-gray-700">Оплата карткою</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="paymentMethod"
              value="cash_on_delivery"
              checked={formData.paymentMethod === 'cash_on_delivery'}
              onChange={handleInputChange}
              className="form-radio h-4 w-4 text-green-600"
            />
            <span className="ml-2 text-gray-700">Готівкою при отриманні</span>
          </label>
        </div>

        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline w-full disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Оформлення...' : `Підтвердити замовлення (${formatPrice(totalPrice)} ₴)`}
        </button>

        {orderStatus && (
          <p className={`mt-4 text-center ${orderStatus.includes('Помилка') ? 'text-red-500' : 'text-green-600'}`}>
            {orderStatus}
          </p>
        )}
      </form>
    </div>
  );
};

export default CheckoutPage;