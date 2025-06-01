import { StorageManager } from './StorageManager';
import type { StorageManagerOptions } from '../types';
import type { AdapterType } from '../adapters';

/**
 * 简化的存储API接口
 * 使用更短的方法名，提供更简洁的使用体验
 */
export class SimpleStore {
  private manager: StorageManager;

  /**
   * 创建简化存储接口
   * @param options 配置选项
   */
  constructor(options?: StorageManagerOptions) {
    this.manager = new StorageManager(options);
  }

  /**
   * 设置存储项
   * @param key 键名
   * @param value 值
   * @param options 选项
   */
  async put<T>(key: string, value: T, options?: { expires?: number; adapter?: AdapterType | string }): Promise<void> {
    return this.manager.set(key, value, options);
  }

  /**
   * 获取存储项
   * @param key 键名
   * @param options 选项
   */
  async get<T>(key: string, options?: { adapter?: AdapterType | string }): Promise<T | undefined> {
    return this.manager.get(key, options);
  }

  /**
   * 删除存储项
   * @param key 键名
   * @param options 选项
   */
  async del(key: string, options?: { adapter?: AdapterType | string }): Promise<void> {
    return this.manager.remove(key, options);
  }

  /**
   * 检查键是否存在
   * @param key 键名
   * @param options 选项
   */
  async has(key: string, options?: { adapter?: AdapterType | string }): Promise<boolean> {
    return this.manager.has(key, options);
  }

  /**
   * 获取所有键名
   * @param options 选项
   */
  async keys(options?: { adapter?: AdapterType | string }): Promise<string[]> {
    return this.manager.keys(options);
  }

  /**
   * 清空存储
   * @param options 选项
   */
  async clear(options?: { adapter?: AdapterType | string }): Promise<void> {
    return this.manager.clear(options);
  }

  /**
   * 获取原始存储管理器实例
   * 用于访问高级功能
   */
  getManager(): StorageManager {
    return this.manager;
  }

  /**
   * 调试方法：获取所有已注册的适配器
   * 仅在开发环境中使用
   */
  getRegisteredAdapters(): string[] {
    return Array.from(this.manager["adapters"].keys());
  }
} 