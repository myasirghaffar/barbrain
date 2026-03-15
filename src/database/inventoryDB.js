/**
 * SQLite database for bar inventory.
 * Tables: products, categories, inventory_sessions, inventory_items.
 */
import SQLite from 'react-native-sqlite-storage';

SQLite.DEBUG(false);
SQLite.enablePromise(true);

const DB_NAME = 'inventory.db';

let db = null;
let initPromise = null;

/**
 * Initialize and open the database; create tables if they don't exist.
 */
export async function initDB() {
  if (db) return db;
  if (initPromise) return initPromise;
  initPromise = (async () => {
    try {
      db = await SQLite.openDatabase({ name: DB_NAME, location: 'default' });
      await createTables();
      return db;
    } catch (err) {
      initPromise = null;
      throw err;
    }
  })();
  return initPromise;
}

async function createTables() {
  const sql = [
    `CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      createdAt TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      categoryId INTEGER NOT NULL DEFAULT 1,
      name TEXT NOT NULL,
      volume INTEGER,
      image TEXT,
      subCategory TEXT,
      price REAL DEFAULT 0,
      fillLevel INTEGER DEFAULT 100,
      fullBottles INTEGER DEFAULT 0,
      createdAt TEXT,
      FOREIGN KEY (categoryId) REFERENCES categories(id)
    )`,
    `CREATE TABLE IF NOT EXISTS inventory_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      categoryId INTEGER NOT NULL,
      categoryName TEXT,
      date TEXT,
      team TEXT,
      createdAt TEXT,
      FOREIGN KEY (categoryId) REFERENCES categories(id)
    )`,
    `CREATE TABLE IF NOT EXISTS inventory_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sessionId INTEGER NOT NULL,
      productId INTEGER NOT NULL,
      fullBottles INTEGER DEFAULT 0,
      fillLevel INTEGER DEFAULT 100,
      FOREIGN KEY (sessionId) REFERENCES inventory_sessions(id),
      FOREIGN KEY (productId) REFERENCES products(id)
    )`,
  ];
  for (const s of sql) {
    await db.executeSql(s);
  }
  // Migration: add fullBottles to products if missing (existing DBs)
  try {
    await db.executeSql('ALTER TABLE products ADD COLUMN fullBottles INTEGER DEFAULT 0');
  } catch (_) {
    // Column already exists
  }
  // Ensure default category exists (no dummy products/sessions — use real API or add manually)
  await db.executeSql(
    `INSERT OR IGNORE INTO categories (id, name, createdAt) VALUES (1, 'Cocktailstation', datetime('now'))`
  );
}

export async function runSql(sql, params = []) {
  await initDB();
  if (!db) return Promise.reject(new Error('Database not initialized'));
  const [result] = await db.executeSql(sql, params);
  return {
    rows: result.rows.raw(),
    insertId: result.insertId,
    rowsAffected: result.rowsAffected,
  };
}

// --- Categories ---
export async function getCategories() {
  const { rows } = await runSql('SELECT * FROM categories ORDER BY name');
  return rows;
}

export async function addCategory(name) {
  await runSql('INSERT INTO categories (name, createdAt) VALUES (?, datetime("now"))', [name]);
  const { rows } = await runSql('SELECT last_insert_rowid() as id');
  return rows[0]?.id;
}

export async function updateCategory(id, name) {
  await runSql('UPDATE categories SET name = ? WHERE id = ?', [name || '', id]);
}

export async function deleteCategory(id) {
  if (!id) return;
  await runSql('DELETE FROM products WHERE categoryId = ?', [id]);
  await runSql('DELETE FROM categories WHERE id = ?', [id]);
}

// --- Products ---
export async function getProducts(categoryId = null) {
  const sql = categoryId
    ? 'SELECT * FROM products WHERE categoryId = ? ORDER BY name'
    : 'SELECT * FROM products ORDER BY name';
  const params = categoryId ? [categoryId] : [];
  const { rows } = await runSql(sql, params);
  return rows;
}

export async function getProductById(id) {
  const { rows } = await runSql('SELECT * FROM products WHERE id = ?', [id]);
  return rows[0] || null;
}

