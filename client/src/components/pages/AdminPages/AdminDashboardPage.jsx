import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [adminEmail, setAdminEmail] = useState('');

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

  useEffect(() => {
    const token = sessionStorage.getItem('adminToken');

    if (!token) {
      navigate('/admin');
      return;
    }

    const decoded = parseJwt(token);

    if (!decoded || decoded.role !== 'admin') {
      navigate('/admin');
      return;
    }

    setAdminEmail(decoded.email || '');
  }, [navigate]);

  const cards = useMemo(
    () => [
      {
        title: 'Замовлення',
        description: 'Перегляд усіх замовлень, зміна статусів і контроль продажів.',
        action: 'Відкрити',
        path: '/admin/orders',
        enabled: true,
      },
      {
        title: 'Користувачі',
        description: 'Список клієнтів, ролі, історія активності та керування доступом.',
        action: 'Відкрити',
        path: '/admin/users',
        enabled: true,
      },
      {
        title: 'Склад',
        description: 'Товари, залишки, наявність, оновлення цін і контроль каталогу.',
        action: 'Відкрити',
        path: '/admin/inventory',
        enabled: true,
      },
    ],
    []
  );

  const logout = () => {
    sessionStorage.removeItem('adminToken');
    navigate('/admin');
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
              Адмін Панель
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-black/60">
              Головна сторінка адмінки. Звідси ми далі будемо додавати окремі
              розділи для замовлень, користувачів і складу.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/')}
              className="rounded-full border border-black px-5 py-3 text-sm font-bold text-black transition hover:bg-black hover:text-white"
            >
              На сайт
            </button>
            <button
              onClick={logout}
              className="rounded-full bg-black px-5 py-3 text-sm font-bold text-white transition hover:bg-[#1a1a1a]"
            >
              Вийти
            </button>
          </div>
        </div>

        <div className="mb-8 grid gap-5 md:grid-cols-3">
          <div className="rounded-[28px] border border-black/10 bg-white p-6 shadow-[0_14px_40px_rgba(0,0,0,0.06)]">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-black/40">
              Роль
            </p>
            <p className="mt-3 text-3xl font-black leading-none text-black">
              ADMIN
            </p>
          </div>

          <div className="rounded-[28px] border border-black/10 bg-white p-6 shadow-[0_14px_40px_rgba(0,0,0,0.06)]">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-black/40">
              Авторизований email
            </p>
            <p className="mt-3 break-all text-xl font-black leading-tight text-black">
              {adminEmail || '—'}
            </p>
          </div>

          <div className="rounded-[28px] border border-black/10 bg-black p-6 text-white shadow-[0_14px_40px_rgba(0,0,0,0.12)]">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/55">
              Статус системи
            </p>
            <p className="mt-3 text-3xl font-black leading-none">
              Активна
            </p>
          </div>
        </div>

        <div className="mb-8 rounded-[30px] border border-black/10 bg-white p-6 shadow-[0_14px_40px_rgba(0,0,0,0.06)] sm:p-8">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-black/45">
            Центр керування
          </p>
          <h2 className="text-2xl font-black uppercase tracking-tight text-black">
            Основні розділи
          </h2>

          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            {cards.map((card) => (
              <div
                key={card.title}
                className={`rounded-[24px] border border-black/10 p-5 transition ${
                  card.enabled
                    ? 'cursor-pointer bg-[#f6f6f6] hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(0,0,0,0.08)]'
                    : 'bg-[#f6f6f6]'
                }`}
                onClick={() => {
                  if (card.enabled) navigate(card.path);
                }}
              >
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-black/40">
                  Розділ
                </p>

                <h3 className="mt-3 text-2xl font-black uppercase tracking-tight text-black">
                  {card.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-black/60">
                  {card.description}
                </p>

                <button
                  type="button"
                  disabled={!card.enabled}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (card.enabled) navigate(card.path);
                  }}
                  className={`mt-5 w-full rounded-full px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.14em] transition ${
                    card.enabled
                      ? 'bg-black text-white hover:bg-[#1a1a1a]'
                      : 'bg-black text-white opacity-50 cursor-not-allowed'
                  }`}
                >
                  {card.action}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[30px] border border-black/10 bg-black p-6 text-white shadow-[0_14px_40px_rgba(0,0,0,0.12)] sm:p-8">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-white/55">
            Наступний крок
          </p>
          <h2 className="text-2xl font-black uppercase tracking-tight">
            Готово до розширення
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-white/70">
            Основа адмінки вже готова: є окрема авторизація, окремий маршрут
            і стартова dashboard-сторінка. Далі можна по черзі додавати сторінки:
            замовлення, користувачі та склад.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;