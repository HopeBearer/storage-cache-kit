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
 * @param isEncrypted 是否加密
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
 * 生成带命名空间的键名
 * @param key 原始键名
 * @param namespace 命名空间
 * @returns 带命名空间的键名
 */
export function namespaceKey(key: string, namespace?: string): string {
  return namespace ? `${namespace}:${key}` : key;
}

export { isNodeEnvironment, isBrowserEnvironment, isTestEnvironment }; 