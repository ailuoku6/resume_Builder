import type { ResumeData } from '../../../src/entities/resume/model/types';

const PASSWORD_ITERATIONS = 120_000;
const PASSWORD_HASH_BYTES = 32;
const AES_GCM_IV_BYTES = 12;
const PASSWORD_SALT_BYTES = 16;

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

const toUint8Array = (value: ArrayBuffer | Uint8Array): Uint8Array => {
  return value instanceof Uint8Array ? value : new Uint8Array(value);
};

const encodeBase64 = (value: ArrayBuffer | Uint8Array): string => {
  const bytes = toUint8Array(value);
  let binary = '';

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary);
};

const decodeBase64 = (value: string): Uint8Array => {
  return new Uint8Array(Uint8Array.from(atob(value), (char) => char.charCodeAt(0)));
};

const toArrayBuffer = (value: Uint8Array): ArrayBuffer => {
  return value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength) as ArrayBuffer;
};

const createPasswordKey = async (password: string): Promise<CryptoKey> => {
  return crypto.subtle.importKey('raw', textEncoder.encode(password), 'PBKDF2', false, ['deriveBits']);
};

const createEncryptionKey = async (secret: string, userId: string): Promise<CryptoKey> => {
  const digest = await crypto.subtle.digest('SHA-256', textEncoder.encode(`${secret}:${userId}`));

  return crypto.subtle.importKey('raw', digest, 'AES-GCM', false, ['encrypt', 'decrypt']);
};

export const createPasswordRecord = async (
  password: string,
): Promise<{ passwordHash: string; passwordSalt: string }> => {
  const salt = crypto.getRandomValues(new Uint8Array(PASSWORD_SALT_BYTES));
  const passwordHash = await hashPassword(password, encodeBase64(salt));

  return {
    passwordHash,
    passwordSalt: encodeBase64(salt),
  };
};

export const hashPassword = async (password: string, salt: string): Promise<string> => {
  const passwordKey = await createPasswordKey(password);
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: toArrayBuffer(decodeBase64(salt)),
      iterations: PASSWORD_ITERATIONS,
    },
    passwordKey,
    PASSWORD_HASH_BYTES * 8,
  );

  return encodeBase64(derivedBits);
};

export const verifyPassword = async (
  password: string,
  passwordHash: string,
  passwordSalt: string,
): Promise<boolean> => {
  const nextHash = await hashPassword(password, passwordSalt);

  return nextHash === passwordHash;
};

export const encryptResumeData = async (
  secret: string,
  userId: string,
  data: ResumeData,
): Promise<{ encryptedPayload: string; payloadIv: string }> => {
  const key = await createEncryptionKey(secret, userId);
  const iv = crypto.getRandomValues(new Uint8Array(AES_GCM_IV_BYTES));
  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    textEncoder.encode(JSON.stringify(data)),
  );

  return {
    encryptedPayload: encodeBase64(encrypted),
    payloadIv: encodeBase64(iv),
  };
};

export const decryptResumeData = async (
  secret: string,
  userId: string,
  encryptedPayload: string,
  payloadIv: string,
): Promise<ResumeData> => {
  const key = await createEncryptionKey(secret, userId);
  const decrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: toArrayBuffer(decodeBase64(payloadIv)),
    },
    key,
    toArrayBuffer(decodeBase64(encryptedPayload)),
  );

  return JSON.parse(textDecoder.decode(decrypted)) as ResumeData;
};
