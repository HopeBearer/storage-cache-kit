import type { StorageAdapter, StorageItem } from '../types';
import { serializeItem, parseStorageItem } from '../utils';

/**
 * 内存存储适配器
 * 用于在内存中临时存储数据，页面刷新后数据会丢失
 */
export class MemoryStorageAdapter implements StorageAdapter {
  private storage: Map<string, string> = new Map();
  private readonly encrypt: boolean;

  /**
   * 创建内存存储适配器
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
      this.storage.set(key, serialized);
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
      const data = this.storage.get(key);
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
    this.storage.delete(key);
  }

  /**
   * 清空所有存储
   */
  async clear(): Promise<void> {
    this.storage.clear();
  }

  /**
   * 获取所有键名
   * @returns 键名数组
   */
  async keys(): Promise<string[]> {
    return Array.from(this.storage.keys());
  }
} 