import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage('');

    const url = isLogin ? '/login' : '/register';
    const payload = isLogin ? { email: form.email, password: form.password } : form;

    const res = await fetch(`http://localhost:8108${url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.message || 'Помилка');
    } else {
      setMessage(data.message || 'Успіх!');
      if (data.token && data.user) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/');
      }
    }
  };

  return (
    <div style={{
      maxWidth: '400px',
      margin: '50px auto',
      padding: '20px',
      border: '1px solid #ccc',
      borderRadius: '8px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h2 style={{ textAlign: 'center' }}>{isLogin ? 'Вхід' : 'Реєстрація'}</h2>
      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <div style={{ marginBottom: '10px' }}>
            <label>Ім'я:</label><br />
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>
        )}
        <div style={{ marginBottom: '10px' }}>
          <label>Email:</label><br />
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Пароль:</label><br />
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <button
          type="submit"
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {isLogin ? 'Увійти' : 'Зареєструватись'}
        </button>
      </form>

      {message && <p style={{ marginTop: '10px', color: 'red', textAlign: 'center' }}>{message}</p>}

      <p style={{ marginTop: '20px', textAlign: 'center' }}>
        {isLogin ? 'Ще немає акаунта?' : 'Вже маєте акаунт?'}{' '}
        <button
          onClick={() => {
            setIsLogin(!isLogin);
            setMessage('');
          }}
          style={{
            background: 'none',
            border: 'none',
            color: '#007bff',
            cursor: 'pointer',
            textDecoration: 'underline',
            padding: 0,
            fontSize: '1em'
          }}
        >
          {isLogin ? 'Зареєструватись' : 'Увійти'}
        </button>
      </p>
    </div>
  );
}
