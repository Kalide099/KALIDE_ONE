import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'django-insecure-your-secret-key-default-skillhub-2025';

import util from 'util';

const pbkdf2 = util.promisify(crypto.pbkdf2);

export async function verifyDjangoPassword(password: string, encoded: string): Promise<boolean> {
  try {
    const parts = encoded.split('$');
    if (parts.length !== 4) return false;
    
    const [algorithm, iterationsStr, salt, hash] = parts;
    
    if (algorithm !== 'pbkdf2_sha256') {
      console.warn(`Unsupported algorithm: ${algorithm}`);
      return false;
    }

    const iterations = parseInt(iterationsStr, 10);
    const keylen = 32;
    const digest = 'sha256';

    const derivedKey = await pbkdf2(password, salt, iterations, keylen, digest);
    const derivedKeyBase64 = derivedKey.toString('base64');

    return derivedKeyBase64 === hash;
  } catch (error) {
    return false;
  }
}

export function hashDjangoPassword(password: string): string {
  const iterations = 600000; // Standard Django iteration count (Django 4.0+)
  const salt = crypto.randomBytes(12).toString('base64').substring(0, 12);
  const keylen = 32;
  const digest = 'sha256';

  const derivedKey = crypto.pbkdf2Sync(password, salt, iterations, keylen, digest);
  const derivedKeyBase64 = derivedKey.toString('base64');

  return `pbkdf2_sha256$${iterations}$${salt}$${derivedKeyBase64}`;
}

export function generateTokens(user: { id: bigint | number; email: string; name: string; role: string }) {
  const payload = {
    user_id: Number(user.id),
    email: user.email,
    role: user.role
  };

  const access = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
  const refresh = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

  return { access, refresh };
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { user_id: number; email: string; role: string };
  } catch (error) {
    return null;
  }
}
