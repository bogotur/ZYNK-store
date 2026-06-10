import React, { useMemo, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from './CartContext';

const API_BASE = import.meta.env.VITE_API_URL;

const getStockQuantity = (item) => {
  const stock = Number(
    item?.stock_quantity ??
      item?.quantity_in_stock ??
      item?.stock ??
      item?.available_quantity ??
      0
  );

  return Number.isFinite(stock) ? Math.max(0, stock) : 0;
};


const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { cartItems, cartTotal, clearCart } = useCart();

  const legacyState = location.state || {};
  const legacyItem = legacyState.item;
  const legacyQuantity = legacyState.quantity;
  const legacyTotalPrice = legacyState.totalPrice;

  const orderItems = useMemo(() => {
    if (cartItems && cartItems.length > 0) {
      return cartItems.map((cartItem) => {
        const productName =
          cartItem.name ||
          `${cartItem.brand_name || ''} ${cartItem.model_name || ''}`.trim();

        return {
          ...cartItem,
          name: productName,
          quantity: Number(cartItem.quantity || 1),
          totalPrice: Number(cartItem.price || 0) * Number(cartItem.quantity || 1),
        };
      });
    }

    if (
      legacyItem &&
      legacyItem.id !== undefined &&
      legacyItem.price !== undefined &&
      legacyQuantity !== undefined &&
      legacyTotalPrice !== undefined
    ) {
      return [
        {
          ...legacyItem,
          name:
            legacyItem.name ||
            `${legacyItem.brand_name || ''} ${legacyItem.model_name || ''}`.trim(),
          quantity: Number(legacyQuantity),
          totalPrice: Number(legacyTotalPrice),
        },
      ];
    }

    return [];
  }, [cartItems, legacyItem, legacyQuantity, legacyTotalPrice]);

  const totalPrice = useMemo(() => {
    if (cartItems && cartItems.length > 0) {
      return Number(cartTotal || 0);
    }

    return Number(legacyTotalPrice || 0);
  }, [cartItems, cartTotal, legacyTotalPrice]);

  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    deliveryAddress: '',
    paymentMethod: 'cash_on_delivery',
  });

  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiry: '',
    cvv: '',
  });

  const [focusedField, setFocusedField] = useState('');
  const [orderStatus, setOrderStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentStage, setPaymentStage] = useState('idle');
  const [orderCompleted, setOrderCompleted] = useState(false);

  const getToken = () => localStorage.getItem('token');

  useEffect(() => {
    const token = getToken();

    if (!token) {
      setOrderStatus('Щоб оформити замовлення, потрібно увійти в акаунт.');
      setTimeout(() => navigate('/login'), 1500);
      return;
    }

    if (orderItems.length === 0 && !orderCompleted && paymentStage !== 'success') {
      setOrderStatus(
        'Кошик порожній або дані замовлення не знайдено. Будь ласка, оберіть товар ще раз.'
      );
      setTimeout(() => navigate('/'), 2000);
    }
  }, [orderItems.length, navigate, orderCompleted, paymentStage]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const formatCardNumber = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  };

  const formatExpiry = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  };

  const handleCardChange = (e) => {
    const { name, value } = e.target;

    setCardData((prev) => {
      if (name === 'cardNumber') {
        return { ...prev, cardNumber: formatCardNumber(value) };
      }
      if (name === 'expiry') {
        return { ...prev, expiry: formatExpiry(value) };
      }
      if (name === 'cvv') {
        return { ...prev, cvv: value.replace(/\D/g, '').slice(0, 3) };
      }
      if (name === 'cardHolder') {
        return { ...prev, cardHolder: value.toUpperCase().slice(0, 26) };
      }
      return { ...prev, [name]: value };
    });
  };

  const formatPrice = (price) => {
    if (price === undefined || price === null) return '0';
    return Number(price).toLocaleString('uk-UA');
  };

  const getImageSrc = (item) => {
    return item?.image_url
      ? `${API_BASE}/images/${encodeURIComponent(String(item.image_url).replace(/^\/+/, ''))}`
      : null;
  };

  const getProductType = (item) => {
    return item?.product_type || item?.type || 'unknown';
  };

  const getDetailItems = (item) => {
    const isVideocard =
      item?.type === 'videocard' || item?.product_type === 'videocard';

    if (!isVideocard) {
      return [
        { label: 'Виробник', value: item?.vendor_name },
        { label: 'Категорія', value: item?.product_type },
      ].filter((detail) => detail.value);
    }

    return [
      { label: 'Виробник', value: item?.vendor_name },
      {
        label: "Пам'ять",
        value: item?.memory_capacity
          ? `${item.memory_capacity} ${item?.memory_type || ''}`.trim()
          : null,
      },
      { label: 'Інтерфейс', value: item?.interface_type },
      {
        label: 'Частота',
        value: item?.core_clock_ghz ? `${item.core_clock_ghz} ГГц` : null,
      },
    ].filter((detail) => detail.value);
  };

  const validateCardFields = () => {
    if (formData.paymentMethod !== 'card') return '';
    const digits = cardData.cardNumber.replace(/\s/g, '');
    if (digits.length !== 16) return 'Введіть коректний номер картки';
    if (!cardData.cardHolder.trim() || cardData.cardHolder.trim().length < 3) {
      return 'Введіть ім’я власника картки';
    }
    if (!/^\d{2}\/\d{2}$/.test(cardData.expiry)) {
      return 'Введіть термін дії у форматі MM/YY';
    }
    const [month] = cardData.expiry.split('/');
    const monthNum = Number(month);
    if (monthNum < 1 || monthNum > 12) {
      return 'Некоректний місяць дії картки';
    }
    if (!/^\d{3}$/.test(cardData.cvv)) {
      return 'Введіть коректний CVV код';
    }
    return '';
  };

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setOrderStatus('');

    const token = getToken();
    if (!token) {
      setOrderStatus('Щоб оформити замовлення, потрібно увійти в акаунт.');
      setLoading(false);
      setTimeout(() => navigate('/login'), 1200);
      return;
    }

    if (orderItems.length === 0 && !orderCompleted && paymentStage !== 'success') {
      setOrderStatus('Кошик порожній.');
      setLoading(false);
      return;
    }

    const stockErrorItem = orderItems.find((orderItem) => {
      const stockQuantity = getStockQuantity(orderItem);
      return stockQuantity > 0 && Number(orderItem.quantity || 1) > stockQuantity;
    });

    if (stockErrorItem) {
      setOrderStatus(
        `❌ Недостатньо товару на складі

${stockErrorItem.name}

Доступно лише: ${getStockQuantity(stockErrorItem)} шт.

Будь ласка, зменште кількість товару та повторіть замовлення.`
      );
      setLoading(false);
      return;
    }

    const outOfStockItem = orderItems.find((orderItem) => getStockQuantity(orderItem) <= 0);

    if (outOfStockItem) {
      setOrderStatus(
        `❌ Товар тимчасово відсутній

${outOfStockItem.name}

На жаль, цього товару більше немає на складі.
Можливо його вже придбав інший покупець.`
      );
      setLoading(false);
      return;
    }

    const cardError = validateCardFields();
    if (cardError) {
      setOrderStatus(`Помилка: ${cardError}`);
      setLoading(false);
      return;
    }

    if (formData.paymentMethod === 'card') {
      setPaymentStage('processing');
      await wait(2200);
    }

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    try {
      const response = await axios.post(
        `${API_BASE}/place_order_multi`,
        {
          items: orderItems.map((orderItem) => ({
            product_id: orderItem.id,
            product_name: orderItem.name,
            product_type: getProductType(orderItem),
            product_price: orderItem.price,
            quantity: orderItem.quantity,
            total_amount: orderItem.totalPrice,
            stock_quantity: getStockQuantity(orderItem),
          })),
          total_amount: totalPrice,
          customer_name: formData.customerName,
          customer_email: formData.customerEmail,
          customer_phone: formData.customerPhone,
          delivery_address: formData.deliveryAddress,
          payment_method: formData.paymentMethod,
          ...(formData.paymentMethod === 'card'
            ? {
                card_last4: cardData.cardNumber.replace(/\s/g, '').slice(-4),
                card_holder: cardData.cardHolder.trim(),
              }
            : {}),
        },
        { headers }
      );

      if (response.status !== 201) {
        throw new Error(response.data?.message || 'Помилка оформлення');
      }

      setOrderCompleted(true);
      setPaymentStage('success');
      setOrderStatus('Замовлення успішно оформлено! Дякуємо за покупку.');
      clearCart();

      setFormData({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        deliveryAddress: '',
        paymentMethod: 'cash_on_delivery',
      });

      setCardData({
        cardNumber: '',
        cardHolder: '',
        expiry: '',
        cvv: '',
      });

      setTimeout(() => navigate('/'), 2600);
    } catch (error) {
      setPaymentStage('idle');
      if (error.response && error.response.status === 401) {
        setOrderStatus('Сесія закінчилась. Увійдіть в акаунт ще раз.');
        setTimeout(() => navigate('/login'), 1500);
      } else if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setOrderStatus(error.response.data.message);
      } else {
        setOrderStatus('Помилка сервера при оформленні замовлення.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (orderItems.length === 0 && !orderCompleted && paymentStage !== 'success') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f5f5] px-4">
        <div className="w-full max-w-xl rounded-[28px] border border-black/10 bg-white p-8 text-center shadow-[0_18px_50px_rgba(0,0,0,0.08)]">
          <p className="text-lg font-semibold text-red-600">
            {orderStatus || 'Завантаження даних замовлення...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {(paymentStage === 'processing' || paymentStage === 'success') && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(0,0,0,0.72)] p-4 backdrop-blur-[4px]">
          <div className="w-full max-w-md rounded-[30px] border border-white/10 bg-white px-8 py-10 text-center shadow-[0_25px_80px_rgba(0,0,0,0.3)]">
            {paymentStage === 'processing' ? (
              <>
                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-black text-white shadow-[0_15px_40px_rgba(0,0,0,0.18)]">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/25 border-t-white" />
                </div>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.24em] text-black/45">
                  ZYNK STORE
                </p>
                <h3 className="text-3xl font-black uppercase tracking-tight text-black">
                  Платіж проходить
                </h3>
                <p className="mt-4 text-sm leading-6 text-black/60">
                  Зачекайте кілька секунд, ми підтверджуємо оплату карткою та оформлюємо ваше замовлення.
                </p>
              </>
            ) : (
              <>
                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-black text-white shadow-[0_15px_40px_rgba(0,0,0,0.18)] animate-[popIn_0.45s_ease]">
                  <span className="text-4xl font-black">✓</span>
                </div>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.24em] text-black/45">
                  ZYNK STORE
                </p>
                <h3 className="text-3xl font-black uppercase tracking-tight text-black">
                  Замовлення прийнято
                </h3>
                <p className="mt-4 text-sm leading-6 text-black/60">
                  {formData.paymentMethod === 'card'
                    ? 'Оплату успішно підтверджено. Зараз повернемо вас на головну сторінку.'
                    : 'Дякуємо за замовлення. Зараз повернемо вас на головну сторінку.'}
                </p>
              </>
            )}
          </div>

          <style>{`
            @keyframes popIn {
              0% { transform: scale(0.72); opacity: 0; }
              70% { transform: scale(1.06); opacity: 1; }
              100% { transform: scale(1); }
            }
          `}</style>
        </div>
      )}

      <div className="min-h-screen bg-[#f5f5f5] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1280px]">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.24em] text-black/45">
                ZYNK STORE
              </p>
              <h1 className="text-4xl font-black uppercase tracking-tight text-black sm:text-5xl">
                Оформлення замовлення
              </h1>
            </div>

            <button
              onClick={() => navigate(-1)}
              className="rounded-full border border-black px-5 py-3 text-sm font-bold text-black transition hover:bg-black hover:text-white"
              disabled={loading || paymentStage !== 'idle'}
            >
              Назад
            </button>
          </div>

          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <section className="rounded-[30px] border border-black/10 bg-white p-6 shadow-[0_14px_40px_rgba(0,0,0,0.06)] sm:p-8">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-black/45">
                    Ваше замовлення
                  </p>
                  <h2 className="text-2xl font-black uppercase tracking-tight text-black">
                    {orderItems.length > 1 ? 'Товари в кошику' : 'Деталі товару'}
                  </h2>
                </div>

                <div className="rounded-full bg-black px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white">
                  {orderItems.reduce((sum, orderItem) => sum + Number(orderItem.quantity || 0), 0)} шт.
                </div>
              </div>

              <div className="space-y-5">
                {orderItems.map((orderItem) => {
                  const imageSrc = getImageSrc(orderItem);
                  const detailItems = getDetailItems(orderItem);

                  return (
                    <div
                      key={`${getProductType(orderItem)}-${orderItem.id}`}
                      className="rounded-[24px] bg-[#f6f6f6] p-5"
                    >
                      <div className="grid gap-5 sm:grid-cols-[170px_1fr]">
                        <div className="flex items-center justify-center rounded-[20px] bg-white p-4">
                          {imageSrc ? (
                            <img
                              src={imageSrc}
                              alt={orderItem.name}
                              className="h-40 w-full object-contain"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src =
                                  'https://placehold.co/280x280/EAEAEA/333333?text=No+Image';
                              }}
                            />
                          ) : (
                            <div className="flex h-40 w-full items-center justify-center text-black/35">
                              No image
                            </div>
                          )}
                        </div>

                        <div>
                          <h3 className="text-2xl font-black leading-tight tracking-tight text-black">
                            {orderItem.name}
                          </h3>
                          <p className="mt-3 text-sm leading-6 text-black/60">
                            Кількість: {orderItem.quantity} шт.
                          </p>
                          <p className={`mt-2 text-sm font-bold ${getStockQuantity(orderItem) <= 0 ? 'text-red-600' : 'text-green-700'}`}>
                            {getStockQuantity(orderItem) <= 0
                              ? 'Немає в наявності'
                              : `На складі: ${getStockQuantity(orderItem)} шт.`}
                          </p>

                          {detailItems.length > 0 && (
                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                              {detailItems.map((detail) => (
                                <div
                                  key={detail.label}
                                  className="rounded-[18px] border border-black/8 bg-white px-4 py-4"
                                >
                                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-black/40">
                                    {detail.label}
                                  </p>
                                  <p className="mt-2 text-sm font-semibold text-black">
                                    {detail.value}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-[18px] bg-white px-4 py-4">
                          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-black/40">
                            Ціна
                          </p>
                          <p className="mt-2 text-2xl font-black leading-none text-black">
                            {formatPrice(orderItem.price)} ₴
                          </p>
                        </div>

                        <div className="rounded-[18px] bg-white px-4 py-4">
                          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-black/40">
                            Кількість
                          </p>
                          <p className="mt-2 text-2xl font-black leading-none text-black">
                            {orderItem.quantity}
                          </p>
                        </div>

                        <div className="rounded-[18px] bg-black px-4 py-4 text-white">
                          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/60">
                            Разом
                          </p>
                          <p className="mt-2 text-2xl font-black leading-none">
                            {formatPrice(orderItem.totalPrice)} ₴
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div className="rounded-[24px] bg-black px-5 py-5 text-white">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/60">
                    Загальна сума
                  </p>
                  <p className="mt-2 text-4xl font-black leading-none">
                    {formatPrice(totalPrice)} ₴
                  </p>
                </div>
              </div>
            </section>

            <form
              onSubmit={handleSubmit}
              className="rounded-[30px] border border-black/10 bg-white p-6 shadow-[0_14px_40px_rgba(0,0,0,0.06)] sm:p-8"
            >
              <div className="mb-8">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-black/45">
                  Контактні дані
                </p>
                <h2 className="text-2xl font-black uppercase tracking-tight text-black">
                  Інформація для доставки
                </h2>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-[12px] font-bold uppercase tracking-[0.16em] text-black/45">
                    Ваше ім'я
                  </span>
                  <input
                    type="text"
                    id="customerName"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    className="h-14 w-full rounded-[18px] border border-black/10 bg-[#f6f6f6] px-4 text-black outline-none transition focus:border-black"
                    required
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-[12px] font-bold uppercase tracking-[0.16em] text-black/45">
                    Email
                  </span>
                  <input
                    type="email"
                    id="customerEmail"
                    name="customerEmail"
                    value={formData.customerEmail}
                    onChange={handleInputChange}
                    className="h-14 w-full rounded-[18px] border border-black/10 bg-[#f6f6f6] px-4 text-black outline-none transition focus:border-black"
                    required
                  />
                </label>

                <label className="block sm:col-span-2">
                  <span className="mb-2 block text-[12px] font-bold uppercase tracking-[0.16em] text-black/45">
                    Телефон
                  </span>
                  <input
                    type="tel"
                    id="customerPhone"
                    name="customerPhone"
                    value={formData.customerPhone}
                    onChange={handleInputChange}
                    className="h-14 w-full rounded-[18px] border border-black/10 bg-[#f6f6f6] px-4 text-black outline-none transition focus:border-black"
                    required
                  />
                </label>

                <label className="block sm:col-span-2">
                  <span className="mb-2 block text-[12px] font-bold uppercase tracking-[0.16em] text-black/45">
                    Адреса доставки
                  </span>
                  <textarea
                    id="deliveryAddress"
                    name="deliveryAddress"
                    value={formData.deliveryAddress}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full resize-none rounded-[18px] border border-black/10 bg-[#f6f6f6] px-4 py-4 text-black outline-none transition focus:border-black"
                    required
                  />
                </label>
              </div>

              <div className="my-8 rounded-[24px] bg-[#f6f6f6] p-5">
                <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.22em] text-black/45">
                  Спосіб оплати
                </p>

                <div className="flex flex-col gap-3">
                  <label className="flex cursor-pointer items-center gap-3 rounded-[18px] border border-black/10 bg-white px-4 py-4">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash_on_delivery"
                      checked={formData.paymentMethod === 'cash_on_delivery'}
                      onChange={handleInputChange}
                      className="h-4 w-4 accent-black"
                    />
                    <div>
                      <p className="text-sm font-bold text-black">Готівкою при отриманні</p>
                      <p className="text-sm text-black/55">
                        Оплата під час отримання замовлення
                      </p>
                    </div>
                  </label>

                  <label className="flex cursor-pointer items-center gap-3 rounded-[18px] border border-black/10 bg-white px-4 py-4">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={formData.paymentMethod === 'card'}
                      onChange={handleInputChange}
                      className="h-4 w-4 accent-black"
                    />
                    <div>
                      <p className="text-sm font-bold text-black">Оплата картою</p>
                      <p className="text-sm text-black/55">
                        Онлайн оплата банківською карткою
                      </p>
                    </div>
                  </label>
                </div>

                <div
                  className={`overflow-hidden transition-all duration-500 ease-out ${
                    formData.paymentMethod === 'card'
                      ? 'mt-5 max-h-[900px] opacity-100'
                      : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="rounded-[22px] border border-black/10 bg-white p-4 sm:p-5">
                    <div className="mb-5 [perspective:1200px]">
                      <div
                        className={`relative h-[210px] w-full transition-transform duration-500 ${
                          focusedField === 'cvv' ? '[transform:rotateY(180deg)]' : ''
                        }`}
                        style={{ transformStyle: 'preserve-3d' }}
                      >
                        <div
                          className="absolute inset-0 rounded-[24px] bg-gradient-to-br from-black via-[#151515] to-[#2a2a2a] p-5 text-white shadow-[0_18px_40px_rgba(0,0,0,0.28)]"
                          style={{ backfaceVisibility: 'hidden' }}
                        >
                          <div className="mb-8 flex items-start justify-between">
                            <div>
                              <p className="text-[11px] uppercase tracking-[0.22em] text-white/55">
                                Банківська картка
                              </p>
                              <p className="mt-2 text-sm font-semibold text-white/80">
                                Secure payment
                              </p>
                            </div>
                            <div className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em]">
                              VISA
                            </div>
                          </div>

                          <div className="mb-6 text-2xl font-black tracking-[0.18em] sm:text-3xl">
                            {cardData.cardNumber || '0000 0000 0000 0000'}
                          </div>

                          <div className="flex items-end justify-between gap-4">
                            <div>
                              <p className="mb-1 text-[10px] uppercase tracking-[0.18em] text-white/50">
                                Card holder
                              </p>
                              <p className="text-sm font-bold uppercase tracking-[0.12em] sm:text-base">
                                {cardData.cardHolder || 'YOUR NAME'}
                              </p>
                            </div>

                            <div className="text-right">
                              <p className="mb-1 text-[10px] uppercase tracking-[0.18em] text-white/50">
                                Expires
                              </p>
                              <p className="text-sm font-bold sm:text-base">
                                {cardData.expiry || 'MM/YY'}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div
                          className="absolute inset-0 rounded-[24px] bg-gradient-to-br from-[#111] via-[#1d1d1d] to-black p-5 text-white shadow-[0_18px_40px_rgba(0,0,0,0.28)]"
                          style={{
                            backfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)',
                          }}
                        >
                          <div className="mt-4 h-10 rounded bg-white/85" />
                          <div className="mt-7 rounded bg-white px-3 py-4 text-right">
                            <p className="text-[10px] uppercase tracking-[0.18em] text-black/45">
                              CVV
                            </p>
                            <p className="mt-1 text-xl font-black text-black">
                              {cardData.cvv || '•••'}
                            </p>
                          </div>
                          <p className="mt-6 text-xs leading-5 text-white/55">
                            Дані картки використовуються лише для демонстрації інтерфейсу оплати.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block sm:col-span-2">
                        <span className="mb-2 block text-[12px] font-bold uppercase tracking-[0.16em] text-black/45">
                          Номер картки
                        </span>
                        <input
                          type="text"
                          name="cardNumber"
                          value={cardData.cardNumber}
                          onChange={handleCardChange}
                          onFocus={() => setFocusedField('cardNumber')}
                          onBlur={() => setFocusedField('')}
                          placeholder="0000 0000 0000 0000"
                          className={`h-14 w-full rounded-[18px] border px-4 text-black outline-none transition ${
                            focusedField === 'cardNumber'
                              ? 'border-black bg-white'
                              : 'border-black/10 bg-[#f6f6f6]'
                          }`}
                          inputMode="numeric"
                        />
                      </label>

                      <label className="block sm:col-span-2">
                        <span className="mb-2 block text-[12px] font-bold uppercase tracking-[0.16em] text-black/45">
                          Ім’я на картці
                        </span>
                        <input
                          type="text"
                          name="cardHolder"
                          value={cardData.cardHolder}
                          onChange={handleCardChange}
                          onFocus={() => setFocusedField('cardHolder')}
                          onBlur={() => setFocusedField('')}
                          placeholder="IVAN IVANENKO"
                          className={`h-14 w-full rounded-[18px] border px-4 text-black outline-none transition ${
                            focusedField === 'cardHolder'
                              ? 'border-black bg-white'
                              : 'border-black/10 bg-[#f6f6f6]'
                          }`}
                        />
                      </label>

                      <label className="block">
                        <span className="mb-2 block text-[12px] font-bold uppercase tracking-[0.16em] text-black/45">
                          Термін дії
                        </span>
                        <input
                          type="text"
                          name="expiry"
                          value={cardData.expiry}
                          onChange={handleCardChange}
                          onFocus={() => setFocusedField('expiry')}
                          onBlur={() => setFocusedField('')}
                          placeholder="MM/YY"
                          className={`h-14 w-full rounded-[18px] border px-4 text-black outline-none transition ${
                            focusedField === 'expiry'
                              ? 'border-black bg-white'
                              : 'border-black/10 bg-[#f6f6f6]'
                          }`}
                          inputMode="numeric"
                        />
                      </label>

                      <label className="block">
                        <span className="mb-2 block text-[12px] font-bold uppercase tracking-[0.16em] text-black/45">
                          CVV
                        </span>
                        <input
                          type="password"
                          name="cvv"
                          value={cardData.cvv}
                          onChange={handleCardChange}
                          onFocus={() => setFocusedField('cvv')}
                          onBlur={() => setFocusedField('')}
                          placeholder="•••"
                          className={`h-14 w-full rounded-[18px] border px-4 text-black outline-none transition ${
                            focusedField === 'cvv'
                              ? 'border-black bg-white'
                              : 'border-black/10 bg-[#f6f6f6]'
                          }`}
                          inputMode="numeric"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-full bg-black px-6 py-4 text-sm font-bold uppercase tracking-[0.12em] text-white transition hover:bg-[#1b1b1b] disabled:opacity-50"
                disabled={
                  loading ||
                  paymentStage !== 'idle' ||
                  orderItems.some(
                    (orderItem) =>
                      getStockQuantity(orderItem) <= 0 ||
                      Number(orderItem.quantity || 1) > getStockQuantity(orderItem)
                  )
                }
              >
                {loading
                  ? formData.paymentMethod === 'card'
                    ? 'Обробка платежу...'
                    : 'Оформлення...'
                  : `Підтвердити замовлення — ${formatPrice(totalPrice)} ₴`}
              </button>

              {orderStatus && paymentStage === 'idle' && (
                <p
                  className={`mt-5 whitespace-pre-line rounded-[18px] px-4 py-4 text-center text-sm font-semibold ${
                    orderStatus.includes('Помилка') ||
                    orderStatus.includes('❌') ||
                    orderStatus.includes('потрібно увійти') ||
                    orderStatus.includes('Сесія закінчилась')
                      ? 'bg-red-50 text-red-600'
                      : 'bg-green-50 text-green-700'
                  }`}
                >
                  {orderStatus}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutPage;