export async function addProduct(product) {
  const { name, volume, image, subCategory, price, fillLevel, fullBottles = 0, categoryId = 1 } = product;
  await runSql(
    `INSERT INTO products (categoryId, name, volume, image, subCategory, price, fillLevel, fullBottles, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
    [categoryId, name || '', volume || 0, image || '', subCategory || '', Number(price) || 0, Number(fillLevel) ?? 100, Math.max(0, Math.floor(fullBottles))]
  );
  const { rows } = await runSql('SELECT last_insert_rowid() as id');
  return rows[0]?.id;
}

export async function addProducts(products, categoryId = 1) {
  for (const p of products) {
    await addProduct({ ...p, categoryId });
  }
}

function normalizeUpdateValue(k, v) {
  if (k === 'fillLevel' && v !== undefined) {
    const n = Number(v);
    if (Number.isNaN(n)) return 100;
    return Math.min(100, Math.max(0, Math.round(n)));
  }
  if (k === 'fullBottles' && v !== undefined) {
    const n = Number(v);
    if (Number.isNaN(n)) return 0;
    return Math.max(0, Math.floor(n));
  }
  return v;
}

export async function updateProduct(id, updates) {
  const allowed = ['name', 'volume', 'image', 'subCategory', 'price', 'fillLevel', 'fullBottles', 'categoryId'];
  const keys = allowed.filter((k) => updates[k] !== undefined);
  const setClause = keys.map((k) => `${k} = ?`).join(', ');
  const values = keys.map((k) => normalizeUpdateValue(k, updates[k]));
  if (values.length === 0) return;
  await runSql(`UPDATE products SET ${setClause} WHERE id = ?`, [...values, id]);
}

export async function updateProductFillLevel(id, fillLevel) {
  await runSql('UPDATE products SET fillLevel = ? WHERE id = ?', [Math.round(fillLevel), id]);
}

export async function updateProductFullBottles(id, fullBottles) {
  await runSql('UPDATE products SET fullBottles = ? WHERE id = ?', [Math.max(0, Math.floor(fullBottles)), id]);
}

export async function updateProductPrice(id, price) {
  await runSql('UPDATE products SET price = ? WHERE id = ?', [price, id]);
}

export async function deleteProduct(id) {
  await runSql('DELETE FROM products WHERE id = ?', [id]);
}

export async function searchProducts(query, categoryId = null) {
  const sql = categoryId
    ? 'SELECT * FROM products WHERE categoryId = ? AND name LIKE ? ORDER BY name'
    : 'SELECT * FROM products WHERE name LIKE ? ORDER BY name';
  const like = `%${(query || '').trim()}%`;
  const params = categoryId ? [categoryId, like] : [like];
  const { rows } = await runSql(sql, params);
  return rows;
}

// --- Inventory sessions & reports ---
export async function createInventorySession(categoryId, categoryName, team = '') {
  await runSql(
    `INSERT INTO inventory_sessions (categoryId, categoryName, date, team, createdAt)
     VALUES (?, ?, date('now'), ?, datetime('now'))`,
    [categoryId, categoryName || '', team]
  );
  const { rows } = await runSql('SELECT last_insert_rowid() as id');
  return rows[0]?.id;
}

export async function getInventorySessions(limit = 50) {
  const { rows } = await runSql(
    `SELECT * FROM inventory_sessions ORDER BY createdAt DESC LIMIT ?`,
    [limit]
  );
  return rows;
}

export async function getProductsWithFillLevels(categoryId) {
  const { rows } = await runSql(
    'SELECT id, name, volume, image, fillLevel, price FROM products WHERE categoryId = ? ORDER BY name',
    [categoryId]
  );
  return rows;
}

/**
 * Get report stats: total bottles, total value, low stock count.
 */
export async function getReportStats(categoryId = null) {
  const where = categoryId ? ' WHERE categoryId = ?' : '';
  const params = categoryId ? [categoryId] : [];
  const { rows } = await runSql(`SELECT * FROM products${where}`, params);
  const totalBottles = rows.length;
  const totalValue = rows.reduce((sum, p) => sum + (p.price || 0), 0);
  const lowStock = rows.filter((p) => (p.fillLevel ?? 100) < 25).length;
  return { totalBottles, totalValue, lowStock, products: rows };
}

export { db };
