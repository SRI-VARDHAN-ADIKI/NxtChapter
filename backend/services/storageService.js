import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');

export class StorageService {
  constructor(collectionName) {
    this.collectionName = collectionName;
    this.filePath = path.join(DATA_DIR, `${collectionName}.json`);
  }

  async _ensureDir() {
    try {
      await fs.access(DATA_DIR);
    } catch {
      await fs.mkdir(DATA_DIR, { recursive: true });
    }
  }

  async getAll() {
    await this._ensureDir();
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  async saveAll(data) {
    await this._ensureDir();
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2));
  }

  async findOne(query) {
    const data = await this.getAll();
    return data.find(item => {
      return Object.entries(query).every(([key, value]) => item[key] === value);
    });
  }

  async create(item) {
    const data = await this.getAll();
    const newItem = { 
      ...item, 
      _id: item._id || Math.random().toString(36).substr(2, 9),
      id: item.id || Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    data.push(newItem);
    await this.saveAll(data);
    return newItem;
  }

  async findById(id) {
    const data = await this.getAll();
    return data.find(item => item._id === id || item.id === id);
  }

  async updateOne(query, update) {
    const data = await this.getAll();
    const index = data.findIndex(item => {
      return Object.entries(query).every(([key, value]) => item[key] === value);
    });
    if (index !== -1) {
      data[index] = { ...data[index], ...update, updatedAt: new Date().toISOString() };
      await this.saveAll(data);
      return data[index];
    }
    return null;
  }
}

export const usersStorage = new StorageService('users');
export const coursesStorage = new StorageService('courses');
export const topicsStorage = new StorageService('topics');
export const doubtsStorage = new StorageService('doubts');
export const progressStorage = new StorageService('progress');
export const codingStorage = new StorageService('coding');
export const quizStorage = new StorageService('quiz');
