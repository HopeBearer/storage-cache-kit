import type {
  StorageAdapter,
  StorageItem,
  StorageItemOptions,
  StorageManagerOptions
} from '../types'
import {
  isExpired,
  namespaceKey,
  isNodeEnvironment,
  isBrowserEnvironment,
  isTestEnvironment
} from '../utils'
import {
  LocalStorageAdapter,
  SessionStorageAdapter,
  MemoryStorageAdapter,
  CookieStorageAdapter,
  ADAPTER_TYPES
} from '../adapters'
import type { AdapterType } from '../adapters'
import { warnOnce } from '../utils/environment'

/**
 * 扩展的存储项选项
 */
interface ExtendedStorageItemOptions extends StorageItemOptions {
  adapter?: AdapterType | string
}

/**
 * 安全地检查是否为开发环境
 * 同时兼容Node.js和浏览器环境
 */
function isDevelopment(): boolean {
  try {
    // Node.js 环境
    if (typeof process !== 'undefined' && process.env) {
      return process.env.NODE_ENV === 'development';
    }
    // 浏览器环境
    return false; // 在浏览器中默认不开启调试日志
  } catch (e) {
    return false;
  }
}

/**
 * 安全地输出调试日志
 * 同时兼容Node.js和浏览器环境
 */
function debugLog(...args: any[]): void {
  if (isDevelopment()) {
    console.debug(...args);
  }
}

/**
 * 存储管理器
 * 用于统一管理各种类型的客户端存储
 */
export class StorageManager {
  private adapters: Map<string, StorageAdapter> = new Map()
  private options: Required<StorageManagerOptions> & {
    defaultAdapter: AdapterType
  }

  /**
   * 创建存储管理器
   * @param options 配置选项
   */
  constructor(options: StorageManagerOptions = {}) {
    // 检测环境
    const isNode = isNodeEnvironment()
    const isTest = isTestEnvironment()
    const isBrowser = isBrowserEnvironment() || isTest // 在测试环境中也当作浏览器环境处理

    // 确定默认适配器
    let defaultAdapter: string;
    
    if (typeof options.defaultAdapter === 'string') {
      defaultAdapter = this.mapAdapterString(options.defaultAdapter);
    } else {
      defaultAdapter = !isBrowser || isNode
        ? ADAPTER_TYPES.MEMORY
        : options.defaultAdapter || ADAPTER_TYPES.LOCAL_STORAGE;
    }

    // 创建选项对象，处理默认值
    const optionsCopy = { ...options };
    
    // 避免重复设置 defaultAdapter
    delete optionsCopy.defaultAdapter;
    
    this.options = {
      defaultAdapter: defaultAdapter as AdapterType,
      defaultExpires: 0, // 默认不过期
      defaultEncrypt: false,
      namespace: '',
      ...optionsCopy
    } as Required<StorageManagerOptions> & { defaultAdapter: AdapterType }

    // 注册所有适配器，让适配器自己决定是否可用
    this.registerAdapters();

    // 调试日志
    debugLog('Registered adapters:', Array.from(this.adapters.keys()));
    
    // 验证默认适配器是否可用
    if (!this.adapters.has(this.options.defaultAdapter.toLowerCase())) {
      // 默认适配器不可用，切换到内存适配器
      warnOnce(`Default adapter '${this.options.defaultAdapter}' is not available, falling back to memory adapter.`);
      this.options.defaultAdapter = ADAPTER_TYPES.MEMORY;
    }
  }
  
