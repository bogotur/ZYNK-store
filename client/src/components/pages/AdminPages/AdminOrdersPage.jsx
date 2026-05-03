import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminOrdersPage = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageStatus, setPageStatus] = useState('');
  const [activeStatus, setActiveStatus] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);

  const getToken = () => sessionStorage.getItem('adminToken');

  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`)
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  };

  const fetchOrders = async () => {
    const token = getToken();

    if (!token) {
      setPageStatus('Потрібно увійти як адміністратор.');
      setLoading(false);
      setTimeout(() => navigate('/admin'), 1200);
      return;
    }

    const decoded = parseJwt(token);

    if (!decoded || decoded.role !== 'admin') {
      setPageStatus('Доступ тільки для адміністратора.');
      setLoading(false);
      setTimeout(() => navigate('/admin'), 1200);
      return;
    }

    try {
      const response = await axios.get('http://localhost:8108/admin/orders', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        setPageStatus('Сесія адміністратора недійсна. Увійдіть ще раз.');
        setTimeout(() => navigate('/admin'), 1400);
      } else {
        setPageStatus('Не вдалося завантажити замовлення.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (orderId, status) => {
    const token = getToken();
    setUpdatingId(orderId);

    try {
      const response = await axios.patch(
        `http://localhost:8108/admin/orders/${orderId}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedOrder = response.data?.order;

      if (updatedOrder) {
        setOrders((prev) =>
          prev.map((order) => (order.id === orderId ? { ...order, ...updatedOrder } : order))
        );
      }
    } catch (error) {
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert('Не вдалося оновити статус замовлення.');
      }
    } finally {
      setUpdatingId(null);
    }
  };

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

  const totalRevenue = useMemo(() => {
    return orders
      .filter((order) => ['paid', 'processing', 'shipped', 'completed'].includes(order.status))
      .reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
  }, [orders]);

  const pendingCount = useMemo(() => {
    return orders.filter((order) => order.status === 'pending').length;
  }, [orders]);

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
    const items = getOrderItems(order);

    if (order.product_type === 'multi' || items.length > 1) {
      return `Замовлення з ${items.length} товарів`;
    }

    return order.product_name;
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1280px]">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.24em] text-black/45">
              ZYNK STORE
            </p>
            <h1 className="text-4xl font-black uppercase tracking-tight text-black sm:text-5xl">
              Адмін - замовлення
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-black/60">
              Переглядайте всі замовлення магазину, контролюйте статуси та
              керуйте процесом обробки.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="rounded-full border border-black px-5 py-3 text-sm font-bold text-black transition hover:bg-black hover:text-white"
            >
              До панелі керування
            </button>
            <button
              onClick={() => navigate('/')}
              className="rounded-full bg-black px-5 py-3 text-sm font-bold text-white transition hover:bg-[#1a1a1a]"
            >
              На сайт
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
              Очікують обробки
            </p>
            <p className="mt-3 text-4xl font-black leading-none text-black">
              {pendingCount}
            </p>
          </div>

          <div className="rounded-[28px] border border-black/10 bg-black p-6 text-white shadow-[0_14px_40px_rgba(0,0,0,0.12)]">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/55">
              Підтверджений оборот
            </p>
            <p className="mt-3 text-4xl font-black leading-none">
              {formatPrice(totalRevenue)}
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
            <p className="text-lg font-semibold text-black/70">
              Завантажуємо замовлення...
            </p>
          </div>
        ) : pageStatus ? (
          <div className="rounded-[30px] border border-red-200 bg-white p-10 text-center shadow-[0_14px_40px_rgba(0,0,0,0.06)]">
            <p className="text-lg font-semibold text-red-600">{pageStatus}</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="rounded-[30px] border border-black/10 bg-white p-10 text-center shadow-[0_14px_40px_rgba(0,0,0,0.06)]">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-black/40">
              ADMIN
            </p>
            <h3 className="mt-3 text-3xl font-black uppercase tracking-tight text-black">
              Замовлень не знайдено
            </h3>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredOrders.map((order) => {
              const statusMeta = getStatusMeta(order.status);
              const orderItems = getOrderItems(order);

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
                          Створено: {formatDate(order.created_at)}
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
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-[22px] bg-[#f6f6f6] p-5">
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-black/40">
                          Клієнт
                        </p>
                        <p className="mt-3 text-lg font-black text-black">
                          {order.customer_name}
                        </p>
                        <p className="mt-2 text-sm text-black/60">
                          {order.customer_email}
                        </p>
                        <p className="mt-1 text-sm text-black/60">
                          {order.customer_phone}
                        </p>
                      </div>

                      <div className="rounded-[22px] bg-[#f6f6f6] p-5">
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-black/40">
                          Користувач системи
                        </p>
                        <p className="mt-3 text-base font-black text-black">
                          {order.user_name || 'Гість / не знайдено'}
                        </p>
                        <p className="mt-2 text-sm text-black/60">
                          {order.user_email || '—'}
                        </p>
                        <p className="mt-2 text-sm text-black/60">
                          user_id: {order.user_id || '—'}
                        </p>
                      </div>

                      <div className="rounded-[22px] bg-[#f6f6f6] p-5 sm:col-span-2">
                        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-black/40">
                              Товари в замовленні
                            </p>
                            <p className="mt-2 text-sm text-black/55">
                              {orderItems.length} позицій • {order.quantity} шт. загалом
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
                              className="rounded-[18px] border border-black/8 bg-white px-4 py-4"
                            >
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                  <p className="text-base font-black text-black">
                                    {item.product_name}
                                  </p>
                                  <p className="mt-1 text-sm text-black/50">
                                    Тип: {item.product_type || '—'} • ID товару: {item.product_id || '—'}
                                  </p>
                                </div>

                                <div className="text-left sm:text-right">
                                  <p className="text-sm font-bold text-black/55">
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
                          Кількість і сума
                        </p>
                        <p className="mt-3 text-lg font-black text-black">
                          {order.quantity} шт.
                        </p>
                        <p className="mt-2 text-sm text-black/55">
                          Позицій: {orderItems.length}
                        </p>
                        <p className="mt-1 text-sm text-black/55">
                          Разом: {formatPrice(order.total_amount)}
                        </p>
                      </div>

                      <div className="rounded-[22px] bg-[#f6f6f6] p-5">
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-black/40">
                          Доставка
                        </p>
                        <p className="mt-3 text-sm leading-6 text-black/70">
                          {order.delivery_address}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-[24px] bg-black p-6 text-white">
                      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/55">
                        Керування
                      </p>

                      <div className="mt-5 space-y-4">
                        <div className="rounded-[18px] bg-white/8 px-4 py-4">
                          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/50">
                            Оплата
                          </p>
                          <p className="mt-2 text-sm font-bold text-white">
                            {order.payment_method === 'card'
                              ? 'Банківська картка'
                              : 'Готівкою при отриманні'}
                          </p>
                          {order.payment_method === 'card' && order.card_last4 && (
                            <p className="mt-2 text-sm text-white/65">
                              Картка •••• {order.card_last4}
                            </p>
                          )}
                        </div>

                        <div className="rounded-[18px] bg-white/8 px-4 py-4">
                          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/50">
                            Оновити статус
                          </p>

                          <select
                            value={order.status}
                            onChange={(e) => updateStatus(order.id, e.target.value)}
                            disabled={updatingId === order.id}
                            className="mt-3 h-12 w-full rounded-[14px] border border-white/10 bg-white px-4 text-sm font-bold text-black outline-none"
                          >
                            <option value="pending">Очікує підтвердження</option>
                            <option value="paid">Оплачено</option>
                            <option value="processing">В обробці</option>
                            <option value="shipped">Відправлено</option>
                            <option value="completed">Завершено</option>
                            <option value="cancelled">Скасовано</option>
                          </select>
                        </div>

                        <div className="rounded-[18px] bg-white px-4 py-5 text-black">
                          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-black/40">
                            Службова інформація
                          </p>
                          <p className="mt-3 text-sm text-black/70">
                            Створено: {formatDate(order.created_at)}
                          </p>
                          <p className="mt-2 text-sm text-black/70">
                            Оновлено: {formatDate(order.updated_at)}
                          </p>
                          <p className="mt-2 text-sm text-black/70">
                            Holder: {order.card_holder || '—'}
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

export default AdminOrdersPage;
