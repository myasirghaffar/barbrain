/**
 * Inventory API client - mirrors inventoryDB interface for backend integration.
 * In dev mode: uses local URL first; falls back to live URL if local is unavailable.
 */
import axios from 'axios';
import {
  getApiFullUrl,
  switchToLiveUrl,
  isUsingLiveUrl,
} from '../config/api';

let authToken = null;

export function setAuthToken(token) {
  authToken = token;
}

export function clearAuthToken() {
  authToken = null;
}

const api = axios.create({
  baseURL: getApiFullUrl(),
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  config.baseURL = getApiFullUrl();
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

function isNetworkError(err) {
  if (err.response) return false;
  const code = err.code || err.message || '';
  return (
    code === 'ECONNREFUSED' ||
    code === 'ERR_NETWORK' ||
    code === 'ETIMEDOUT' ||
    code === 'ENOTFOUND' ||
    String(code).includes('Network Error')
  );
}

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const config = err.config || {};
    if (
      __DEV__ &&
      !isUsingLiveUrl() &&
      isNetworkError(err) &&
      !config._retriedWithLive
    ) {
      config._retriedWithLive = true;
      switchToLiveUrl();
      api.defaults.baseURL = getApiFullUrl();
      try {
        return await api.request(config);
      } catch (retryErr) {
        return Promise.reject(retryErr);
      }
    }
    const msg = err.response?.data?.message || err.message || 'Network error';
    const status = err.response?.status;
    const fullUrl =
      config?.baseURL && config?.url
        ? `${config.baseURL.replace(/\/$/, '')}/${config.url.replace(/^\//, '')}`
        : config?.url;
    const enhanced = new Error(msg);
    if (status === 404) {
      enhanced.message = msg.includes('Route')
        ? `${msg} (${config?.method?.toUpperCase()} ${fullUrl})`
        : msg;
    }
    return Promise.reject(enhanced);
  }
);

async function handleResponse(res) {
  const data = res.data;
  if (data && data.success === false) {
    throw new Error(data.message || 'API error');
  }
  return data?.data ?? data;
}

async function handleError(err) {
  const msg = err.response?.data?.message || err.message || 'Network error';
  throw new Error(msg);
}

export async function initDB() {
  return true;
}

export async function getAreas() {
  try {
    const data = await handleResponse(await api.get('categories'));
    const list = Array.isArray(data) ? data : [];
    // Map _id to id for frontend compatibility
    return list.map(a => ({ ...a, id: a._id || a.id }));
  } catch (e) {
    if (e?.message) throw e;
    throw new Error('Failed to load areas');
  }
}

export async function addArea(name) {
  try {
    const data = await handleResponse(await api.post('categories', { name }));
    return data?.id ?? data?._id;
  } catch (e) {
    throw new Error(e?.message || 'Failed to add area');
  }
}

export async function updateArea(id, name) {
  await api.put(`categories/${id}`, { name });
}

export async function deleteArea(id) {
  await api.delete(`categories/${id}`);
}

export async function getProducts(areaId = null) {
  const params = areaId ? { categoryId: areaId } : {};
  const data = await handleResponse(await api.get('products', { params }));
  const list = Array.isArray(data) ? data : [];
  return list.map(p => ({
    ...p,
    id: p._id || p.id,
    volume: p.unitSize,
    image: p.imageURL,
    areaId: p.categoryId,
  }));
}

export async function getProductById(id) {
  const data = await handleResponse(await api.get(`products/${id}`));
  return data || null;
}

export async function addProduct(product) {
  const payload = {
    categoryId: product.areaId,
    name: String(product.name || '').trim(),
    unitSize: Math.max(0, Number(product.volume) || 0),
    imageURL: product.image ?? '',
    price: Math.max(0, Number(product.price) || 0),
    fillLevel: Math.min(100, Math.max(0, Number(product.fillLevel) || 100)),
  };
  const data = await handleResponse(await api.post('products', payload));
  return data?.id ?? data?._id;
}

export async function addProducts(products, areaId = 1) {
  for (const p of products) {
    await addProduct({ ...p, areaId });
  }
}

export async function updateProduct(id, updates) {
  const payload = {};
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.volume !== undefined) payload.unitSize = updates.volume;
  if (updates.image !== undefined) payload.imageURL = updates.image;
  if (updates.areaId !== undefined) payload.categoryId = updates.areaId;
  if (updates.price !== undefined) payload.price = updates.price;
  if (updates.fillLevel !== undefined) payload.fillLevel = updates.fillLevel;
  
  if (Object.keys(payload).length === 0) return;
  await api.put(`products/${id}`, payload);
}

export async function updateProductFillLevel(id, fillLevel) {
  await updateProduct(id, { fillLevel: Math.round(fillLevel) });
}

export async function updateProductPrice(id, price) {
  await updateProduct(id, { price });
}

export async function deleteProduct(id) {
  await api.delete(`products/${id}`);
}

export async function searchProducts(query, areaId = null) {
  const params = { q: (query || '').trim() };
  if (areaId) params.categoryId = areaId;
  const data = await handleResponse(await api.get('products', { params }));
  const list = Array.isArray(data) ? data : [];
  return list.map(p => ({
    ...p,
    id: p._id || p.id,
    volume: p.unitSize,
    image: p.imageURL,
    areaId: p.categoryId,
  }));
}

export async function createInventorySession(areaId, areaName, team = '') {
  const data = await handleResponse(
    await api.post('inventory', {
      categoryId: areaId,
      areaName: areaName || '',
      team: team || '',
      items: [], // Backend might expect initial items
    })
  );
  return data?.id ?? data?._id;
}

export async function getInventorySessions(limit = 50) {
  const data = await handleResponse(
    await api.get('inventory', { params: { limit } })
  );
  return Array.isArray(data) ? data : [];
}

export async function getProductsWithFillLevels(areaId) {
  const data = await handleResponse(
    await api.get('products', { params: { areaId } })
  );
  return Array.isArray(data) ? data : [];
}

export async function getReportStats(areaId = null) {
  const params = areaId ? { categoryId: areaId } : {};
  const data = await handleResponse(
    await api.get('inventory/report', { params })
  );
  return {
    totalBottles: data?.totalBottles ?? 0,
    totalValue: data?.totalValue ?? 0,
    lowStock: data?.lowStock ?? 0,
    products: (data?.products ?? []).map(p => ({
      ...p,
      id: p._id || p.id,
      volume: p.unitSize,
      image: p.imageURL,
      areaId: p.categoryId,
    })),
  };
}

export const db = null;
