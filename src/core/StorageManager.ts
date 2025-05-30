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

/**
 * 扩展的存储项选项
 */
interface ExtendedStorageItemOptions extends StorageItemOptions {
  adapter?: AdapterType
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
    const defaultAdapter =
      !isBrowser || isNode
        ? ADAPTER_TYPES.MEMORY
        : options.defaultAdapter || ADAPTER_TYPES.LOCAL_STORAGE

    this.options = {
      defaultAdapter: defaultAdapter as AdapterType,
      defaultExpires: 0, // 默认不过期
      defaultEncrypt: false,
      namespace: '',
      ...options
    } as Required<StorageManagerOptions> & { defaultAdapter: AdapterType }

    // 注册默认适配器
    // 在纯Node环境中，只注册内存存储适配器
    if (isNode && !isTest) {
      this.registerAdapter(
        ADAPTER_TYPES.MEMORY,
        new MemoryStorageAdapter(this.options.defaultEncrypt)
      )
    } else {
      // 浏览器环境或测试环境，注册所有适配器
      this.registerAdapter(
        ADAPTER_TYPES.LOCAL_STORAGE,
        new LocalStorageAdapter(this.options.defaultEncrypt)
      )
      this.registerAdapter(
        ADAPTER_TYPES.SESSION_STORAGE,
        new SessionStorageAdapter(this.options.defaultEncrypt)
      )
      this.registerAdapter(
        ADAPTER_TYPES.MEMORY,
        new MemoryStorageAdapter(this.options.defaultEncrypt)
      )
      this.registerAdapter(
        ADAPTER_TYPES.COOKIE,
        new CookieStorageAdapter({ encrypt: this.options.defaultEncrypt })
      )
    }
  }

  /**
   * 注册存储适配器
   * @param name 适配器名称
   * @param adapter 适配器实例
   */
  registerAdapter(name: string, adapter: StorageAdapter): void {
    this.adapters.set(name, adapter)
  }

  /**
   * 获取存储适配器
   * @param name 适配器名称
   * @returns 适配器实例
   */
  getAdapter(name: string = this.options.defaultAdapter): StorageAdapter {
    const adapter = this.adapters.get(name)
    if (!adapter) {
      throw new Error(`Adapter '${name}' not found`)
    }
    return adapter
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
    const adapterName = options.adapter || this.options.defaultAdapter
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
    const adapterName = options.adapter || this.options.defaultAdapter
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
    options: { adapter?: AdapterType } = {}
  ): Promise<void> {
    const adapterName = options.adapter || this.options.defaultAdapter
    const adapter = this.getAdapter(adapterName)
    const namespacedKey = namespaceKey(key, this.options.namespace)
    await adapter.removeItem(namespacedKey)
  }

  /**
   * 清空指定适配器的所有存储
   * @param options 选项
   * @returns Promise
   */
  async clear(options: { adapter?: AdapterType } = {}): Promise<void> {
    const adapterName = options.adapter || this.options.defaultAdapter
    const adapter = this.getAdapter(adapterName)
    await adapter.clear()
  }

  /**
   * 获取指定适配器的所有键名
   * @param options 选项
   * @returns 键名数组
   */
  async keys(options: { adapter?: AdapterType } = {}): Promise<string[]> {
    const adapterName = options.adapter || this.options.defaultAdapter
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
    options: { adapter?: AdapterType } = {}
  ): Promise<boolean> {
    const value = await this.get(key, options)
    return value !== undefined
  }
}
