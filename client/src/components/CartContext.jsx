import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);

const CART_STORAGE_KEY = 'zynk_cart';

const normalizeCartItem = (item) => {
  return {
    id: item.id,
    product_type: item.product_type || 'product',
    brand_name: item.brand_name || '',
    model_name: item.model_name || item.name || '',
    vendor_name: item.vendor_name || '',
    image_url: item.image_url || '',
    price: Number(item.price || 0),
    stock_quantity: Number(item.stock_quantity || 0),
    quantity: Number(item.quantity || 1),
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
            const maxQuantity = Number(cartItem.stock_quantity || 99);
            const nextQuantity = Math.min(cartItem.quantity + 1, maxQuantity || cartItem.quantity + 1);

            return {
              ...cartItem,
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
          const maxQuantity = Number(item.stock_quantity || 99);
          const safeQuantity = Math.max(1, Math.min(Number(quantity), maxQuantity || Number(quantity)));

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
