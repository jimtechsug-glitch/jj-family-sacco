import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_FILE = path.join(__dirname, 'data.json');

const defaultData = {
  adminPassword: 'Adallyn2290',
  members: [],
  savings: [],
  loans: [],
  lastUpdated: new Date().toISOString()
};

// Load database from file
export const loadDatabase = async () => {
  try {
    const data = await fs.readFile(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, create it
      await fs.writeFile(DB_FILE, JSON.stringify(defaultData, null, 2), 'utf-8');
      return defaultData;
    }
    throw error;
  }
};

// Save database to file
export const saveDatabase = async (data) => {
  data.lastUpdated = new Date().toISOString();
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  return data;
};

// Initialize database on startup
export const initializeDatabase = async () => {
  try {
    const db = await loadDatabase();
    console.log('✅ Database initialized');
    console.log(`📊 Current data: ${db.members.length} members, ${db.savings.length} savings records, ${db.loans.length} loans`);
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    throw error;
  }
};

// Get current database state
let dbCache = null;

export const getDatabase = async () => {
  if (!dbCache) {
    dbCache = await loadDatabase();
  }
  return dbCache;
};

// Update cache after write
export const updateDatabase = async (data) => {
  dbCache = data;
  return await saveDatabase(data);
};
