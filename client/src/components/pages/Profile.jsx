import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL;

const Profile = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    firstName: '',
    email: '',
    phone: '',
    city: '',
    createdAt: '',
    updatedAt: '',
  });

  const [loading, setLoading] = useState(true);
  const [pageStatus, setPageStatus] = useState('');

  const getToken = () => localStorage.getItem('token');

  useEffect(() => {
    const token = getToken();

    if (!token) {
      setPageStatus('Щоб переглядати профіль, потрібно увійти в акаунт.');
      setLoading(false);
      setTimeout(() => navigate('/login'), 1400);
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/users/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = response.data?.profile || {};

        setProfile({
          firstName: data.firstName || '',
          email: data.email || '',
          phone: data.phone || '',
          city: data.city || '',
          createdAt: data.createdAt || '',
          updatedAt: data.updatedAt || '',
        });
      } catch {
        setPageStatus('Не вдалося завантажити профіль.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

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

  const handleLogout = () => {
    localStorage.removeItem('token');
    setTimeout(() => navigate('/login'), 200);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1280px] rounded-[30px] border border-black/10 bg-white p-10 text-center shadow-[0_14px_40px_rgba(0,0,0,0.06)]">
          <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-black/15 border-t-black" />
          <p className="text-lg font-semibold text-black/70">Завантажуємо профіль...</p>
        </div>
      </div>
    );
  }

  if (pageStatus && !profile.email) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1280px] rounded-[30px] border border-red-200 bg-white p-10 text-center shadow-[0_14px_40px_rgba(0,0,0,0.06)]">
          <p className="text-lg font-semibold text-red-600">{pageStatus}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1280px]">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.24em] text-black/45">
              ZYNK STORE
            </p>
            <h1 className="text-4xl font-black uppercase tracking-tight text-black sm:text-5xl">
              Профіль
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-black/60">
              Переглядайте свої дані та швидко переходьте до історії замовлень.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/orders')}
              className="rounded-full border border-black px-5 py-3 text-sm font-bold text-black transition hover:bg-black hover:text-white"
            >
              Мої замовлення
            </button>
            <button
              onClick={handleLogout}
              className="rounded-full bg-black px-5 py-3 text-sm font-bold text-white transition hover:bg-[#1a1a1a]"
            >
              Вийти
            </button>
          </div>
        </div>

        <div className="mb-8 grid gap-5 md:grid-cols-3">
          <div className="rounded-[28px] border border-black/10 bg-white p-6 shadow-[0_14px_40px_rgba(0,0,0,0.06)]">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-black/40">
              Ім’я
            </p>
            <p className="mt-3 text-3xl font-black leading-none text-black">
              {profile.firstName || '—'}
            </p>
          </div>

          <div className="rounded-[28px] border border-black/10 bg-white p-6 shadow-[0_14px_40px_rgba(0,0,0,0.06)]">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-black/40">
              Email
            </p>
            <p className="mt-3 break-all text-xl font-black leading-tight text-black">
              {profile.email || '—'}
            </p>
          </div>

          <div className="rounded-[28px] border border-black/10 bg-black p-6 text-white shadow-[0_14px_40px_rgba(0,0,0,0.12)]">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/55">
              Місто
            </p>
            <p className="mt-3 text-3xl font-black leading-none">
              {profile.city || '—'}
            </p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[30px] border border-black/10 bg-white p-6 shadow-[0_14px_40px_rgba(0,0,0,0.06)] sm:p-8">
            <div className="mb-8">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-black/45">
                Особисті дані
              </p>
              <h2 className="text-2xl font-black uppercase tracking-tight text-black">
                Інформація профілю
              </h2>
            </div>

            <div className="grid gap-5">
              <label className="block">
                <span className="mb-2 block text-[12px] font-bold uppercase tracking-[0.16em] text-black/45">
                  Ім’я
                </span>
                <input
                  type="text"
                  value={profile.firstName}
                  readOnly
                  className="h-14 w-full rounded-[18px] border border-black/10 bg-[#ededed] px-4 text-black/70 outline-none"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[12px] font-bold uppercase tracking-[0.16em] text-black/45">
                  Телефон
                </span>
                <input
                  type="text"
                  value={profile.phone}
                  readOnly
                  className="h-14 w-full rounded-[18px] border border-black/10 bg-[#ededed] px-4 text-black/70 outline-none"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[12px] font-bold uppercase tracking-[0.16em] text-black/45">
                  Місто
                </span>
                <input
                  type="text"
                  value={profile.city}
                  readOnly
                  className="h-14 w-full rounded-[18px] border border-black/10 bg-[#ededed] px-4 text-black/70 outline-none"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[12px] font-bold uppercase tracking-[0.16em] text-black/45">
                  Email
                </span>
                <input
                  type="email"
                  value={profile.email}
                  readOnly
                  className="h-14 w-full rounded-[18px] border border-black/10 bg-[#ededed] px-4 text-black/70 outline-none"
                />
              </label>
            </div>

            {pageStatus && (
              <p className="mt-5 rounded-[18px] bg-red-50 px-4 py-4 text-center text-sm font-semibold text-red-600">
                {pageStatus}
              </p>
            )}
          </div>

          <aside className="space-y-6">
            <div className="rounded-[30px] border border-black/10 bg-white p-6 shadow-[0_14px_40px_rgba(0,0,0,0.06)] sm:p-8">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-black/45">
                Обліковий запис
              </p>
              <h2 className="text-2xl font-black uppercase tracking-tight text-black">
                Інформація
              </h2>

              <div className="mt-6 space-y-4">
                <div className="rounded-[20px] bg-[#f6f6f6] p-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-black/40">
                    Дата реєстрації
                  </p>
                  <p className="mt-3 text-sm font-bold text-black">
                    {formatDate(profile.createdAt)}
                  </p>
                </div>

                <div className="rounded-[20px] bg-[#f6f6f6] p-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-black/40">
                    Останнє оновлення
                  </p>
                  <p className="mt-3 text-sm font-bold text-black">
                    {formatDate(profile.updatedAt)}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[30px] border border-black/10 bg-black p-6 text-white shadow-[0_14px_40px_rgba(0,0,0,0.12)] sm:p-8">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-white/55">
                Швидкий доступ
              </p>
              <h2 className="text-2xl font-black uppercase tracking-tight">
                Дії
              </h2>

              <div className="mt-6 grid gap-3">
                <button
                  onClick={() => navigate('/orders')}
                  className="rounded-full bg-white px-5 py-4 text-sm font-bold uppercase tracking-[0.12em] text-black transition hover:bg-[#ececec]"
                >
                  Відкрити мої замовлення
                </button>

                <button
                  onClick={() => navigate('/')}
                  className="rounded-full border border-white/20 px-5 py-4 text-sm font-bold uppercase tracking-[0.12em] text-white transition hover:bg-white hover:text-black"
                >
                  На головну
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Profile;