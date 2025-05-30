import type { StorageAdapter, StorageItem } from '../types';
import { serializeItem, deserializeItem } from '../utils';

/**
 * sessionStorage 存储适配器
 */
export class SessionStorageAdapter implements StorageAdapter {
  private readonly encrypt: boolean;

  /**
   * 创建 sessionStorage 适配器
   * @param encrypt 是否加密数据
   */
  constructor(encrypt: boolean = false) {
    this.encrypt = encrypt;
  }

  /**
   * 设置存储项
   * @param key 键名
   * @param item 存储项
   */
  async setItem<T>(key: string, item: StorageItem<T>): Promise<void> {
    try {
      const serialized = serializeItem(item, this.encrypt);
      sessionStorage.setItem(key, serialized);
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
    try {
      const data = sessionStorage.getItem(key);
      if (!data) return undefined;
      return deserializeItem<T>(data, this.encrypt);
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
    sessionStorage.removeItem(key);
  }

  /**
   * 清空所有存储
   */
  async clear(): Promise<void> {
    sessionStorage.clear();
  }

  /**
   * 获取所有键名
   * @returns 键名数组
   */
  async keys(): Promise<string[]> {
    const keys: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
        keys.push(key);
      }
    }
    return keys;
  }
} 