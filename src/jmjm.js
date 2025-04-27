import CryptoJS from 'crypto-js';

// 从环境变量获取密钥（关键安全步骤！）
// const SECRET_KEY = CryptoJS.enc.Utf8.parse(import.meta.env.VITE_ENCRYPTION_KEY); // [!code ++]
const SECRET_KEY = CryptoJS.enc.Utf8.parse('K7gNU3sdo+OL0wNhqoVWhr3gEsMw7y8f');
// const FIXED_SALT_HEX = CryptoJS.enc.Hex.parse(import.meta.env.VITE_FIXED_SALT);  // [!code ++]
const FIXED_SALT_HEX = CryptoJS.enc.Hex.parse('3e7a41f8d32a9b014cd4b5d8c890d4f3');

// console.log('[加密调试] SECRET_KEY:', SECRET_KEY);
// console.log('[加密调试] FIXED_SALT_HEX:', FIXED_SALT_HEX);

// AES-256 加密
export const encrypt = (data) => {
  const encrypted = CryptoJS.AES.encrypt(data, SECRET_KEY, {
    iv: FIXED_SALT_HEX, // 直接使用已解析的 IV
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });

  // 轉換為 URL-safe Base64 並過濾斜杠
  return encrypted.ciphertext
    .toString(CryptoJS.enc.Base64)
    .replace(/\//g, '_')  // 替換斜杠
    .replace(/\+/g, '-') // 替換加號
    .replace(/=+$/, ''); // 移除填充等號
};

// AES-256 解密
export const decrypt = (ciphertext) => {

  // 还原URL安全的Base64编码
  let base64 = ciphertext.replace(/-/g, '+').replace(/_/g, '/');

  // 补全Base64填充等号
  const padLength = (4 - (base64.length % 4)) % 4;
  base64 += '='.repeat(padLength);

  // 解密处理后的Base64字符串
  const bytes = CryptoJS.AES.decrypt(
    { ciphertext: CryptoJS.enc.Base64.parse(base64) }, // 直接解析处理后的Base64
    SECRET_KEY,
    {
      iv: FIXED_SALT_HEX,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    }
  );
  return bytes.toString(CryptoJS.enc.Utf8);
};
