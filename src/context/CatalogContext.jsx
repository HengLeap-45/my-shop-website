import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getCategories, getProducts } from '../services/catalogService';

const CatalogContext = createContext(null);

export function CatalogProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refreshCatalog = useCallback(async ({ includeInactive = false } = {}) => {
    setLoading(true);
    setError('');
    try {
      const [cats, prods] = await Promise.all([
        getCategories(),
        getProducts({ includeInactive }),
      ]);
      setCategories(cats);
      setProducts(prods);
    } catch (err) {
      setError(err.message || 'Unable to load store catalog.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCatalog();
  }, [refreshCatalog]);

  return (
    <CatalogContext.Provider
      value={{
        products,
        categories,
        loading,
        error,
        refreshCatalog,
      }}
    >
      {children}
    </CatalogContext.Provider>
  );
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error('useCatalog must be used within CatalogProvider');
  return ctx;
}
