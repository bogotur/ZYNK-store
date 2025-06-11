import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import CartModal from "../CartModal"; // Переконайтеся, що шлях правильний

const Videocards = () => {
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [cards, setCards] = useState([]);

  const [selectedBrandId, setSelectedBrandId] = useState(null);
  const [selectedModelId, setSelectedModelId] = useState(null);
  const [selectedVendorIds, setSelectedVendorIds] = useState([]);

  const [sortOrder, setSortOrder] = useState('popular');

  const [showModal, setShowModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:8108/brands')
      .then(res => setBrands(res.data))
      .catch(err => console.log(err));

    axios.get('http://localhost:8108/vendors')
      .then(res => setVendors(res.data))
      .catch(err => console.log(err));
  }, []);

  useEffect(() => {
    if (selectedBrandId) {
      axios.get(`http://localhost:8108/models?brand_id=${selectedBrandId}`)
        .then(res => setModels(res.data))
        .catch(err => console.log(err));
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

    axios.get(`http://localhost:8108/cards?${query}`)
      .then(res => setCards(res.data))
      .catch(err => console.log(err));
  }, [selectedBrandId, selectedModelId, selectedVendorIds, sortOrder]);

  const handleVendorToggle = (vendorId) => {
    setSelectedVendorIds(prev =>
      prev.includes(vendorId)
        ? prev.filter(id => id !== vendorId)
        : [...prev, vendorId]
    );
  };

  const handleAddToCartClick = (card) => {
    setSelectedCard(card);
    setShowModal(true);
  };

  return (
    <div className="flex">
      {/* Фільтри */}
      <div className="w-[250px] p-4 border-r">
        <h2 className="text-2xl font-bold mb-4">Фільтри</h2>

        {/* Бренди */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Бренди</h3>
          {brands.map(brand => (
            <div key={brand.id}>
              <label className="text-sm cursor-pointer">
                <input
                  type="radio"
                  name="brand"
                  value={brand.id}
                  checked={selectedBrandId === brand.id}
                  onChange={() => setSelectedBrandId(brand.id)}
                  className="mr-2"
                />
                {brand.name}
              </label>
            </div>
          ))}
          <button
            className="text-xs text-blue-600 mt-2"
            onClick={() => {
              setSelectedBrandId(null);
              setSelectedModelId(null);
            }}
          >
            Очистити бренд
          </button>
        </div>

        {/* Моделі */}
        {models.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Графічний чіп</h3>
            {models.map(model => (
              <div key={model.id}>
                <label className="text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="model"
                    value={model.id}
                    checked={selectedModelId === model.id}
                    onChange={() => setSelectedModelId(model.id)}
                    className="mr-2"
                  />
                  {model.name}
                </label>
              </div>
            ))}
            <button
              className="text-xs text-blue-600 mt-2"
              onClick={() => setSelectedModelId(null)}
            >
              Очистити модель
            </button>
          </div>
        )}

        {/* Виробники */}
        <div>
          <h3 className="font-semibold mb-2">Виробники</h3>
          {vendors.map(vendor => (
            <div key={vendor.id}>
              <label className="text-sm cursor-pointer">
                <input
                  type="checkbox"
                  value={vendor.id}
                  checked={selectedVendorIds.includes(vendor.id)}
                  onChange={() => handleVendorToggle(vendor.id)}
                  className="mr-2"
                />
                {vendor.name}
              </label>
            </div>
          ))}
          <button
            className="text-xs text-blue-600 mt-2"
            onClick={() => setSelectedVendorIds([])}
          >
            Очистити виробників
          </button>
        </div>
      </div>

      {/* Товари */}
      <div className="flex-1 p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Відеокарти</h2>
          <div className="space-x-2">
            <button
              className={`px-4 py-1 rounded bg-gray-200 font-semibold ${sortOrder === 'popular' ? 'bg-gray-400' : ''}`}
              onClick={() => setSortOrder('popular')}
            >
              За популярністю
            </button>
            <button
              className={`px-4 py-1 rounded bg-gray-200 font-semibold ${sortOrder === 'asc' ? 'bg-gray-400' : ''}`}
              onClick={() => setSortOrder('asc')}
            >
              Дешевше
            </button>
            <button
              className={`px-4 py-1 rounded bg-gray-200 font-semibold ${sortOrder === 'desc' ? 'bg-gray-400' : ''}`}
              onClick={() => setSortOrder('desc')}
            >
              Дорожче
            </button>
          </div>
        </div>

        {cards.length === 0 ? (
          <p>Немає результатів</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map(card => (
              <div key={card.id} className="relative border rounded-xl p-4 shadow hover:shadow-md transition flex flex-col justify-between">
                {card.image_url && (
                  <img
                    src={`http://localhost:8108/images${card.image_url}`}
                    alt={`${card.brand_name} ${card.model_name}`}
                    className="w-full h-48 object-contain mb-2"
                  />
                )}
                <div>
                  <h4 className="text-lg font-bold mb-1">
                    {card.brand_name} {card.model_name}
                  </h4>
                  <p className="text-sm text-gray-600">Виробник: {card.vendor_name}</p>
                  <p className="mt-2 font-semibold text-green-600">{card.price} грн</p>
                </div>

                <div className="flex justify-between items-center mt-4">
                  <span
                    className="text-black text-xs cursor-pointer"
                    onClick={() => navigate(`/videocards/${card.id}`)}
                  >
                    Детальніше про товар
                  </span>

                  <button
                    className="border border-black text-sm px-4 py-3 rounded-full hover:bg-black hover:text-white transition"
                    onClick={() => handleAddToCartClick(card)}
                  >
                    Додати до кошика
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Модальне вікно */}
      {showModal && selectedCard && (
        <CartModal item={selectedCard} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
};

export default Videocards;
