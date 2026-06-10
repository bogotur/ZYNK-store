import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL;

const PRODUCT_TYPES = [
  { value: 'all', label: 'Усі товари' },
  { value: 'videocard', label: 'Відеокарти' },
  { value: 'cpu', label: 'Процесори' },
  { value: 'motherboard', label: 'Материнські плати' },
  { value: 'ram', label: 'ОЗУ' },
  { value: 'case', label: 'Корпуси' },
  { value: 'cooling', label: 'Системи охолодження' },
  { value: 'mouse', label: 'Мишки' },
  { value: 'keyboard', label: 'Клавіатури' },
  { value: 'headphones', label: 'Навушники' },
  { value: 'controller', label: 'Контролери' },
  { value: 'ssd', label: 'SSD диски' },
  { value: 'psu', label: 'Блоки живлення' },
];

const getProductTypeLabel = (value) => {
  return PRODUCT_TYPES.find((type) => type.value === value)?.label || 'Інше';
};

const getInventoryTitle = (value) => {
  if (value === 'all') return 'Склад товарів';
  return `Склад: ${getProductTypeLabel(value).toLowerCase()}`;
};

const getCreateFormTitle = (value) => {
  return `Додати: ${getProductTypeLabel(value).toLowerCase()}`;
};

const PRODUCT_FIELD_CONFIG = {
  videocard: [
    { name: 'memory_capacity', placeholder: 'Пам’ять', type: 'text' },
    { name: 'memory_type', placeholder: 'Тип пам’яті', type: 'text' },
    { name: 'interface_type', placeholder: 'Інтерфейс', type: 'text' },
    { name: 'core_clock_ghz', placeholder: 'Частота ядра', type: 'number', step: '0.01' },
  ],
  cpu: [
    { name: 'memory_capacity', placeholder: 'Кількість ядер', type: 'text' },
    { name: 'memory_type', placeholder: 'Кількість потоків', type: 'text' },
    { name: 'interface_type', placeholder: 'Сокет', type: 'text' },
    { name: 'core_clock_ghz', placeholder: 'Частота, ГГц', type: 'number', step: '0.01' },
  ],
  motherboard: [
    { name: 'memory_capacity', placeholder: 'Чипсет', type: 'text' },
    { name: 'memory_type', placeholder: 'Тип пам’яті, напр. DDR5', type: 'text' },
    { name: 'interface_type', placeholder: 'Сокет', type: 'text' },
    { name: 'core_clock_ghz', placeholder: 'Форм-фактор', type: 'text' },
  ],
  ram: [
    { name: 'memory_capacity', placeholder: 'Обʼєм, напр. 32GB', type: 'text' },
    { name: 'memory_type', placeholder: 'Тип, напр. DDR5', type: 'text' },
    { name: 'interface_type', placeholder: 'Частота, напр. 6000MHz', type: 'text' },
    { name: 'core_clock_ghz', placeholder: 'Таймінги, напр. CL36', type: 'text' },
  ],
  case: [
    { name: 'memory_capacity', placeholder: 'Форм-фактор плат, напр. ATX', type: 'text' },
    { name: 'memory_type', placeholder: 'Розмір корпусу', type: 'text' },
    { name: 'interface_type', placeholder: 'Колір', type: 'text' },
  ],
  cooling: [
    { name: 'memory_capacity', placeholder: 'Тип охолодження', type: 'text' },
    { name: 'memory_type', placeholder: 'Сумісність сокетів', type: 'text' },
    { name: 'interface_type', placeholder: 'Розмір вентилятора/радіатора', type: 'text' },
  ],
  mouse: [
    { name: 'memory_capacity', placeholder: 'DPI', type: 'text' },
    { name: 'memory_type', placeholder: 'Підключення', type: 'text' },
    { name: 'interface_type', placeholder: 'Кількість кнопок', type: 'text' },
  ],
  keyboard: [
    { name: 'memory_capacity', placeholder: 'Тип клавіатури, напр. механічна', type: 'text' },
    { name: 'memory_type', placeholder: 'Свічі, напр. Red', type: 'text' },
    { name: 'interface_type', placeholder: 'Підключення, USB/Bluetooth', type: 'text' },
  ],
  headphones: [
    { name: 'memory_capacity', placeholder: 'Тип, напр. накладні', type: 'text' },
    { name: 'memory_type', placeholder: 'Підключення', type: 'text' },
    { name: 'interface_type', placeholder: 'Мікрофон', type: 'text' },
  ],
  controller: [
    { name: 'memory_capacity', placeholder: 'Сумісність', type: 'text' },
    { name: 'memory_type', placeholder: 'Підключення', type: 'text' },
    { name: 'interface_type', placeholder: 'Колір', type: 'text' },
  ],
  ssd: [
    { name: 'memory_capacity', placeholder: 'Обʼєм, напр. 1TB', type: 'text' },
    { name: 'memory_type', placeholder: 'Тип, напр. NVMe', type: 'text' },
    { name: 'interface_type', placeholder: 'Інтерфейс, напр. PCIe 4.0', type: 'text' },
  ],
  psu: [
    { name: 'memory_capacity', placeholder: 'Потужність, напр. 750W', type: 'text' },
    { name: 'memory_type', placeholder: 'Сертифікат, напр. 80+ Gold', type: 'text' },
    { name: 'interface_type', placeholder: 'Модульність', type: 'text' },
  ],
};

