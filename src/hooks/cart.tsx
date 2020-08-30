import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // await AsyncStorage.removeItem('@GoMarketplace:products');

      const productsData = await AsyncStorage.getItem(
        '@GoMarketplace:products',
      );

      if (productsData) {
        const productsList = JSON.parse(productsData);

        setProducts(productsList);
      }
    }

    loadProducts();
  }, []);

  const increment = useCallback(
    async id => {
      const productsCopy = [...products];
      const productIndex = productsCopy.findIndex(product => product.id === id);
      const product = productsCopy[productIndex];
      product.quantity += 1;
      productsCopy[productIndex] = product;

      setProducts(productsCopy);

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(productsCopy),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const productsCopy = [...products];
      const productIndex = productsCopy.findIndex(product => product.id === id);
      const product = productsCopy[productIndex];
      product.quantity -= 1;
      productsCopy[productIndex] = product;

      setProducts(productsCopy);

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(productsCopy),
      );
    },
    [products],
  );

  const addToCart = useCallback(
    async product => {
      const productFound = products.find(p => p.id === product.id);

      if (productFound) {
        increment(product.id);
      } else {
        setProducts([...products, { ...product, quantity: 1 }]);

        await AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify(products),
        );
      }
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
