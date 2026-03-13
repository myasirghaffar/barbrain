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
    const data = await handleResponse(await api.get('areas'));
    return Array.isArray(data) ? data : [];
  } catch (e) {
    if (e?.message) throw e;
    throw new Error('Failed to load areas');
  }
}

export async function addArea(name) {
  try {
    const data = await handleResponse(await api.post('areas', { name }));
    return data?.id ?? data?._id;
  } catch (e) {
    throw new Error(e?.message || 'Failed to add area');
  }
}

export async function updateArea(id, name) {
  await api.put(`areas/${id}`, { name });
}

export async function deleteArea(id) {
  await api.delete(`areas/${id}`);
}

export async function getProducts(areaId = null) {
  const params = areaId ? { areaId } : {};
  const data = await handleResponse(await api.get('products', { params }));
  return Array.isArray(data) ? data : [];
}

export async function getProductById(id) {
  const data = await handleResponse(await api.get(`products/${id}`));
  return data || null;
}

export async function addProduct(product) {
  const payload = {
    areaId: product.areaId,
    name: String(product.name || '').trim(),
    volume: Math.max(0, Number(product.volume) || 0),
    image: product.image ?? '',
    category: product.category ?? '',
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
  const allowed = ['name', 'volume', 'image', 'category', 'price', 'fillLevel'];
  const payload = {};
  for (const k of allowed) {
    if (updates[k] !== undefined) payload[k] = updates[k];
  }
  if (Object.keys(payload).length === 0) return;
  await api.put(`products/${id}`, payload);
}

export async function updateProductFillLevel(id, fillLevel) {
  await api.patch(`products/${id}/fillLevel`, { fillLevel: Math.round(fillLevel) });
}

export async function updateProductPrice(id, price) {
  await api.patch(`products/${id}/price`, { price });
}

export async function deleteProduct(id) {
  await api.delete(`products/${id}`);
}

export async function searchProducts(query, areaId = null) {
  const params = { q: (query || '').trim() };
  if (areaId) params.areaId = areaId;
  const data = await handleResponse(await api.get('products/search', { params }));
  return Array.isArray(data) ? data : [];
}

export async function createInventorySession(areaId, areaName, team = '') {
  const data = await handleResponse(
    await api.post('inventory/sessions', {
      areaId,
      areaName: areaName || '',
      team: team || '',
    })
  );
  return data?.id ?? data?._id;
}

export async function getInventorySessions(limit = 50) {
  const data = await handleResponse(
    await api.get('inventory/sessions', { params: { limit } })
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
  const params = areaId ? { areaId } : {};
  const data = await handleResponse(
    await api.get('inventory/report', { params })
  );
  return {
    totalBottles: data?.totalBottles ?? 0,
    totalValue: data?.totalValue ?? 0,
    lowStock: data?.lowStock ?? 0,
    products: data?.products ?? [],
  };
}

export const db = null;
