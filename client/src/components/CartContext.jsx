import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

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
    quantity: Math.max(
      1,
      Math.min(Number(item.quantity || 1), stockQuantity || 1)
    ),
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

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item) => {
    const nextItem = normalizeCartItem(item);

    if (!nextItem.id) return;

    if (nextItem.stock_quantity <= 0) {
      alert('Цього товару немає в наявності.');
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

            const nextQuantity = Math.min(
              Number(cartItem.quantity || 1) + 1,
              maxQuantity
            );

            if (Number(cartItem.quantity || 1) >= maxQuantity) {
              alert(`На складі доступно лише ${maxQuantity} шт.`);
            }

            return {
              ...cartItem,
              stock_quantity: maxQuantity,
              quantity: nextQuantity,
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

          const safeQuantity = Math.max(
            1,
            Math.min(requestedQuantity, maxQuantity || 1)
          );

          if (requestedQuantity > maxQuantity && maxQuantity > 0) {
            alert(`На складі доступно лише ${maxQuantity} шт.`);
          }

          return {
            ...item,
            quantity: safeQuantity,
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

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used inside CartProvider');
  }

  return context;
};
