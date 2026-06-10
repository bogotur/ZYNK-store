import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const CartContext = createContext(null);

const CART_STORAGE_KEY = 'zynk_cart';

const getStockQuantity = (item) => {
  const stock = Number(
    item?.stock_quantity ??
      item?.quantity_in_stock ??
      item?.stock ??
      item?.available_quantity ??
      0
  );

  return Number.isFinite(stock) ? Math.max(0, stock) : 0;
};

const normalizeCartItem = (item) => {
  const stockQuantity = getStockQuantity(item);

  return {
    id: item.id,
    product_type: item.product_type || item.type || 'product',
    brand_name: item.brand_name || '',
    model_name: item.model_name || item.name || '',
    vendor_name: item.vendor_name || '',
    image_url: item.image_url || '',
    price: Number(item.price || 0),
    stock_quantity: stockQuantity,
    quantity: Math.max(1, Math.min(Number(item.quantity || 1), stockQuantity || 1)),
    memory_capacity: item.memory_capacity || '',
    memory_type: item.memory_type || '',
    interface_type: item.interface_type || '',
    core_clock_ghz: item.core_clock_ghz || '',
  };
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      return savedCart ? JSON.parse(savedCart) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartMessage, setCartMessage] = useState('');

  const showCartMessage = (message) => {
    setCartMessage(message);

    setTimeout(() => {
      setCartMessage('');
    }, 3500);
  };

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item) => {
    const nextItem = normalizeCartItem(item);

    if (!nextItem.id) return;

    if (nextItem.stock_quantity <= 0) {
      showCartMessage(
        `❌ Товар тимчасово відсутній\n\n${nextItem.brand_name} ${nextItem.model_name}\n\nНа жаль, цього товару зараз немає на складі.`
      );
      return;
    }

    setCartItems((prev) => {
      const existingItem = prev.find(
        (cartItem) =>
          cartItem.id === nextItem.id &&
          cartItem.product_type === nextItem.product_type
      );

      if (existingItem) {
        return prev.map((cartItem) => {
          if (
            cartItem.id === nextItem.id &&
            cartItem.product_type === nextItem.product_type
          ) {
            const maxQuantity = getStockQuantity({
              ...cartItem,
              stock_quantity: nextItem.stock_quantity || cartItem.stock_quantity,
            });

            if (Number(cartItem.quantity || 1) >= maxQuantity) {
              showCartMessage(
                `❌ Недостатньо товару на складі\n\n${cartItem.brand_name} ${cartItem.model_name}\n\nДоступно лише: ${maxQuantity} шт.`
              );

              return {
                ...cartItem,
                stock_quantity: maxQuantity,
                quantity: maxQuantity,
              };
            }

            return {
              ...cartItem,
              stock_quantity: maxQuantity,
              quantity: Number(cartItem.quantity || 1) + 1,
            };
          }

          return cartItem;
        });
      }

      return [...prev, nextItem];
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (id, productType) => {
    setCartItems((prev) =>
      prev.filter(
        (item) => !(item.id === id && item.product_type === productType)
      )
    );
  };

  const updateQuantity = (id, productType, quantity) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === id && item.product_type === productType) {
          const maxQuantity = getStockQuantity(item);
          const requestedQuantity = Number(quantity || 1);

          if (requestedQuantity > maxQuantity && maxQuantity > 0) {
            showCartMessage(
              `❌ Недостатньо товару на складі\n\n${item.brand_name} ${item.model_name}\n\nДоступно лише: ${maxQuantity} шт.`
            );
          }

          return {
            ...item,
            quantity: Math.max(1, Math.min(requestedQuantity, maxQuantity || 1)),
          };
        }

        return item;
      })
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  }, [cartItems]);

  const cartTotal = useMemo(() => {
    return cartItems.reduce(
      (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
      0
    );
  }, [cartItems]);

  const value = {
    cartItems,
    cartCount,
    cartTotal,
    isCartOpen,
    setIsCartOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}

      {cartMessage && (
        <div className="fixed left-1/2 top-6 z-[9999] w-[92%] max-w-md -translate-x-1/2 rounded-[24px] border border-black/10 bg-white p-5 text-center shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
          <p className="whitespace-pre-line text-sm font-bold leading-6 text-red-600">
            {cartMessage}
          </p>
        </div>
      )}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used inside CartProvider');
  }

  return context;
};