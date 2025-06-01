import type { StorageAdapter, StorageItem } from '../types';
import { serializeItem, parseStorageItem } from '../utils';
import { warnOnce } from '../utils/environment';

// 检查 cookie 是否可用
function isCookieAvailable(): boolean {
  try {
    if (typeof document === 'undefined' || typeof document.cookie === 'undefined') {
      return false;
    }
    
    // 测试 cookie 是否可写
    const testKey = '__test_cookie__';
    const testValue = 'test';
    const now = new Date();
    now.setTime(now.getTime() + 1000); // 1秒后过期
    
    document.cookie = `${testKey}=${testValue}; expires=${now.toUTCString()}; path=/`;
    const success = document.cookie.indexOf(testKey) !== -1;
    
    // 立即删除测试 cookie
    document.cookie = `${testKey}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    
    return success;
  } catch (e) {
    return false;
  }
}

/**
 * Cookie存储适配器
 */
export class CookieStorageAdapter implements StorageAdapter {
  private readonly encrypt: boolean;
  private readonly defaultDays: number;
  private readonly path: string;
  private readonly domain?: string;
  private readonly secure: boolean;
  private readonly sameSite: 'strict' | 'lax' | 'none';
  private readonly available: boolean;

  /**
   * 创建Cookie存储适配器
   * @param options Cookie配置选项
   */
  constructor(options: {
    encrypt?: boolean;
    defaultDays?: number;
    path?: string;
    domain?: string;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
  } = {}) {
    this.encrypt = options.encrypt || false;
    this.defaultDays = options.defaultDays || 7; // 默认7天
    this.path = options.path || '/';
    this.domain = options.domain;
    this.secure = options.secure || false;
    this.sameSite = options.sameSite || 'lax';
    this.available = isCookieAvailable();
    
    if (!this.available) {
      warnOnce('Cookie is not available in this environment.');
    }
  }

  /**
   * 设置存储项
   * @param key 键名
   * @param item 存储项
   */
  async setItem<T>(key: string, item: StorageItem<T>): Promise<void> {
    if (!this.available) {
      throw new Error('Cookie is not available in this environment');
    }
    
    try {
      const serialized = serializeItem(item, this.encrypt);
      
      // 计算过期时间
      const days = item.expires ? Math.ceil(item.expires / (24 * 60 * 60 * 1000)) : this.defaultDays;
      const expiresDate = new Date();
      expiresDate.setTime(expiresDate.getTime() + days * 24 * 60 * 60 * 1000);
      
      // 构建cookie字符串
      let cookieStr = `${encodeURIComponent(key)}=${encodeURIComponent(serialized)}; expires=${expiresDate.toUTCString()}; path=${this.path}`;
      
      if (this.domain) {
        cookieStr += `; domain=${this.domain}`;
      }
      
      if (this.secure) {
        cookieStr += '; secure';
      }
      
      cookieStr += `; samesite=${this.sameSite}`;
      
      // 设置cookie
      document.cookie = cookieStr;
    } catch (error) {
      console.error(`Failed to set cookie '${key}':`, error);
      throw new Error(`Failed to set cookie '${key}'`);
    }
  }

  /**
   * 获取存储项
   * @param key 键名
   * @returns 存储项或undefined（如果不存在）
   */
  async getItem<T>(key: string): Promise<StorageItem<T> | undefined> {
    if (!this.available) {
      throw new Error('Cookie is not available in this environment');
    }
    
    try {
      const cookies = document.cookie.split(';');
      const encodedKey = encodeURIComponent(key);
      
      for (const cookie of cookies) {
        const [cookieKey, cookieValue] = cookie.trim().split('=');
        
        if (cookieKey === encodedKey && cookieValue) {
          const decodedValue = decodeURIComponent(cookieValue);
          
          // 使用通用函数处理标准和非标准格式
          return parseStorageItem<T>(decodedValue, this.encrypt);
        }
      }
      
      return undefined;
    } catch (error) {
      console.error(`Failed to get cookie '${key}':`, error);
      return undefined;
    }
  }

  /**
   * 移除存储项
   * @param key 键名
   */
  async removeItem(key: string): Promise<void> {
    if (!this.available) {
      throw new Error('Cookie is not available in this environment');
    }
    
    // 设置过期时间为过去，即删除cookie
    document.cookie = `${encodeURIComponent(key)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${this.path}`;
    
    if (this.domain) {
      document.cookie = `${encodeURIComponent(key)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${this.path}; domain=${this.domain}`;
    }
  }

  /**
   * 清空所有存储
   * 注意：只能清除当前域下的cookie，且受路径限制
   */
  async clear(): Promise<void> {
    if (!this.available) {
      throw new Error('Cookie is not available in this environment');
    }
    
    const cookies = document.cookie.split(';');
    
    for (const cookie of cookies) {
      const cookieKey = cookie.split('=')[0].trim();
      await this.removeItem(cookieKey);
    }
  }

  /**
   * 获取所有键名
   * @returns 键名数组
   */
  async keys(): Promise<string[]> {
    if (!this.available) {
      throw new Error('Cookie is not available in this environment');
    }
    
    const cookies = document.cookie.split(';');
    const keys: string[] = [];
    
    for (const cookie of cookies) {
      if (cookie.trim()) {
        const cookieKey = cookie.split('=')[0].trim();
        keys.push(decodeURIComponent(cookieKey));
      }
    }
    
    return keys;
  }
} 