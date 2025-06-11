import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import CartModal from "../CartModal"; // Переконайтеся, що шлях правильний

const CPUPage = () => { // Назва компонента змінена на CPUPage для консистентності
  // Стан для даних фільтрів CPU
  const [cpuBrands, setCpuBrands] = useState([]);
  const [cpuFamilies, setCpuFamilies] = useState([]);
  const [cpuModels, setCpuModels] = useState([]);
  const [cpuSockets, setCpuSockets] = useState([]);
  const [cpuCores, setCpuCores] = useState([]);

  // Стан для вибраних фільтрів CPU
  const [selectedCpuBrandId, setSelectedCpuBrandId] = useState(null);
  const [selectedCpuFamilyId, setSelectedCpuFamilyId] = useState(null);
  const [selectedCpuModelId, setSelectedCpuModelId] = useState(null);
  const [selectedCpuSocketIds, setSelectedCpuSocketIds] = useState([]);
  const [selectedCpuCoreIds, setSelectedCpuCoreIds] = useState([]);

  // Стан для списку процесорів та сортування
  const [cpus, setCpus] = useState([]);
  const [sortOrder, setSortOrder] = useState('popular');

  // Стан для модального вікна кошика
  const [showModal, setShowModal] = useState(false);
  const [selectedCpu, setSelectedCpu] = useState(null);

  const navigate = useNavigate();

  // Ефект для початкового завантаження брендів CPU, сокетів та ядер
  useEffect(() => {
    axios.get('http://localhost:8108/brands_cpu')
      .then(res => setCpuBrands(res.data))
      .catch(err => console.error("Помилка при завантаженні брендів CPU:", err));

    axios.get('http://localhost:8108/sockets_cpu')
      .then(res => setCpuSockets(res.data))
      .catch(err => console.error("Помилка при завантаженні сокетів CPU:", err));

    axios.get('http://localhost:8108/cores_cpu')
      .then(res => setCpuCores(res.data))
      .catch(err => console.error("Помилка при завантаженні кількості ядер CPU:", err));
  }, []);

  // Ефект для завантаження сімейств CPU на основі вибраного бренду CPU
  useEffect(() => {
    if (selectedCpuBrandId) {
      axios.get(`http://localhost:8108/families_cpu?brand_cpu_id=${selectedCpuBrandId}`)
        .then(res => setCpuFamilies(res.data))
        .catch(err => console.error("Помилка при завантаженні сімейств CPU:", err));
    } else {
      setCpuFamilies([]);
      setSelectedCpuFamilyId(null);
    }
  }, [selectedCpuBrandId]);

  // Ефект для завантаження моделей CPU на основі вибраного сімейства CPU
  useEffect(() => {
    if (selectedCpuFamilyId) {
      axios.get(`http://localhost:8108/models_cpu?family_cpu_id=${selectedCpuFamilyId}`)
        .then(res => setCpuModels(res.data))
        .catch(err => console.error("Помилка при завантаженні моделей CPU:", err));
    } else {
      setCpuModels([]);
      setSelectedCpuModelId(null);
    }
  }, [selectedCpuFamilyId]);

  // Ефект для завантаження списку процесорів на основі всіх фільтрів
  useEffect(() => {
    const params = {};
    if (selectedCpuBrandId) params.brand_cpu_id = selectedCpuBrandId;
    if (selectedCpuFamilyId) params.family_cpu_id = selectedCpuFamilyId;
    if (selectedCpuModelId) params.model_cpu_id = selectedCpuModelId;
    if (selectedCpuSocketIds.length) params.socket_cpu_id = selectedCpuSocketIds.join(',');
    if (selectedCpuCoreIds.length) params.cores_cpu_id = selectedCpuCoreIds.join(',');

    if (sortOrder === 'asc') params.sort = 'asc';
    else if (sortOrder === 'desc') params.sort = 'desc';
    else params.sort = 'popular';

    const query = new URLSearchParams(params).toString();

    axios.get(`http://localhost:8108/cpus?${query}`)
      .then(res => setCpus(res.data))
      .catch(err => console.error("Помилка при завантаженні процесорів:", err));
  }, [selectedCpuBrandId, selectedCpuFamilyId, selectedCpuModelId, selectedCpuSocketIds, selectedCpuCoreIds, sortOrder]);

  // Обробник перемикання для сокетів CPU
  const handleSocketToggle = (socketId) => {
    setSelectedCpuSocketIds(prev =>
      prev.includes(socketId)
        ? prev.filter(id => id !== socketId)
        : [...prev, socketId]
    );
  };

  // Обробник перемикання для кількості ядер CPU
  const handleCoreToggle = (coreId) => {
    setSelectedCpuCoreIds(prev =>
      prev.includes(coreId)
        ? prev.filter(id => id !== coreId)
        : [...prev, coreId]
    );
  };

  // Обробник додавання товару (CPU) до кошика
  const handleAddToCartClick = (cpu) => {
    setSelectedCpu(cpu);
    setShowModal(true);
  };

  return (
    <div className="flex">
      {/* Фільтри */}
      <div className="w-[250px] p-4 border-r">
        <h2 className="text-2xl font-bold mb-4">Фільтри</h2>

        {/* Бренди CPU */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Бренди CPU</h3>
          {cpuBrands.map(brand => (
            <div key={brand.id}>
              <label className="text-sm cursor-pointer">
                <input
                  type="radio"
                  name="cpuBrand"
                  value={brand.id}
                  checked={selectedCpuBrandId === brand.id}
                  onChange={() => setSelectedCpuBrandId(brand.id)}
                  className="mr-2"
                />
                {brand.name}
              </label>
            </div>
          ))}
          <button
            className="text-xs text-blue-600 mt-2"
            onClick={() => {
              setSelectedCpuBrandId(null);
              setSelectedCpuFamilyId(null);
              setSelectedCpuModelId(null);
            }}
          >
            Очистити бренд
          </button>
        </div>

        {/* Сімейства CPU */}
        {cpuFamilies.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Сімейство CPU</h3>
            {cpuFamilies.map(family => (
              <div key={family.id}>
                <label className="text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="cpuFamily"
                    value={family.id}
                    checked={selectedCpuFamilyId === family.id}
                    onChange={() => setSelectedCpuFamilyId(family.id)}
                    className="mr-2"
                  />
                  {family.name}
                </label>
              </div>
            ))}
            <button
              className="text-xs text-blue-600 mt-2"
              onClick={() => {
                setSelectedCpuFamilyId(null);
                setSelectedCpuModelId(null);
              }}
            >
              Очистити сімейство
            </button>
          </div>
        )}

        {/* ФІЛЬТР: Моделі CPU */}
        {cpuModels.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Модель CPU</h3>
            {cpuModels.map(model => (
              <div key={model.id}>
                <label className="text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="cpuModel"
                    value={model.id}
                    checked={selectedCpuModelId === model.id}
                    onChange={() => setSelectedCpuModelId(model.id)}
                    className="mr-2"
                  />
                  {model.name}
                </label>
              </div>
            ))}
            <button
              className="text-xs text-blue-600 mt-2"
              onClick={() => setSelectedCpuModelId(null)}
            >
              Очистити модель
            </button>
          </div>
        )}

        {/* Сокети CPU */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Сокети</h3>
          {cpuSockets.map(socket => (
            <div key={socket.id}>
              <label className="text-sm cursor-pointer">
                <input
                  type="checkbox"
                  value={socket.id}
                  checked={selectedCpuSocketIds.includes(socket.id)}
                  onChange={() => handleSocketToggle(socket.id)}
                  className="mr-2"
                />
                {socket.name}
              </label>
            </div>
          ))}
          <button
            className="text-xs text-blue-600 mt-2"
            onClick={() => setSelectedCpuSocketIds([])}
          >
            Очистити сокети
          </button>
        </div>

        {/* Кількість ядер CPU */}
        <div>
          <h3 className="font-semibold mb-2">Кількість ядер</h3>
          {cpuCores.map(core => (
            <div key={core.id}>
              <label className="text-sm cursor-pointer">
                <input
                  type="checkbox"
                  value={core.id}
                  checked={selectedCpuCoreIds.includes(core.id)}
                  onChange={() => handleCoreToggle(core.id)}
                  className="mr-2"
                />
                {core.number}
              </label>
            </div>
          ))}
          <button
            className="text-xs text-blue-600 mt-2"
            onClick={() => setSelectedCpuCoreIds([])}
          >
            Очистити ядра
          </button>
        </div>
      </div>

      {/* Товари (Процесори) */}
      <div className="flex-1 p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Процесори</h2>
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

        {cpus.length === 0 ? (
          <p>Немає результатів</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cpus.map(cpu => (
              <div key={cpu.id} className="relative border rounded-xl p-4 shadow hover:shadow-md transition flex flex-col justify-between">
                {cpu.image_url && (
                  <img
                    src={`http://localhost:8108/images${cpu.image_url}`}
                    alt={`${cpu.brand_cpu_name} ${cpu.name}`}
                    className="w-full h-48 object-contain mb-2"
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/192x192/E0E0E0/333333?text=No+Image'; }} // Fallback для зображень
                  />
                )}
                <div>
                  <h4 className="text-lg font-bold mb-1">
                    {cpu.brand_cpu_name} {cpu.name}
                  </h4>
                  {/* Рядки для Моделі, Сімейства, Сокета, Ядер - закоментовані */}
                  {/* {cpu.model_cpu_name && <p className="text-sm text-gray-600">Модель: {cpu.model_cpu_name}</p>} */}
                  {/* <p className="text-sm text-gray-600">Сімейство: {cpu.family_cpu_name}</p> */}
                  {/* <p className="text-sm text-gray-600">Сокет: {cpu.socket_cpu_name}</p> */}
                  {/* <p className="text-sm text-gray-600">Ядер: {cpu.cores_cpu_number}</p> */}
                  <p className="mt-2 font-semibold text-green-600">{cpu.price} грн</p>
                </div>

                <div className="flex justify-between items-center mt-4">
                  <span
                    className="text-black text-xs cursor-pointer"
                    onClick={() => navigate(`/cpus/${cpu.id}`)}
                  >
                    Детальніше про товар
                  </span>

                  <button
                    className="border border-black text-sm px-4 py-3 rounded-full hover:bg-black hover:text-white transition"
                    onClick={() => handleAddToCartClick(cpu)}
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
      {showModal && selectedCpu && (
        <CartModal item={selectedCpu} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
};

export default CPUPage;
