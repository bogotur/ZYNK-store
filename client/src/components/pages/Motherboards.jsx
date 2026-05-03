import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import CartModal from "../CartModal"; 

const Motherboard = () => {
  const [mbBrands, setMbBrands] = useState([]);
  const [mbModels, setMbModels] = useState([]); 
  const [mbSockets, setMbSockets] = useState([]);
  const [mbFormFactors, setMbFormFactors] = useState([]);
  const [mbMemoryTypes, setMbMemoryTypes] = useState([]);

  const [selectedMbBrandId, setSelectedMbBrandId] = useState(null);
  const [selectedMbModelId, setSelectedMbModelId] = useState(null); 
  const [selectedMbSocketIds, setSelectedMbSocketIds] = useState([]);
  const [selectedMbFormFactorIds, setSelectedMbFormFactorIds] = useState([]);
  const [selectedMbMemoryTypeIds, setSelectedMbMemoryTypeIds] = useState([]);

  const [motherboards, setMotherboards] = useState([]);
  const [sortOrder, setSortOrder] = useState('popular');

  const [showModal, setShowModal] = useState(false);
  const [selectedMotherboard, setSelectedMotherboard] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:8108/brands_mb')
      .then(res => setMbBrands(res.data))
      .catch(err => console.error("Помилка при завантаженні брендів MB:", err));

    axios.get('http://localhost:8108/sockets_mb')
      .then(res => setMbSockets(res.data))
      .catch(err => console.error("Помилка при завантаженні сокетів MB:", err));

    axios.get('http://localhost:8108/form_factors_mb')
      .then(res => setMbFormFactors(res.data))
      .catch(err => console.error("Помилка при завантаженні форм-факторів MB:", err));

    axios.get('http://localhost:8108/memory_types_mb')
      .then(res => setMbMemoryTypes(res.data))
      .catch(err => console.error("Помилка при завантаженні типів пам'яті MB:", err));
  }, []);

  useEffect(() => {
    if (selectedMbBrandId) {
      axios.get(`http://localhost:8108/models_mb?brand_mb_id=${selectedMbBrandId}`)
        .then(res => setMbModels(res.data))
        .catch(err => console.error("Помилка при завантаженні моделей MB:", err));
    } else {
      setMbModels([]);
      setSelectedMbModelId(null); 
    }
  }, [selectedMbBrandId]);

  useEffect(() => {
    const params = {};
    if (selectedMbBrandId) params.brand_mb_id = selectedMbBrandId;
    if (selectedMbModelId) params.model_mb_id = selectedMbModelId; 
    if (selectedMbSocketIds.length) params.socket_mb_id = selectedMbSocketIds.join(',');
    if (selectedMbFormFactorIds.length) params.form_factor_mb_id = selectedMbFormFactorIds.join(',');
    if (selectedMbMemoryTypeIds.length) params.memory_type_mb_id = selectedMbMemoryTypeIds.join(',');

    if (sortOrder === 'asc') params.sort = 'asc';
    else if (sortOrder === 'desc') params.sort = 'desc';
    else params.sort = 'popular';

    const query = new URLSearchParams(params).toString();

    axios.get(`http://localhost:8108/motherboards?${query}`)
      .then(res => setMotherboards(res.data))
      .catch(err => console.error("Помилка при завантаженні материнських плат:", err));
  }, [selectedMbBrandId, selectedMbModelId, selectedMbSocketIds, selectedMbFormFactorIds, selectedMbMemoryTypeIds, sortOrder]);

  const handleSocketMbToggle = (socketId) => {
    setSelectedMbSocketIds(prev =>
      prev.includes(socketId)
        ? prev.filter(id => id !== socketId)
        : [...prev, socketId]
    );
  };

  const handleFormFactorMbToggle = (formFactorId) => {
    setSelectedMbFormFactorIds(prev =>
      prev.includes(formFactorId)
        ? prev.filter(id => id !== formFactorId)
        : [...prev, formFactorId]
    );
  };

  const handleMemoryTypeMbToggle = (memoryTypeId) => {
    setSelectedMbMemoryTypeIds(prev =>
      prev.includes(memoryTypeId)
        ? prev.filter(id => id !== memoryTypeId)
        : [...prev, memoryTypeId]
    );
  };

  const handleAddToCartClick = (motherboard) => {
    setSelectedMotherboard(motherboard);
    setShowModal(true);
  };

  return (
    <div className="flex">
      <div className="w-[250px] p-4 border-r">
        <h2 className="text-2xl font-bold mb-4">Фільтри</h2>
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Бренди MB</h3>
          {mbBrands.map(brand => (
            <div key={brand.id}>
              <label className="text-sm cursor-pointer">
                <input
                  type="radio"
                  name="mbBrand"
                  value={brand.id}
                  checked={selectedMbBrandId === brand.id}
                  onChange={() => {
                    setSelectedMbBrandId(brand.id);
                    setSelectedMbModelId(null); 
                  }}
                  className="mr-2"
                />
                {brand.name}
              </label>
            </div>
          ))}
          <button
            className="text-xs text-blue-600 mt-2"
            onClick={() => {
              setSelectedMbBrandId(null);
              setSelectedMbModelId(null);
            }}
          >
            Очистити бренд
          </button>
        </div>

        {mbModels.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Модель MB</h3>
            {mbModels.map(model => (
              <div key={model.id}>
                <label className="text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="mbModel"
                    value={model.id}
                    checked={selectedMbModelId === model.id}
                    onChange={() => setSelectedMbModelId(model.id)}
                    className="mr-2"
                  />
                  {model.name}
                </label>
              </div>
            ))}
            <button
              className="text-xs text-blue-600 mt-2"
              onClick={() => setSelectedMbModelId(null)}
            >
              Очистити модель
            </button>
          </div>
        )}

        <div className="mb-6">
          <h3 className="font-semibold mb-2">Сокети</h3>
          {mbSockets.map(socket => (
            <div key={socket.id}>
              <label className="text-sm cursor-pointer">
                <input
                  type="checkbox"
                  value={socket.id}
                  checked={selectedMbSocketIds.includes(socket.id)}
                  onChange={() => handleSocketMbToggle(socket.id)}
                  className="mr-2"
                />
                {socket.name}
              </label>
            </div>
          ))}
          <button
            className="text-xs text-blue-600 mt-2"
            onClick={() => setSelectedMbSocketIds([])}
          >
            Очистити сокети
          </button>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold mb-2">Форм-фактор</h3>
          {mbFormFactors.map(formFactor => (
            <div key={formFactor.id}>
              <label className="text-sm cursor-pointer">
                <input
                  type="checkbox"
                  value={formFactor.id}
                  checked={selectedMbFormFactorIds.includes(formFactor.id)}
                  onChange={() => handleFormFactorMbToggle(formFactor.id)}
                  className="mr-2"
                />
                {formFactor.name}
              </label>
            </div>
          ))}
          <button
            className="text-xs text-blue-600 mt-2"
            onClick={() => setSelectedMbFormFactorIds([])}
          >
            Очистити форм-фактор
          </button>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Тип пам'яті</h3>
          {mbMemoryTypes.map(memoryType => (
            <div key={memoryType.id}>
              <label className="text-sm cursor-pointer">
                <input
                  type="checkbox"
                  value={memoryType.id}
                  checked={selectedMbMemoryTypeIds.includes(memoryType.id)}
                  onChange={() => handleMemoryTypeMbToggle(memoryType.id)}
                  className="mr-2"
                />
                {memoryType.name}
              </label>
            </div>
          ))}
          <button
            className="text-xs text-blue-600 mt-2"
            onClick={() => setSelectedMbMemoryTypeIds([])}
          >
            Очистити тип пам'яті
          </button>
        </div>
      </div>

      <div className="flex-1 p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Материнські плати</h2>
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

        {motherboards.length === 0 ? (
          <p>Немає результатів</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {motherboards.map(mb => (
              <div key={mb.id} className="relative border rounded-xl p-4 shadow hover:shadow-md transition flex flex-col justify-between">
                {mb.image_url && (
                  <img
                    src={`http://localhost:8108/images${mb.image_url}`}
                    alt={`${mb.brand_mb_name} ${mb.name}`}
                    className="w-full h-48 object-contain mb-2"
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/192x192/E0E0E0/333333?text=No+Image'; }} // Fallback для зображень
                  />
                )}
                <div>
                  <h4 className="text-lg font-bold mb-1">
                    {mb.brand_mb_name} {mb.model_mb_name ? mb.model_mb_name : mb.name}
                  </h4>
                  <p className="text-sm text-gray-600">Сокет: <span className="font-medium">{mb.socket_mb_name}</span></p>
                  <p className="text-sm text-gray-600">Форм-фактор: <span className="font-medium">{mb.form_factor_mb_name}</span></p>
                  <p className="text-sm text-gray-600">Тип пам'яті: <span className="font-medium">{mb.memory_type_mb_name}</span></p>
                  
                  <p className="mt-2 font-semibold text-green-600">{mb.price} грн</p>
                </div>

                <div className="flex justify-between items-center mt-4">
                  <span
                    className="text-black text-xs cursor-pointer"
                    onClick={() => navigate(`/motherboards/${mb.id}`)}
                  >
                    Детальніше про товар
                  </span>

                  <button
                    className="border border-black text-sm px-4 py-3 rounded-full hover:bg-black hover:text-white transition"
                    onClick={() => handleAddToCartClick(mb)}
                  >
                    Додати до кошика
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && selectedMotherboard && (
        <CartModal item={{ ...selectedMotherboard, product_type: 'motherboard' }} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
};

export default Motherboard;
