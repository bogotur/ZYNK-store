import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageStatus, setPageStatus] = useState('');
  const [activeStatus, setActiveStatus] = useState('all');

  const getToken = () => localStorage.getItem('token');

  useEffect(() => {
    const token = getToken();

    if (!token) {
      setPageStatus('Щоб переглядати замовлення, потрібно увійти в акаунт.');
      setLoading(false);
      setTimeout(() => navigate('/login'), 1400);
      return;
    }

    const API_URL = import.meta.env.VITE_API_URL;

    const fetchOrders = async () => {
      try {
        const response = await axios.get(`${API_URL}/orders/my`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setOrders(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          setPageStatus('Сесія закінчилась. Увійдіть в акаунт ще раз.');
          setTimeout(() => navigate('/login'), 1500);
        } else {
          setPageStatus('Не вдалося завантажити замовлення.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  const formatPrice = (value) => {
    if (value === null || value === undefined) return '0 ₴';
    return `${Number(value).toLocaleString('uk-UA')} ₴`;
  };

  const formatDate = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    return date.toLocaleString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getOrderItems = (order) => {
    if (Array.isArray(order.items) && order.items.length > 0) {
      return order.items;
    }

    return [
      {
        id: `single-${order.id}`,
        product_id: order.product_id,
        product_name: order.product_name,
        product_type: order.product_type,
        product_price: order.product_price,
        quantity: order.quantity,
        total_amount: order.total_amount,
      },
    ];
  };

  const getOrderTitle = (order) => {
    const orderItems = getOrderItems(order);

    if (order.product_type === 'multi' || orderItems.length > 1) {
      return `Замовлення з ${orderItems.length} товарів`;
    }

    return order.product_name;
  };

  const getTotalQuantity = (order) => {
    return getOrderItems(order).reduce(
      (sum, item) => sum + Number(item.quantity || 0),
      0
    );
  };

  const getStatusMeta = (status) => {
    const map = {
      pending: {
        label: 'Очікує підтвердження',
        className: 'bg-[#fff3d6] text-[#8a6300] border-[#f3d58a]',
      },
      paid: {
        label: 'Оплачено',
        className: 'bg-[#e8f8ec] text-[#187a34] border-[#9fd8ae]',
      },
      processing: {
        label: 'В обробці',
        className: 'bg-[#eaf2ff] text-[#2457b2] border-[#b6ccfb]',
      },
      shipped: {
        label: 'Відправлено',
        className: 'bg-[#efeaff] text-[#5f39b5] border-[#cbb8ff]',
      },
      completed: {
        label: 'Завершено',
        className: 'bg-[#ebfbf7] text-[#12715d] border-[#9fdfce]',
      },
      cancelled: {
        label: 'Скасовано',
        className: 'bg-[#ffe9e9] text-[#b42318] border-[#f4b0b0]',
      },
    };

    return map[status] || {
      label: status || 'Невідомо',
      className: 'bg-[#f1f1f1] text-[#333] border-[#ddd]',
    };
  };

  const statusOptions = useMemo(
    () => [
      { value: 'all', label: 'Усі' },
      { value: 'pending', label: 'Очікують' },
      { value: 'paid', label: 'Оплачені' },
      { value: 'processing', label: 'В обробці' },
      { value: 'shipped', label: 'Відправлені' },
      { value: 'completed', label: 'Завершені' },
      { value: 'cancelled', label: 'Скасовані' },
    ],
    []
  );

  const filteredOrders = useMemo(() => {
    if (activeStatus === 'all') return orders;
    return orders.filter((order) => order.status === activeStatus);
  }, [orders, activeStatus]);

  const totalSpent = useMemo(() => {
    return orders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
  }, [orders]);

  const paidOrdersCount = useMemo(() => {
    return orders.filter((order) =>
      ['paid', 'processing', 'shipped', 'completed'].includes(order.status)
    ).length;
  }, [orders]);

  return (
    <div className="min-h-screen bg-[#f5f5f5] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1280px]">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.24em] text-black/45">
              ZYNK STORE
            </p>
            <h1 className="text-4xl font-black uppercase tracking-tight text-black sm:text-5xl">
              Мої замовлення
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-black/60">
              Тут ви можете переглядати історію покупок, статус кожного замовлення,
              спосіб оплати та підсумкову суму.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/profile')}
              className="rounded-full border border-black px-5 py-3 text-sm font-bold text-black transition hover:bg-black hover:text-white"
            >
              Профіль
            </button>
            <button
              onClick={() => navigate('/')}
              className="rounded-full bg-black px-5 py-3 text-sm font-bold text-white transition hover:bg-[#1a1a1a]"
            >
              На головну
            </button>
          </div>
        </div>

        <div className="mb-8 grid gap-5 md:grid-cols-3">
          <div className="rounded-[28px] border border-black/10 bg-white p-6 shadow-[0_14px_40px_rgba(0,0,0,0.06)]">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-black/40">
              Усього замовлень
            </p>
            <p className="mt-3 text-4xl font-black leading-none text-black">
              {orders.length}
            </p>
          </div>

          <div className="rounded-[28px] border border-black/10 bg-white p-6 shadow-[0_14px_40px_rgba(0,0,0,0.06)]">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-black/40">
              Успішні / активні
            </p>
            <p className="mt-3 text-4xl font-black leading-none text-black">
              {paidOrdersCount}
            </p>
          </div>

          <div className="rounded-[28px] border border-black/10 bg-black p-6 text-white shadow-[0_14px_40px_rgba(0,0,0,0.12)]">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/55">
              Загальна сума
            </p>
            <p className="mt-3 text-4xl font-black leading-none">
              {formatPrice(totalSpent)}
            </p>
          </div>
        </div>

        <div className="mb-8 rounded-[30px] border border-black/10 bg-white p-5 shadow-[0_14px_40px_rgba(0,0,0,0.06)] sm:p-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-black/45">
                Фільтр
              </p>
              <h2 className="text-2xl font-black uppercase tracking-tight text-black">
                Статус замовлень
              </h2>
            </div>
            <div className="rounded-full bg-[#f3f3f3] px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-black/55">
              {filteredOrders.length} знайдено
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setActiveStatus(option.value)}
                className={`rounded-full px-4 py-3 text-sm font-bold transition ${
                  activeStatus === option.value
                    ? 'bg-black text-white'
                    : 'border border-black/10 bg-[#f6f6f6] text-black hover:bg-black hover:text-white'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="rounded-[30px] border border-black/10 bg-white p-10 text-center shadow-[0_14px_40px_rgba(0,0,0,0.06)]">
            <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-black/15 border-t-black" />
            <p className="text-lg font-semibold text-black/70">Завантажуємо ваші замовлення...</p>
          </div>
        ) : pageStatus ? (
          <div className="rounded-[30px] border border-red-200 bg-white p-10 text-center shadow-[0_14px_40px_rgba(0,0,0,0.06)]">
            <p className="text-lg font-semibold text-red-600">{pageStatus}</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="rounded-[30px] border border-black/10 bg-white p-10 text-center shadow-[0_14px_40px_rgba(0,0,0,0.06)]">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-black/40">
              ZYNK STORE
            </p>
            <h3 className="text-3xl font-black uppercase tracking-tight text-black">
              Замовлень поки немає
            </h3>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-black/60">
              Після оформлення покупки тут з’явиться список ваших замовлень зі статусами
              та деталями доставки.
            </p>
            <button
              onClick={() => navigate('/')}
              className="mt-6 rounded-full bg-black px-6 py-4 text-sm font-bold uppercase tracking-[0.12em] text-white transition hover:bg-[#1a1a1a]"
            >
              Перейти до покупок
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredOrders.map((order) => {
              const statusMeta = getStatusMeta(order.status);
              const orderItems = getOrderItems(order);
              const totalQuantity = getTotalQuantity(order);

              return (
                <article
                  key={order.id}
                  className="overflow-hidden rounded-[30px] border border-black/10 bg-white shadow-[0_14px_40px_rgba(0,0,0,0.06)]"
                >
                  <div className="border-b border-black/8 px-6 py-5 sm:px-8">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-black/40">
                          Замовлення #{order.id}
                        </p>
                        <h3 className="text-2xl font-black uppercase tracking-tight text-black">
                          {getOrderTitle(order)}
                        </h3>
                        <p className="mt-2 text-sm text-black/55">
                          Оформлено: {formatDate(order.created_at)}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <span
                          className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] ${statusMeta.className}`}
                        >
                          {statusMeta.label}
                        </span>
                        <span className="rounded-full bg-black px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white">
                          {formatPrice(order.total_amount)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-5 p-6 sm:p-8 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="grid gap-4">
                      <div className="rounded-[22px] bg-[#f6f6f6] p-5">
                        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-black/40">
                              Товари в замовленні
                            </p>
                            <p className="mt-2 text-sm text-black/55">
                              {orderItems.length} позицій • {totalQuantity} шт. загалом
                            </p>
                          </div>

                          <div className="rounded-full bg-black px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white">
                            {formatPrice(order.total_amount)}
                          </div>
                        </div>

                        <div className="grid gap-3">
                          {orderItems.map((item) => (
                            <div
                              key={item.id}
                              className="rounded-[18px] border border-black/10 bg-white px-4 py-4"
                            >
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                  <p className="text-lg font-black text-black">
                                    {item.product_name}
                                  </p>

                                  {item.product_type && item.product_type !== 'unknown' && (
                                    <p className="mt-1 text-sm text-black/50">
                                      Тип: {item.product_type}
                                    </p>
                                  )}

                                  {item.product_id && (
                                    <p className="mt-1 text-sm text-black/40">
                                      ID товару: {item.product_id}
                                    </p>
                                  )}
                                </div>

                                <div className="text-left sm:text-right">
                                  <p className="text-sm font-semibold text-black/55">
                                    {item.quantity} шт. × {formatPrice(item.product_price)}
                                  </p>

                                  <p className="mt-1 text-lg font-black text-black">
                                    {formatPrice(item.total_amount)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-[22px] bg-[#f6f6f6] p-5">
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-black/40">
                          Доставка
                        </p>
                        <p className="mt-3 text-base font-bold text-black">
                          {order.customer_name}
                        </p>
                        <p className="mt-2 text-sm text-black/60">
                          {order.customer_phone}
                        </p>
                        <p className="mt-1 text-sm text-black/60">
                          {order.customer_email}
                        </p>
                        <p className="mt-3 text-sm leading-6 text-black/70">
                          {order.delivery_address}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-[24px] bg-black p-6 text-white">
                      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/55">
                        Платіж і статус
                      </p>

                      <div className="mt-5 space-y-4">
                        <div className="rounded-[18px] bg-white/8 px-4 py-4">
                          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/50">
                            Спосіб оплати
                          </p>
                          <p className="mt-2 text-sm font-bold text-white">
                            {order.payment_method === 'card'
                              ? 'Банківська картка'
                              : 'Готівкою при отриманні'}
                          </p>
                        </div>

                        <div className="rounded-[18px] bg-white/8 px-4 py-4">
                          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/50">
                            Реквізити
                          </p>
                          <p className="mt-2 text-sm font-bold text-white">
                            {order.payment_method === 'card' && order.card_last4
                              ? `Картка •••• ${order.card_last4}`
                              : 'Оплата при отриманні'}
                          </p>
                          {order.payment_method === 'card' && order.card_holder && (
                            <p className="mt-2 text-sm text-white/65">
                              {order.card_holder}
                            </p>
                          )}
                        </div>

                        <div className="rounded-[18px] bg-white px-4 py-5 text-black">
                          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-black/40">
                            Підсумок
                          </p>
                          <p className="mt-3 text-3xl font-black leading-none">
                            {formatPrice(order.total_amount)}
                          </p>
                          <p className="mt-3 text-sm text-black/60">
                            Останнє оновлення: {formatDate(order.updated_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
