import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import CartModal from "../CartModal"; 

const SSD = () => {
    const [ssdBrands, setSsdBrands] = useState([]);
    const [ssdMemorySizes, setSsdMemorySizes] = useState([]);
    const [ssdInterfaces, setSsdInterfaces] = useState([]);

    const [selectedSsdBrandId, setSelectedSsdBrandId] = useState(null);
    const [selectedSsdMemorySizeIds, setSelectedSsdMemorySizeIds] = useState([]);
    const [selectedSsdInterfaceIds, setSelectedSsdInterfaceIds] = useState([]);

    const [ssds, setSsds] = useState([]);
    const [sortOrder, setSortOrder] = useState('popular'); 

    const [showModal, setShowModal] = useState(false);
    const [selectedSsd, setSelectedSsd] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        axios.get('http://localhost:8108/brands_ssd')
            .then(res => setSsdBrands(res.data))
            .catch(err => console.error("Помилка при завантаженні брендів SSD:", err));

        axios.get('http://localhost:8108/memory_sizes_ssd')
            .then(res => setSsdMemorySizes(res.data))
            .catch(err => console.error("Помилка при завантаженні об'ємів пам'яті SSD:", err));

        axios.get('http://localhost:8108/interfaces_ssd')
            .then(res => setSsdInterfaces(res.data))
            .catch(err => console.error("Помилка при завантаженні інтерфейсів SSD:", err));
    }, []); 

    useEffect(() => {
        const params = {};
        if (selectedSsdBrandId) params.brand_ssd_id = selectedSsdBrandId;
        if (selectedSsdMemorySizeIds.length) params.memory_size_ssd_id = selectedSsdMemorySizeIds.join(',');
        if (selectedSsdInterfaceIds.length) params.interface_ssd_id = selectedSsdInterfaceIds.join(',');

        if (sortOrder === 'asc') params.sort = 'asc';
        else if (sortOrder === 'desc') params.sort = 'desc';
        else params.sort = 'popular'; 

        const query = new URLSearchParams(params).toString(); 

        axios.get(`http://localhost:8108/ssds?${query}`)
            .then(res => setSsds(res.data))
            .catch(err => console.error("Помилка при завантаженні SSD:", err));
    }, [selectedSsdBrandId, selectedSsdMemorySizeIds, selectedSsdInterfaceIds, sortOrder]); 

    const handleMemorySizeSsdToggle = (sizeId) => {
        setSelectedSsdMemorySizeIds(prev =>
            prev.includes(sizeId)
                ? prev.filter(id => id !== sizeId) 
                : [...prev, sizeId] 
        );
    };

    const handleInterfaceSsdToggle = (interfaceId) => {
        setSelectedSsdInterfaceIds(prev =>
            prev.includes(interfaceId)
                ? prev.filter(id => id !== interfaceId)
                : [...prev, interfaceId]
        );
    };

    const handleAddToCartClick = (ssd) => {
        setSelectedSsd(ssd);
        setShowModal(true);
    };

    return (
        <div className="flex"> 
            <div className="w-[250px] p-4 border-r"> 
                <h2 className="text-2xl font-bold mb-4">Фільтри</h2>
                <div className="mb-6">
                    <h3 className="font-semibold mb-2">Бренди SSD</h3>
                    {ssdBrands.map(brand => (
                        <div key={brand.id}>
                            <label className="text-sm cursor-pointer">
                                <input
                                    type="radio"
                                    name="ssdBrand"
                                    value={brand.id}
                                    checked={selectedSsdBrandId === brand.id}
                                    onChange={() => setSelectedSsdBrandId(brand.id)}
                                    className="mr-2"
                                />
                                {brand.name}
                            </label>
                        </div>
                    ))}
                    <button
                        className="text-xs text-blue-600 mt-2"
                        onClick={() => setSelectedSsdBrandId(null)}
                    >
                        Очистити бренд
                    </button>
                </div>

                <div className="mb-6">
                    <h3 className="font-semibold mb-2">Об'єм пам'яті</h3>
                    {ssdMemorySizes.map(size => (
                        <div key={size.id}>
                            <label className="text-sm cursor-pointer">
                                <input
                                    type="checkbox"
                                    value={size.id}
                                    checked={selectedSsdMemorySizeIds.includes(size.id)}
                                    onChange={() => handleMemorySizeSsdToggle(size.id)}
                                    className="mr-2"
                                />
                                {size.size}
                            </label>
                        </div>
                    ))}
                    <button
                        className="text-xs text-blue-600 mt-2"
                        onClick={() => setSelectedSsdMemorySizeIds([])}
                    >
                        Очистити об'єм
                    </button>
                </div>

                <div className="mb-6">
                    <h3 className="font-semibold mb-2">Інтерфейс</h3>
                    {ssdInterfaces.map(iface => (
                        <div key={iface.id}>
                            <label className="text-sm cursor-pointer">
                                <input
                                    type="checkbox"
                                    value={iface.id}
                                    checked={selectedSsdInterfaceIds.includes(iface.id)}
                                    onChange={() => handleInterfaceSsdToggle(iface.id)}
                                    className="mr-2"
                                />
                                {iface.name}
                            </label>
                        </div>
                    ))}
                    <button
                        className="text-xs text-blue-600 mt-2"
                        onClick={() => setSelectedSsdInterfaceIds([])}
                    >
                        Очистити інтерфейс
                    </button>
                </div>
            </div>

            <div className="flex-1 p-4"> 
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Твердотільні накопичувачі (SSD)</h2>
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

                {ssds.length === 0 ? (
                    <p>Немає результатів</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"> 
                        {ssds.map(ssd => (
                            <div key={ssd.id} className="relative border rounded-xl p-4 shadow hover:shadow-md transition flex flex-col justify-between"> 
                                {ssd.image_url && (
                                    <img
                                        src={`http://localhost:8108/images${ssd.image_url}`}
                                        alt={`${ssd.brand_ssd_name} ${ssd.model_name}`}
                                        className="w-full h-48 object-contain mb-2" 
                                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/192x192/E0E0E0/333333?text=SSD+Image'; }} 
                                    />
                                )}
                                <div>
                                    <h4 className="text-lg font-bold mb-1">
                                        {ssd.brand_ssd_name} {ssd.model_name}
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                        Об'єм: <span className="font-medium">{ssd.memory_size_ssd_value}</span>
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Інтерфейс: <span className="font-medium">{ssd.interface_ssd_name}</span>
                                    </p>
                                    {ssd.read_speed_mbps && (
                                        <p className="text-sm text-gray-600">
                                            Швидкість читання: <span className="font-medium">{ssd.read_speed_mbps} МБ/с</span>
                                        </p>
                                    )}
                                    {ssd.write_speed_mbps && (
                                        <p className="text-sm text-gray-600">
                                            Швидкість запису: <span className="font-medium">{ssd.write_speed_mbps} МБ/с</span>
                                        </p>
                                    )}
                                    <p className="mt-2 font-semibold text-green-600">{ssd.price} грн</p> 
                                </div>

                                <div className="flex justify-between items-center mt-4">
                                    <span
                                        className="text-black text-xs cursor-pointer" 
                                        onClick={() => navigate(`/ssds/${ssd.id}`)}
                                    >
                                        Детальніше про товар
                                    </span>

                                    <button
                                        className="border border-black text-sm px-4 py-3 rounded-full hover:bg-black hover:text-white transition" 
                                        Motherboard
                                        onClick={() => handleAddToCartClick(ssd)}
                                    >
                                        Додати до кошика
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showModal && selectedSsd && (
                <CartModal item={{ ...selectedSsd, product_type: 'ssd' }} onClose={() => setShowModal(false)} />
            )}
        </div>
    );
};

export default SSD;
