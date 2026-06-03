import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../../styles/AuthPage.module.css';

const API_BASE = import.meta.env.VITE_API_URL;

const NAME_REGEX = /^[A-Za-zА-Яа-яІіЇїЄєҐґ' -]{2,30}$/;
const PHONE_ALLOWED_REGEX = /^\+?[0-9\s\-()]+$/;
const CITY_REGEX = /^[A-Za-zА-Яа-яІіЇїЄєҐґ' -]{2,120}$/;

function validateName(name) {
  const value = name.trim();

  if (!value) return "Введіть ім'я";
  if (value.length < 2) return "Ім'я має містити мінімум 2 символи";
  if (value.length > 30) return "Ім'я не повинно бути довшим за 30 символів";
  if (!NAME_REGEX.test(value)) {
    return "Ім'я може містити лише літери, пробіл, апостроф або дефіс";
  }

  const words = value.split(/\s+/).filter(Boolean);
  if (words.length > 3) {
    return "Введіть тільки реальне ім'я без зайвих слів";
  }

  const compact = value.replace(/[' -]/g, '').toLowerCase();

  if (/^(.)\1{2,}$/i.test(compact)) {
    return "Ім'я виглядає некоректно";
  }

  const fakeNames = ['test', 'admin', 'user', 'qwerty', 'asdf'];
  if (fakeNames.includes(compact)) {
    return "Введіть, будь ласка, реальне ім'я";
  }

  return '';
}

function validateEmail(email) {
  const value = email.trim().toLowerCase();

  if (!value) return 'Введіть email';
  if (value.length > 100) return 'Email занадто довгий';
  if (value.includes('..')) return 'Email не може містити дві крапки підряд';

  const parts = value.split('@');
  if (parts.length !== 2) return 'Некоректний формат email';

  const [localPart, domain] = parts;

  if (!localPart || !domain) return 'Некоректний email';
  if (localPart.length < 3) return 'Email виглядає занадто коротким';
  if (localPart.length > 40) return 'Перша частина email занадто довга';
  if (domain.length < 4 || domain.length > 50) return 'Некоректний домен email';
  if (domain.startsWith('.') || domain.endsWith('.')) return 'Некоректний домен email';
  if (!domain.includes('.')) return 'Email має містити коректний домен';

  if (!/^[a-z0-9._%+-]+$/i.test(localPart)) {
    return 'Некоректний формат email';
  }

  const domainParts = domain.split('.');
  if (domainParts.length < 2) return 'Email має містити коректний домен';

  const tld = domainParts[domainParts.length - 1];
  if (!/^[a-z]{2,24}$/i.test(tld)) return 'Некоректний домен email';

  for (const label of domainParts) {
    if (!label) return 'Некоректний домен email';
    if (!/^[a-z0-9-]+$/i.test(label)) return 'Некоректний домен email';
    if (label.startsWith('-') || label.endsWith('-')) return 'Некоректний домен email';
    if (label.length > 24) return 'Некоректний домен email';
  }

  const fakeEmails = ['test@test.com', 'admin@gmail.com', 'user@gmail.com'];
  if (fakeEmails.includes(value)) {
    return 'Введіть, будь ласка, свій реальний email';
  }

  const gibberishMatch = localPart.match(/^[a-z]+$/i);
  if (gibberishMatch && localPart.length > 24) {
    return 'Введіть, будь ласка, реальний email';
  }

  return '';
}

function validatePassword(password) {
  if (!password) return 'Введіть пароль';
  if (password.length < 8) return 'Пароль має містити мінімум 8 символів';
  if (password.length > 64) return 'Пароль занадто довгий';
  if (/\s/.test(password)) return 'Пароль не повинен містити пробіли';
  if (!/[A-ZА-ЯІЇЄҐ]/.test(password)) {
    return 'Пароль має містити хоча б одну велику літеру';
  }
  if (!/[a-zа-яіїєґ]/.test(password)) {
    return 'Пароль має містити хоча б одну малу літеру';
  }
  if (!/\d/.test(password)) {
    return 'Пароль має містити хоча б одну цифру';
  }

  const weakPasswords = [
    'qwerty123',
    'password123',
    'admin123',
    '12345678',
    'qwertyui',
    'password',
  ];

  if (weakPasswords.includes(password.toLowerCase())) {
    return 'Оберіть складніший пароль';
  }

  if (/^(.)\1{5,}$/.test(password)) {
    return 'Пароль занадто простий';
  }

  return '';
}

function validatePhone(phone) {
  const value = phone.trim();

  if (!value) return 'Введіть номер телефону';
  if (!PHONE_ALLOWED_REGEX.test(value)) return 'Некоректний номер телефону';

  const digitsOnly = value.replace(/\D/g, '');

  if (/^(\d)\1+$/.test(digitsOnly)) {
    return 'Введіть реальний номер телефону';
  }

  if (digitsOnly.startsWith('380')) {
    if (digitsOnly.length !== 12) return 'Номер у форматі +380XXXXXXXXX';
    return '';
  }

  if (digitsOnly.startsWith('0')) {
    if (digitsOnly.length !== 10) return 'Номер у форматі 0XXXXXXXXX';
    return '';
  }

  return 'Введіть номер у форматі +380XXXXXXXXX або 0XXXXXXXXX';
}

function validateCity(city) {
  const value = city.trim();

  if (!value) return 'Введіть місто';
  if (value.length < 2) return 'Місто має містити мінімум 2 символи';
  if (value.length > 120) return 'Назва міста занадто довга';
  if (!CITY_REGEX.test(value)) {
    return 'Місто може містити лише літери, пробіл, апостроф або дефіс';
  }

  const normalized = value.replace(/[' -]/g, '').toLowerCase();

  if (/^(.)\1{2,}$/i.test(normalized)) {
    return 'Назва міста виглядає некоректно';
  }

  const fakeCities = ['test', 'admin', 'qwerty', 'asdf'];
  if (fakeCities.includes(normalized)) {
    return 'Введіть реальне місто';
  }

  return '';
}

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [showLoginOverlay, setShowLoginOverlay] = useState(false);
  const [loading, setLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    city: ''
  });

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const navigate = useNavigate();

  const resetMessage = () => {
    setMessage('');
    setMessageType('');
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;

    setLoginForm((prev) => ({
      ...prev,
      [name]: name === 'email' ? value.trimStart().toLowerCase() : value
    }));
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;

    setRegisterForm((prev) => ({
      ...prev,
      [name]: name === 'email' ? value.trimStart().toLowerCase() : value
    }));
  };

  const goToRegister = () => {
    resetMessage();
    setIsLogin(false);
  };

  const goToLogin = () => {
    resetMessage();
    setIsLogin(true);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    resetMessage();
    setLoading(true);

    const cleanedLoginForm = {
      email: loginForm.email.trim().toLowerCase(),
      password: loginForm.password
    };

    const emailError = validateEmail(cleanedLoginForm.email);
    if (emailError) {
      setMessageType('error');
      setMessage(emailError);
      setLoading(false);
      return;
    }

    if (!cleanedLoginForm.password) {
      setMessageType('error');
      setMessage('Введіть пароль');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedLoginForm)
      });

      const data = await res.json();

      if (!res.ok) {
        setMessageType('error');
        setMessage(data.message || 'Помилка входу');
        return;
      }

      if (data.token && data.user) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        window.dispatchEvent(new Event('userChanged'));

        setShowLoginOverlay(true);

        setTimeout(() => {
          navigate('/');
        }, 1200);
      }
    } catch {
      setMessageType('error');
      setMessage("Помилка зʼєднання з сервером");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    resetMessage();
    setLoading(true);

    const cleanedForm = {
      name: registerForm.name.trim(),
      email: registerForm.email.trim().toLowerCase(),
      password: registerForm.password,
      phone: registerForm.phone.trim(),
      city: registerForm.city.trim()
    };

    const nameError = validateName(cleanedForm.name);
    if (nameError) {
      setMessageType('error');
      setMessage(nameError);
      setLoading(false);
      return;
    }

    const emailError = validateEmail(cleanedForm.email);
    if (emailError) {
      setMessageType('error');
      setMessage(emailError);
      setLoading(false);
      return;
    }

    const passwordError = validatePassword(cleanedForm.password);
    if (passwordError) {
      setMessageType('error');
      setMessage(passwordError);
      setLoading(false);
      return;
    }

    const phoneError = validatePhone(cleanedForm.phone);
    if (phoneError) {
      setMessageType('error');
      setMessage(phoneError);
      setLoading(false);
      return;
    }

    const cityError = validateCity(cleanedForm.city);
    if (cityError) {
      setMessageType('error');
      setMessage(cityError);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedForm)
      });

      const data = await res.json();

      if (!res.ok) {
        setMessageType('error');
        setMessage(data.message || 'Помилка реєстрації');
        return;
      }

      setLoginForm((prev) => ({
        ...prev,
        email: cleanedForm.email
      }));

      setRegisterForm({
        name: '',
        email: '',
        password: '',
        phone: '',
        city: ''
      });

      setShowSuccessOverlay(true);

      setTimeout(() => {
        setShowSuccessOverlay(false);
        setIsLogin(true);
        setMessage('');
        setMessageType('');
      }, 1400);
    } catch {
      setMessageType('error');
      setMessage("Помилка зʼєднання з сервером");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.wrapperGlow}></div>

      <div className={styles.layout}>
        <div className={styles.hero}>
          <div className={styles.heroInner}>
            <div className={styles.brand}>ZYNK</div>

            <h1 className={styles.heroTitle}>
              {isLogin ? (
                <>
                  ВХІД В
                  <br />
                  АКАУНТ
                </>
              ) : (
                <>
                  СТВОРИ
                  <br />
                  АКАУНТ
                </>
              )}
            </h1>

            <p className={styles.heroText}>
              {isLogin
                ? 'Увійдіть, щоб керувати замовленнями та профілем'
                : 'Зареєструйтесь для швидких покупок'}
            </p>
          </div>
        </div>

        <div className={styles.cardScene}>
          <div className={`${styles.card3d} ${!isLogin ? styles.flipped : ''}`}>
            <div className={`${styles.cardFace} ${styles.cardFront}`}>
              {showLoginOverlay && (
                <div className={styles.successOverlay}>
                  <div className={styles.successCircle}>✓</div>
                  <h3 className={styles.successTitle}>Вхід успішний</h3>
                  <p className={styles.successText}>Переходимо в магазин...</p>
                </div>
              )}

              <h2 className={styles.cardTitle}>Вхід</h2>

              <form className={styles.form} onSubmit={handleLoginSubmit}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Email</label>
                  <input
                    className={styles.input}
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={loginForm.email}
                    onChange={handleLoginChange}
                    autoComplete="email"
                    maxLength={100}
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Пароль</label>
                  <input
                    className={styles.input}
                    type="password"
                    name="password"
                    placeholder="Пароль"
                    value={loginForm.password}
                    onChange={handleLoginChange}
                    autoComplete="current-password"
                    maxLength={64}
                    required
                  />
                </div>

                <button type="submit" className={styles.button} disabled={loading}>
                  {loading ? 'Входимо...' : 'Увійти'}
                </button>
              </form>

              {message && messageType === 'error' && isLogin && (
                <div className={`${styles.message} ${styles.errorMessage}`}>
                  <span className={styles.messageIcon}>!</span>
                  <span>{message}</span>
                </div>
              )}

              <div className={styles.switchText}>
                Немає акаунта?
                <button
                  type="button"
                  onClick={goToRegister}
                  className={styles.switchButton}
                >
                  Зареєструватись
                </button>
              </div>
            </div>

            <div className={`${styles.cardFace} ${styles.cardBack}`}>
              {showSuccessOverlay && (
                <div className={styles.successOverlay}>
                  <div className={styles.successCircle}>✓</div>
                  <h3 className={styles.successTitle}>Акаунт створено</h3>
                  <p className={styles.successText}>Переходимо до входу...</p>
                </div>
              )}

              <h2 className={styles.cardTitle}>Реєстрація</h2>

              <form className={styles.form} onSubmit={handleRegisterSubmit}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Ім'я</label>
                  <input
                    className={styles.input}
                    type="text"
                    name="name"
                    placeholder="Ім'я"
                    value={registerForm.name}
                    onChange={handleRegisterChange}
                    autoComplete="name"
                    maxLength={30}
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Email</label>
                  <input
                    className={styles.input}
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={registerForm.email}
                    onChange={handleRegisterChange}
                    autoComplete="email"
                    maxLength={100}
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Телефон</label>
                  <input
                    className={styles.input}
                    type="text"
                    name="phone"
                    placeholder="+380XXXXXXXXX"
                    value={registerForm.phone}
                    onChange={handleRegisterChange}
                    autoComplete="tel"
                    maxLength={17}
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Місто</label>
                  <input
                    className={styles.input}
                    type="text"
                    name="city"
                    placeholder="Київ"
                    value={registerForm.city}
                    onChange={handleRegisterChange}
                    autoComplete="address-level2"
                    maxLength={120}
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Пароль</label>
                  <input
                    className={styles.input}
                    type="password"
                    name="password"
                    placeholder="Пароль"
                    value={registerForm.password}
                    onChange={handleRegisterChange}
                    autoComplete="new-password"
                    minLength={8}
                    maxLength={64}
                    required
                  />
                </div>

                <button type="submit" className={styles.button} disabled={loading}>
                  {loading ? 'Створюємо...' : 'Створити акаунт'}
                </button>
              </form>

              {message && messageType === 'error' && !showSuccessOverlay && !isLogin && (
                <div className={`${styles.message} ${styles.errorMessage}`}>
                  <span className={styles.messageIcon}>!</span>
                  <span>{message}</span>
                </div>
              )}

              <div className={styles.switchText}>
                Вже є акаунт?
                <button
                  type="button"
                  onClick={goToLogin}
                  className={styles.switchButton}
                >
                  Увійти
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
