/**
 * 简单的加密工具
 * 注意：这只是基本的加密，不适用于高安全性要求
 */

/**
 * 简单加密字符串
 * @param value 要加密的字符串
 * @returns 加密后的字符串
 */
export function encrypt(value: string): string {
  try {
    // 使用 Base64 编码作为简单加密
    return btoa(encodeURIComponent(value));
  } catch (error) {
    console.error('Encryption failed:', error);
    return value;
  }
}

/**
 * 解密字符串
 * @param encryptedValue 加密的字符串
 * @returns 解密后的字符串
 */
export function decrypt(encryptedValue: string): string {
  try {
    // 解码 Base64 字符串
    return decodeURIComponent(atob(encryptedValue));
  } catch (error) {
    console.error('Decryption failed:', error);
    return encryptedValue;
  }
} 