/**
 * Unicode 文本通过 URI 百分号编码转成单字节序列，再交由浏览器生成 Base64。
 * @param data - 需要保留 Unicode 字符的原始文本。
 * @returns 与原文本 UTF-8 字节对应的 Base64 字符串。
 */
export function utoa(data: string): string {
  return btoa(unescape(encodeURIComponent(data)));
}

/**
 * 将 Base64 字节串还原为 Unicode 文本。
 * @param base64 - 待解码的 Base64 文本。
 * @returns 从 Base64 字节串还原的 Unicode 文本。
 */
export function atou(base64: string): string {
  return decodeURIComponent(escape(atob(base64)));
}
