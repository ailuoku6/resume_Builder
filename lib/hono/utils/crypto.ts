import { scryptSync, timingSafeEqual } from 'node:crypto';

import type { ResumeData } from '../../../src/entities/resume/model/types';

const AES_GCM_IV_BYTES = 12;
const PASSWORD_SALT_BYTES = 16;
const PASSWORD_HASH_BYTES = 32;
const SCRYPT_PREFIX = 'scrypt';
const SCRYPT_N = 16_384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;

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

const createEncryptionKey = async (secret: string, userId: string): Promise<CryptoKey> => {
  const digest = await crypto.subtle.digest('SHA-256', textEncoder.encode(`${secret}:${userId}`));

  return crypto.subtle.importKey('raw', digest, 'AES-GCM', false, ['encrypt', 'decrypt']);
};

type PasswordMeta =
  {
    salt: string;
    n: number;
    p: number;
    r: number;
  };

const buildScryptSaltRecord = (salt: string): string => {
  return `${SCRYPT_PREFIX}$${SCRYPT_N}$${SCRYPT_R}$${SCRYPT_P}$${salt}`;
};

const parsePasswordMeta = (passwordSalt: string): PasswordMeta => {
  const parts = passwordSalt.split('$');

  if (parts.length === 5 && parts[0] === SCRYPT_PREFIX) {
    const n = Number(parts[1]);
    const r = Number(parts[2]);
    const p = Number(parts[3]);
    const salt = parts[4] || '';

    if (Number.isFinite(n) && Number.isFinite(r) && Number.isFinite(p) && salt) {
      return {
        salt,
        n,
        p,
        r,
      };
    }
  }

  throw new Error('Unsupported password salt format.');
};

const hashPasswordWithScrypt = (password: string, salt: string, meta?: Pick<PasswordMeta, 'n' | 'p' | 'r'>): string => {
  const derivedBits = scryptSync(password, decodeBase64(salt), PASSWORD_HASH_BYTES, {
    N: meta?.n ?? SCRYPT_N,
    p: meta?.p ?? SCRYPT_P,
    r: meta?.r ?? SCRYPT_R,
  });

  return encodeBase64(derivedBits);
};

const compareBase64Hashes = (left: string, right: string): boolean => {
  try {
    const leftBytes = Buffer.from(decodeBase64(left));
    const rightBytes = Buffer.from(decodeBase64(right));

    if (leftBytes.length !== rightBytes.length) {
      return false;
    }

    return timingSafeEqual(leftBytes, rightBytes);
  } catch {
    return false;
  }
};

export const createPasswordRecord = async (
  password: string,
): Promise<{ passwordHash: string; passwordSalt: string }> => {
  const salt = crypto.getRandomValues(new Uint8Array(PASSWORD_SALT_BYTES));
  const encodedSalt = encodeBase64(salt);

  return {
    passwordHash: hashPasswordWithScrypt(password, encodedSalt),
    passwordSalt: buildScryptSaltRecord(encodedSalt),
  };
};

export const verifyPassword = async (
  password: string,
  passwordHash: string,
  passwordSalt: string,
): Promise<boolean> => {
  const passwordMeta = parsePasswordMeta(passwordSalt);
  const nextHash = hashPasswordWithScrypt(password, passwordMeta.salt, passwordMeta);

  return compareBase64Hashes(nextHash, passwordHash);
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
