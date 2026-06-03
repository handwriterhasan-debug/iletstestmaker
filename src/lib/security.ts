import CryptoJS from 'crypto-js';

const SECRET_KEY = '1856hk_secure_filfo_key_2026';

export const encryptData = (data: any): string => {
  try {
    const jsonString = JSON.stringify(data);
    return CryptoJS.AES.encrypt(jsonString, SECRET_KEY).toString();
  } catch (error) {
    console.error('Encryption failed:', error);
    return '';
  }
};

export const decryptData = (encryptedText: string | null): any => {
  if (!encryptedText) return null;
  
  // Backwards compatibility check
  if (typeof encryptedText === 'string' && (encryptedText.startsWith('[') || encryptedText.startsWith('{') || encryptedText.startsWith('"'))) {
    try {
      return JSON.parse(encryptedText);
    } catch {
      // Not JSON, proceed to decryption
    }
  }

  try {
    const bytes = CryptoJS.AES.decrypt(encryptedText, SECRET_KEY);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    if (!decryptedString) throw new Error('Decryption error or empty result');
    return JSON.parse(decryptedString);
  } catch (error) {
    console.warn('Decryption failed, returning plain/empty:', error);
    try {
      return JSON.parse(encryptedText);
    } catch {
      return null;
    }
  }
};

export const getSecureStorage = (key: string, defaultValue: any = null) => {
  const value = localStorage.getItem(key);
  if (!value) return defaultValue;
  const decrypted = decryptData(value);
  return decrypted !== null ? decrypted : defaultValue;
};

export const setSecureStorage = (key: string, value: any) => {
  const encrypted = encryptData(value);
  localStorage.setItem(key, encrypted);
};