const getFieldsForProductType = (value) => {
  return PRODUCT_FIELD_CONFIG[value] || PRODUCT_FIELD_CONFIG.videocard;
};


const emptyForm = {
  product_type: 'videocard',
  brand_id: '',
  model_id: '',
  new_model_name: '',
  use_custom_model: false,
  vendor_id: '',
  image_url: '',
  memory_capacity: '',
  memory_type: '',
  interface_type: '',
  core_clock_ghz: '',
  price: '',
  stock_quantity: '0',
  is_active: true,
  sku: '',
};

const AdminInventoryPage = () => {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageStatus, setPageStatus] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [filterMode, setFilterMode] = useState('all');
  const [selectedProductType, setSelectedProductType] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [drafts, setDrafts] = useState({});

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [brands, setBrands] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [models, setModels] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [creating, setCreating] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const getToken = () => sessionStorage.getItem('adminToken');

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

  const authHeaders = () => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchMeta = async () => {
    try {
      const response = await axios.get(`${API_BASE}/admin/inventory/meta`, {
        headers: authHeaders(),
      });
      setBrands(response.data?.brands || []);
      setVendors(response.data?.vendors || []);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchModelsByBrand = async (brandId) => {
    if (!brandId) {
      setModels([]);
      return;
    }

    try {
      const response = await axios.get(
        `${API_BASE}/admin/inventory/models?brand_id=${brandId}`,
        {
          headers: authHeaders(),
        }
      );
      setModels(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.log(error);
      setModels([]);
    }
  };

  const fetchInventory = async () => {
    const token = getToken();

    if (!token) {
      setPageStatus('Потрібно увійти як адміністратор.');
      setLoading(false);
      setTimeout(() => navigate('/admin'), 1200);
      return;
    }

    const decoded = parseJwt(token);

    if (!decoded || decoded.role !== 'admin') {
      setPageStatus('Доступ тільки для адміністратора.');
      setLoading(false);
      setTimeout(() => navigate('/admin'), 1200);
      return;
    }

    try {
      const [inventoryResponse] = await Promise.all([
        axios.get(`${API_BASE}/admin/inventory`, {
          headers: authHeaders(),
        }),
        fetchMeta(),
      ]);

      const data = Array.isArray(inventoryResponse.data) ? inventoryResponse.data : [];
      setItems(data);

      const nextDrafts = {};
      data.forEach((item) => {
        nextDrafts[item.id] = {
          stock_quantity: item.stock_quantity ?? 0,
          price: item.price ?? 0,
          is_active: item.is_active ?? true,
          sku: item.sku || '',
          product_type: item.product_type || 'videocard',
        };
      });
      setDrafts(nextDrafts);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        setPageStatus('Сесія адміністратора недійсна. Увійдіть ще раз.');
        setTimeout(() => navigate('/admin'), 1400);
      } else {
        setPageStatus('Не вдалося завантажити склад.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  useEffect(() => {
    if (form.brand_id) {
      fetchModelsByBrand(form.brand_id);
    } else {
      setModels([]);
    }
  }, [form.brand_id]);

  const formatDate = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';

    return date.toLocaleString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (value) => {
    if (value === null || value === undefined) return '0 ₴';
    return `${Number(value).toLocaleString('uk-UA')} ₴`;
  };

  const filteredItems = useMemo(() => {
    const term = searchValue.trim().toLowerCase();

    return items.filter((item) => {
      const searchable = [
        item.brand_name,
        item.model_name,
        item.vendor_name,
        item.sku,
        item.memory_capacity,
        item.memory_type,
        item.product_type,
        getProductTypeLabel(item.product_type || 'videocard'),
      ]
        .map((v) => String(v || '').toLowerCase())
        .join(' ');

      const matchesSearch = !term || searchable.includes(term);

      const itemType = item.product_type || 'videocard';
      const matchesProductType =
        selectedProductType === 'all' || itemType === selectedProductType;

      const stock = Number(item.stock_quantity || 0);

      const matchesFilter =
        filterMode === 'all' ||
        (filterMode === 'active' && item.is_active) ||
        (filterMode === 'inactive' && !item.is_active) ||
        (filterMode === 'low' && stock > 0 && stock <= 5) ||
        (filterMode === 'empty' && stock === 0);

      return matchesSearch && matchesProductType && matchesFilter;
    });
  }, [items, searchValue, filterMode, selectedProductType]);

  const totalItems = items.length;
  const lowStockCount = items.filter((item) => {
    const stock = Number(item.stock_quantity || 0);
    return stock > 0 && stock <= 5;
  }).length;
  const outOfStockCount = items.filter((item) => Number(item.stock_quantity || 0) === 0).length;
  const activeCount = items.filter((item) => item.is_active).length;

  const categoryCounts = useMemo(() => {
    return items.reduce((acc, item) => {
      const type = item.product_type || 'videocard';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
  }, [items]);

  const getStockMeta = (stock) => {
    const value = Number(stock || 0);

    if (value === 0) {
      return {
        label: 'Немає в наявності',
        className: 'bg-[#ffe9e9] text-[#b42318] border-[#f4b0b0]',
      };
    }

    if (value <= 5) {
      return {
        label: 'Мало на складі',
        className: 'bg-[#fff3d6] text-[#8a6300] border-[#f3d58a]',
      };
    }

    return {
      label: 'В наявності',
      className: 'bg-[#e8f8ec] text-[#187a34] border-[#9fd8ae]',
    };
  };

  const handleDraftChange = (id, field, value) => {
    setDrafts((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const saveItem = async (id) => {
    try {
      setEditingId(id);

      const payload = drafts[id];

      const response = await axios.patch(
        `${API_BASE}/admin/inventory/${id}`,
        {
          stock_quantity: Number(payload.stock_quantity),
          price: Number(payload.price),
          is_active: Boolean(payload.is_active),
          sku: payload.sku,
        },
        { headers: authHeaders() }
      );

      const updated = response.data?.item;

      if (updated) {
        setItems((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  ...updated,
                }
              : item
          )
        );
      }
    } catch (error) {
      alert(error?.response?.data?.message || 'Не вдалося оновити товар на складі');
    } finally {
      setEditingId(null);
    }
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
      ...(field === 'brand_id'
        ? { model_id: '', new_model_name: '', use_custom_model: false }
        : {}),
      ...(field === 'use_custom_model'
        ? { model_id: '', new_model_name: '' }
        : {}),
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);

      const data = new FormData();
      data.append('image', file);

      const response = await axios.post(
        `${API_BASE}/admin/inventory/upload-image`,
        data,
        {
          headers: {
            ...authHeaders(),
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data?.image_url) {
        setForm((prev) => ({
          ...prev,
          image_url: response.data.image_url,
        }));
      }
    } catch (error) {
      alert(error?.response?.data?.message || 'Не вдалося завантажити зображення');
    } finally {
      setUploadingImage(false);
    }
  };

  const createItem = async () => {
    try {
      setCreating(true);

      if (!form.brand_id) {
        alert('Оберіть бренд');
        return;
      }

      if (form.use_custom_model && !form.new_model_name.trim()) {
        alert('Введіть назву нової моделі');
        return;
      }

      if (!form.use_custom_model && !form.model_id) {
        alert('Оберіть модель або додайте нову');
        return;
      }

      let finalModelId = form.model_id;

      if (form.use_custom_model) {
        const modelResponse = await axios.post(
          `${API_BASE}/admin/inventory/models`,
          {
            brand_id: form.brand_id,
            name: form.new_model_name.trim(),
          },
          { headers: authHeaders() }
        );

        finalModelId = modelResponse.data?.model?.id;

        if (!finalModelId) {
          throw new Error('Не вдалося створити нову модель');
        }
      }

      const response = await axios.post(
        `${API_BASE}/admin/inventory`,
        {
          ...form,
          model_id: finalModelId,
          price: Number(form.price),
          stock_quantity: Number(form.stock_quantity || 0),
          core_clock_ghz:
            form.product_type === 'videocard' || form.product_type === 'cpu'
              ? form.core_clock_ghz
                ? Number(form.core_clock_ghz)
                : null
              : form.core_clock_ghz,
        },
        { headers: authHeaders() }
      );

      const createdItem = response.data?.item;

      if (createdItem) {
        await fetchInventory();
        setForm(emptyForm);
        setModels([]);
        setShowCreateForm(false);
      }
    } catch (error) {
      alert(error?.response?.data?.message || error.message || 'Не вдалося додати товар');
    } finally {
      setCreating(false);
    }
  };


  const deleteItem = async (id) => {
    const confirmed = window.confirm('Видалити цей товар зі складу?');
    if (!confirmed) return;

    try {
      setEditingId(id);

      await axios.delete(`${API_BASE}/admin/inventory/${id}`, {
        headers: authHeaders(),
      });

      setItems((prev) => prev.filter((item) => item.id !== id));

      setDrafts((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } catch (error) {
      alert(error?.response?.data?.message || 'Не вдалося видалити товар');
    } finally {
      setEditingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1280px]">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.24em] text-black/45">
              ZYNK STORE
            </p>
            <h1 className="text-4xl font-black uppercase tracking-tight text-black sm:text-5xl">
              Адмін - склад
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-black/60">
              Контролюйте залишки, змінюйте ціну, активність товарів та швидко
              відстежуйте позиції з низьким запасом.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowCreateForm((prev) => !prev)}
              className="rounded-full border border-black px-5 py-3 text-sm font-bold text-black transition hover:bg-black hover:text-white"
            >
              {showCreateForm ? 'Закрити форму' : 'Додати товар'}
            </button>

            <button
              onClick={() => navigate('/admin/dashboard')}
              className="rounded-full border border-black px-5 py-3 text-sm font-bold text-black transition hover:bg-black hover:text-white"
            >
              До панелі керування
            </button>
            <button
              onClick={() => navigate('/')}
              className="rounded-full bg-black px-5 py-3 text-sm font-bold text-white transition hover:bg-[#1a1a1a]"
            >
              На сайт
            </button>
          </div>
        </div>

        {showCreateForm && (
          <div className="mb-8 rounded-[28px] border border-black/10 bg-white p-5 shadow-[0_12px_34px_rgba(0,0,0,0.05)] sm:p-6">
            <div className="mb-5">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-black/45">
                Новий товар
              </p>
              <h2 className="text-2xl font-black uppercase tracking-tight text-black">
                {getCreateFormTitle(form.product_type)}
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <select
                value={form.product_type}
                onChange={(e) => handleFormChange('product_type', e.target.value)}
                className="h-14 rounded-[18px] border border-black/10 bg-[#f6f6f6] px-4 text-sm font-medium text-black outline-none"
              >
                {PRODUCT_TYPES.filter((type) => type.value !== 'all').map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>

              <select
                value={form.brand_id}
                onChange={(e) => handleFormChange('brand_id', e.target.value)}
                className="h-14 rounded-[18px] border border-black/10 bg-[#f6f6f6] px-4 text-sm font-medium text-black outline-none"
              >
                <option value="">Оберіть бренд</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>

              <div className="space-y-3">
                <select
                  value={form.use_custom_model ? 'custom' : form.model_id}
                  onChange={(e) => {
                    if (e.target.value === 'custom') {
                      handleFormChange('use_custom_model', true);
                    } else {
                      setForm((prev) => ({
                        ...prev,
                        use_custom_model: false,
                        new_model_name: '',
                        model_id: e.target.value,
                      }));
                    }
                  }}
                  disabled={!form.brand_id}
                  className="h-14 w-full rounded-[18px] border border-black/10 bg-[#f6f6f6] px-4 text-sm font-medium text-black outline-none disabled:opacity-50"
                >
                  <option value="">
                    {form.brand_id ? 'Оберіть модель' : 'Спочатку оберіть бренд'}
                  </option>
                  {models.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))}
                  <option value="custom">+ Додати нову модель</option>
                </select>

                {form.use_custom_model && (
                  <input
                    type="text"
                    placeholder="Назва нової моделі, напр. RTX 4070 SUPER"
                    value={form.new_model_name}
                    onChange={(e) => handleFormChange('new_model_name', e.target.value)}
                    className="h-14 w-full rounded-[18px] border border-black/10 bg-[#f6f6f6] px-4 text-sm font-medium text-black outline-none"
                  />
                )}
              </div>

              <select
                value={form.vendor_id}
                onChange={(e) => handleFormChange('vendor_id', e.target.value)}
                className="h-14 rounded-[18px] border border-black/10 bg-[#f6f6f6] px-4 text-sm font-medium text-black outline-none"
              >
                <option value="">Оберіть виробника</option>
                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </option>
                ))}
              </select>

              {getFieldsForProductType(form.product_type).map((field) => (
                <input
                  key={field.name}
                  type={field.type}
                  step={field.step}
                  placeholder={field.placeholder}
                  value={form[field.name]}
                  onChange={(e) => handleFormChange(field.name, e.target.value)}
                  className="h-14 rounded-[18px] border border-black/10 bg-[#f6f6f6] px-4 text-sm font-medium text-black outline-none"
                />
              ))}

              <input
                type="number"
                min="0"
                placeholder="Ціна"
                value={form.price}
                onChange={(e) => handleFormChange('price', e.target.value)}
                className="h-14 rounded-[18px] border border-black/10 bg-[#f6f6f6] px-4 text-sm font-medium text-black outline-none"
              />

              <input
                type="number"
                min="0"
                placeholder="Кількість на складі"
                value={form.stock_quantity}
                onChange={(e) => handleFormChange('stock_quantity', e.target.value)}
                className="h-14 rounded-[18px] border border-black/10 bg-[#f6f6f6] px-4 text-sm font-medium text-black outline-none"
              />

              <input
                type="text"
                placeholder="SKU"
                value={form.sku}
                onChange={(e) => handleFormChange('sku', e.target.value)}
                className="h-14 rounded-[18px] border border-black/10 bg-[#f6f6f6] px-4 text-sm font-medium text-black outline-none"
              />

              <label className="flex h-14 items-center justify-between rounded-[18px] border border-black/10 bg-[#f6f6f6] px-4">
                <span className="text-sm font-bold text-black">Активний товар</span>
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => handleFormChange('is_active', e.target.checked)}
                  className="h-4 w-4 accent-black"
                />
              </label>

              <div className="sm:col-span-2 lg:col-span-3 rounded-[18px] border border-dashed border-black/15 bg-[#fafafa] p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-sm font-bold text-black">Зображення товару</p>
                    <p className="mt-1 text-sm text-black/60">
                      Завантаж файл, а в базу збережеться тільки його назва.
                    </p>
                    {form.image_url && (
                      <p className="mt-2 text-xs font-bold uppercase tracking-[0.12em] text-black/45">
                        {form.image_url}
                      </p>
                    )}
                  </div>

                  <label className="cursor-pointer rounded-full border border-black px-5 py-3 text-sm font-bold text-black transition hover:bg-black hover:text-white">
                    {uploadingImage ? 'Завантаження...' : 'Завантажити зображення'}
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={createItem}
                disabled={creating || uploadingImage}
                className="rounded-full bg-black px-5 py-3 text-sm font-bold text-white transition hover:bg-[#1a1a1a] disabled:opacity-50"
              >
                {creating ? 'Створення...' : 'Створити товар'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setForm(emptyForm);
                  setModels([]);
                }}
                className="rounded-full border border-black px-5 py-3 text-sm font-bold text-black transition hover:bg-black hover:text-white"
              >
                Очистити форму
              </button>
            </div>
          </div>
        )}

        <div className="mb-8 grid gap-5 md:grid-cols-4">
          <div className="rounded-[26px] border border-black/10 bg-white p-6 shadow-[0_12px_34px_rgba(0,0,0,0.05)]">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-black/40">
              Позицій
            </p>
            <p className="mt-3 text-4xl font-black leading-none text-black">
              {totalItems}
            </p>
          </div>

          <div className="rounded-[26px] border border-black/10 bg-white p-6 shadow-[0_12px_34px_rgba(0,0,0,0.05)]">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-black/40">
              Активні
            </p>
            <p className="mt-3 text-4xl font-black leading-none text-black">
              {activeCount}
            </p>
          </div>

          <div className="rounded-[26px] border border-black/10 bg-white p-6 shadow-[0_12px_34px_rgba(0,0,0,0.05)]">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-black/40">
              Мало на складі
            </p>
            <p className="mt-3 text-4xl font-black leading-none text-black">
              {lowStockCount}
            </p>
          </div>

          <div className="rounded-[26px] border border-black/10 bg-black p-6 text-white shadow-[0_14px_40px_rgba(0,0,0,0.12)]">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/55">
              Немає в наявності
            </p>
            <p className="mt-3 text-4xl font-black leading-none">
              {outOfStockCount}
            </p>
          </div>
        </div>

        <div className="mb-8 rounded-[28px] border border-black/10 bg-white p-5 shadow-[0_12px_34px_rgba(0,0,0,0.05)] sm:p-6">
          <div className="mb-4">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-black/45">
              Категорії
            </p>
            <h2 className="text-2xl font-black uppercase tracking-tight text-black">
              Поділ товарів
            </h2>
          </div>

          <div className="flex flex-wrap gap-3">
            {PRODUCT_TYPES.map((type) => {
              const count =
                type.value === 'all' ? items.length : categoryCounts[type.value] || 0;

              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setSelectedProductType(type.value)}
                  className={`rounded-full px-4 py-3 text-sm font-bold transition ${
                    selectedProductType === type.value
                      ? 'bg-black text-white'
                      : 'border border-black/10 bg-[#f6f6f6] text-black hover:bg-black hover:text-white'
                  }`}
                >
                  {type.label} <span className="opacity-60">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-8 rounded-[28px] border border-black/10 bg-white p-5 shadow-[0_12px_34px_rgba(0,0,0,0.05)] sm:p-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-black/45">
                Пошук і фільтр
              </p>
              <h2 className="text-2xl font-black uppercase tracking-tight text-black">
                {getInventoryTitle(selectedProductType)}
              </h2>
            </div>
            <div className="rounded-full bg-[#f3f3f3] px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-black/55">
              {filteredItems.length} знайдено
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Пошук по бренду, моделі, виробнику, SKU або пам’яті"
              className="h-14 w-full rounded-full border border-black/10 bg-[#f6f6f6] px-5 text-sm font-medium text-black outline-none transition focus:border-black"
            />

            <div className="flex flex-wrap gap-3">
              {[
                ['all', 'Усі'],
                ['active', 'Активні'],
                ['inactive', 'Неактивні'],
                ['low', 'Мало'],
                ['empty', 'Немає'],
              ].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFilterMode(key)}
                  className={`rounded-full px-4 py-3 text-sm font-bold transition ${
                    filterMode === key
                      ? 'bg-black text-white'
                      : 'border border-black/10 bg-[#f6f6f6] text-black hover:bg-black hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="rounded-[28px] border border-black/10 bg-white p-10 text-center shadow-[0_12px_34px_rgba(0,0,0,0.05)]">
            <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-black/15 border-t-black" />
            <p className="text-lg font-semibold text-black/70">Завантажуємо склад...</p>
          </div>
        ) : pageStatus ? (
          <div className="rounded-[28px] border border-red-200 bg-white p-10 text-center shadow-[0_12px_34px_rgba(0,0,0,0.05)]">
            <p className="text-lg font-semibold text-red-600">{pageStatus}</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-[28px] border border-black/10 bg-white p-10 text-center shadow-[0_12px_34px_rgba(0,0,0,0.05)]">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-black/40">ADMIN</p>
            <h3 className="mt-3 text-3xl font-black uppercase tracking-tight text-black">Позицій не знайдено</h3>
          </div>
        ) : (
          <div className="grid gap-5">
            {filteredItems.map((item) => {
              const stockMeta = getStockMeta(item.stock_quantity);
              const draft = drafts[item.id] || {
                stock_quantity: 0,
                price: 0,
                is_active: true,
                sku: '',
              };

              return (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-[0_12px_34px_rgba(0,0,0,0.05)]"
                >
                  <div className="border-b border-black/8 px-6 py-5 sm:px-8">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-black/40">
                          SKU {draft.sku || item.sku || '—'}
                        </p>
                        <h3 className="text-2xl font-black tracking-tight text-black">
                          {item.brand_name} {item.model_name}
                        </h3>
                        <p className="mt-2 text-sm text-black/55">
                          {getProductTypeLabel(item.product_type || 'videocard')} • {item.vendor_name} • {item.memory_capacity || '—'} {item.memory_type || ''}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-full border border-black/10 bg-[#f6f6f6] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-black">
                          {getProductTypeLabel(item.product_type || 'videocard')}
                        </span>
                        <span
                          className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] ${stockMeta.className}`}
                        >
                          {stockMeta.label}
                        </span>
                        <span
                          className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] ${
                            draft.is_active
                              ? 'bg-black text-white'
                              : 'border border-black/10 bg-[#f6f6f6] text-black'
                          }`}
                        >
                          {draft.is_active ? 'Активний' : 'Неактивний'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-5 p-6 sm:p-8 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-[20px] bg-[#f6f6f6] p-5">
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-black/40">Виробник</p>
                        <p className="mt-3 text-lg font-black text-black">{item.vendor_name}</p>
                      </div>

                      <div className="rounded-[20px] bg-[#f6f6f6] p-5">
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-black/40">Інтерфейс</p>
                        <p className="mt-3 text-lg font-black text-black">{item.interface_type || '—'}</p>
                      </div>

                      <div className="rounded-[20px] bg-[#f6f6f6] p-5">
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-black/40">Частота</p>
                        <p className="mt-3 text-lg font-black text-black">
                          {item.core_clock_ghz ? `${item.core_clock_ghz} ГГц` : '—'}
                        </p>
                      </div>

                      <div className="rounded-[20px] bg-[#f6f6f6] p-5">
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-black/40">Оновлено</p>
                        <p className="mt-3 text-base font-bold text-black">{formatDate(item.updated_at)}</p>
                      </div>
                    </div>

                    <div className="rounded-[22px] bg-black p-6 text-white">
                      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/55">
                        Керування складом
                      </p>

                      <div className="mt-5 space-y-4">
                        <div className="rounded-[18px] bg-white/8 px-4 py-4">
                          <label className="block">
                            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/50">
                              SKU
                            </span>
                            <input
                              type="text"
                              value={draft.sku}
                              onChange={(e) => handleDraftChange(item.id, 'sku', e.target.value)}
                              className="mt-3 h-12 w-full rounded-[14px] border border-white/10 bg-white px-4 text-sm font-bold text-black outline-none"
                              placeholder="Наприклад GPU-RTX4070-01"
                            />
                          </label>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="rounded-[18px] bg-white/8 px-4 py-4">
                            <label className="block">
                              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/50">
                                Кількість
                              </span>
                              <input
                                type="number"
                                min="0"
                                value={draft.stock_quantity}
                                onChange={(e) =>
                                  handleDraftChange(item.id, 'stock_quantity', e.target.value)
                                }
                                className="mt-3 h-12 w-full rounded-[14px] border border-white/10 bg-white px-4 text-sm font-bold text-black outline-none"
                              />
                            </label>
                          </div>

                          <div className="rounded-[18px] bg-white/8 px-4 py-4">
                            <label className="block">
                              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/50">
                                Ціна
                              </span>
                              <input
                                type="number"
                                min="0"
                                value={draft.price}
                                onChange={(e) => handleDraftChange(item.id, 'price', e.target.value)}
                                className="mt-3 h-12 w-full rounded-[14px] border border-white/10 bg-white px-4 text-sm font-bold text-black outline-none"
                              />
                            </label>
                          </div>
                        </div>

                        <div className="rounded-[18px] bg-white px-4 py-5 text-black">
                          <label className="flex items-center justify-between gap-4">
                            <div>
                              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-black/40">
                                Активність товару
                              </p>
                              <p className="mt-2 text-sm text-black/70">
                                Керує видимістю товару в магазині
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                handleDraftChange(item.id, 'is_active', !draft.is_active)
                              }
                              className={`relative h-8 w-16 rounded-full transition ${
                                draft.is_active ? 'bg-black' : 'bg-black/15'
                              }`}
                            >
                              <span
                                className={`absolute top-1 h-6 w-6 rounded-full bg-white transition ${
                                  draft.is_active ? 'left-9' : 'left-1'
                                }`}
                              />
                            </button>
                          </label>
                        </div>

                        <div className="rounded-[18px] bg-white px-4 py-5 text-black">
                          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-black/40">
                            Поточні значення
                          </p>
                          <p className="mt-3 text-sm text-black/70">
                            Ціна: {formatPrice(item.price)}
                          </p>
                          <p className="mt-2 text-sm text-black/70">
                            На складі: {item.stock_quantity} шт.
                          </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <button
                            type="button"
                            onClick={() => saveItem(item.id)}
                            disabled={editingId === item.id}
                            className="w-full rounded-full bg-white px-4 py-3 text-sm font-bold text-black transition hover:bg-[#f0f0f0] disabled:opacity-50"
                          >
                            {editingId === item.id ? 'Збереження...' : 'Зберегти зміни'}
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteItem(item.id)}
                            disabled={editingId === item.id}
                            className="w-full rounded-full border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200 transition hover:bg-red-500 hover:text-white disabled:opacity-50"
                          >
                            Видалити товар
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminInventoryPage;
