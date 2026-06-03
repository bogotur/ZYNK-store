import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from './CartContext';

const API_BASE = import.meta.env.VITE_API_URL;

const FloatingCart = () => {
  const navigate = useNavigate();

  const {
    cartItems,
    cartCount,
    cartTotal,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    clearCart,
  } = useCart();

  const formatPrice = (value) => {
    return `${Number(value || 0).toLocaleString('uk-UA')} грн`;
  };

  const goToCheckout = () => {
    if (cartItems.length === 0) return;
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-6 right-6 z-[90] flex h-16 min-w-16 items-center justify-center rounded-full bg-black px-5 text-white shadow-[0_20px_50px_rgba(0,0,0,0.25)] transition hover:scale-105"
      >
        <span className="text-xl">🛒</span>
        {cartCount > 0 && (
          <span className="ml-2 text-sm font-black">{cartCount}</span>
        )}
      </button>

      {isCartOpen && (
        <div className="fixed inset-0 z-[100] bg-black/55 backdrop-blur-sm">
          <div className="absolute right-0 top-0 h-full w-full max-w-[520px] overflow-y-auto bg-white shadow-[-20px_0_60px_rgba(0,0,0,0.25)]">
            <div className="sticky top-0 z-10 border-b border-black/10 bg-white px-6 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-black/40">
                    ZYNK STORE
                  </p>
                  <h2 className="mt-1 text-3xl font-black uppercase tracking-tight text-black">
                    Кошик
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-[#f5f5f5] text-xl font-black transition hover:bg-black hover:text-white"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="px-6 py-6">
              {cartItems.length === 0 ? (
                <div className="rounded-[28px] bg-[#f6f6f6] p-8 text-center">
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-black/40">
                    Кошик порожній
                  </p>
                  <h3 className="mt-3 text-2xl font-black text-black">
                    Додайте товар для замовлення
                  </h3>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => {
                    const imageSrc = item.image_url
                      ? `${API_BASE}/images/${encodeURIComponent(String(item.image_url).replace(/^\/+/, ''))}`
                      : '';

                    return (
                      <div
                        key={`${item.product_type}-${item.id}`}
                        className="rounded-[26px] border border-black/10 bg-white p-4 shadow-[0_10px_30px_rgba(0,0,0,0.06)]"
                      >
                        <div className="grid grid-cols-[110px_1fr] gap-4">
                          <div className="flex h-[110px] items-center justify-center rounded-[20px] bg-[#f6f6f6]">
                            {imageSrc ? (
                              <img
                                src={imageSrc}
                                alt={`${item.brand_name} ${item.model_name}`}
                                className="h-full w-full object-contain p-2"
                              />
                            ) : (
                              <span className="text-xs font-bold text-black/30">
                                No image
                              </span>
                            )}
                          </div>

                          <div>
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-black/40">
                                  {item.brand_name}
                                </p>
                                <h3 className="mt-1 text-lg font-black leading-tight text-black">
                                  {item.model_name}
                                </h3>
                                <p className="mt-1 text-xs font-semibold text-black/45">
                                  {item.vendor_name}
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() => removeFromCart(item.id, item.product_type)}
                                className="rounded-full border border-black/10 px-3 py-1 text-xs font-black text-black/50 transition hover:bg-red-500 hover:text-white"
                              >
                                ×
                              </button>
                            </div>

                            <div className="mt-4 flex items-center justify-between gap-3">
                              <div className="flex items-center rounded-full border border-black/10 bg-[#f6f6f6] p-1">
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateQuantity(
                                      item.id,
                                      item.product_type,
                                      Number(item.quantity) - 1
                                    )
                                  }
                                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white font-black"
                                >
                                  −
                                </button>

                                <span className="min-w-10 text-center text-sm font-black">
                                  {item.quantity}
                                </span>

                                <button
                                  type="button"
                                  onClick={() =>
                                    updateQuantity(
                                      item.id,
                                      item.product_type,
                                      Number(item.quantity) + 1
                                    )
                                  }
                                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white font-black"
                                >
                                  +
                                </button>
                              </div>

                              <div className="text-right">
                                <p className="text-xs font-bold uppercase tracking-[0.16em] text-black/40">
                                  Разом
                                </p>
                                <p className="text-lg font-black text-black">
                                  {formatPrice(Number(item.price) * Number(item.quantity))}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <div className="sticky bottom-0 rounded-[30px] border border-black/10 bg-white p-5 shadow-[0_-15px_40px_rgba(0,0,0,0.08)]">
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-sm font-bold uppercase tracking-[0.16em] text-black/40">
                        Всього
                      </p>
                      <p className="text-3xl font-black text-black">
                        {formatPrice(cartTotal)}
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={clearCart}
                        className="rounded-full border border-black px-5 py-3 text-sm font-black text-black transition hover:bg-black hover:text-white"
                      >
                        Очистити
                      </button>

                      <button
                        type="button"
                        onClick={goToCheckout}
                        className="rounded-full bg-black px-5 py-3 text-sm font-black text-white transition hover:bg-[#1a1a1a]"
                      >
                        Оформити
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingCart;
