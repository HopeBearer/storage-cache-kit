// 导出核心模块
export * from './core';

// 导出适配器
export * from './adapters';

// 导出类型
export * from './types';

// 创建默认存储管理器实例
import { StorageManager, SimpleStore } from './core';

// 默认导出单例实例 (原始API)
const defaultStorageManager = new StorageManager();
export default defaultStorageManager;

// 创建并导出简化API单例实例
export const store = new SimpleStore();

// 导出简化API方法
export const { 
  put, 
  get, 
  del, 
  has, 
  keys, 
  clear 
} = store; 