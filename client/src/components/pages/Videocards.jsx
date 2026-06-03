import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../CartContext';

const API_BASE = import.meta.env.VITE_API_URL;

const Videocards = () => {
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [cards, setCards] = useState([]);

  const [selectedBrandId, setSelectedBrandId] = useState(null);
  const [selectedModelId, setSelectedModelId] = useState(null);
  const [selectedVendorIds, setSelectedVendorIds] = useState([]);

  const [sortOrder, setSortOrder] = useState('popular');

  const navigate = useNavigate();
  const { addToCart } = useCart();

  useEffect(() => {
    axios
      .get(`${API_BASE}/api/videocards/brands`)
      .then((res) => setBrands(res.data))
      .catch((err) => console.log(err));

    axios
      .get(`${API_BASE}/api/videocards/vendors`)
      .then((res) => setVendors(res.data))
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    if (selectedBrandId) {
      axios
        .get(`${API_BASE}/api/videocards/models?brand_id=${selectedBrandId}`)
        .then((res) => setModels(res.data))
        .catch((err) => console.log(err));
    } else {
      setModels([]);
      setSelectedModelId(null);
    }
  }, [selectedBrandId]);

  useEffect(() => {
    const params = {};

    if (selectedBrandId) params.brand_id = selectedBrandId;
    if (selectedModelId) params.model_id = selectedModelId;
    if (selectedVendorIds.length) params.vendor_id = selectedVendorIds.join(',');
    if (sortOrder === 'asc') params.sort = 'asc';
    else if (sortOrder === 'desc') params.sort = 'desc';
    else params.sort = 'popular';

    const query = new URLSearchParams(params).toString();

    axios
      .get(`${API_BASE}/api/videocards/cards?${query}`)
      .then((res) => setCards(res.data))
      .catch((err) => console.log(err));
  }, [selectedBrandId, selectedModelId, selectedVendorIds, sortOrder]);

  const handleVendorToggle = (vendorId) => {
    setSelectedVendorIds((prev) =>
      prev.includes(vendorId)
        ? prev.filter((id) => id !== vendorId)
        : [...prev, vendorId]
    );
  };

  const getStockMeta = (card) => {
    const stock = Number(card.stock_quantity || 0);

    if (!card.is_active) {
      return {
        label: 'Недоступний',
        className: 'bg-[#f1f1f1] text-[#555] border-[#ddd]',
        canBuy: false,
      };
    }

    if (stock === 0) {
      return {
        label: 'Немає на складі',
        className: 'bg-[#ffe9e9] text-[#b42318] border-[#f4b0b0]',
        canBuy: false,
      };
    }

    if (stock <= 5) {
      return {
        label: 'Закінчується',
        className: 'bg-[#fff3d6] text-[#8a6300] border-[#f3d58a]',
        canBuy: true,
      };
    }

    return {
      label: 'В наявності',
      className: 'bg-[#e8f8ec] text-[#187a34] border-[#9fd8ae]',
      canBuy: true,
    };
  };

  const handleAddToCartClick = (card) => {
    const stockMeta = getStockMeta(card);
    if (!stockMeta.canBuy) return;

    addToCart({
      ...card,
      name: `${card.brand_name} ${card.model_name}`.trim(),
      product_type: 'videocard',
    });
  };

  return (
    <div className="flex bg-[#f5f5f5]">
      <div className="w-[250px] p-5 border-r border-black/10 bg-white">
        <h2 className="text-2xl font-black mb-6 uppercase tracking-tight">Фільтри</h2>

        <div className="mb-8">
          <h3 className="font-bold mb-3 uppercase text-sm tracking-wide">Бренди</h3>
          {brands.map((brand) => (
            <div key={brand.id} className="mb-2">
              <label className="text-sm cursor-pointer flex items-center gap-2">
                <input
                  type="radio"
                  name="brand"
                  value={brand.id}
                  checked={selectedBrandId === brand.id}
                  onChange={() => {
                    setSelectedBrandId(brand.id);
                    setSelectedModelId(null);
                  }}
                  className="accent-black"
                />
                {brand.name}
              </label>
            </div>
          ))}
          <button
            className="text-xs text-black/60 mt-2 hover:text-black transition"
            onClick={() => {
              setSelectedBrandId(null);
              setSelectedModelId(null);
            }}
          >
            Очистити бренд
          </button>
        </div>

        {models.length > 0 && (
          <div className="mb-8">
            <h3 className="font-bold mb-3 uppercase text-sm tracking-wide">Графічний чіп</h3>
            {models.map((model) => (
              <div key={model.id} className="mb-2">
                <label className="text-sm cursor-pointer flex items-center gap-2">
                  <input
                    type="radio"
                    name="model"
                    value={model.id}
                    checked={selectedModelId === model.id}
                    onChange={() => setSelectedModelId(model.id)}
                    className="accent-black"
                  />
                  {model.name}
                </label>
              </div>
            ))}
            <button
              className="text-xs text-black/60 mt-2 hover:text-black transition"
              onClick={() => setSelectedModelId(null)}
            >
              Очистити модель
            </button>
          </div>
        )}

        <div>
          <h3 className="font-bold mb-3 uppercase text-sm tracking-wide">Виробники</h3>
          {vendors.map((vendor) => (
            <div key={vendor.id} className="mb-2">
              <label className="text-sm cursor-pointer flex items-center gap-2">
                <input
                  type="checkbox"
                  value={vendor.id}
                  checked={selectedVendorIds.includes(vendor.id)}
                  onChange={() => handleVendorToggle(vendor.id)}
                  className="accent-black"
                />
                {vendor.name}
              </label>
            </div>
          ))}
          <button
            className="text-xs text-black/60 mt-2 hover:text-black transition"
            onClick={() => setSelectedVendorIds([])}
          >
            Очистити виробників
          </button>
        </div>
      </div>

      <div className="flex-1 p-5">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-4xl font-black tracking-tight uppercase">Відеокарти</h2>
          <div className="flex gap-2">
            <button
              className={`px-5 py-2 rounded-full border text-sm font-bold transition ${
                sortOrder === 'popular'
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-black border-black/10 hover:border-black'
              }`}
              onClick={() => setSortOrder('popular')}
            >
              За популярністю
            </button>
            <button
              className={`px-5 py-2 rounded-full border text-sm font-bold transition ${
                sortOrder === 'asc'
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-black border-black/10 hover:border-black'
              }`}
              onClick={() => setSortOrder('asc')}
            >
              Дешевше
            </button>
            <button
              className={`px-5 py-2 rounded-full border text-sm font-bold transition ${
                sortOrder === 'desc'
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-black border-black/10 hover:border-black'
              }`}
              onClick={() => setSortOrder('desc')}
            >
              Дорожче
            </button>
          </div>
        </div>

        {cards.length === 0 ? (
          <p className="text-black/60">Немає результатів</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-7">
            {cards.map((card) => {
              const stockMeta = getStockMeta(card);

              return (
                <div
                  key={card.id}
                  className="group relative overflow-hidden rounded-[28px] border border-black/10 bg-white p-5 shadow-[0_12px_35px_rgba(0,0,0,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(0,0,0,0.12)]"
                >
                  <div
                    className={`absolute left-4 top-4 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${stockMeta.className}`}
                  >
                    {stockMeta.label}
                  </div>

                  <div className="absolute right-4 top-4 rounded-full border border-black/10 bg-black px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white">
                    {card.vendor_name}
                  </div>

                  <div className="mb-4 rounded-[22px] bg-[#f6f6f6] p-4 pt-12">
                    {card.image_url ? (
                      <img
                        src={`${API_BASE}/images/${encodeURIComponent(card.image_url)}`}
                        alt={`${card.brand_name} ${card.model_name}`}
                        className="h-56 w-full object-contain transition duration-300 group-hover:scale-[1.03]"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            `${API_BASE}/images/placeholder.jpg`;
                        }}
                      />
                    ) : (
                      <div className="flex h-56 w-full items-center justify-center text-black/40">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-black/45">
                      {card.brand_name}
                    </p>
                    <h4 className="min-h-[56px] text-2xl font-black leading-[1.05] tracking-tight text-black">
                      {card.model_name}
                    </h4>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-5">
                    {card.memory_capacity && (
                      <div className="rounded-2xl bg-[#f6f6f6] px-4 py-3">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-black/40">Пам'ять</p>
                        <p className="mt-1 text-sm font-bold text-black">
                          {card.memory_capacity} {card.memory_type}
                        </p>
                      </div>
                    )}

                    {card.interface_type && (
                      <div className="rounded-2xl bg-[#f6f6f6] px-4 py-3">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-black/40">Інтерфейс</p>
                        <p className="mt-1 text-sm font-bold text-black">{card.interface_type}</p>
                      </div>
                    )}

                    {card.core_clock_ghz && (
                      <div className="col-span-2 rounded-2xl bg-[#f6f6f6] px-4 py-3">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-black/40">Частота</p>
                        <p className="mt-1 text-sm font-bold text-black">{card.core_clock_ghz} ГГц</p>
                      </div>
                    )}
                  </div>

                  <div className="mb-5 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-black/40">Ціна</p>
                      <p className="mt-1 text-3xl font-black leading-none text-black">
                        {Number(card.price).toFixed(0)} грн
                      </p>
                      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-black/45">
                        На складі: {Number(card.stock_quantity || 0)} шт.
                      </p>
                    </div>

                    <button
                      className={`rounded-full px-5 py-3 text-sm font-bold transition ${
                        stockMeta.canBuy
                          ? 'border border-black text-black hover:bg-black hover:text-white'
                          : 'cursor-not-allowed border border-black/10 bg-[#efefef] text-black/35'
                      }`}
                      onClick={() => stockMeta.canBuy && handleAddToCartClick(card)}
                      disabled={!stockMeta.canBuy}
                    >
                      {stockMeta.canBuy ? 'Додати' : 'Немає'}
                    </button>
                  </div>

                  <button
                    className="w-full rounded-full bg-[#f3f3f3] px-5 py-3 text-sm font-bold text-black transition hover:bg-black hover:text-white"
                    onClick={() => navigate(`/videocards/${card.id}`)}
                  >
                    Детальніше про товар
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Videocards;
