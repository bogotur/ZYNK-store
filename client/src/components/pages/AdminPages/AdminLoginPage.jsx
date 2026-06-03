import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL;

const AdminLoginPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [pageStatus, setPageStatus] = useState('');
  const [loginStage, setLoginStage] = useState('idle'); 

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

    if (!token) return;

    const decoded = parseJwt(token);

    if (decoded?.role === 'admin') {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPageStatus('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE}/login`, {
        email: formData.email,
        password: formData.password,
      });

      const token = response.data?.token;

      if (!token) {
        setPageStatus('Не вдалося отримати токен авторизації.');
        setLoading(false);
        return;
      }

      const decoded = parseJwt(token);

      if (!decoded || decoded.role !== 'admin') {
        setPageStatus('Доступ дозволено лише адміністратору.');
        setLoading(false);
        return;
      }

      sessionStorage.setItem('adminToken', token);
      setLoginStage('success');
      setPageStatus('Вхід успішний. Переходимо в адмінку...');
      setTimeout(() => navigate('/admin/dashboard'), 1800);
    } catch (error) {
      if (error.response?.data?.message) {
        setPageStatus(`Помилка: ${error.response.data.message}`);
      } else {
        setPageStatus('Не вдалося увійти в адмінку.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loginStage === 'success' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(0,0,0,0.72)] p-4 backdrop-blur-[4px]">
          <div className="w-full max-w-md rounded-[30px] border border-white/10 bg-white px-8 py-10 text-center shadow-[0_25px_80px_rgba(0,0,0,0.3)]">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-black text-white shadow-[0_15px_40px_rgba(0,0,0,0.18)] animate-[popIn_0.45s_ease]">
              <span className="text-4xl font-black">✓</span>
            </div>

            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.24em] text-black/45">
              ZYNK STORE
            </p>

            <h3 className="text-3xl font-black uppercase tracking-tight text-black">
              Вхід виконано
            </h3>

            <p className="mt-4 text-sm leading-6 text-black/60">
              Авторизацію адміністратора успішно підтверджено. Зараз відкриємо
              панель керування.
            </p>
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
          <div className="mb-8">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.24em] text-black/45">
              ZYNK STORE
            </p>
            <h1 className="text-4xl font-black uppercase tracking-tight text-black sm:text-5xl">
              admin
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-black/60">
              Авторизація адміністратора для доступу до панелі керування магазином.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <section className="rounded-[30px] border border-black/10 bg-black p-6 text-white shadow-[0_14px_40px_rgba(0,0,0,0.12)] sm:p-8">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-white/55">
                Admin access
              </p>
              <h2 className="text-3xl font-black uppercase tracking-tight">
                Панель керування
              </h2>

              <div className="mt-8 grid gap-4">
                <div className="rounded-[22px] bg-white/8 p-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/50">
                    Доступ
                  </p>
                  <p className="mt-3 text-lg font-bold text-white">
                    Тільки для адміністраторів
                  </p>
                </div>

                <div className="rounded-[22px] bg-white/8 p-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/50">
                    Після входу
                  </p>
                  <p className="mt-3 text-sm leading-6 text-white/70">
                    Ви отримаєте доступ до головної сторінки адмінки, де пізніше
                    будуть розділи замовлень, користувачів і складу.
                  </p>
                </div>

                <div className="rounded-[22px] bg-white px-5 py-6 text-black">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-black/40">
                    Поточний етап
                  </p>
                  <p className="mt-3 text-2xl font-black leading-none">
                    Вхід в адмінку
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
                  Адміністратор
                </p>
                <h2 className="text-2xl font-black uppercase tracking-tight text-black">
                  Увійти в панель
                </h2>
              </div>

              <div className="grid gap-5">
                <label className="block">
                  <span className="mb-2 block text-[12px] font-bold uppercase tracking-[0.16em] text-black/45">
                    Email
                  </span>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="h-14 w-full rounded-[18px] border border-black/10 bg-[#f6f6f6] px-4 text-black outline-none transition focus:border-black"
                    required
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-[12px] font-bold uppercase tracking-[0.16em] text-black/45">
                    Пароль
                  </span>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="h-14 w-full rounded-[18px] border border-black/10 bg-[#f6f6f6] px-4 text-black outline-none transition focus:border-black"
                    required
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={loading || loginStage !== 'idle'}
                className="mt-8 w-full rounded-full bg-black px-6 py-4 text-sm font-bold uppercase tracking-[0.12em] text-white transition hover:bg-[#1b1b1b] disabled:opacity-50"
              >
                {loading ? 'Вхід...' : 'Увійти в адмінку'}
              </button>

              {pageStatus && loginStage === 'idle' && (
                <p
                  className={`mt-5 rounded-[18px] px-4 py-4 text-center text-sm font-semibold ${
                    pageStatus.includes('успішний')
                      ? 'bg-green-50 text-green-700'
                      : 'bg-red-50 text-red-600'
                  }`}
                >
                  {pageStatus}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminLoginPage;