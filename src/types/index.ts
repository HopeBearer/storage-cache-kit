/**
 * 存储项配置接口
 */
export interface StorageItemOptions {
  /** 过期时间（毫秒）*/
  expires?: number;
  /** 是否使用加密 */
  encrypt?: boolean;
}

/**
 * 存储项数据结构
 */
export interface StorageItem<T = any> {
  /** 存储的值 */
  value: T;
  /** 创建时间戳 */
  timestamp: number;
  /** 过期时间（毫秒） */
  expires?: number;
}

/**
 * 存储适配器接口
 */
export interface StorageAdapter {
  /**
   * 设置存储项
   * @param key 键名
   * @param item 存储项
   */
  setItem<T>(key: string, item: StorageItem<T>): Promise<void>;

  /**
   * 获取存储项
   * @param key 键名
   * @returns 存储项或undefined（如果不存在）
   */
  getItem<T>(key: string): Promise<StorageItem<T> | undefined>;

  /**
   * 移除存储项
   * @param key 键名
   */
  removeItem(key: string): Promise<void>;

  /**
   * 清空所有存储
   */
  clear(): Promise<void>;

  /**
   * 获取所有键名
   * @returns 键名数组
   */
  keys(): Promise<string[]>;
}

/**
 * 存储管理器配置接口
 */
export interface StorageManagerOptions {
  /** 默认存储适配器 */
  defaultAdapter?: string;
  /** 默认过期时间（毫秒） */
  defaultExpires?: number;
  /** 是否默认使用加密 */
  defaultEncrypt?: boolean;
  /** 命名空间前缀 */
  namespace?: string;
} 