import { describe, it, expect, beforeEach } from 'vitest';
import { StorageManager } from '../core';
import { ADAPTER_TYPES } from '../adapters';

describe('StorageManager', () => {
  let storageManager: StorageManager;

  beforeEach(() => {
    // 清除localStorage模拟
    localStorage.clear();
    storageManager = new StorageManager();
  });

  it('should store and retrieve values', async () => {
    const testKey = 'testKey';
    const testValue = { foo: 'bar' };

    await storageManager.set(testKey, testValue);
    const retrievedValue = await storageManager.get(testKey);

    expect(retrievedValue).toEqual(testValue);
  });

  it('should handle expiration', async () => {
    const testKey = 'expiringKey';
    const testValue = 'will expire soon';

    // 设置一个过期时间为 100ms 的值
    await storageManager.set(testKey, testValue, { expires: 100 });
    
    // 立即获取，应该存在
    let value = await storageManager.get(testKey);
    expect(value).toEqual(testValue);
    
    // 等待过期
    await new Promise(resolve => setTimeout(resolve, 110));
    
    // 再次获取，应该已过期
    value = await storageManager.get(testKey);
    expect(value).toBeUndefined();
  });

  it('should use different adapters', async () => {
    const memoryKey = 'memoryKey';
    const memoryValue = 'memory value';
    
    await storageManager.set(memoryKey, memoryValue, { adapter: ADAPTER_TYPES.MEMORY });
    const value = await storageManager.get(memoryKey, { adapter: ADAPTER_TYPES.MEMORY });
    
    expect(value).toEqual(memoryValue);
    
    // 在 localStorage 中不应该存在
    const localValue = await storageManager.get(memoryKey, { adapter: ADAPTER_TYPES.LOCAL_STORAGE });
    expect(localValue).toBeUndefined();
  });

  it('should remove items', async () => {
    const testKey = 'toBeRemoved';
    await storageManager.set(testKey, 'temporary');
    
    await storageManager.remove(testKey);
    const value = await storageManager.get(testKey);
    
    expect(value).toBeUndefined();
  });

  it('should check if keys exist', async () => {
    const testKey = 'existingKey';
    await storageManager.set(testKey, 'exists');
    
    const exists = await storageManager.has(testKey);
    const doesNotExist = await storageManager.has('nonExistentKey');
    
    expect(exists).toBe(true);
    expect(doesNotExist).toBe(false);
  });
}); 