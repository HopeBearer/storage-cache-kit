// 导出核心模块
export * from './core';

// 导出适配器
export * from './adapters';

// 导出类型
export * from './types';


// 创建默认存储管理器实例
import { SimpleStore } from './core';


// 创建并导出简化API单例实例
export const store = new SimpleStore();