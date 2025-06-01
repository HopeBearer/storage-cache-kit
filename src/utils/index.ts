import type { StorageItem } from '../types';
import { encrypt, decrypt } from './crypto';
import { isNodeEnvironment, isBrowserEnvironment, isTestEnvironment } from './environment';

/**
 * 检查存储项是否过期
 * @param item 存储项
 * @returns 是否过期
 */
export function isExpired(item: StorageItem): boolean {
  if (!item.expires) return false;
  const now = Date.now();
  return now - item.timestamp > item.expires;
}

/**
 * 序列化存储项
 * @param item 存储项
 * @param shouldEncrypt 是否加密
 * @returns 序列化后的字符串
 */
export function serializeItem<T>(item: StorageItem<T>, shouldEncrypt: boolean = false): string {
  const serialized = JSON.stringify(item);
  return shouldEncrypt ? encrypt(serialized) : serialized;
}

/**
 * 反序列化存储项
 * @param data 序列化的字符串
 * @param isEncrypted 是否为加密数据
 * @returns 存储项对象
 */
export function deserializeItem<T>(data: string, isEncrypted: boolean = false): StorageItem<T> {
  try {
    const decryptedData = isEncrypted ? decrypt(data) : data;
    return JSON.parse(decryptedData) as StorageItem<T>;
  } catch (error) {
    console.error('Failed to deserialize item:', error);
    throw new Error('Invalid storage item format');
  }
}

/**
 * 解析存储项，兼容非标准格式
 * @param data 存储的数据字符串
 * @param isEncrypted 是否为加密数据
 * @returns 标准格式的存储项或undefined
 */
export function parseStorageItem<T>(data: string, isEncrypted: boolean = false): StorageItem<T> | undefined {
  if (!data) return undefined;
  
  // 首先尝试按照标准格式解析
  try {
    const parsedItem = deserializeItem<T>(data, isEncrypted);
    // 验证是否符合标准格式
    if (
      parsedItem && 
      typeof parsedItem === 'object' && 
      'value' in parsedItem && 
      'timestamp' in parsedItem
    ) {
      return parsedItem;
    }
  } catch (e) {
    // 解析标准格式失败，继续处理
    // 在调试模式下可以记录详细信息
    if (process.env.NODE_ENV === 'development') {
      console.debug('Item not in standard format, trying alternative parsing:', e);
    }
  }
  
  // 尝试解析为 JSON
  let value: T;
  try {
    value = JSON.parse(data) as T;
    if (process.env.NODE_ENV === 'development') {
      console.debug('Successfully parsed as JSON:', value);
    }
  } catch (e) {
    // 如果 JSON 解析失败，则使用原始字符串
    value = data as unknown as T;
    if (process.env.NODE_ENV === 'development') {
      console.debug('Using raw string as value:', data);
    }
  }
  
  // 返回兼容的 StorageItem
  return {
    value,
    timestamp: Date.now(),
    expires: undefined
  };
}

/**
 * 生成带命名空间的键名
 * @param key 原始键名
 * @param namespace 命名空间
 * @returns 带命名空间的键名
 */
export function namespaceKey(key: string, namespace?: string): string {
  return namespace ? `${namespace}:${key}` : key;
}

export { isNodeEnvironment, isBrowserEnvironment, isTestEnvironment }; 