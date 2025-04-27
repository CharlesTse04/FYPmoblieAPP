import CryptoJS from 'crypto-js';

// 从环境变量获取密钥（关键安全步骤！）
const SECRET_KEY = CryptoJS.enc.Utf8.parse('K7gNU3sdo+OL0wNhqoVWhr3gEsMw7y8f');
const FIXED_SALT_HEX = CryptoJS.enc.Hex.parse('3e7a41f8d32a9b014cd4b5d8c890d4f3');

// AES-256 加密
interface EncryptOptions {
    iv: CryptoJS.lib.WordArray;
    mode: typeof CryptoJS.mode.CBC;
    padding: typeof CryptoJS.pad.Pkcs7;
}

export const encrypt = (data: string): string => {
    const options: EncryptOptions = {
        iv: FIXED_SALT_HEX, // 直接使用已解析的 IV
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    };

    const encrypted = CryptoJS.AES.encrypt(data, SECRET_KEY, options);

    // 轉換為 URL-safe Base64 並過濾斜杠
    return encrypted.ciphertext
        .toString(CryptoJS.enc.Base64)
        .replace(/\//g, '_')  // 替換斜杠
        .replace(/\+/g, '-') // 替換加號
        .replace(/=+$/, ''); // 移除填充等號
};

// AES-256 解密
interface DecryptOptions {
    iv: CryptoJS.lib.WordArray;
}

export const decrypt = (ciphertext: string): string => {
    if (!ciphertext) {

        return ''; // Handle the error as needed
    }

    const options: DecryptOptions = {
        iv: FIXED_SALT_HEX,
    };

    const bytes = CryptoJS.AES.decrypt(
        ciphertext.replace(/_/g, '/').replace(/-/g, '+'),
        SECRET_KEY,
        options
    );

    return bytes.toString(CryptoJS.enc.Utf8);
};