import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL;

const AdminUsersPage = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageStatus, setPageStatus] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [expandedUserId, setExpandedUserId] = useState(null);
  const [userOrders, setUserOrders] = useState({});
  const [loadingOrdersId, setLoadingOrdersId] = useState(null);
  const [actionUserId, setActionUserId] = useState(null);

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

  const authHeaders = () => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchUsers = async () => {
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
      const response = await axios.get(`${API_BASE}/admin/users`, {
        headers: authHeaders(),
      });

      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        setPageStatus('Сесія адміністратора недійсна. Увійдіть ще раз.');
        setTimeout(() => navigate('/admin'), 1400);
      } else {
        setPageStatus('Не вдалося завантажити користувачів.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const formatDate = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';

    return date.toLocaleString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (value) => {
    if (value === null || value === undefined) return '0 ₴';
    return `${Number(value).toLocaleString('uk-UA')} ₴`;
  };

  const filteredUsers = useMemo(() => {
    const term = searchValue.trim().toLowerCase();

    if (!term) return users;

    return users.filter((user) => {
      const name = String(user.name || '').toLowerCase();
      const email = String(user.email || '').toLowerCase();
      const phone = String(user.phone || '').toLowerCase();
      const city = String(user.city || '').toLowerCase();
      const role = String(user.role || '').toLowerCase();

      return (
        name.includes(term) ||
        email.includes(term) ||
        phone.includes(term) ||
        city.includes(term) ||
        role.includes(term)
      );
    });
  }, [users, searchValue]);

  const usersWithPhone = useMemo(
    () => users.filter((user) => user.phone && String(user.phone).trim() !== '').length,
    [users]
  );

  const usersWithCity = useMemo(
    () => users.filter((user) => user.city && String(user.city).trim() !== '').length,
    [users]
  );

  const adminCount = useMemo(
    () => users.filter((user) => user.role === 'admin').length,
    [users]
  );

  const fetchUserOrders = async (userId) => {
    try {
      setLoadingOrdersId(userId);

      const response = await axios.get(
        `${API_BASE}/admin/users/${userId}/orders`,
        { headers: authHeaders() }
      );

      setUserOrders((prev) => ({
        ...prev,
        [userId]: Array.isArray(response.data) ? response.data : [],
      }));
    } catch (error) {
      alert(error?.response?.data?.message || 'Не вдалося завантажити замовлення користувача');
    } finally {
      setLoadingOrdersId(null);
    }
  };

  const toggleOrders = async (userId) => {
    if (expandedUserId === userId) {
      setExpandedUserId(null);
      return;
    }

    setExpandedUserId(userId);

    if (!userOrders[userId]) {
      await fetchUserOrders(userId);
    }
  };

  const handleMakeAdmin = async (userId) => {
    const confirmed = window.confirm('Видати цьому користувачу роль адміністратора?');
    if (!confirmed) return;

    try {
      setActionUserId(userId);

      const response = await axios.patch(
        `${API_BASE}/admin/users/${userId}/make-admin`,
        {},
        { headers: authHeaders() }
      );

      const updatedUser = response.data?.user;
      if (updatedUser) {
        setUsers((prev) =>
          prev.map((user) => (user.id === userId ? { ...user, ...updatedUser } : user))
        );
      }
    } catch (error) {
      alert(error?.response?.data?.message || 'Не вдалося змінити роль користувача');
    } finally {
      setActionUserId(null);
    }
  };

  const handleDeleteUser = async (userId) => {
    const confirmed = window.confirm(
      'Видалити користувача? Замовлення залишаться в системі, але без прив’язки до акаунта.'
    );
    if (!confirmed) return;

    try {
      setActionUserId(userId);

      await axios.delete(`${API_BASE}/admin/users/${userId}`, {
        headers: authHeaders(),
      });

      setUsers((prev) => prev.filter((user) => user.id !== userId));
      setUserOrders((prev) => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });

      if (expandedUserId === userId) {
        setExpandedUserId(null);
      }
    } catch (error) {
      alert(error?.response?.data?.message || 'Не вдалося видалити користувача');
    } finally {
      setActionUserId(null);
    }
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
              Адмін - користувачі
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-black/60">
              Переглядайте користувачів, дивіться їхні замовлення та керуйте ролями.
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

        <div className="mb-8 grid gap-5 md:grid-cols-4">
          <div className="rounded-[26px] border border-black/10 bg-white p-6 shadow-[0_12px_34px_rgba(0,0,0,0.05)]">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-black/40">Усього користувачів</p>
            <p className="mt-3 text-4xl font-black leading-none text-black">{users.length}</p>
          </div>
          <div className="rounded-[26px] border border-black/10 bg-white p-6 shadow-[0_12px_34px_rgba(0,0,0,0.05)]">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-black/40">З телефоном</p>
            <p className="mt-3 text-4xl font-black leading-none text-black">{usersWithPhone}</p>
          </div>
          <div className="rounded-[26px] border border-black/10 bg-white p-6 shadow-[0_12px_34px_rgba(0,0,0,0.05)]">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-black/40">З містом</p>
            <p className="mt-3 text-4xl font-black leading-none text-black">{usersWithCity}</p>
          </div>
          <div className="rounded-[26px] border border-black/10 bg-black p-6 text-white shadow-[0_14px_40px_rgba(0,0,0,0.12)]">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/55">Адміністратори</p>
            <p className="mt-3 text-4xl font-black leading-none">{adminCount}</p>
          </div>
        </div>

        <div className="mb-8 rounded-[28px] border border-black/10 bg-white p-5 shadow-[0_12px_34px_rgba(0,0,0,0.05)] sm:p-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-black/45">Пошук</p>
              <h2 className="text-2xl font-black uppercase tracking-tight text-black">База користувачів</h2>
            </div>
            <div className="rounded-full bg-[#f3f3f3] px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-black/55">
              {filteredUsers.length} знайдено
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Пошук по імені, email, телефону, місту або ролі"
              className="h-14 w-full rounded-full border border-black/10 bg-[#f6f6f6] px-5 text-sm font-medium text-black outline-none transition focus:border-black"
            />
            <button
              type="button"
              onClick={fetchUsers}
              className="rounded-full border border-black px-5 py-3 text-sm font-bold text-black transition hover:bg-black hover:text-white"
            >
              Оновити список
            </button>
          </div>
        </div>

        {loading ? (
          <div className="rounded-[28px] border border-black/10 bg-white p-10 text-center shadow-[0_12px_34px_rgba(0,0,0,0.05)]">
            <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-black/15 border-t-black" />
            <p className="text-lg font-semibold text-black/70">Завантажуємо користувачів...</p>
          </div>
        ) : pageStatus ? (
          <div className="rounded-[28px] border border-red-200 bg-white p-10 text-center shadow-[0_12px_34px_rgba(0,0,0,0.05)]">
            <p className="text-lg font-semibold text-red-600">{pageStatus}</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="rounded-[28px] border border-black/10 bg-white p-10 text-center shadow-[0_12px_34px_rgba(0,0,0,0.05)]">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-black/40">ADMIN</p>
            <h3 className="mt-3 text-3xl font-black uppercase tracking-tight text-black">Користувачів не знайдено</h3>
          </div>
        ) : (
          <div className="grid gap-5">
            {filteredUsers.map((user) => (
              <article
                key={user.id}
                className="overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-[0_12px_34px_rgba(0,0,0,0.05)]"
              >
                <div className="border-b border-black/8 px-6 py-5 sm:px-8">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-black/40">
                        Користувач #{user.id}
                      </p>
                      <h3 className="text-2xl font-black tracking-tight text-black">
                        {user.name || 'Без імені'}
                      </h3>
                      <p className="mt-2 text-sm text-black/55">
                        Створено: {formatDate(user.created_at)}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-full border border-black/10 bg-[#f6f6f6] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-black">
                        ID {user.id}
                      </span>
                      <span
                        className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] ${
                          user.role === 'admin'
                            ? 'bg-black text-white'
                            : 'border border-black/10 bg-[#f6f6f6] text-black'
                        }`}
                      >
                        {user.role || 'user'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-5 p-6 sm:p-8 lg:grid-cols-[1.15fr_0.85fr]">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-[20px] bg-[#f6f6f6] p-5">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-black/40">Ім’я</p>
                      <p className="mt-3 text-lg font-black text-black">{user.name || '—'}</p>
                    </div>

                    <div className="rounded-[20px] bg-[#f6f6f6] p-5">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-black/40">Місто</p>
                      <p className="mt-3 text-lg font-black text-black">{user.city || 'Не вказано'}</p>
                    </div>

                    <div className="rounded-[20px] bg-[#f6f6f6] p-5 sm:col-span-2">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-black/40">Email</p>
                      <p className="mt-3 break-all text-base font-bold text-black">{user.email || '—'}</p>
                    </div>

                    <div className="rounded-[20px] bg-[#f6f6f6] p-5 sm:col-span-2">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-black/40">Телефон</p>
                      <p className="mt-3 text-base font-bold text-black">{user.phone || 'Не вказано'}</p>
                    </div>

                    {expandedUserId === user.id && (
                      <div className="rounded-[22px] bg-[#f6f6f6] p-5 sm:col-span-2">
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-black/40">
                            Замовлення користувача
                          </p>
                          <span className="rounded-full bg-black px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white">
                            {(userOrders[user.id] || []).length} шт
                          </span>
                        </div>

                        {loadingOrdersId === user.id ? (
                          <p className="text-sm font-semibold text-black/60">Завантажуємо замовлення...</p>
                        ) : !userOrders[user.id] || userOrders[user.id].length === 0 ? (
                          <p className="text-sm font-semibold text-black/60">
                            У цього користувача поки немає замовлень.
                          </p>
                        ) : (
                          <div className="grid gap-3">
                            {userOrders[user.id].map((order) => (
                              <div
                                key={order.id}
                                className="rounded-[18px] border border-black/10 bg-white px-4 py-4"
                              >
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                  <div>
                                    <p className="text-sm font-black text-black">
                                      #{order.id} — {order.product_name}
                                    </p>
                                    <p className="mt-1 text-sm text-black/60">
                                      {order.product_type || '—'} • {order.quantity} шт.
                                    </p>
                                    <p className="mt-1 text-sm text-black/60">
                                      {formatDate(order.created_at)}
                                    </p>
                                  </div>
                                  <div className="text-left sm:text-right">
                                    <p className="text-sm font-black text-black">
                                      {formatPrice(order.total_amount)}
                                    </p>
                                    <p className="mt-1 text-xs uppercase tracking-[0.12em] text-black/45">
                                      {order.status || '—'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="rounded-[22px] bg-black p-6 text-white">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/55">
                      Дії адміністратора
                    </p>

                    <div className="mt-5 space-y-4">
                      <button
                        type="button"
                        onClick={() => toggleOrders(user.id)}
                        disabled={actionUserId === user.id}
                        className="w-full rounded-full border border-white/20 bg-white/10 px-4 py-3 text-sm font-bold text-white transition hover:bg-white hover:text-black disabled:opacity-50"
                      >
                        {expandedUserId === user.id ? 'Сховати замовлення' : 'Переглянути замовлення'}
                      </button>

                      {user.role !== 'admin' ? (
                        <button
                          type="button"
                          onClick={() => handleMakeAdmin(user.id)}
                          disabled={actionUserId === user.id}
                          className="w-full rounded-full bg-white px-4 py-3 text-sm font-bold text-black transition hover:bg-[#f0f0f0] disabled:opacity-50"
                        >
                          Видати роль адміністратора
                        </button>
                      ) : (
                        <div className="rounded-[18px] bg-white/8 px-4 py-4">
                          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/50">Роль</p>
                          <p className="mt-2 text-sm font-bold text-white">admin</p>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={actionUserId === user.id}
                        className="w-full rounded-full border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200 transition hover:bg-red-500 hover:text-white disabled:opacity-50"
                      >
                        Видалити користувача
                      </button>

                      <div className="rounded-[18px] bg-white px-4 py-5 text-black">
                        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-black/40">
                          Статус профілю
                        </p>
                        <p className="mt-3 text-sm text-black/70">
                          {user.phone || user.city ? 'Профіль частково заповнений' : 'Профіль майже порожній'}
                        </p>
                        <p className="mt-2 text-sm text-black/70">Email: {user.email || '—'}</p>
                        <p className="mt-2 text-sm text-black/70">Оновлено: {formatDate(user.updated_at)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsersPage;
