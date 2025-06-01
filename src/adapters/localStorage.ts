import type { StorageAdapter, StorageItem } from '../types';
import { serializeItem, parseStorageItem } from '../utils';
import { warnOnce } from '../utils/environment';

// 检查 localStorage 是否可用
function isLocalStorageAvailable(): boolean {
  try {
    if (typeof localStorage === 'undefined') return false;
    
    // 测试 localStorage 是否可写
    const testKey = '__test_localStorage__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * localStorage 存储适配器
 */
export class LocalStorageAdapter implements StorageAdapter {
  private readonly encrypt: boolean;
  private readonly available: boolean;

  /**
   * 创建 localStorage 适配器
   * @param encrypt 是否加密数据
   */
  constructor(encrypt: boolean = false) {
    this.encrypt = encrypt;
    this.available = isLocalStorageAvailable();
    
    if (!this.available) {
      warnOnce('localStorage is not available in this environment.');
    }
  }

  /**
   * 设置存储项
   * @param key 键名
   * @param item 存储项
   */
  async setItem<T>(key: string, item: StorageItem<T>): Promise<void> {
    if (!this.available) {
      throw new Error('localStorage is not available in this environment');
    }
    
    try {
      const serialized = serializeItem(item, this.encrypt);
      localStorage.setItem(key, serialized);
    } catch (error) {
      console.error(`Failed to set item '${key}':`, error);
      throw new Error(`Failed to set item '${key}'`);
    }
  }

  /**
   * 获取存储项
   * @param key 键名
   * @returns 存储项或undefined（如果不存在）
   */
  async getItem<T>(key: string): Promise<StorageItem<T> | undefined> {
    if (!this.available) {
      throw new Error('localStorage is not available in this environment');
    }
    
    try {
      const data = localStorage.getItem(key);
      if (!data) return undefined;
      
      // 使用通用函数处理标准和非标准格式
      return parseStorageItem<T>(data, this.encrypt);
    } catch (error) {
      console.error(`Failed to get item '${key}':`, error);
      return undefined;
    }
  }

  /**
   * 移除存储项
   * @param key 键名
   */
  async removeItem(key: string): Promise<void> {
    if (!this.available) {
      throw new Error('localStorage is not available in this environment');
    }
    
    localStorage.removeItem(key);
  }

  /**
   * 清空所有存储
   */
  async clear(): Promise<void> {
    if (!this.available) {
      throw new Error('localStorage is not available in this environment');
    }
    
    localStorage.clear();
  }

  /**
   * 获取所有键名
   * @returns 键名数组
   */
  async keys(): Promise<string[]> {
    if (!this.available) {
      throw new Error('localStorage is not available in this environment');
    }
    
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        keys.push(key);
      }
    }
    return keys;
  }
} 