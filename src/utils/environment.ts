/**
 * 检测当前是否为Node.js环境
 * @returns 是否为Node环境
 */
export function isNodeEnvironment(): boolean {
  return (
    typeof process !== 'undefined' &&
    process.versions != null &&
    process.versions.node != null
  );
}

/**
 * 检测当前是否为浏览器环境
 * @returns 是否为浏览器环境
 */
export function isBrowserEnvironment(): boolean {
  // 如果window和document存在，则认为是浏览器环境
  // 这也会包括测试环境中模拟的浏览器环境
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined'
  );
}

/**
 * 检测当前是否为测试环境
 * @returns 是否为测试环境
 */
export function isTestEnvironment(): boolean {
  return (
    // Vitest环境检测
    typeof process !== 'undefined' &&
    process.env &&
    (process.env.NODE_ENV === 'test' || 
     process.env.VITEST !== undefined)
  );
} 