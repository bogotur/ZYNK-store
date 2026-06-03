import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import CartModal from "../CartModal"; 

const API_BASE = import.meta.env.VITE_API_URL;

const Ram = () => {
  const [ramBrands, setRamBrands] = useState([]);
  const [ramMemorySizes, setRamMemorySizes] = useState([]);
  const [ramMemoryTypes, setRamMemoryTypes] = useState([]);
  const [ramFrequencies, setRamFrequencies] = useState([]);

  const [selectedRamBrandId, setSelectedRamBrandId] = useState(null);
  const [selectedRamMemorySizeIds, setSelectedRamMemorySizeIds] = useState([]);
  const [selectedRamMemoryTypeIds, setSelectedRamMemoryTypeIds] = useState([]);
  const [selectedRamFrequencyIds, setSelectedRamFrequencyIds] = useState([]);

  const [ramModules, setRamModules] = useState([]);
  const [sortOrder, setSortOrder] = useState('popular'); 

  const [showModal, setShowModal] = useState(false);
  const [selectedRamModule, setSelectedRamModule] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API_BASE}/brands_ram`)
      .then(res => setRamBrands(res.data))
      .catch(err => console.error("Помилка при завантаженні брендів RAM:", err));

    axios.get(`${API_BASE}/memory_sizes_ram`)
      .then(res => setRamMemorySizes(res.data))
      .catch(err => console.error("Помилка при завантаженні обсягів пам'яті RAM:", err));

    axios.get(`${API_BASE}/memory_types_ram`)
      .then(res => setRamMemoryTypes(res.data))
      .catch(err => console.error("Помилка при завантаженні типів пам'яті RAM:", err));

    axios.get(`${API_BASE}/frequencies_ram`)
      .then(res => setRamFrequencies(res.data))
      .catch(err => console.error("Помилка при завантаженні частот RAM:", err));
  }, []); 

  useEffect(() => {
    const params = {};
    if (selectedRamBrandId) params.brand_ram_id = selectedRamBrandId;
    if (selectedRamMemorySizeIds.length) params.memory_size_ram_id = selectedRamMemorySizeIds.join(',');
    if (selectedRamMemoryTypeIds.length) params.memory_type_ram_id = selectedRamMemoryTypeIds.join(',');
    if (selectedRamFrequencyIds.length) params.frequency_ram_id = selectedRamFrequencyIds.join(',');

    if (sortOrder === 'asc') params.sort = 'asc';
    else if (sortOrder === 'desc') params.sort = 'desc';
    else params.sort = 'popular'; // За замовчуванням

    const query = new URLSearchParams(params).toString();

    axios.get(`${API_BASE}/ram_modules?${query}`)
      .then(res => setRamModules(res.data))
      .catch(err => console.error("Помилка при завантаженні модулів RAM:", err));
  }, [selectedRamBrandId, selectedRamMemorySizeIds, selectedRamMemoryTypeIds, selectedRamFrequencyIds, sortOrder]);

  const handleMemorySizeRamToggle = (sizeId) => {
    setSelectedRamMemorySizeIds(prev =>
      prev.includes(sizeId)
        ? prev.filter(id => id !== sizeId)
        : [...prev, sizeId]
    );
  };

  const handleMemoryTypeRamToggle = (typeId) => {
    setSelectedRamMemoryTypeIds(prev =>
      prev.includes(typeId)
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId]
    );
  };

  const handleFrequencyRamToggle = (frequencyId) => {
    setSelectedRamFrequencyIds(prev =>
      prev.includes(frequencyId)
        ? prev.filter(id => id !== frequencyId)
        : [...prev, frequencyId]
    );
  };

  const handleAddToCartClick = (ramModule) => {
    setSelectedRamModule(ramModule);
    setShowModal(true);
  };

  return (
    <div className="flex">
      <div className="w-[250px] p-4 border-r">
        <h2 className="text-2xl font-bold mb-4">Фільтри</h2>

        <div className="mb-6">
          <h3 className="font-semibold mb-2">Бренди RAM</h3>
          {ramBrands.map(brand => (
            <div key={brand.id}>
              <label className="text-sm cursor-pointer">
                <input
                  type="radio"
                  name="ramBrand"
                  value={brand.id}
                  checked={selectedRamBrandId === brand.id}
                  onChange={() => setSelectedRamBrandId(brand.id)}
                  className="mr-2"
                />
                {brand.name}
              </label>
            </div>
          ))}
          <button
            className="text-xs text-blue-600 mt-2"
            onClick={() => setSelectedRamBrandId(null)}
          >
            Очистити бренд
          </button>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold mb-2">Обсяг пам'яті</h3>
          {ramMemorySizes.map(size => (
            <div key={size.id}>
              <label className="text-sm cursor-pointer">
                <input
                  type="checkbox"
                  value={size.id}
                  checked={selectedRamMemorySizeIds.includes(size.id)}
                  onChange={() => handleMemorySizeRamToggle(size.id)}
                  className="mr-2"
                />
                {size.size}
              </label>
            </div>
          ))}
          <button
            className="text-xs text-blue-600 mt-2"
            onClick={() => setSelectedRamMemorySizeIds([])}
          >
            Очистити обсяг
          </button>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold mb-2">Тип пам'яті</h3>
          {ramMemoryTypes.map(type => (
            <div key={type.id}>
              <label className="text-sm cursor-pointer">
                <input
                  type="checkbox"
                  value={type.id}
                  checked={selectedRamMemoryTypeIds.includes(type.id)}
                  onChange={() => handleMemoryTypeRamToggle(type.id)}
                  className="mr-2"
                />
                {type.name}
              </label>
            </div>
          ))}
          <button
            className="text-xs text-blue-600 mt-2"
            onClick={() => setSelectedRamMemoryTypeIds([])}
          >
            Очистити тип
          </button>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold mb-2">Частота</h3>
          {ramFrequencies.map(frequency => (
            <div key={frequency.id}>
              <label className="text-sm cursor-pointer">
                <input
                  type="checkbox"
                  value={frequency.id}
                  checked={selectedRamFrequencyIds.includes(frequency.id)}
                  onChange={() => handleFrequencyRamToggle(frequency.id)}
                  className="mr-2"
                />
                {frequency.value}
              </label>
            </div>
          ))}
          <button
            className="text-xs text-blue-600 mt-2"
            onClick={() => setSelectedRamFrequencyIds([])}
          >
            Очистити частоту
          </button>
        </div>
      </div>

      <div className="flex-1 p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Оперативна пам'ять</h2>
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

        {ramModules.length === 0 ? (
          <p>Немає результатів</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ramModules.map(ram => (
              <div key={ram.id} className="relative border rounded-xl p-4 shadow hover:shadow-md transition flex flex-col justify-between">
                {ram.image_url && (
                  <img
                    src={`${API_BASE}/images${ram.image_url}`}
                    alt={`${ram.brand_ram_name} ${ram.name}`}
                    className="w-full h-48 object-contain mb-2"
                    onError={(e) => { e.target.onerror = null; e.target.src = `${API_BASE}/images/placeholder.jpg`; }} 
                  />
                )}
                <div>
                  <h4 className="text-lg font-bold mb-1">
                    {ram.brand_ram_name} {ram.name}
                  </h4>
                  <p className="text-sm">Обсяг: {ram.memory_size_ram_value}</p>
                  <p className="text-sm">Тип: {ram.memory_type_ram_name}</p>
                  <p className="text-sm">Частота: {ram.frequency_ram_value}</p>
                  <p className="mt-2 font-semibold text-green-600">{ram.price} грн</p>
                </div>

                <div className="flex justify-between items-center mt-4">
                  <span
                    className="text-black text-xs cursor-pointer"
                    onClick={() => navigate(`/ram_modules/${ram.id}`)}
                  >
                    Детальніше про товар
                  </span>

                  <button
                    className="border border-black text-sm px-4 py-3 rounded-full hover:bg-black hover:text-white transition"
                    onClick={() => handleAddToCartClick(ram)}
                  >
                    Додати до кошика
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && selectedRamModule && (
        <CartModal item={selectedRamModule} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
};

export default Ram;