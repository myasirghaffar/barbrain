/**
 * Global inventory state: products, areas, current station, offline preference, and DB/API helpers.
 */
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { USE_BACKEND_API } from '../config/useApi';
import * as DB from '../database/inventoryDB';
import * as API from '../api/inventoryApi';
import { useAuth } from './AuthContext';

const OFFLINE_STORAGE_KEY = '@barlytics_offline_download';

const dataSource = USE_BACKEND_API ? API : DB;

const InventoryContext = createContext(null);

export function InventoryProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [areas, setAreas] = useState([]);
  const [currentAreaId, setCurrentAreaId] = useState(USE_BACKEND_API ? null : 1);
  const [currentAreaName, setCurrentAreaName] = useState(USE_BACKEND_API ? '' : 'Cocktailstation');
  const [dbReady, setDbReady] = useState(false);
  const [offlineDownloadEnabled, setOfflineDownloadEnabledState] = useState(false);

  const loadDB = useCallback(async () => {
    try {
      await dataSource.initDB();
      setDbReady(true);
    } catch (e) {
      console.error('Data source init failed', e);
      setDbReady(false);
    }
  }, []);

  useEffect(() => {
    loadDB();
  }, [loadDB]);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(OFFLINE_STORAGE_KEY)
      .then((stored) => {
        if (mounted) setOfflineDownloadEnabledState(stored === 'true');
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  const setOfflineDownloadEnabled = useCallback((value) => {
    setOfflineDownloadEnabledState(value);
    AsyncStorage.setItem(OFFLINE_STORAGE_KEY, value ? 'true' : 'false').catch(() => {});
  }, []);

  const refreshAreas = useCallback(async () => {
    if (!dbReady) return;
    if (USE_BACKEND_API && !isAuthenticated) return;
    try {
      const list = await dataSource.getAreas();
    setAreas(list);
    if (list.length && !list.find((a) => a.id === currentAreaId)) {
      setCurrentAreaId(list[0].id);
      setCurrentAreaName(list[0].name);
    } else {
      const current = list.find((a) => a.id === currentAreaId);
      if (current) setCurrentAreaName(current.name);
    }
    } catch (e) {
      console.warn('refreshAreas failed:', e?.message);
    }
  }, [dbReady, currentAreaId, isAuthenticated]);

  const updateArea = useCallback(
    async (id, name) => {
      await dataSource.updateArea(id, name);
      await refreshAreas();
    },
    [refreshAreas]
  );

  const deleteArea = useCallback(
    async (id) => {
      await dataSource.deleteArea(id);
      await refreshAreas();
    },
    [refreshAreas]
  );

  const addArea = useCallback(
    async (name) => {
      const id = await dataSource.addArea(name || '');
      await refreshAreas();
      return id;
    },
    [refreshAreas]
  );

  const refreshProducts = useCallback(async () => {
    if (!dbReady) return;
    if (USE_BACKEND_API && currentAreaId == null) return;
    if (USE_BACKEND_API && !isAuthenticated) return;
    try {
      const list = await dataSource.getProducts(currentAreaId);
      setProducts(list);
    } catch (e) {
      console.warn('refreshProducts failed:', e?.message);
    }
  }, [dbReady, currentAreaId, isAuthenticated]);

  useEffect(() => {
    if (dbReady) {
      refreshAreas();
    }
  }, [dbReady, refreshAreas]);

  useEffect(() => {
    if (dbReady) {
      refreshProducts();
    }
  }, [dbReady, currentAreaId, refreshProducts]);

  const addProduct = useCallback(
    async (product) => {
      const areaId = product.areaId ?? currentAreaId;
      const id = await dataSource.addProduct({ ...product, areaId });
      if (areaId !== currentAreaId) {
        setCurrentAreaId(areaId);
        const area = areas.find((a) => a.id === areaId);
        if (area) setCurrentAreaName(area.name);
        const list = await dataSource.getProducts(areaId);
        setProducts(list);
      } else {
        await refreshProducts();
      }
      return id;
    },
    [currentAreaId, refreshProducts, areas]
  );

  const addProducts = useCallback(
    async (items) => {
      await dataSource.addProducts(items, currentAreaId);
      await refreshProducts();
    },
    [currentAreaId, refreshProducts]
  );

  const updateProduct = useCallback(
    async (id, updates) => {
      await dataSource.updateProduct(id, updates);
      await refreshProducts();
    },
    [refreshProducts]
  );

  const updateFillLevel = useCallback(
    async (id, fillLevel) => {
      await dataSource.updateProductFillLevel(id, fillLevel);
      await refreshProducts();
    },
    [refreshProducts]
  );

  const updatePrice = useCallback(
    async (id, price) => {
      await dataSource.updateProductPrice(id, price);
      await refreshProducts();
    },
    [refreshProducts]
  );

  const deleteProduct = useCallback(
    async (id) => {
      await dataSource.deleteProduct(id);
      await refreshProducts();
    },
    [refreshProducts]
  );

  const searchProducts = useCallback(
    async (query) => {
      if (!dbReady) return [];
      return dataSource.searchProducts(query, currentAreaId);
    },
    [dbReady, currentAreaId]
  );

  const getAllProductsForPriceScreen = useCallback(async () => {
    if (!dbReady) return [];
    return dataSource.getProducts();
  }, [dbReady]);

  const getReportStats = useCallback(
    async (areaId = undefined) => {
      if (!dbReady) return { totalBottles: 0, totalValue: 0, lowStock: 0, products: [] };
      if (USE_BACKEND_API && !isAuthenticated) return { totalBottles: 0, totalValue: 0, lowStock: 0, products: [] };
      try {
        const id = areaId === undefined ? currentAreaId : areaId;
        return await dataSource.getReportStats(id);
      } catch (e) {
        console.warn('getReportStats failed:', e?.message);
        return { totalBottles: 0, totalValue: 0, lowStock: 0, products: [] };
      }
    },
    [dbReady, currentAreaId, isAuthenticated]
  );

  const getSessions = useCallback(async () => {
    if (!dbReady) return [];
    return dataSource.getInventorySessions();
  }, [dbReady]);

  const value = {
    dbReady,
    products,
    areas,
    currentAreaId,
    currentAreaName,
    setCurrentAreaId,
    setCurrentAreaName,
    offlineDownloadEnabled,
    setOfflineDownloadEnabled,
    refreshProducts,
    refreshAreas,
    updateArea,
    deleteArea,
    addArea,
    addProduct,
    addProducts,
    updateProduct,
    updateFillLevel,
    updatePrice,
    deleteProduct,
    searchProducts,
    getAllProductsForPriceScreen,
    getReportStats,
    getSessions,
    getProductById: dataSource.getProductById,
    getProductsWithFillLevels: (areaId) => dataSource.getProductsWithFillLevels(areaId || currentAreaId),
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error('useInventory must be used within InventoryProvider');
  return ctx;
}