  /**
   * 注册所有适配器
   * @private
   */
  private registerAdapters(): void {
    // 注册内存存储适配器（这个应该总是可用的）
    const memoryAdapter = new MemoryStorageAdapter(this.options.defaultEncrypt);
    this.registerAdapterWithAliases(ADAPTER_TYPES.MEMORY, memoryAdapter, ['memory', 'mem']);
    
    // 尝试注册 localStorage 适配器
    try {
      const localStorageAdapter = new LocalStorageAdapter(this.options.defaultEncrypt);
      this.registerAdapterWithAliases(
        ADAPTER_TYPES.LOCAL_STORAGE, 
        localStorageAdapter, 
        ['localStorage', 'local', 'localstorage']
      );
    } catch (error: unknown) {
      debugLog('localStorage adapter registration failed:', error instanceof Error ? error.message : String(error));
    }
    
    // 尝试注册 sessionStorage 适配器
    try {
      const sessionStorageAdapter = new SessionStorageAdapter(this.options.defaultEncrypt);
      this.registerAdapterWithAliases(
        ADAPTER_TYPES.SESSION_STORAGE, 
        sessionStorageAdapter, 
        ['sessionStorage', 'session', 'sessionstorage']
      );
    } catch (error: unknown) {
      debugLog('sessionStorage adapter registration failed:', error instanceof Error ? error.message : String(error));
    }
    
    // 尝试注册 cookie 适配器
    try {
      const cookieAdapter = new CookieStorageAdapter({ encrypt: this.options.defaultEncrypt });
      this.registerAdapterWithAliases(
        ADAPTER_TYPES.COOKIE, 
        cookieAdapter, 
        ['cookie', 'cookies']
      );
    } catch (error: unknown) {
      debugLog('cookie adapter registration failed:', error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * 注册适配器及其别名
   * @private
   * @param primaryName 主要名称
   * @param adapter 适配器实例
   * @param aliases 别名数组
   */
  private registerAdapterWithAliases(primaryName: string, adapter: StorageAdapter, aliases: string[]): void {
    // 注册主要名称（确保使用小写）
    const lowerPrimaryName = primaryName.toLowerCase();
    this.adapters.set(lowerPrimaryName, adapter);
    
    // 注册所有别名（使用小写以确保大小写不敏感）
    for (const alias of aliases) {
      const lowerAlias = alias.toLowerCase();
      if (lowerAlias !== lowerPrimaryName) { // 避免重复注册
        this.adapters.set(lowerAlias, adapter);
      }
    }
    
    // 调试日志
    debugLog(`Registered adapter '${primaryName}' with aliases:`, aliases);
  }

  /**
   * 映射适配器字符串到适配器类型
   * @private
   */
  private mapAdapterString(adapter: string): string {
    if (!adapter) return ADAPTER_TYPES.MEMORY;
    
    // 确保大小写不敏感的映射
    const lowerAdapter = adapter.toLowerCase();
    const adapterMap: Record<string, string> = {
      'localstorage': ADAPTER_TYPES.LOCAL_STORAGE,
      'local': ADAPTER_TYPES.LOCAL_STORAGE,
      'sessionstorage': ADAPTER_TYPES.SESSION_STORAGE,
      'session': ADAPTER_TYPES.SESSION_STORAGE,
      'cookie': ADAPTER_TYPES.COOKIE,
      'cookies': ADAPTER_TYPES.COOKIE,
      'memory': ADAPTER_TYPES.MEMORY,
      'mem': ADAPTER_TYPES.MEMORY,
    };
    
    return adapterMap[lowerAdapter] || adapter;
  }

  /**
   * 注册存储适配器
   * @param name 适配器名称
   * @param adapter 适配器实例
   */
  registerAdapter(name: string, adapter: StorageAdapter): void {
    // 始终使用小写存储适配器名称，确保大小写不敏感
    this.adapters.set(name.toLowerCase(), adapter)
  }

  /**
   * 获取存储适配器
   * @param name 适配器名称
   * @returns 适配器实例
   */
  getAdapter(name: string = this.options.defaultAdapter): StorageAdapter {
    if (!name) {
      name = this.options.defaultAdapter;
    }
    
    // 映射字符串名称
    const mappedName = this.mapAdapterString(name);
    const lowerMappedName = mappedName.toLowerCase();
    
    // 使用小写名称查找适配器，确保大小写不敏感
    const adapter = this.adapters.get(lowerMappedName);
    if (!adapter) {
      // 调试信息：输出所有已注册的适配器名称
      debugLog('Available adapters:', Array.from(this.adapters.keys()));
      debugLog('Requested adapter:', name, 'Mapped to:', lowerMappedName);
      throw new Error(`Adapter '${name}' not found`);
    }
    return adapter;
  }

  /**
   * 设置存储项
   * @param key 键名
   * @param value 值
   * @param options 选项
   * @returns Promise
   */
  async set<T>(
    key: string,
    value: T,
    options: ExtendedStorageItemOptions = {}
  ): Promise<void> {
    const { expires = this.options.defaultExpires } = options
    
    // 处理适配器名称
    let adapterName: string;
    if (options.adapter) {
      adapterName = this.mapAdapterString(options.adapter as string);
    } else {
      adapterName = this.options.defaultAdapter;
    }
    
    const adapter = this.getAdapter(adapterName)
    const namespacedKey = namespaceKey(key, this.options.namespace)

    const item: StorageItem<T> = {
      value,
      timestamp: Date.now(),
      expires
    }

    await adapter.setItem(namespacedKey, item)
  }

  /**
   * 获取存储项
   * @param key 键名
   * @param options 选项
   * @returns 存储值或undefined（如果不存在或已过期）
   */
  async get<T>(
    key: string,
    options: Partial<ExtendedStorageItemOptions> = {}
  ): Promise<T | undefined> {
    // 处理适配器名称
    let adapterName: string;
    if (options.adapter) {
      adapterName = this.mapAdapterString(options.adapter as string);
    } else {
      adapterName = this.options.defaultAdapter;
    }
    
    const adapter = this.getAdapter(adapterName)
    const namespacedKey = namespaceKey(key, this.options.namespace)

    const item = await adapter.getItem<T>(namespacedKey)
    if (!item) return undefined
    
    // 检查是否过期
    if (isExpired(item)) {
      await this.remove(key, { adapter: adapterName })
      return undefined
    }

    return item.value
  }

  /**
   * 移除存储项
   * @param key 键名
   * @param options 选项
   * @returns Promise
   */
  async remove(
    key: string,
    options: { adapter?: AdapterType | string } = {}
  ): Promise<void> {
    // 处理适配器名称
    let adapterName: string;
    if (options.adapter) {
      adapterName = this.mapAdapterString(options.adapter as string);
    } else {
      adapterName = this.options.defaultAdapter;
    }
    
    const adapter = this.getAdapter(adapterName)
    const namespacedKey = namespaceKey(key, this.options.namespace)
    await adapter.removeItem(namespacedKey)
  }

  /**
   * 清空指定适配器的所有存储
   * @param options 选项
   * @returns Promise
   */
  async clear(options: { adapter?: AdapterType | string } = {}): Promise<void> {
    // 处理适配器名称
    let adapterName: string;
    if (options.adapter) {
      adapterName = this.mapAdapterString(options.adapter as string);
    } else {
      adapterName = this.options.defaultAdapter;
    }
    
    const adapter = this.getAdapter(adapterName)
    await adapter.clear()
  }

  /**
   * 获取指定适配器的所有键名
   * @param options 选项
   * @returns 键名数组
   */
  async keys(options: { adapter?: AdapterType | string } = {}): Promise<string[]> {
    // 处理适配器名称
    let adapterName: string;
    if (options.adapter) {
      adapterName = this.mapAdapterString(options.adapter as string);
    } else {
      adapterName = this.options.defaultAdapter;
    }
    
    const adapter = this.getAdapter(adapterName)
    const keys = await adapter.keys()

    // 过滤命名空间
    if (this.options.namespace) {
      const prefix = `${this.options.namespace}:`
      return keys
        .filter((key) => key.startsWith(prefix))
        .map((key) => key.slice(prefix.length))
    }

    return keys
  }

  /**
   * 检查键是否存在
   * @param key 键名
   * @param options 选项
   * @returns 是否存在
   */
  async has(
    key: string,
    options: { adapter?: AdapterType | string } = {}
  ): Promise<boolean> {
    const value = await this.get(key, options)
    return value !== undefined
  }
}
