import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL;

const CartModal = ({ item, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    if (item && item.price !== undefined) {
      setTotalPrice(Number(item.price) * quantity);
    }
  }, [quantity, item]);

  if (!item) {
    console.warn('CartModal: item is null or undefined, not rendering modal.');
    return null;
  }

  const handleQuantityChange = (amount) => {
    setQuantity((prevQuantity) => Math.max(1, prevQuantity + amount));
  };

  const formatPrice = (price) => {
    if (price === undefined || price === null) return '0';
    return Number(price).toLocaleString('uk-UA');
  };

  let productName = '';
  let productDetails = '';
  let imageUrlAlt = 'Зображення товару';

  const isCpu = item.brand_cpu_name !== undefined;
  const isVideocard = item.brand_name !== undefined;
  const isMotherboard = item.brand_mb_name !== undefined;
  const isRam = item.brand_ram_name !== undefined;

  if (isCpu) {
    productName = `${item.brand_cpu_name || ''} ${item.name || ''}`.trim();
    imageUrlAlt = productName;
  } else if (isVideocard) {
    productName = `${item.brand_name || ''} ${item.model_name || ''}`.trim();
    imageUrlAlt = productName;

    const detailsParts = [];
    if (item.vendor_name) detailsParts.push(`Виробник: ${item.vendor_name}`);
    if (item.memory_capacity) {
      detailsParts.push(`Пам'ять: ${item.memory_capacity} ${item.memory_type || ''}`.trim());
    }
    if (item.interface_type) detailsParts.push(`Інтерфейс: ${item.interface_type}`);
    if (item.core_clock_ghz) detailsParts.push(`Частота: ${item.core_clock_ghz} ГГц`);
    productDetails = detailsParts.join(' • ');
  } else if (isMotherboard) {
    productName = `${item.brand_mb_name || ''} ${item.model_mb_name || item.name || ''}`.trim();
    imageUrlAlt = productName;

    const detailsParts = [];
    if (item.socket_mb_name) detailsParts.push(`Сокет: ${item.socket_mb_name}`);
    if (item.form_factor_mb_name) detailsParts.push(`Форм-фактор: ${item.form_factor_mb_name}`);
    if (item.memory_type_mb_name) detailsParts.push(`Пам'ять: ${item.memory_type_mb_name}`);
    productDetails = detailsParts.join(' • ');
  } else if (isRam) {
    productName = `${item.brand_ram_name || ''} ${item.name || ''}`.trim();
    imageUrlAlt = productName;

    const detailsParts = [];
    if (item.memory_size_ram_value) detailsParts.push(`${item.memory_size_ram_value}`);
    if (item.memory_type_ram_name) detailsParts.push(`${item.memory_type_ram_name}`);
    if (item.frequency_ram_value) detailsParts.push(`${item.frequency_ram_value}`);
    productDetails = detailsParts.join(' • ');
  } else {
    productName = item.name || item.id || 'Невідомий товар';
    imageUrlAlt = productName;
  }

  const handleCheckoutClick = () => {
    onClose();
    navigate('/checkout', {
      state: {
        item: {
          id: item.id,
          name: productName,
          price: item.price,
          image_url: item.image_url,
          type: isCpu
            ? 'cpu'
            : isVideocard
            ? 'videocard'
            : isMotherboard
            ? 'motherboard'
            : isRam
            ? 'ram'
            : 'unknown',

          vendor_name: item.vendor_name,
          memory_capacity: item.memory_capacity,
          memory_type: item.memory_type,
          interface_type: item.interface_type,
          core_clock_ghz: item.core_clock_ghz,
        },
        quantity,
        totalPrice,
      },
    });
  };

  const imageSrc = item.image_url
    ? `${API_BASE}/images/${encodeURIComponent(
        String(item.image_url).replace(/^\/+/, '')
      )}`
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.62)] p-4 backdrop-blur-[2px]">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-[30px] border border-black/10 bg-[#f5f5f5] shadow-[0_25px_80px_rgba(0,0,0,0.28)]">
        <div className="absolute inset-x-0 top-0 h-1 bg-black" />

        <div className="flex items-center justify-between border-b border-black/10 bg-white px-6 py-5 sm:px-8">
          <div>
            <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.22em] text-black/45">
              ZYNK STORE
            </p>
            <h2 className="text-2xl font-black uppercase tracking-tight text-black">
              Кошик
            </h2>
          </div>

          <button
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-[#f6f6f6] text-xl font-bold text-black transition hover:bg-black hover:text-white"
            aria-label="Закрити"
          >
            ×
          </button>
        </div>

        <div className="grid gap-6 p-6 sm:grid-cols-[220px_1fr] sm:p-8">
          <div className="rounded-[24px] bg-white p-4 shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
            <div className="flex h-[220px] items-center justify-center rounded-[18px] bg-[#f6f6f6]">
              {imageSrc ? (
                <img
                  src={imageSrc}
                  alt={imageUrlAlt}
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      `${API_BASE}/images/placeholder.jpg`;
                  }}
                />
              ) : (
                <div className="text-sm font-semibold text-black/35">No image</div>
              )}
            </div>
          </div>

          <div className="rounded-[24px] bg-white p-5 shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-black/45">
                  Обраний товар
                </p>
                <h3 className="max-w-[520px] text-2xl font-black leading-tight tracking-tight text-black">
                  {productName}
                </h3>
                {productDetails && (
                  <p className="mt-3 max-w-[560px] text-sm leading-6 text-black/60">
                    {productDetails}
                  </p>
                )}
                {item.product_code && (
                  <p className="mt-2 text-xs uppercase tracking-[0.16em] text-black/40">
                    Код: {item.product_code}
                  </p>
                )}
              </div>

              <div className="rounded-[18px] bg-[#f6f6f6] px-4 py-3 text-right">
                {item.old_price && (
                  <p className="text-sm text-black/35 line-through">
                    {formatPrice(item.old_price)} ₴
                  </p>
                )}
                <p className="mt-1 text-3xl font-black leading-none text-black">
                  {formatPrice(item.price)} ₴
                </p>
              </div>
            </div>

            <div className="mb-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[18px] bg-[#f6f6f6] px-4 py-4">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-black/40">
                  Кількість
                </p>
                <div className="inline-flex items-center overflow-hidden rounded-full border border-black/10 bg-white">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    className="flex h-11 w-11 items-center justify-center text-lg font-bold text-black transition hover:bg-black hover:text-white"
                  >
                    −
                  </button>
                  <span className="min-w-[56px] text-center text-base font-bold text-black">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="flex h-11 w-11 items-center justify-center text-lg font-bold text-black transition hover:bg-black hover:text-white"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="rounded-[18px] bg-[#f6f6f6] px-4 py-4">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-black/40">
                  Разом
                </p>
                <p className="text-3xl font-black leading-none text-black">
                  {formatPrice(totalPrice)} ₴
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={onClose}
                className="flex-1 rounded-full border border-black px-5 py-3.5 text-sm font-bold text-black transition hover:bg-black hover:text-white"
              >
                Продовжити покупки
              </button>
              <button
                onClick={handleCheckoutClick}
                className="flex-1 rounded-full bg-black px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#1b1b1b]"
              >
                Зробити замовлення
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartModal;
